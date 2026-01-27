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
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  newEmail: string;
  onSuccess: () => void;
}

export default function ChangeEmailModal({
  open,
  onClose,
  newEmail,
  onSuccess,
}: ChangeEmailModalProps) {
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof otpSchema>) => {
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail,
          otp: values.otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server Error Response:", data);
        setError(data.error || "Invalid code. Please try again.");
        return;
      }

      // Success animation
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        form.reset();
      }, 1500);
    } catch (err) {
      console.error("Verification Crash:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-email-change-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Resend API Error:", data);
        setError(data.error || "Failed to resend code");
        return;
      }

      form.reset();
    } catch (err) {
      console.error("Resend Network Error:", err);
      setError("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    if (!form.formState.isSubmitting) {
      onClose();
      form.reset();
      setError("");
      setSuccess(false);
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
                Email Updated Successfully!
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="mx-auto mb-4">
                  <Mail className="text-primary h-12 w-12" />
                </div>
                <DialogTitle className="text-center">Verify New Email</DialogTitle>
                <DialogDescription className="text-center">
                  We sent a 6-digit code to <strong>{newEmail}</strong>
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) =>
                    console.error("Form Validation Errors:", errors)
                  )}
                  className="mt-6 space-y-4"
                >
                  <FormField
                    control={form.control}
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
                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={form.formState.isSubmitting}
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
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
