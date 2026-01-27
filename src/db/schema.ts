import { pgTable, text, timestamp, boolean, integer, index, primaryKey } from "drizzle-orm/pg-core";

/**
 * Users table schema
 * Stores user account information for authentication and profiles
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  username: text("username").notNull().unique(),
  displayUsername: text("display_username"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Sessions table schema
 * Stores active user sessions with device tracking and expiration
 * Each session is linked to a user and contains authentication tokens
 */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

/**
 * Accounts table schema
 * Stores OAuth provider connections and credential-based authentication
 * Enables account linking - users can connect multiple providers to one account
 * Contains tokens for OAuth and password hash for credentials
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Verification table schema
 * Stores email verification tokens and other verification data
 * Used for email confirmation, password reset, and magic links
 */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * Prompt table schema
 * Stores AI prompts shared by users with metadata and engagement metrics
 */
export const prompt = pgTable(
  "prompt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    upvotes: integer("upvotes").default(0).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("prompt_user_id_idx").on(table.userId),
  })
);

/**
 * Tag table schema
 * Stores reusable tags for categorizing prompts
 */
export const tag = pgTable("tag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Prompt-Tag junction table schema
 * Many-to-many relationship between prompts and tags
 */
export const promptTag = pgTable(
  "prompt_tag",
  {
    promptId: text("prompt_id")
      .notNull()
      .references(() => prompt.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.promptId, table.tagId] }),
    promptIdIdx: index("prompt_tag_prompt_id_idx").on(table.promptId),
    tagIdIdx: index("prompt_tag_tag_id_idx").on(table.tagId),
  })
);

/**
 * Vote table schema
 * Stores user votes (upvote/downvote) on prompts
 */
export const vote = pgTable(
  "vote",
  {
    promptId: text("prompt_id")
      .notNull()
      .references(() => prompt.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    voteType: text("vote_type").$type<"up" | "down">().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.promptId, table.userId] }),
    promptIdIdx: index("vote_prompt_id_idx").on(table.promptId),
    userIdIdx: index("vote_user_id_idx").on(table.userId),
  })
);

/**
 * Saved Prompt table schema
 * Stores user's bookmarked/saved prompts
 */
export const savedPrompt = pgTable(
  "saved_prompt",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    promptId: text("prompt_id")
      .notNull()
      .references(() => prompt.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.promptId] }),
    userIdIdx: index("saved_prompt_user_id_idx").on(table.userId),
    promptIdIdx: index("saved_prompt_prompt_id_idx").on(table.promptId),
  })
);

/**
 * Email verification table for pre-signup OTP verification
 * Stores hashed OTPs with expiration and attempt tracking
 * Security: OTPs are hashed using bcrypt, limited to 3 attempts, expire in 5 minutes
 */
export const emailVerification = pgTable("email_verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  otpHash: text("otp_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
