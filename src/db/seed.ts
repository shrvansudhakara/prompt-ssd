import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { db } from "./index";
import { user, prompt } from "./schema";

/**
 * Seed script to populate database with test data
 * Run with: npx tsx src/db/seed.ts
 */
async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(prompt);
    await db.delete(user);
    console.log("✅ Existing data cleared");

    // Create test user
    const [testUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        emailVerified: true,
      })
      .returning();

    console.log("✅ Created test user:", testUser.username);

    // Test prompts
    const testPrompts = [
      {
        id: crypto.randomUUID(),
        title: "Write a Blog Post About AI",
        description:
          "A comprehensive prompt for generating SEO-optimized blog posts about artificial intelligence",
        content:
          "You are an expert content writer. Write a 1000-word blog post about [TOPIC]. Include an introduction, 3 main points with examples, and a conclusion. Use a friendly, engaging tone.",
        userId: testUser.id,
        upvotes: 42,
      },
      {
        id: crypto.randomUUID(),
        title: "Debug Python Code",
        description: "Help identify and fix bugs in Python code with detailed explanations",
        content:
          "You are a senior Python developer. Review this code and identify any bugs, security issues, or performance problems. Provide fixes with explanations:\n\n[PASTE CODE HERE]",
        userId: testUser.id,
        upvotes: 28,
      },
      {
        id: crypto.randomUUID(),
        title: "Create Social Media Content",
        description: "Generate engaging social media posts for various platforms",
        content:
          "You are a social media expert. Create 5 engaging posts for [PLATFORM] about [TOPIC]. Include relevant hashtags and emojis. Keep it under 280 characters per post.",
        userId: testUser.id,
        upvotes: 15,
      },
      {
        id: crypto.randomUUID(),
        title: "Explain Complex Topics Simply",
        description: "Break down complicated subjects for easy understanding",
        content:
          "You are an expert educator. Explain [TOPIC] to a 10-year-old using simple language, analogies, and examples they can relate to.",
        userId: testUser.id,
        upvotes: 67,
      },
      {
        id: crypto.randomUUID(),
        title: "Code Review Assistant",
        description: "Get detailed code reviews with best practices and suggestions",
        content:
          "You are a senior software engineer. Review this code for: 1) bugs, 2) performance issues, 3) security vulnerabilities, 4) code style, 5) best practices. Provide specific suggestions.",
        userId: testUser.id,
        upvotes: 53,
      },
      {
        id: crypto.randomUUID(),
        title: "Creative Story Generator",
        description: "Generate engaging short stories with plot twists",
        content:
          "You are a creative fiction writer. Write a 500-word short story about [THEME]. Include an unexpected plot twist, vivid descriptions, and emotional depth.",
        userId: testUser.id,
        upvotes: 31,
      },
      {
        id: crypto.randomUUID(),
        title: "Email Response Template",
        description: "Professional email responses for common business situations",
        content:
          "You are a professional communication expert. Write a polite and professional email response to [SITUATION]. Keep it concise, friendly, and actionable.",
        userId: testUser.id,
        upvotes: 89,
      },
      {
        id: crypto.randomUUID(),
        title: "SQL Query Generator",
        description: "Convert natural language to optimized SQL queries",
        content:
          "You are a database expert. Convert this request into an optimized SQL query: [REQUEST]. Include explanations for complex joins and provide alternative approaches if applicable.",
        userId: testUser.id,
        upvotes: 44,
      },
      {
        id: crypto.randomUUID(),
        title: "Meeting Notes Summarizer",
        description: "Turn long meeting transcripts into actionable summaries",
        content:
          "You are an executive assistant. Summarize this meeting transcript into: 1) Key decisions, 2) Action items with owners, 3) Important dates, 4) Follow-up questions.",
        userId: testUser.id,
        upvotes: 72,
      },
      {
        id: crypto.randomUUID(),
        title: "Recipe Creator",
        description: "Generate creative recipes based on available ingredients",
        content:
          "You are a professional chef. Create a delicious recipe using these ingredients: [INGREDIENTS]. Include prep time, cook time, servings, and step-by-step instructions.",
        userId: testUser.id,
        upvotes: 38,
      },
      {
        id: crypto.randomUUID(),
        title: "Interview Question Analyzer",
        description: "Practice technical interview questions with detailed solutions",
        content:
          "You are a senior technical interviewer. Analyze this interview question: [QUESTION]. Provide: 1) Multiple solution approaches, 2) Time/space complexity, 3) Common mistakes, 4) Follow-up questions.",
        userId: testUser.id,
        upvotes: 91,
      },
      {
        id: crypto.randomUUID(),
        title: "Marketing Copy Writer",
        description: "Create compelling marketing copy that converts",
        content:
          "You are a conversion copywriter. Write marketing copy for [PRODUCT/SERVICE]. Include: 1) Attention-grabbing headline, 2) Pain points addressed, 3) Clear benefits, 4) Strong CTA.",
        userId: testUser.id,
        upvotes: 56,
      },
    ];

    await db.insert(prompt).values(testPrompts);

    console.log("✅ Created test prompts:", testPrompts.length);
    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
