import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { validateOTP } from "@/lib/otp/store";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/validations/auth-schemas";

const changePasswordSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
  newPassword: signUpSchema.shape.password, // Reuse password validation
});

/**
 * POST /api/auth/change-password-with-otp
 * Verify OTP and update user's password
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
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { otp, newPassword } = validation.data;

    // Validate OTP
    const result = await validateOTP(session.user.email, otp);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in account table (credential provider)
    await db
      .update(account)
      .set({ password: hashedPassword })
      .where(and(eq(account.userId, session.user.id), eq(account.providerId, "credential")));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
