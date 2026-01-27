import { db } from "@/db";
import { prompt, promptTag, tag } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import EditPromptForm from "@/components/prompts/EditPromptForm";

interface EditPromptPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Edit prompt page - only accessible by prompt creator
 */
export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch the prompt with tags
  const [promptData] = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      imageUrl: prompt.imageUrl,
      videoUrl: prompt.videoUrl,
      userId: prompt.userId,
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
    .from(prompt)
    .leftJoin(promptTag, eq(prompt.id, promptTag.promptId))
    .leftJoin(tag, eq(promptTag.tagId, tag.id))
    .where(eq(prompt.id, id))
    .groupBy(prompt.id);

  if (!promptData) {
    notFound();
  }

  // Check ownership
  if (promptData.userId !== session.user.id) {
    redirect(`/prompt/${id}`);
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Prompt</h1>
        <p className="text-muted-foreground mt-2">Update your prompt details</p>
      </div>

      <EditPromptForm prompt={promptData} />
    </div>
  );
}
