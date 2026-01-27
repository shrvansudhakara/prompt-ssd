"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import VoteButtons from "./VoteButtons";
import SaveButton from "./SaveButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PromptDetailProps {
  prompt: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    imageUrl: string | null;
    videoUrl: string | null;
    upvotes: number;
    createdAt: Date;
    userId: string;
    author: {
      username: string;
      firstName: string;
      lastName: string | null;
    } | null;
    tags: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
  currentUserId?: string;
  isAuthenticated: boolean;
}

/**
 * Prompt detail component showing full prompt information
 * Includes copy button, author info, tags, and upvote UI
 */
export default function PromptDetail({
  prompt,
  currentUserId,
  isAuthenticated,
}: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      router.push("/feed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete prompt";
      alert(message);
    }
  };

  const authorDisplay = prompt.author?.username || "Unknown";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold">{prompt.title}</h1>
                {prompt.description && (
                  <p className="text-muted-foreground">{prompt.description}</p>
                )}

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <Link key={tag.id} href={`/feed?tags=${tag.id}`}>
                        <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <VoteButtons
                  promptId={prompt.id}
                  initialUpvotes={prompt.upvotes}
                  isAuthenticated={isAuthenticated}
                />

                <SaveButton promptId={prompt.id} isAuthenticated={isAuthenticated} />

                {/* Show edit/delete only for owner */}
                {currentUserId === prompt.userId && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/prompt/${prompt.id}/edit`)}
                      aria-label="Edit prompt"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Delete prompt">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Prompt?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your prompt.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            {/* Author and date */}
            <div className="text-muted-foreground mt-4 flex items-center gap-4 text-sm">
              {prompt.author?.username ? (
                <Link
                  href={`/profile/${prompt.author.username}`}
                  className="hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>@{authorDisplay}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>@{authorDisplay}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Prompt */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Prompt</h2>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap">{prompt.content}</pre>
              </div>
            </div>

            {/* Media (if exists) */}
            {prompt.imageUrl && (
              <div>
                <h2 className="mb-2 text-lg font-semibold">Preview</h2>
                <div className="relative w-full max-w-[600px]">
                  <Image
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    width={800}
                    height={600}
                    className="h-auto max-h-[400px] w-full rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            {prompt.videoUrl && (
              <div>
                <h2 className="mb-2 text-lg font-semibold">Video Demo</h2>
                <div className="w-full max-w-[600px]">
                  <video
                    src={prompt.videoUrl}
                    controls
                    className="h-auto max-h-[400px] w-full rounded-lg"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
