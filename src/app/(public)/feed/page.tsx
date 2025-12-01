"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import PromptCard from "@/components/prompts/PromptCard";
import SearchBar from "@/components/prompts/SearchBar";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

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
  tags: Array<{ id: string; name: string; slug: string }>;
};

async function fetchPrompts({
  pageParam = 1,
  query = "",
  tags = [],
}: {
  pageParam?: number;
  query?: string;
  tags?: string[];
}) {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: "9",
  });

  if (query) params.append("search", query);
  if (tags.length > 0) params.append("tags", tags.join(","));

  const res = await fetch(`/api/prompts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

async function fetchTags() {
  const res = await fetch("/api/tags");
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

export default function FeedPage() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["prompts", searchQuery, selectedTags],
      queryFn: ({ pageParam }) =>
        fetchPrompts({
          pageParam,
          query: searchQuery,
          tags: selectedTags,
        }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    });

  // Scroll to top when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery, selectedTags]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = useCallback((query: string, tags: string[]) => {
    setSearchQuery(query);
    setSelectedTags(tags);

    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (tags.length > 0) params.set("tags", tags.join(","));

    const search = params.toString();
    window.history.replaceState({}, "", search ? `/feed?${search}` : "/feed");
  }, []);

  const allPrompts = data?.pages.flatMap((page) => page.prompts) ?? [];
  const tags = tagsData?.tags || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Prompts</h1>
        <p className="text-muted-foreground mt-2">
          Discover and explore AI prompts shared by the community
        </p>
      </div>

      <div className="mb-8">
        {tags.length > 0 ? (
          <SearchBar
            tags={tags}
            initialQuery={searchQuery}
            initialSelectedTags={selectedTags}
            onSearch={handleSearch}
          />
        ) : (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {isError ? (
        <div className="py-12 text-center text-red-500">
          <AlertCircle className="mx-auto mb-4 h-10 w-10" />
          <p>Something went wrong loading the prompts. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : allPrompts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery || selectedTags.length > 0
              ? "No prompts found matching your search."
              : "No prompts yet. Be the first to share one!"}
          </p>
        </div>
      ) : (
        <>
          <motion.div
            // FIX: Add key to force remount/re-animation when filters change
            key={`${searchQuery}-${selectedTags.join(",")}`}
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
