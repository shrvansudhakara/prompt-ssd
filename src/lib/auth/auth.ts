import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

/**
 * Better Auth server-side configuration
 *
 * Configures authentication with:
 * - Email/password authentication
 * - Username plugin for unique usernames
 * - Drizzle ORM adapter with PostgreSQL
 * - Custom user fields (firstName, lastName, username)
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [username()],
  user: {
    fields: {
      name: "username",
    },
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
        returned: true,
      },
      username: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },
    },
  },
});
