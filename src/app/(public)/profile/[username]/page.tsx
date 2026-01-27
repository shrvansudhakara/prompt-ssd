import { db } from "@/db";
import { user, prompt } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import PromptCard from "@/components/prompts/PromptCard";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

/**
 * Public user profile page - shows user info and their prompts
 */
export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  // Fetch user by username
  const [userData] = await db
    .select({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (!userData) {
    notFound();
  }

  // Fetch user's prompt count
  const [promptCount] = await db
    .select({ count: count() })
    .from(prompt)
    .where(eq(prompt.userId, userData.id));

  // Fetch total upvotes received
  const [upvotesReceived] = await db
    .select({
      upvotes: sql<number>`COALESCE(SUM(${prompt.upvotes}), 0)`,
    })
    .from(prompt)
    .where(eq(prompt.userId, userData.id));

  // Fetch user's recent prompts (limit 12)
  const userPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      upvotes: prompt.upvotes,
      createdAt: prompt.createdAt,
      userId: prompt.userId,
    })
    .from(prompt)
    .where(eq(prompt.userId, userData.id))
    .orderBy(desc(prompt.createdAt))
    .limit(12);

  // Map to include author info and empty tags
  const promptsWithAuthor = userPrompts.map((p) => ({
    ...p,
    author: {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
    },
    tags: [],
  }));

  const joinDate = new Date(userData.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fullName = `${userData.firstName} ${userData.lastName || ""}`.trim();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{fullName}</h1>
        <p className="text-muted-foreground mt-1">@{userData.username}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - User Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">@{userData.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Joined {joinDate}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{promptCount.count}</p>
                <p className="text-muted-foreground text-sm">Prompts</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{upvotesReceived.upvotes}</p>
                <p className="text-muted-foreground text-sm">Upvotes Received</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - User's Prompts */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Prompts</CardTitle>
              <CardDescription>
                {fullName}&apos;s prompts ({promptCount.count} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {promptsWithAuthor.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No prompts yet</h3>
                  <p className="text-muted-foreground text-sm">
                    {fullName} hasn&apos;t created any prompts yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {promptsWithAuthor.map((p) => (
                    <PromptCard key={p.id} prompt={p} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
