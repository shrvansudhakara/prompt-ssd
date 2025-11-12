"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Main navigation bar component
 * Features logo, navigation links, and auth buttons with smooth animations
 *
 * @returns {JSX.Element} The animated navigation bar
 */
export default function Navbar() {
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

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Sign In
          </Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </motion.nav>
  );
}
