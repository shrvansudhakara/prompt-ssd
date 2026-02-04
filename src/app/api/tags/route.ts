import { auth } from "@/lib/auth/auth";
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
 * Requires authentication
 * Expects: { name: string }
 * Returns: { tag: { id, name, slug } }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    // Create case-insensitive slug (lowercase, spaces to hyphens)
    const slug = trimmedName.toLowerCase().replace(/\s+/g, "-");

    // Check if tag already exists (case-insensitive)
    const [upsertedTag] = await db
      .insert(tag)
      .values({
        name: trimmedName,
        slug,
        usageCount: 1,
      })
      .onConflictDoUpdate({
        target: tag.slug,
        set: { usageCount: sql`${tag.usageCount} + 1` },
      })
      .returning();

    return NextResponse.json({ tag: upsertedTag });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
