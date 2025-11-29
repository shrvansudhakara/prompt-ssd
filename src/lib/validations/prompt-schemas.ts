import { z } from "zod";

/**
 * Schema for creating a new prompt
 */
export const createPromptSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z.string().max(200, "Description must not exceed 200 characters").optional(),
  content: z
    .string()
    .min(20, "Prompt content must be at least 20 characters")
    .max(5000, "Prompt content must not exceed 5000 characters"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
