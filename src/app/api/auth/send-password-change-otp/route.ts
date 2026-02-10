import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { storeOTP } from "@/lib/otp/store";
import { sendPasswordChangeOTP } from "@/lib/email/resend";

/**
 * POST /api/auth/send-password-change-otp
 * Send OTP to verify password change
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate and store OTP for current user's email
    const otp = await storeOTP(session.user.email);

    // Send email
    await sendPasswordChangeOTP({ email: session.user.email, otp });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending password change OTP:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
