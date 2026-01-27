"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ChangePasswordModal from "./ChangePasswordModal";

interface ChangePasswordFormProps {
  userEmail: string;
}

/**
 * Form for changing user password via OTP verification
 */
export default function ChangePasswordForm({ userEmail }: ChangePasswordFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    setIsSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-password-change-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send verification code");
      }

      setShowModal(true);
      toast.success("Verification code sent to your email");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuccess = () => {
    toast.success("Password changed successfully!");
    setShowModal(false);
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          To change your password, we&apos;ll send a verification code to{" "}
          <strong>{userEmail}</strong>
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <Button onClick={handleSendOTP} disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </div>

      <ChangePasswordModal
        open={showModal}
        onClose={() => setShowModal(false)}
        userEmail={userEmail}
        onSuccess={handleSuccess}
      />
    </>
  );
}
