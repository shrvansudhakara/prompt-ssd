import { db } from "@/db";
import { prompt, user, tag, promptTag } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/prompts
 * Fetches paginated prompts with author info and tags
 * Query params: page (default: 1), limit (default: 9), search, tags (comma-separated IDs)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const offset = (page - 1) * limit;

    // Get search and filter params
    const searchQuery = searchParams.get("search") || "";
    const tagIds = searchParams.get("tags")?.split(",").filter(Boolean) || [];

    // Build where conditions
    const whereConditions = [];

    if (searchQuery) {
      whereConditions.push(
        sql`(
          ${prompt.title} ILIKE ${`%${searchQuery}%`} OR 
          ${prompt.description} ILIKE ${`%${searchQuery}%`} OR 
          ${prompt.content} ILIKE ${`%${searchQuery}%`}
        )`
      );
    }

    if (tagIds.length > 0) {
      whereConditions.push(
        sql`${prompt.id} IN (
          SELECT ${promptTag.promptId} 
          FROM ${promptTag} 
          WHERE ${promptTag.tagId} IN (${sql.join(
            tagIds.map((id) => sql`${id}`),
            sql`, `
          )})
        )`
      );
    }

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
        tags: sql<{ id: string; name: string; slug: string }[]>`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${tag.id},
                'name', ${tag.name},
                'slug', ${tag.slug}
              )
            ) FILTER (WHERE ${tag.id} IS NOT NULL),
            '[]'
          )
        `,
      })
      .from(prompt)
      .leftJoin(user, eq(prompt.userId, user.id))
      .leftJoin(promptTag, eq(prompt.id, promptTag.promptId))
      .leftJoin(tag, eq(promptTag.tagId, tag.id))
      .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
      .groupBy(prompt.id, user.id)
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
