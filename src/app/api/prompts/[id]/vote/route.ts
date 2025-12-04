import { db } from "@/db";
import { vote, prompt } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * POST /api/prompts/[id]/vote
 * Create or update a vote on a prompt
 * Body: { voteType: "up" | "down" }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: promptId } = await params;
    const { voteType } = await request.json();

    if (voteType !== "up" && voteType !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(vote)
      .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)))
      .limit(1);

    if (existingVote.length > 0) {
      const currentVote = existingVote[0];

      // If same vote type, remove the vote (toggle off)
      if (currentVote.voteType === voteType) {
        await db
          .delete(vote)
          .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)));

        // Update prompt upvotes count
        await db
          .update(prompt)
          .set({
            upvotes: sql`${prompt.upvotes} + ${voteType === "up" ? -1 : 1}`,
          })
          .where(eq(prompt.id, promptId));

        return NextResponse.json({ voteType: null, message: "Vote removed" });
      }

      // Different vote type, update the vote
      await db
        .update(vote)
        .set({ voteType })
        .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)));

      // Update prompt upvotes: remove old vote effect, add new vote effect
      const delta = voteType === "up" ? 2 : -2; // Switching from down to up = +2, up to down = -2
      await db
        .update(prompt)
        .set({
          upvotes: sql`${prompt.upvotes} + ${delta}`,
        })
        .where(eq(prompt.id, promptId));

      return NextResponse.json({ voteType, message: "Vote updated" });
    }

    // No existing vote, create new one
    await db.insert(vote).values({
      promptId,
      userId: session.user.id,
      voteType,
    });

    // Update prompt upvotes count
    await db
      .update(prompt)
      .set({
        upvotes: sql`${prompt.upvotes} + ${voteType === "up" ? 1 : -1}`,
      })
      .where(eq(prompt.id, promptId));

    return NextResponse.json({ voteType, message: "Vote created" });
  } catch (error) {
    console.error("Error voting on prompt:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

/**
 * DELETE /api/prompts/[id]/vote
 * Remove user's vote from a prompt
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

    // Get existing vote to know how to adjust count
    const existingVote = await db
      .select()
      .from(vote)
      .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)))
      .limit(1);

    if (existingVote.length === 0) {
      return NextResponse.json({ error: "No vote found" }, { status: 404 });
    }

    const currentVote = existingVote[0];

    // Delete the vote
    await db.delete(vote).where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)));

    // Update prompt upvotes count
    await db
      .update(prompt)
      .set({
        upvotes: sql`${prompt.upvotes} + ${currentVote.voteType === "up" ? -1 : 1}`,
      })
      .where(eq(prompt.id, promptId));

    return NextResponse.json({ message: "Vote removed" });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 });
  }
}
