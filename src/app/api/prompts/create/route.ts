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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
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

    const promptId = crypto.randomUUID();

    const newPrompt = await db.transaction(async (tx) => {
      // Create prompt
      const [created] = await tx
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
        const processedSlugs = new Set<string>();
        const tagIds: string[] = [];

        for (const tagName of tagNames) {
          const trimmedName = tagName.trim();
          if (!trimmedName) continue;

          // Create case-insensitive slug
          const slug = trimmedName.toLowerCase().replace(/\s+/g, "-");

          // Skip if already processed this slug
          if (processedSlugs.has(slug)) continue;
          processedSlugs.add(slug);

          // Check if tag exists (case-insensitive)
          const [upsertedTag] = await tx
            .insert(tag)
            .values({
              name: trimmedName,
              slug: slug,
              usageCount: 1,
            })
            .onConflictDoUpdate({
              target: tag.slug,
              set: { usageCount: sql`${tag.usageCount} + 1` },
            })
            .returning({ id: tag.id });

          tagIds.push(upsertedTag.id);
        }

        // Create prompt-tag associations
        if (tagIds.length > 0) {
          await tx.insert(promptTag).values(
            tagIds.map((tagId) => ({
              promptId: promptId,
              tagId: tagId,
            }))
          );
        }
      }

      return created;
    });

    return NextResponse.json({ promptId: newPrompt.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}
