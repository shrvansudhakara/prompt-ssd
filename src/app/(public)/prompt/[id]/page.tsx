import { db } from "@/db";
import { prompt, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PromptDetail from "@/components/prompts/PromptDetail";

interface PromptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { id } = await params;

  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch prompt with author info
  const [promptData] = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      imageUrl: prompt.imageUrl,
      videoUrl: prompt.videoUrl,
      upvotes: prompt.upvotes,
      createdAt: prompt.createdAt,
      userId: prompt.userId,
      author: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
    .from(prompt)
    .leftJoin(user, eq(prompt.userId, user.id))
    .where(eq(prompt.id, id));

  // 404 if prompt not found
  if (!promptData) {
    notFound();
  }

  return (
    <PromptDetail
      prompt={promptData}
      currentUserId={session?.user.id}
      isAuthenticated={!!session}
    />
  );
}
