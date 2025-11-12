"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Hero section for the landing page
 * Features animated image, headline, description, and CTA buttons
 *
 * @returns {JSX.Element} The animated hero section
 */
export default function Hero() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-linear-to-b from-zinc-950 to-zinc-900 px-4">
      <div className="flex max-w-3xl flex-col items-center space-y-6 text-center">
        {/* Landing Image */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-72 w-72 sm:h-96 sm:w-96"
        >
          <Image
            src="/landing.png"
            alt="Landing page image"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white sm:text-4xl md:text-5xl"
        >
          Share, Discover & Reference <br />
          AI Prompts
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-xl text-base text-zinc-400 sm:text-lg"
        >
          Explore a curated collection of AI prompts, get inspired, and contribute your own ideas to
          the community
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <Button size="default">Browse Prompts</Button>
          <Button variant="outline" size="default">
            Join Community
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
