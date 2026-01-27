import { db } from "@/db";
import { vote, prompt, user } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VotesHistory from "@/components/profile/VotesHistory";

/**
 * User votes history page - shows upvoted and downvoted prompts
 */
export default async function VotesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/profile/votes");
  }

  // Fetch user's upvoted prompts
  const upvotedPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      upvotes: prompt.upvotes,
      createdAt: prompt.createdAt,
      userId: prompt.userId,
      votedAt: vote.createdAt,
      author: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
    .from(vote)
    .innerJoin(prompt, eq(vote.promptId, prompt.id))
    .leftJoin(user, eq(prompt.userId, user.id))
    .where(and(eq(vote.userId, session.user.id), eq(vote.voteType, "up")))
    .orderBy(desc(vote.createdAt));

  // Fetch user's downvoted prompts
  const downvotedPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      upvotes: prompt.upvotes,
      createdAt: prompt.createdAt,
      userId: prompt.userId,
      votedAt: vote.createdAt,
      author: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
    .from(vote)
    .innerJoin(prompt, eq(vote.promptId, prompt.id))
    .leftJoin(user, eq(prompt.userId, user.id))
    .where(and(eq(vote.userId, session.user.id), eq(vote.voteType, "down")))
    .orderBy(desc(vote.createdAt));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Votes</h1>
        <p className="text-muted-foreground mt-2">Prompts you&apos;ve upvoted and downvoted</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <VotesHistory upvoted={upvotedPrompts} downvoted={downvotedPrompts} />
        </CardContent>
      </Card>
    </div>
  );
}
