import { z } from "zod";

/**
 * Sign up form validation schema
 * Validates user registration with name, email, and password
 */
export const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z.string().max(50, "Last name must not exceed 50 characters").optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-z0-9._-]+$/,
      "Username must be lowercase and can only contain letters, numbers, periods, underscores, and hyphens"
    ),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

/**
 * Sign in form validation schema
 * Validates user login credentials
 */
export const signInSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .refine((val) => {
      const hasAt = val.includes("@");

      if (hasAt) {
        // Must be a valid email
        return z.email().safeParse(val).success;
      } else {
        // Must be a valid username (same rules as signup)
        return /^[a-z0-9._-]+$/.test(val);
      }
    }, "Must be a valid email or username"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Forgot password form validation schema
 * Validates email for password reset request
 */
export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

/**
 * Reset password form validation schema
 * Validates new password during password reset
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Email-only schema for initial signup step
 */
export const emailOnlySchema = z.object({
  email: z.email("Invalid email address"),
});

/**
 * OTP verification schema
 */
export const verifyOTPSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

/**
 * Complete signup schema - after email verified
 */
export const completeSignupSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z.string().max(50, "Last name must not exceed 50 characters").optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-z0-9._-]+$/,
      "Username must be lowercase and can only contain letters, numbers, periods, underscores, and hyphens"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// Type inference for TypeScript
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type CompleteSignupInput = z.infer<typeof completeSignupSchema>;
