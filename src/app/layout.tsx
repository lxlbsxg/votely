import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Votely",
  description: "Share opinions, vote, and see what people really think.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
          <Link href="/" className="text-lg font-semibold">
            Votely
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {session && (
              <>
                <Link href="/publish" className="hover:underline">
                  Publish
                </Link>
                <Link href="/chat" className="hover:underline">
                  Chat
                </Link>
                <Link href="/friends" className="hover:underline">
                  Friends
                </Link>
                <Link href="/groups" className="hover:underline">
                  Groups
                </Link>
              </>
            )}
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            {!session && (
              <Link
                href="/login"
                className="rounded-full bg-foreground px-4 py-1.5 text-background"
              >
                Sign in
              </Link>
            )}
          </nav>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
