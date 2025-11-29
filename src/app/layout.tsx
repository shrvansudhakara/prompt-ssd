import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata configuration for the application
 * Defines the page title and description for SEO
 */
export const metadata: Metadata = {
  title: "PromptSSD - Share, Discover & Reference AI Prompts",
  description: "A community-driven platform for sharing, discovering, and referencing AI prompts.",
};

/**
 * Root layout component that wraps all pages
 * Configures global fonts, styling, dark theme, and layout structure
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root layout structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Implement dynamic theme switching when adding user preferences
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
