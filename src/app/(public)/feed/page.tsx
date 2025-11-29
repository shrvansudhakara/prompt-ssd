"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import PromptCard from "@/components/prompts/PromptCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Prompt = {
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

async function fetchPrompts({ pageParam = 1 }: { pageParam?: number }) {
  const res = await fetch(`/api/prompts?page=${pageParam}&limit=9`);
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

export default function FeedPage() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["prompts"],
    queryFn: fetchPrompts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Auto-fetch next page when scroll trigger is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPrompts = data?.pages.flatMap((page) => page.prompts) ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Prompts</h1>
        <p className="text-muted-foreground mt-2">
          Discover and explore AI prompts shared by the community
        </p>
      </div>

      {allPrompts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No prompts yet. Be the first to share one!</p>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {allPrompts.map((prompt: Prompt) => (
              <motion.div
                key={prompt.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                <PromptCard prompt={prompt} />
              </motion.div>
            ))}
          </motion.div>

          {/* Infinite scroll trigger */}
          <div ref={ref} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
