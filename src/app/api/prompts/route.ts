import { db } from "@/db";
import { prompt, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/prompts
 * Fetches paginated prompts with author info
 * Query params: page (default: 1), limit (default: 9)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const offset = (page - 1) * limit;

    const prompts = await db
      .select({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        upvotes: prompt.upvotes,
        createdAt: prompt.createdAt,
        userId: prompt.userId,
        author: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
      .from(prompt)
      .leftJoin(user, eq(prompt.userId, user.id))
      .orderBy(desc(prompt.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      prompts,
      hasMore: prompts.length === limit,
      nextPage: prompts.length === limit ? page + 1 : null,
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}
