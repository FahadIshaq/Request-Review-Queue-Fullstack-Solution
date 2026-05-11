import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Request Review Queue",
  description: "Internal queue for reviewing incoming requests.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                aria-label="Request Review Queue — home"
                className="inline-flex items-center"
              >
                <Image
                  src="/logo.svg"
                  alt="Request Review Queue"
                  width={690}
                  height={220}
                  priority
                  className="h-9 w-auto sm:h-10 dark:invert dark:brightness-95"
                />
              </Link>
              <nav className="flex items-center gap-4 text-sm text-ink-muted dark:text-slate-400">
                <Link
                  href="/"
                  className="hover:text-ink dark:hover:text-slate-100"
                >
                  Queue
                </Link>
                <Link
                  href="/new"
                  className="hover:text-ink dark:hover:text-slate-100"
                >
                  New request
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
