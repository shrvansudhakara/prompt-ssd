"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession, authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar, FileText } from "lucide-react";
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  if (!session) {
    return null;
  }
  const joinDate = new Date(session.user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Name</p>
                <p className="font-medium">
                  {session.user.firstName} {session.user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Username</p>
                <p className="font-medium">@{session.user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Joined</p>
                <p className="font-medium">{joinDate}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" disabled>
                Edit Profile (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>Your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-muted-foreground text-sm">Prompts Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-muted-foreground text-sm">Saved Prompts</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-muted-foreground text-sm">Upvotes Received</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Prompts Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Prompts</CardTitle>
          <CardDescription>Prompts you&apos;ve created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No prompts yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create your first prompt to get started!
            </p>
            <Button disabled>Create Prompt (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
