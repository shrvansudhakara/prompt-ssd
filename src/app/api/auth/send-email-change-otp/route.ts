import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { storeOTP } from "@/lib/otp/store";
import { sendEmailChangeOTP } from "@/lib/email/resend";

const sendEmailChangeOTPSchema = z.object({
  newEmail: z.email("Invalid email address"),
});

/**
 * POST /api/auth/send-email-change-otp
 * Send OTP to verify new email address
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
    const validation = sendEmailChangeOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { newEmail } = validation.data;

    // Check if new email is same as current
    if (newEmail === session.user.email) {
      return NextResponse.json({ error: "This is already your current email" }, { status: 400 });
    }

    // Check if new email is already in use
    const existingUser = await db.select().from(user).where(eq(user.email, newEmail)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "This email is already in use" }, { status: 400 });
    }

    // Generate and store OTP
    const otp = await storeOTP(newEmail);

    // Send email
    void sendEmailChangeOTP({ email: newEmail, otp });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email change OTP:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
