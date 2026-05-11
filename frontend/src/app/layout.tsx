import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-900 focus:px-3 focus:py-1.5 focus:text-sm focus:text-white"
          >
            Skip to content
          </a>
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/70 dark:bg-slate-950/80 dark:supports-[backdrop-filter]:bg-slate-950/60">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
              <Link
                href="/"
                aria-label="Request Review Queue — home"
                className="inline-flex items-center rounded-md transition hover:opacity-90"
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
              <nav className="flex items-center gap-1.5 text-sm font-medium text-ink-muted dark:text-slate-400">
                <Link
                  href="/"
                  className="rounded-md px-3 py-1.5 transition hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  Queue
                </Link>
                <Link
                  href="/new"
                  className="rounded-md px-3 py-1.5 transition hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  New request
                </Link>
                <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main
            id="main-content"
            className="mx-auto w-full max-w-6xl flex-1 px-6 py-10"
          >
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
