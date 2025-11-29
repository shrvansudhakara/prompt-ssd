import { db } from "@/db";
import { prompt } from "@/db/schema";
import { eq } from "drizzle-orm";
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

  // Fetch the prompt
  const [promptData] = await db.select().from(prompt).where(eq(prompt.id, id));

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
