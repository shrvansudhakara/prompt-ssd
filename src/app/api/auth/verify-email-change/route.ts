import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { validateOTP } from "@/lib/otp/store";

const verifyEmailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

/**
 * POST /api/auth/verify-email-change
 * Verify OTP and update user's email
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = verifyEmailChangeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { newEmail, otp } = validation.data;

    // Validate OTP
    const result = await validateOTP(newEmail, otp);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Re-check email availability (prevent TOCTOU race condition)
    const existingUser = await db.select().from(user).where(eq(user.email, newEmail)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "This email is already in use" }, { status: 400 });
    }

    // Update user's email
    await db
      .update(user)
      .set({ email: newEmail, emailVerified: true })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying email change:", error);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}
