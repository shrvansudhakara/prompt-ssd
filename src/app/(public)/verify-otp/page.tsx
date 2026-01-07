"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { verifyOTPSchema, type VerifyOTPInput } from "@/lib/validations/auth-schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [error, setError] = useState<string>("");
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyOTPInput>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      email,
      otp: "",
    },
  });

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const onSubmit = async (values: VerifyOTPInput) => {
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code. Please try again.");
        return;
      }

      // OTP verified - store verification flag and redirect to complete signup
      sessionStorage.setItem("emailVerified", values.email);
      router.push(`/complete-signup?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Resend API Error:", data);
        setError(data.error || "Failed to resend code");
        return;
      }

      form.reset({ email, otp: "" });
    } catch (err) {
      console.error("Resend Network/Parse Error:", err);
      setError("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="text-primary mx-auto mb-4 h-12 w-12" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-2 text-sm">Didn&apos;t receive the code?</p>
            <Button variant="ghost" onClick={handleResend} disabled={isResending}>
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
