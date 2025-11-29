"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowBigUp, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    description: string | null;
    upvotes: number;
    createdAt: Date;
    userId: string;
    author: {
      username: string;
      firstName: string;
      lastName: string | null;
    } | null;
  };
}

/**
 * Prompt card component for displaying prompt preview in feed
 * Shows title, description, upvotes, and author info
 */
export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Link href={`/prompt/${prompt.id}`}>
        <Card className="hover:border-primary h-full cursor-pointer transition-colors">
          <CardHeader>
            <h3 className="line-clamp-2 text-xl font-semibold">{prompt.title}</h3>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground line-clamp-3">
              {prompt.description || "No description provided"}
            </p>
          </CardContent>

          <CardFooter className="text-muted-foreground flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ArrowBigUp className="h-4 w-4" />
                <span>{prompt.upvotes}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>
                {prompt.author
                  ? `${prompt.author.firstName} ${prompt.author.lastName || ""}`.trim()
                  : "Unknown"}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
