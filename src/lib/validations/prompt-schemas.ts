import { z } from "zod";

/**
 * Schema for creating a new prompt
 */
export const createPromptSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title must be at least 1 character")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1,000 characters")
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, "Prompt must be at least 1 character")
    .max(10000, "Prompt must not exceed 10,000 characters"),
  imageUrl: z.union([z.url(), z.literal("")]).optional(),
  videoUrl: z.union([z.url(), z.literal("")]).optional(),
  tagNames: z.array(z.string().trim().min(1, "Tag cannot be empty")).optional(),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
