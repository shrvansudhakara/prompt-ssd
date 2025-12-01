import { db } from "@/db";
import { tag } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * GET /api/tags
 * Fetches all tags ordered by usage count
 */
export async function GET() {
  try {
    const tags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        usageCount: tag.usageCount,
      })
      .from(tag)
      .orderBy(desc(tag.usageCount));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
