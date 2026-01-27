import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CreatePromptForm from "@/components/prompts/CreatePromptForm";

/**
 * Create prompt page - protected route requiring authentication
 */
export default async function CreatePromptPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Prompt</h1>
        <p className="text-muted-foreground mt-2">Share your AI prompt with the community</p>
      </div>

      <CreatePromptForm />
    </div>
  );
}
