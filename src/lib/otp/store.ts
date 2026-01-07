import { db } from "@/db";
import { emailVerification } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashOTP, verifyOTP, generateOTP } from "./generate";

/**
 * Store a new OTP for email verification (expires in 5 minutes)
 */
export async function storeOTP(email: string): Promise<string> {
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Delete any existing verification records for this email
  await db.delete(emailVerification).where(eq(emailVerification.email, email));

  // Create new verification record
  await db.insert(emailVerification).values({
    email,
    otpHash,
    attempts: 0,
    expiresAt,
  });

  return otp;
}

/**
 * Verify OTP (max 3 attempts, expires after 5 minutes)
 */
export async function validateOTP(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const [record] = await db
    .select()
    .from(emailVerification)
    .where(eq(emailVerification.email, email))
    .limit(1);

  if (!record) {
    return { success: false, error: "No verification found. Please request a new code." };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    await db.delete(emailVerification).where(eq(emailVerification.id, record.id));
    return { success: false, error: "Code expired. Please request a new one." };
  }

  // Check attempt limit
  if (record.attempts >= 3) {
    return { success: false, error: "Too many attempts. Please request a new code." };
  }

  // Verify OTP
  const isValid = await verifyOTP(otp, record.otpHash);

  if (!isValid) {
    await db
      .update(emailVerification)
      .set({ attempts: record.attempts + 1 })
      .where(eq(emailVerification.id, record.id));

    const remaining = 3 - (record.attempts + 1);
    if (remaining > 0) {
      return {
        success: false,
        error: `Invalid code. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`,
      };
    } else {
      return { success: false, error: "Too many attempts. Please request a new code." };
    }
  }

  // Success - delete the record (single use)
  await db.delete(emailVerification).where(eq(emailVerification.id, record.id));

  return { success: true };
}
