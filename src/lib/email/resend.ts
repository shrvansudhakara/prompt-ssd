import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@promptssd.com";

/**
 * Send OTP verification email for signup
 *
 * @param params - Email parameters
 * @param params.email - Recipient email address
 * @param params.otp - 6-digit verification code
 * @throws Error if email delivery fails
 */
export async function sendSignupOTP({ email, otp }: { email: string; otp: string }) {
  const { data, error } = await resend.emails.send({
    from: `PromptSSD <${fromEmail}>`,
    to: email,
    subject: "Verify Your Email - PromptSSD",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #000000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Welcome to PromptSSD!
              </h1>
              
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                Thanks for signing up! Use this code to verify your email address:
              </p>
              
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 24px 0 0 0;">
                This code will expire in 5 minutes. If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
  if (error) {
    throw new Error(`Failed to send signup OTP: ${error.message}`);
  }

  return data;
}

/**
 * Send OTP for email change verification
 *
 * @param params - Email parameters
 * @param params.email - New email address to verify
 * @param params.otp - 6-digit verification code
 * @throws Error if email delivery fails
 */
export async function sendEmailChangeOTP({ email, otp }: { email: string; otp: string }) {
  const { data, error } = await resend.emails.send({
    from: `PromptSSD <${fromEmail}>`,
    to: email,
    subject: "Verify Your New Email - PromptSSD",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #000000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Verify Your New Email
              </h1>
              
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                You requested to change your email address. Use this code to verify your new email:
              </p>
              
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 24px 0 0 0;">
                This code will expire in 5 minutes. If you didn't request this change, please secure your account immediately.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email change OTP: ${error.message}`);
  }

  return data;
}

/**
 * Send OTP for password change verification
 *
 * @param params - Email parameters
 * @param params.email - User's current email address
 * @param params.otp - 6-digit verification code
 * @throws Error if email delivery fails
 */
export async function sendPasswordChangeOTP({ email, otp }: { email: string; otp: string }) {
  const { data, error } = await resend.emails.send({
    from: `PromptSSD <${fromEmail}>`,
    to: email,
    subject: "Change Your Password - PromptSSD",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #000000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Change Your Password
              </h1>
              
              <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                You requested to change your password. Use this code to proceed:
              </p>
              
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 24px 0 0 0;">
                This code will expire in 5 minutes. If you didn't request this change, please secure your account immediately.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
  if (error) {
    throw new Error(`Failed to send password change OTP: ${error.message}`);
  }

  return data;
}
