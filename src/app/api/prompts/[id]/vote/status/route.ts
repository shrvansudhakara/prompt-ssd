import { db } from "@/db";
import { vote } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * GET /api/prompts/[id]/vote/status
 * Get the current user's vote status for a prompt
 * Returns: { voteType: "up" | "down" | null }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    // If not logged in, return null
    if (!session) {
      return NextResponse.json({ voteType: null });
    }

    const { id: promptId } = await params;

    const userVote = await db
      .select()
      .from(vote)
      .where(and(eq(vote.promptId, promptId), eq(vote.userId, session.user.id)))
      .limit(1);

    return NextResponse.json({
      voteType: userVote.length > 0 ? userVote[0].voteType : null,
    });
  } catch (error) {
    console.error("Error fetching vote status:", error);
    return NextResponse.json({ error: "Failed to fetch vote status" }, { status: 500 });
  }
}
