import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

/**
 * Generate a random 6-digit OTP
 * Security: Uses cryptographically secure random number generator
 * @returns 6-digit numeric string
 */
export function generateOTP(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP using bcrypt
 * Security: Uses bcrypt with salt rounds of 10
 * @param otp - Plain text OTP to hash
 * @returns Hashed OTP
 */
export async function hashOTP(otp: string): Promise<string> {
  return await bcrypt.hash(otp, 10);
}

/**
 * Verify an OTP against its hash
 * Security: Constant-time comparison via bcrypt
 * @param otp - Plain text OTP to verify
 * @param hash - Stored OTP hash
 * @returns true if OTP matches hash
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(otp, hash);
}
