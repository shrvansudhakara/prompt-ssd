import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { usernameClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

/**
 * Better Auth client-side configuration
 *
 * Provides React hooks and methods for authentication:
 * - signIn/signUp/signOut methods
 * - useSession hook for session state
 * - Type-safe with inferred user fields from server config
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>(), usernameClient()],
});

/**
 * Authentication methods and hooks
 *
 * @property signIn - Authenticate user with credentials
 * @property signUp - Register new user account
 * @property signOut - End user session
 * @property useSession - React hook for accessing current session
 */
export const { signIn, signUp, signOut, useSession } = authClient;
