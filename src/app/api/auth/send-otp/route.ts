import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { storeOTP } from "@/lib/otp/store";
import { sendSignupOTP } from "@/lib/email/resend";

const sendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/auth/send-otp
 * Generate and send OTP for email verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = sendOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { email } = validation.data;

    // Check if user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Generate and store OTP
    const otp = await storeOTP(email);

    // Send email (don't await to prevent timing attacks)
    void sendSignupOTP({ email, otp });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
