import { db } from "@/db";
import { vote, prompt } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * Create or update a vote on a prompt
 *
 * Handles upvote/downvote logic with toggle functionality:
 * - Same vote type: removes vote (toggle off)
 * - Different vote type: switches vote and adjusts count by ±2
 * - No existing vote: creates new vote and adjusts count by ±1
 *
 * All operations are atomic using database transactions.
 *
 * @param request - Next.js request containing { voteType: "up" | "down" }
 * @param params - Route params containing prompt id
 * @returns Vote status and message, 400 on invalid input, 401 if unauthorized, 500 on server error
 * @requires Authentication - User must be logged in
 *
 * @route POST /api/prompts/[id]/vote
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
        await db.transaction(async (tx) => {
          await tx
            .delete(vote)
            .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)));

          await tx
            .update(prompt)
            .set({
              upvotes: sql`${prompt.upvotes} + ${voteType === "up" ? -1 : 1}`,
            })
            .where(eq(prompt.id, promptId));
        });

        return NextResponse.json({ voteType: null, message: "Vote removed" });
      }

      // Update vote and adjust count atomically
      const delta = voteType === "up" ? 2 : -2; // Switching from down to up = +2, up to down = -2
      await db.transaction(async (tx) => {
        await tx
          .update(vote)
          .set({ voteType })
          .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)));

        await tx
          .update(prompt)
          .set({
            upvotes: sql`${prompt.upvotes} + ${delta}`,
          })
          .where(eq(prompt.id, promptId));
      });

      return NextResponse.json({ voteType, message: "Vote updated" });
    }

    // Create vote and update count atomically
    await db.transaction(async (tx) => {
      await tx.insert(vote).values({
        promptId,
        userId: session.user.id,
        voteType,
      });

      await tx
        .update(prompt)
        .set({
          upvotes: sql`${prompt.upvotes} + ${voteType === "up" ? 1 : -1}`,
        })
        .where(eq(prompt.id, promptId));
    });

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

    // Delete vote and update count atomically
    await db.transaction(async (tx) => {
      await tx
        .delete(vote)
        .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)));

      await tx
        .update(prompt)
        .set({
          upvotes: sql`${prompt.upvotes} + ${currentVote.voteType === "up" ? -1 : 1}`,
        })
        .where(eq(prompt.id, promptId));
    });

    return NextResponse.json({ message: "Vote removed" });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 });
  }
}
