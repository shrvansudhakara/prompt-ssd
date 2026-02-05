import { db } from "@/db";
import { savedPrompt } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * POST /api/prompts/[id]/save
 * Save/bookmark a prompt
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId } = await params;

    // Save the prompt
    await db
      .insert(savedPrompt)
      .values({
        userId: session.user.id,
        promptId,
      })
      .onConflictDoNothing();

    return NextResponse.json({ message: "Prompt saved", saved: true });
  } catch (error) {
    console.error("Error saving prompt:", error);
    return NextResponse.json({ error: "Failed to save prompt" }, { status: 500 });
  }
}

/**
 * DELETE /api/prompts/[id]/save
 * Remove saved/bookmarked prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId } = await params;

    await db
      .delete(savedPrompt)
      .where(and(eq(savedPrompt.userId, session.user.id), eq(savedPrompt.promptId, promptId)));

    return NextResponse.json({ message: "Prompt unsaved", saved: false });
  } catch (error) {
    console.error("Error unsaving prompt:", error);
    return NextResponse.json({ error: "Failed to unsave prompt" }, { status: 500 });
  }
}

/**
 * GET /api/prompts/[id]/save/status
 * Check if user has saved this prompt
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ saved: false });
    }

    const { id: promptId } = await params;

    const saved = await db
      .select()
      .from(savedPrompt)
      .where(and(eq(savedPrompt.userId, session.user.id), eq(savedPrompt.promptId, promptId)))
      .limit(1);

    return NextResponse.json({ saved: saved.length > 0 });
  } catch (error) {
    console.error("Error checking save status:", error);
    return NextResponse.json({ error: "Failed to check save status" }, { status: 500 });
  }
}
