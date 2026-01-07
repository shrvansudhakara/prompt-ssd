import { db } from "@/db";
import { prompt, savedPrompt, vote } from "@/db/schema";
import { eq, count, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Calendar,
  FileText,
  Settings,
  Bookmark,
  ArrowBigUp,
  ArrowBigDown,
} from "lucide-react";
import Link from "next/link";
import PromptCard from "@/components/prompts/PromptCard";

/**
 * User profile page showing account info, stats, and recent prompts
 */
export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  // Fetch user stats
  const [promptsCreated] = await db
    .select({ count: count() })
    .from(prompt)
    .where(eq(prompt.userId, session.user.id));

  const [savedPromptsCount] = await db
    .select({ count: count() })
    .from(savedPrompt)
    .where(eq(savedPrompt.userId, session.user.id));

  // Fetch user's voting activity
  const [userUpvotes] = await db
    .select({ count: count() })
    .from(vote)
    .where(and(eq(vote.userId, session.user.id), eq(vote.voteType, "up")));

  const [userDownvotes] = await db
    .select({ count: count() })
    .from(vote)
    .where(and(eq(vote.userId, session.user.id), eq(vote.voteType, "down")));

  const joinDate = new Date(session.user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Fetch user's recent prompts (limit 6)
  const recentPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      upvotes: prompt.upvotes,
      createdAt: prompt.createdAt,
      userId: prompt.userId,
    })
    .from(prompt)
    .where(eq(prompt.userId, session.user.id))
    .orderBy(desc(prompt.createdAt))
    .limit(6);

  // Map to add author info (since we already have it from session)
  const promptsWithAuthor = recentPrompts.map((p) => ({
    ...p,
    author: {
      username: session.user.username,
      firstName: session.user.firstName,
      lastName: session.user.lastName || null,
    },
    tags: [],
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {session.user.firstName} {session.user.lastName || ""}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/profile/edit">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Sidebar - User Info */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* User Info Card */}
          <Card className="shrink-0">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">@{session.user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">{session.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Joined {joinDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Links */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/profile/saved" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved ({savedPromptsCount.count})
                </Button>
              </Link>
              <Link href="/profile/votes" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowBigUp className="mr-2 h-4 w-4" />
                  Votes ({userUpvotes.count + userDownvotes.count})
                </Button>
              </Link>
              <div className="mt-3 border-t pt-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowBigUp className="h-3 w-3 text-green-500" />
                      Upvotes
                    </span>
                    <span className="font-semibold">{userUpvotes.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowBigDown className="h-3 w-3 text-red-500" />
                      Downvotes
                    </span>
                    <span className="font-semibold">{userDownvotes.count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Recent Prompts */}
        <div className="lg:col-span-3">
          <Card className="flex h-full flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prompts</CardTitle>
                  <CardDescription>
                    Your recent prompts ({promptsCreated.count} total)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {recentPrompts.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <FileText className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No prompts yet</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Create your first prompt to get started!
                  </p>
                  <Link href="/create">
                    <Button>Create Prompt</Button>
                  </Link>
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
