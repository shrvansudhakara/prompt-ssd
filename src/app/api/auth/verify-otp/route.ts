import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateOTP } from "@/lib/otp/store";

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP for email verification
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
