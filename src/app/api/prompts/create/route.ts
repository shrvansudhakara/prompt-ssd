import { db } from "@/db";
import { prompt, tag, promptTag } from "@/db/schema";
import { createPromptSchema } from "@/lib/validations/prompt-schemas";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

/**
 * Create a new prompt with tags
 *
 * Creates a prompt entry and associates it with tags. Tags are created
 * if they don't exist (case-insensitive matching), or existing tags are
 * reused with incremented usage count.
 *
 * @param request - Next.js request containing { title, description, content, imageUrl, videoUrl, tagNames }
 * @returns 201 with promptId on success, 400 on validation error, 401 if unauthorized, 500 on server error
 * @requires Authentication - User must be logged in
 *
 * @route POST /api/prompts/create
 */
export async function POST(request: NextRequest) {
  try {
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

    // Get userId from authenticated session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Create prompt
    const promptId = crypto.randomUUID();
    const [newPrompt] = await db
      .insert(prompt)
      .values({
        id: promptId,
        title,
        description: description || null,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        userId,
      })
      .returning({ id: prompt.id });

    // Handle tags if provided
    if (tagNames && tagNames.length > 0) {
      const tagIds: string[] = [];

      for (const tagName of tagNames) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        // Create case-insensitive slug
        const slug = trimmedName.toLowerCase().replace(/\s+/g, "-");

        // Check if tag exists (case-insensitive)
        const existingTag = await db
          .select()
          .from(tag)
          .where(sql`LOWER(${tag.slug}) = ${slug}`)
          .limit(1);

        let tagId: string;

        if (existingTag.length > 0) {
          // Use existing tag
          tagId = existingTag[0].id;
          // Increment usage count
          await db
            .update(tag)
            .set({ usageCount: sql`${tag.usageCount} + 1` })
            .where(sql`id = ${tagId}`);
        } else {
          // Create new tag
          const [newTag] = await db
            .insert(tag)
            .values({
              name: trimmedName,
              slug: slug,
              usageCount: 1,
            })
            .returning({ id: tag.id });
          tagId = newTag.id;
        }

        tagIds.push(tagId);
      }

      // Create prompt-tag associations
      if (tagIds.length > 0) {
        await db.insert(promptTag).values(
          tagIds.map((tagId) => ({
            promptId: promptId,
            tagId: tagId,
          }))
        );
      }
    }

    return NextResponse.json({ promptId: newPrompt.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}
