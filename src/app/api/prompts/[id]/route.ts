import { db } from "@/db";
import { prompt } from "@/db/schema";
import { createPromptSchema } from "@/lib/validations/prompt-schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

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

    const { title, description, content, imageUrl, videoUrl } = validation.data;

    // Check ownership
    const [existingPrompt] = await db.select().from(prompt).where(eq(prompt.id, id));

    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update prompt
    await db
      .update(prompt)
      .set({
        title,
        description: description || null,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
      })
      .where(eq(prompt.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
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

    // Delete prompt
    await db.delete(prompt).where(eq(prompt.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
