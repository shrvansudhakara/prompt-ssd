import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailVerification } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { completeSignupSchema } from "@/lib/validations/auth-schemas";

/**
 * Complete signup after email verification
 *
 * Validates that the email was verified via OTP before creating account
 * Security: Prevents account creation without valid email verification
 *
 * @route POST /api/auth/complete-signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, ...formData } = body; // Changed: signupData → formData

    // Validate request body
    const validation = completeSignupSchema.safeParse(formData); // Changed
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify the email was actually verified via OTP
    const verifiedRecord = await db.query.emailVerification.findFirst({
      where: and(
        eq(emailVerification.email, email),
        eq(emailVerification.verified, true),
        // Ensure verification happened within last 15 minutes
        gte(emailVerification.verifiedAt, new Date(Date.now() - 15 * 60 * 1000))
      ),
    });

    if (!verifiedRecord) {
      return NextResponse.json(
        { error: "Email not verified or verification expired. Please verify your email again." },
        { status: 403 }
      );
    }

    // Create a fake request to pass to Better Auth
    const signupRequest = new Request(
      `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: validation.data.password,
          name: `${validation.data.firstName}${validation.data.lastName ? ` ${validation.data.lastName}` : ""}`,
          firstName: validation.data.firstName,
          lastName: validation.data.lastName,
          username: validation.data.username,
        }),
      }
    );

    // Call Better Auth handler directly
    const signupResponse = await auth.handler(signupRequest);
    const responseData = await signupResponse.json(); // Changed: signupData → responseData

    // Check if signup failed
    if (!signupResponse.ok) {
      return NextResponse.json(
        { error: responseData.error || "Failed to create account" }, // Changed
        { status: signupResponse.status }
      );
    }

    // Clean up the verification record after successful signup
    await db.delete(emailVerification).where(eq(emailVerification.email, email));

    return NextResponse.json({ success: true, user: responseData }); // Changed
  } catch (error) {
    console.error("Complete signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
