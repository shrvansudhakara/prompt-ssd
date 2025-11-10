import Image from "next/image";

/**
 * Home page component displaying a coming soon message
 * Features hero logo, project tagline, and animated status text
 *
 * @returns {JSX.Element} The coming soon landing page
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-zinc-950 to-zinc-900 px-4">
      <div className="flex flex-col items-center space-y-12 text-center">
        {/* Hero Logo */}
        <div className="relative h-32 w-80 sm:h-40 sm:w-96">
          <Image src="/logo-dark.svg" alt="PromptSSD" fill className="object-contain" priority />
        </div>

        {/* Tagline */}
        <p className="max-w-xl text-xl text-zinc-400 sm:text-2xl">
          A community-driven platform for sharing, discovering, and referencing AI prompts.
        </p>

        {/* Coming Soon Text */}
        <p className="animate-pulse text-sm font-medium tracking-wider text-zinc-500">
          COMING SOON...
        </p>
      </div>
    </main>
  );
}
