"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPromptSchema, type CreatePromptInput } from "@/lib/validations/prompt-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

/**
 * Form for creating a new prompt with custom tag input
 */
export default function CreatePromptForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const form = useForm<CreatePromptInput>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      videoUrl: "",
      tagNames: [],
    },
  });

  // Fetch existing tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      } finally {
        setIsLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
          !selectedTags.includes(tag.name)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [tagInput, availableTags, selectedTags]);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      const newTags = [...selectedTags, trimmed];
      setSelectedTags(newTags);
      form.setValue("tagNames", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagName: string) => {
    const newTags = selectedTags.filter((t) => t !== tagName);
    setSelectedTags(newTags);
    form.setValue("tagNames", newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "," || e.key === ";") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const onSubmit = async (values: CreatePromptInput) => {
    setError("");

    try {
      const res = await fetch("/api/prompts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tagNames: selectedTags,
        }),
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
                    <Input placeholder="Give your prompt a catchy, searchable title" {...field} />
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
                    <Input placeholder="Briefly explain how this prompt helps others" {...field} />
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
                  <FormLabel>Prompt *</FormLabel>
                  <FormControl>
                    <textarea
                      className="border-input bg-background min-h-[200px] w-full rounded-md border p-3"
                      placeholder="Paste your full prompt here. Use brackets [ ] for user inputs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Input */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-0.5">
                        {tag}
                        <button
                          type="button" // Crucial: prevents form submission
                          onClick={() => removeTag(tag)}
                          className="hover:bg-destructive/10 hover:text-destructive focus:ring-ring pointer-events-auto rounded-full p-1 focus:ring-2 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {tag} tag</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="relative">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type to add tags (press Enter or comma)"
                    disabled={isLoadingTags}
                  />

                  {/* Tag Suggestions */}
                  {filteredTags.length > 0 && (
                    <div className="bg-popover border-input absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
                      {filteredTags.map((tag) => (
                        <div
                          key={tag.id}
                          className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                          onClick={() => addTag(tag.name)}
                        >
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Add custom tags or select from existing ones. Press Enter or comma to add.
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image</Label>
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
              <Label>Video</Label>
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
