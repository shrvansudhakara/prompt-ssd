"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  promptId: string;
  initialUpvotes: number;
  isAuthenticated: boolean;
}

/**
 * Vote buttons component with upvote/downvote functionality
 * Supports optimistic updates and real-time vote count
 */
export default function VoteButtons({
  promptId,
  initialUpvotes,
  isAuthenticated,
}: VoteButtonsProps) {
  const [voteType, setVoteType] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's current vote status
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchVoteStatus() {
      try {
        const res = await fetch(`/api/prompts/${promptId}/vote/status`);
        if (res.ok) {
          const data = await res.json();
          setVoteType(data.voteType);
        }
      } catch (error) {
        console.error("Error fetching vote status:", error);
      }
    }

    fetchVoteStatus();
  }, [promptId, isAuthenticated]);

  const handleVote = async (newVoteType: "up" | "down") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote on prompts");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const previousVoteType = voteType;
    const previousUpvotes = upvotes;

    // Calculate new vote count
    let delta = 0;
    if (previousVoteType === null) {
      // No previous vote
      delta = newVoteType === "up" ? 1 : -1;
      setVoteType(newVoteType);
    } else if (previousVoteType === newVoteType) {
      // Clicking same button - remove vote
      delta = newVoteType === "up" ? -1 : 1;
      setVoteType(null);
    } else {
      // Switching vote type
      delta = newVoteType === "up" ? 2 : -2;
      setVoteType(newVoteType);
    }

    setUpvotes(previousUpvotes + delta);

    try {
      const res = await fetch(`/api/prompts/${promptId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: newVoteType }),
      });

      if (!res.ok) {
        throw new Error("Failed to vote");
      }

      const data = await res.json();
      setVoteType(data.voteType);
    } catch (error) {
      // Revert optimistic update on error
      setVoteType(previousVoteType);
      setUpvotes(previousUpvotes);

      console.error("Error voting:", error);
      toast.error("Failed to register vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("up")}
        disabled={isLoading}
        className={cn(
          "hover:bg-green-100 dark:hover:bg-green-900/20",
          voteType === "up" && "bg-green-100 text-green-600 dark:bg-green-900/20"
        )}
      >
        <ArrowBigUp className={cn("h-5 w-5", voteType === "up" && "fill-current")} />
      </Button>

      <span className="min-w-[3ch] text-center font-semibold">{upvotes}</span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("down")}
        disabled={isLoading}
        className={cn(
          "hover:bg-red-100 dark:hover:bg-red-900/20",
          voteType === "down" && "bg-red-100 text-red-600 dark:bg-red-900/20"
        )}
      >
        <ArrowBigDown className={cn("h-5 w-5", voteType === "down" && "fill-current")} />
      </Button>
    </div>
  );
}
