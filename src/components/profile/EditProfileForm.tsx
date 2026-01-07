"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ChangeEmailModal from "./ChangeEmailModal";

const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional(),
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.email("Invalid email address"),
});

type EditProfileInput = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName?: string | null;
    username: string;
    email: string;
  };
}

/**
 * Form for editing user profile information
 */
export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      username: user.username,
      email: user.email,
    },
  });

  const onSubmit = async (values: EditProfileInput) => {
    setError("");

    // Check if email changed
    const emailChanged = values.email !== user.email;

    if (emailChanged) {
      // Open modal for email verification
      setPendingEmail(values.email);

      // Send OTP
      try {
        const res = await fetch("/api/auth/send-email-change-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newEmail: values.email }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send verification code");
        }

        setShowEmailModal(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send verification code";
        setError(message);
        toast.error(message);
      }
      return;
    }

    // Update profile without email change
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: user.email, // Keep current email
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    }
  };

  const handleEmailVerified = async () => {
    // Update other fields after email is verified
    try {
      const values = form.getValues();
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: pendingEmail, // Use verified email
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile and email updated successfully!");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
                {field.value !== user.email && (
                  <p className="text-muted-foreground text-xs">
                    Changing your email will require verification
                  </p>
                )}
              </FormItem>
            )}
          />

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile")}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      <ChangeEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        newEmail={pendingEmail}
        onSuccess={handleEmailVerified}
      />
    </>
  );
}
