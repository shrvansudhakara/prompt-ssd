"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle2, Lock } from "lucide-react";
import { signUpSchema } from "@/lib/validations/auth-schemas";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

const passwordSchema = z
  .object({
    newPassword: signUpSchema.shape.password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess: () => void;
}

export default function ChangePasswordModal({
  open,
  onClose,
  userEmail,
  onSuccess,
}: ChangePasswordModalProps) {
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"otp" | "password">("otp");

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitOTP = async () => {
    setError("");
    // Just validate OTP, don't change password yet
    setStep("password");
  };

  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    setError("");

    try {
      const res = await fetch("/api/auth/change-password-with-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otpForm.getValues("otp"),
          newPassword: values.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }

      // Success animation
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Change password error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-password-change-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend code");
        return;
      }

      otpForm.reset();
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    if (!otpForm.formState.isSubmitting && !passwordForm.formState.isSubmitting) {
      onClose();
      otpForm.reset();
      passwordForm.reset();
      setError("");
      setSuccess(false);
      setStep("otp");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-lg font-semibold"
              >
                Password Changed Successfully!
              </motion.p>
            </motion.div>
          ) : step === "otp" ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="mx-auto mb-4">
                  <Mail className="text-primary h-12 w-12" />
                </div>
                <DialogTitle className="text-center">Verify Your Identity</DialogTitle>
                <DialogDescription className="text-center">
                  We sent a 6-digit code to <strong>{userEmail}</strong>
                </DialogDescription>
              </DialogHeader>

              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onSubmitOTP)} className="mt-6 space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123456"
                            maxLength={6}
                            className="text-center text-2xl tracking-widest"
                            autoComplete="one-time-code"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-destructive/15 text-destructive rounded-md p-3 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={otpForm.formState.isSubmitting}
                    >
                      {otpForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={otpForm.formState.isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <p className="text-muted-foreground mb-2 text-sm">Didn&apos;t receive the code?</p>
                <Button variant="ghost" size="sm" onClick={handleResend} disabled={isResending}>
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="mx-auto mb-4">
                  <Lock className="text-primary h-12 w-12" />
                </div>
                <DialogTitle className="text-center">Set New Password</DialogTitle>
                <DialogDescription className="text-center">
                  Choose a strong password for your account
                </DialogDescription>
              </DialogHeader>

              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                  className="mt-6 space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} autoFocus />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-destructive/15 text-destructive rounded-md p-3 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("otp")}
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      Back
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
