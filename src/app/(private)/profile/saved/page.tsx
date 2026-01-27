import { db } from "@/db";
import { savedPrompt, prompt, user, tag, promptTag } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PromptCard from "@/components/prompts/PromptCard";

/**
 * Saved prompts page - shows user's bookmarked prompts
 */
export default async function SavedPromptsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/profile/saved");
  }

  // Fetch user's saved prompts
  const savedPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      upvotes: prompt.upvotes,
      createdAt: prompt.createdAt,
      userId: prompt.userId,
      savedAt: savedPrompt.savedAt,
      author: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tags: sql<{ id: string; name: string; slug: string }[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${tag.id},
              'name', ${tag.name},
              'slug', ${tag.slug}
            )
          ) FILTER (WHERE ${tag.id} IS NOT NULL),
          '[]'
        )
      `,
    })
    .from(savedPrompt)
    .innerJoin(prompt, eq(savedPrompt.promptId, prompt.id))
    .leftJoin(user, eq(prompt.userId, user.id))
    .leftJoin(promptTag, eq(prompt.id, promptTag.promptId))
    .leftJoin(tag, eq(promptTag.tagId, tag.id))
    .where(eq(savedPrompt.userId, session.user.id))
    .groupBy(prompt.id, user.id, savedPrompt.savedAt)
    .orderBy(desc(savedPrompt.savedAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Prompts</h1>
        <p className="text-muted-foreground mt-2">Prompts you&apos;ve bookmarked for reference</p>
      </div>

      {savedPrompts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t saved any prompts yet. Browse the feed to find prompts to save!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
