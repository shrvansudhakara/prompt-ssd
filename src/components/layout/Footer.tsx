import Link from "next/link";

/**
 * Footer component with links and copyright information
 *
 * @returns {JSX.Element} The footer section
 */
export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Footer Note */}
          <div className="text-center md:text-left">
            <p className="text-sm text-zinc-400">© {new Date().getFullYear()} PromptSSD</p>
            <p className="mt-1 text-xs">
              Made with <span className="animate-pulse text-red-500">☕</span> -{" "}
              <Link
                href="https://x.com/shrvansudhakara"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground font-medium transition-colors"
              >
                Shrvan Sudhakara
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
