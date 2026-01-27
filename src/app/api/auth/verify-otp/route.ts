import { NextRequest, NextResponse } from "next/server";
import { validateOTP } from "@/lib/otp/store";
import { verifyOTPSchema } from "@/lib/validations/auth-schemas";

/**
 * Verify email OTP for account verification
 *
 * Validates a 6-digit OTP against the stored hash with security checks:
 * - Expiration validation (5 minutes)
 * - Rate limiting (max 3 attempts)
 * - Single-use verification
 *
 * @param request - Next.js request containing { email, otp }
 * @returns 200 on success, 400 on validation/verification failure, 500 on server error
 *
 * @route POST /api/auth/verify-otp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, otp } = validation.data;

    // Validate OTP
    const result = await validateOTP(email, otp);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
