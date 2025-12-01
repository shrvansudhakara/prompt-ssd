"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  tags: Array<{ id: string; name: string; slug: string }>;
  initialQuery?: string;
  initialSelectedTags?: string[];
  onSearch: (query: string, selectedTags: string[]) => void;
}

/**
 * Search bar component with keyword search and tag filtering
 */
export default function SearchBar({
  tags,
  initialQuery = "",
  initialSelectedTags = [],
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [query]);

  // Trigger search when debounced query or tags change
  useEffect(() => {
    onSearch(debouncedQuery, selectedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedTags]);

  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
  };

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedTags([]);
  };

  const hasFilters = query || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search prompts by keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10 pl-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tag filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Filter by tags:</p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active filters display */}
      {hasFilters && (
        <div className="text-muted-foreground text-sm">
          {query && <span>Searching for: &quot;{query}&quot;</span>}
          {query && selectedTags.length > 0 && <span> • </span>}
          {selectedTags.length > 0 && (
            <span>
              {selectedTags.length} tag{selectedTags.length > 1 ? "s" : ""} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
}
