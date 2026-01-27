"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSession, authClient } from "@/lib/auth/auth-client";
import { LogOut } from "lucide-react";

/**
 * Main navigation bar component
 * Features logo, navigation links, and auth buttons with smooth animations
 */
export default function Navbar() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8">
            <Image src="/logo-icon.svg" alt="PromptSSD" fill className="object-contain" />
          </div>
          <span className="text-xl font-bold text-white">PromptSSD</span>
        </Link>

        {/* Navigation Links & Auth */}
        <div className="flex items-center space-x-4">
          {!isPending && (
            <>
              {session ? (
                <>
                  <Link href="/feed" className="text-zinc-300 transition-colors hover:text-white">
                    Feed
                  </Link>
                  <Link href="/create" className="text-zinc-300 transition-colors hover:text-white">
                    Create
                  </Link>
                  <Link
                    href="/profile/saved"
                    className="text-zinc-300 transition-colors hover:text-white"
                  >
                    Saved
                  </Link>
                  <Link
                    href="/profile"
                    className="text-zinc-300 transition-colors hover:text-white"
                  >
                    Profile
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSignOut}
                    className="border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
