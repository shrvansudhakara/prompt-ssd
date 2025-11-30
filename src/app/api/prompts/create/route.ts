import { db } from "@/db";
import { prompt } from "@/db/schema";
import { createPromptSchema } from "@/lib/validations/prompt-schemas";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * POST /api/prompts/create
 * Creates a new prompt
 */
export async function POST(request: NextRequest) {
  try {
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

    // Get userId from authenticated session, not from request body
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Create prompt
    const [newPrompt] = await db
      .insert(prompt)
      .values({
        id: crypto.randomUUID(),
        title,
        description: description || null,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        userId,
      })
      .returning({ id: prompt.id });

    return NextResponse.json({ promptId: newPrompt.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}
