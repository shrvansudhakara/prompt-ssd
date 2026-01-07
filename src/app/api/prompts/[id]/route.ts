import { db } from "@/db";
import { prompt, tag, promptTag } from "@/db/schema";
import { createPromptSchema } from "@/lib/validations/prompt-schemas";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

/**
 * PATCH /api/prompts/[id]
 * Updates an existing prompt
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = createPromptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, description, content, imageUrl, videoUrl, tagNames } = validation.data;

    // Check ownership
    const [existingPrompt] = await db.select().from(prompt).where(eq(prompt.id, id));

    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete old files if they're being replaced
    const filesToDelete: string[] = [];

    if (existingPrompt.imageUrl && imageUrl !== existingPrompt.imageUrl) {
      const oldImageKey = extractFileKey(existingPrompt.imageUrl);
      if (oldImageKey) filesToDelete.push(oldImageKey);
    }

    if (existingPrompt.videoUrl && videoUrl !== existingPrompt.videoUrl) {
      const oldVideoKey = extractFileKey(existingPrompt.videoUrl);
      if (oldVideoKey) filesToDelete.push(oldVideoKey);
    }

    if (filesToDelete.length > 0) {
      try {
        const utapi = new UTApi();
        await utapi.deleteFiles(filesToDelete);
      } catch (fileError) {
        console.error("Failed to delete old files from Uploadthing:", fileError);
      }
    }

    // Use transaction for atomic updates
    await db.transaction(async (tx) => {
      // Update prompt
      await tx
        .update(prompt)
        .set({
          title,
          description: description || null,
          content,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
        })
        .where(eq(prompt.id, id));

      // Handle tags if provided
      if (tagNames && Array.isArray(tagNames)) {
        // Get old tags to decrement usage count
        const oldTags = await tx
          .select({ tagId: promptTag.tagId })
          .from(promptTag)
          .where(eq(promptTag.promptId, id));

        // Delete old tag associations
        await tx.delete(promptTag).where(eq(promptTag.promptId, id));

        // Decrement usage count for old tags
        for (const oldTag of oldTags) {
          await tx
            .update(tag)
            .set({ usageCount: sql`${tag.usageCount} - 1` })
            .where(eq(tag.id, oldTag.tagId));
        }

        // Process new tags
        for (const tagName of tagNames) {
          const trimmed = tagName.trim();
          if (!trimmed) continue;

          const slug = trimmed.toLowerCase().replace(/\s+/g, "-");

          // Find or create tag
          let tagRecord = await tx
            .select()
            .from(tag)
            .where(sql`LOWER(${tag.slug}) = ${slug}`)
            .limit(1);

          if (tagRecord.length === 0) {
            // Create new tag
            const [newTag] = await tx
              .insert(tag)
              .values({
                name: trimmed,
                slug: slug,
                usageCount: 1,
              })
              .returning();
            tagRecord = [newTag];
          } else {
            // Increment usage count
            await tx
              .update(tag)
              .set({ usageCount: sql`${tag.usageCount} + 1` })
              .where(eq(tag.id, tagRecord[0].id));
          }

          // Create tag association
          await tx.insert(promptTag).values({
            promptId: id,
            tagId: tagRecord[0].id,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

/**
 * Extract Uploadthing file key from URL
 * URL format: https://utfs.io/f/{fileKey}
 */
function extractFileKey(url: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "utfs.io") {
      const parts = urlObj.pathname.split("/");
      return parts[parts.length - 1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * DELETE /api/prompts/[id]
 * Deletes a prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const [existingPrompt] = await db.select().from(prompt).where(eq(prompt.id, id));

    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete uploaded files from Uploadthing first
    const filesToDelete: string[] = [];
    const imageKey = extractFileKey(existingPrompt.imageUrl);
    const videoKey = extractFileKey(existingPrompt.videoUrl);

    if (imageKey) filesToDelete.push(imageKey);
    if (videoKey) filesToDelete.push(videoKey);

    if (filesToDelete.length > 0) {
      try {
        const utapi = new UTApi();
        await utapi.deleteFiles(filesToDelete);
      } catch (fileError) {
        console.error("Failed to delete files from Uploadthing:", fileError);
        // Continue with DB deletion even if file deletion fails
      }
    }

    // Delete prompt from database
    await db.delete(prompt).where(eq(prompt.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
