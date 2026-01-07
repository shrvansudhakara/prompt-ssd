import { db } from "@/db";
import { tag } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

/**
 * POST /api/tags
 * Creates or retrieves a tag by name (case-insensitive)
 * Expects: { name: string }
 * Returns: { tag: { id, name, slug } }
 */
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    // Create case-insensitive slug (lowercase, spaces to hyphens)
    const slug = trimmedName.toLowerCase().replace(/\s+/g, "-");

    // Check if tag already exists (case-insensitive)
    const existingTag = await db
      .select()
      .from(tag)
      .where(sql`LOWER(${tag.slug}) = ${slug}`)
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json({ tag: existingTag[0] });
    }

    // Create new tag
    const [newTag] = await db
      .insert(tag)
      .values({
        name: trimmedName,
        slug: slug,
        usageCount: 0,
      })
      .returning();

    return NextResponse.json({ tag: newTag });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
