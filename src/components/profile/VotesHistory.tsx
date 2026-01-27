"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowBigUp, ArrowBigDown, User, Clock } from "lucide-react";

interface VotePrompt {
  id: string;
  title: string;
  description: string | null;
  upvotes: number;
  createdAt: Date;
  userId: string;
  votedAt: Date;
  author: {
    username: string;
    firstName: string;
    lastName: string | null;
  } | null;
}

interface VotesHistoryProps {
  upvoted: VotePrompt[];
  downvoted: VotePrompt[];
}

/**
 * Component displaying user's voting history with tabs
 */
export default function VotesHistory({ upvoted, downvoted }: VotesHistoryProps) {
  const [activeTab, setActiveTab] = useState<"upvoted" | "downvoted">("upvoted");

  const currentPrompts = activeTab === "upvoted" ? upvoted : downvoted;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("upvoted")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === "upvoted"
              ? "border-primary text-primary border-b-2"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowBigUp className="h-4 w-4" />
          Upvoted ({upvoted.length})
        </button>
        <button
          onClick={() => setActiveTab("downvoted")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === "downvoted"
              ? "border-primary text-primary border-b-2"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowBigDown className="h-4 w-4" />
          Downvoted ({downvoted.length})
        </button>
      </div>

      {/* Prompts List */}
      {currentPrompts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No {activeTab === "upvoted" ? "upvoted" : "downvoted"} prompts yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentPrompts.map((prompt) => {
            const authorName = prompt.author
              ? `${prompt.author.firstName} ${prompt.author.lastName || ""}`.trim()
              : "Unknown";

            return (
              <Link key={prompt.id} href={`/prompt/${prompt.id}`}>
                <Card className="hover:bg-accent/50 cursor-pointer p-4 transition-colors">
                  <div className="space-y-2">
                    {/* Title */}
                    <h3 className="text-lg font-semibold">{prompt.title}</h3>

                    {/* Description */}
                    {prompt.description && (
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {prompt.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{authorName}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Voted {new Date(prompt.votedAt).toLocaleDateString()}</span>
                      </div>

                      <Badge variant="secondary" className="flex items-center gap-1">
                        {activeTab === "upvoted" ? (
                          <ArrowBigUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowBigDown className="h-3 w-3 text-red-500" />
                        )}
                        {prompt.upvotes}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
