"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  promptId: string;
  isAuthenticated: boolean;
}

/**
 * Save/bookmark button component
 * Allows users to save prompts to their collection
 */
export default function SaveButton({ promptId, isAuthenticated }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch save status on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchSaveStatus() {
      try {
        const res = await fetch(`/api/prompts/${promptId}/save/status`);
        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.saved);
        }
      } catch (error) {
        console.error("Error fetching save status:", error);
      }
    }

    fetchSaveStatus();
  }, [promptId, isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save prompts");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/prompts/${promptId}/save`, { method });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      const data = await res.json();
      setIsSaved(data.saved);

      toast.success(data.saved ? "Prompt saved!" : "Prompt removed from saved");
    } catch (error) {
      // Revert on error
      setIsSaved(previousSaved);
      toast.error("Failed to save prompt. Please try again.");
      console.error("Error saving prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSave}
      disabled={isLoading}
      className={cn(
        "hover:bg-blue-100 dark:hover:bg-blue-900/20",
        isSaved && "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
      )}
      aria-label={isSaved ? "Remove from saved" : "Save prompt"}
    >
      <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
    </Button>
  );
}
