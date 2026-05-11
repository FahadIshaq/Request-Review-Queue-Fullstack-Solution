import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
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
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 bg-white">
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
                className="h-9 w-auto sm:h-10"
              />
            </Link>
            <nav className="flex items-center gap-4 text-sm text-ink-muted">
              <Link href="/" className="hover:text-ink">
                Queue
              </Link>
              <Link href="/new" className="hover:text-ink">
                New request
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
