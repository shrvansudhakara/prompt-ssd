import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
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
