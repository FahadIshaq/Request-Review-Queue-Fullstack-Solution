import Image from "next/image";
import Link from "next/link";
import { ApiStatusIndicator } from "./ApiStatusIndicator";

const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ?? "v1.0.0";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

const HEALTH_URL = API_BASE.replace(/\/api\/?$/, "") + "/health";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
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
                className="h-8 w-auto dark:invert dark:brightness-95"
              />
            </Link>
            <p className="max-w-xs text-sm text-ink-muted dark:text-slate-400">
              Internal tool for triaging and approving incoming review
              requests. Built with explicit business rules and a full activity
              audit trail.
            </p>
            <div className="pt-1 text-xs text-ink-subtle dark:text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {APP_VERSION}
              </span>
            </div>
          </div>

          <FooterSection title="Queue">
            <FooterLink href="/">All requests</FooterLink>
            <FooterLink href="/?due=overdue">Overdue</FooterLink>
            <FooterLink href="/?due=due_soon">Due in next 7 days</FooterLink>
            <FooterLink href="/?status=NEEDS_INFO">Needs info</FooterLink>
            <FooterLink href="/?owner=unassigned">Unassigned</FooterLink>
          </FooterSection>

          <FooterSection title="Actions">
            <FooterLink href="/new">+ New request</FooterLink>
            <FooterLink href="/?status=NEW">Newly submitted</FooterLink>
            <FooterLink href="/?status=IN_REVIEW">In review</FooterLink>
            <FooterLink href="/?status=APPROVED">Approved</FooterLink>
            <FooterLink href="/?status=REJECTED">Rejected</FooterLink>
          </FooterSection>

          <FooterSection title="Resources">
            <FooterExternalLink href={HEALTH_URL}>
              API health
            </FooterExternalLink>
            <FooterExternalLink href={API_BASE}>
              API base · <span className="font-mono text-xs">{API_BASE}</span>
            </FooterExternalLink>
            <div className="pt-1">
              <ApiStatusIndicator healthUrl={HEALTH_URL} />
            </div>
          </FooterSection>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-ink-subtle dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {YEAR} Request Review Queue · Internal use only.
          </p>
          <p className="flex items-center gap-1.5">
            Built with
            <span className="font-medium text-ink-muted dark:text-slate-300">
              Next.js
            </span>
            ·
            <span className="font-medium text-ink-muted dark:text-slate-300">
              Express
            </span>
            ·
            <span className="font-medium text-ink-muted dark:text-slate-300">
              TypeScript
            </span>
            ·
            <span className="font-medium text-ink-muted dark:text-slate-300">
              Tailwind
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-slate-400">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-ink-muted transition hover:text-ink hover:underline dark:text-slate-400 dark:hover:text-slate-100"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="break-all text-ink-muted transition hover:text-ink hover:underline dark:text-slate-400 dark:hover:text-slate-100"
      >
        {children}
      </a>
    </li>
  );
}
