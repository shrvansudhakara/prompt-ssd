"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPromptSchema, type CreatePromptInput } from "@/lib/validations/prompt-schemas";
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

interface CreatePromptFormProps {
  userId: string;
}

/**
 * Form for creating a new prompt
 * Validates input and submits to API
 */
export default function CreatePromptForm({ userId }: CreatePromptFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const form = useForm<CreatePromptInput>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      videoUrl: "",
    },
  });

  const onSubmit = async (values: CreatePromptInput) => {
    setError("");

    try {
      const res = await fetch("/api/prompts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create prompt");
      }

      const { promptId } = await res.json();
      router.push(`/prompt/${promptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Write a Blog Post About AI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Short description of what this prompt does" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Content *</FormLabel>
                  <FormControl>
                    <textarea
                      className="border-input bg-background min-h-[200px] w-full rounded-md border p-3"
                      placeholder="You are an expert... [Write your prompt here]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              {imageUrl ? (
                <div className="space-y-2">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="max-w-xs rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageUrl("");
                      form.setValue("imageUrl", "");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const url = res[0]?.url;
                    if (url) {
                      setImageUrl(url);
                      form.setValue("imageUrl", url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video (optional)</Label>
              {videoUrl ? (
                <div className="space-y-2">
                  <video src={videoUrl} controls className="max-w-xs rounded-lg" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVideoUrl("");
                      form.setValue("videoUrl", "");
                    }}
                  >
                    Remove Video
                  </Button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="videoUploader"
                  onClientUploadComplete={(res) => {
                    const url = res[0]?.url;
                    if (url) {
                      setVideoUrl(url);
                      form.setValue("videoUrl", url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              )}
            </div>

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
                    Creating...
                  </>
                ) : (
                  "Create Prompt"
                )}
              </Button>

              <Button type="button" variant="outline" onClick={() => router.push("/feed")}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
