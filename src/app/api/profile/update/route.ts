import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, or, and, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().max(50).optional(),
  username: z.string().min(3).max(30),
  email: z.email(),
});

/**
 * Update user profile information
 *
 * Updates firstName, lastName, username, and email for the authenticated user.
 * Validates uniqueness of username and email across all users.
 *
 * Validation:
 * - firstName: 1-50 characters (required)
 * - lastName: up to 50 characters (optional)
 * - username: 3-30 characters (must be unique)
 * - email: valid email format (must be unique)
 *
 * @param request - Request body containing { firstName, lastName?, username, email }
 * @returns 200 on success, 400 on validation error, 401 if unauthorized, 409 if username/email taken, 500 on server error
 * @requires Authentication - User must be logged in
 *
 * @route PATCH /api/profile/update
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, email } = validation.data;

    // Check if username or email already taken by another user
    const existingUser = await db
      .select()
      .from(user)
      .where(
        and(or(eq(user.username, username), eq(user.email, email)), ne(user.id, session.user.id))
      )
      .limit(1);

    if (existingUser.length > 0) {
      if (existingUser[0].username === username) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
      if (existingUser[0].email === email) {
        return NextResponse.json({ error: "Email already taken" }, { status: 409 });
      }
    }

    // Update user
    await db
      .update(user)
      .set({
        firstName,
        lastName: lastName || null,
        username,
        email,
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
