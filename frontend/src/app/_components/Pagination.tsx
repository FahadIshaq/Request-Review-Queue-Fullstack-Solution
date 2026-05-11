"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function go(target: number) {
    const clamped = Math.min(Math.max(1, target), totalPages);
    if (clamped === page) return;
    const next = new URLSearchParams(params.toString());
    if (clamped <= 1) next.delete("page");
    else next.set("page", String(clamped));
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/60 px-5 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
      <p className="flex items-center gap-2 text-ink-muted dark:text-slate-400">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            <span>
              Showing{" "}
              <span className="font-medium text-ink tabular-nums dark:text-slate-100">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-medium text-ink tabular-nums dark:text-slate-100">
                {total}
              </span>
            </span>
            {pending && (
              <span className="ml-1 inline-flex items-center text-xs text-ink-subtle dark:text-slate-500">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-700 dark:border-t-brand-300" />
                <span className="ml-1.5">Loading…</span>
              </span>
            )}
          </>
        )}
      </p>
      <nav
        aria-label="Pagination"
        className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900"
      >
        <PageButton
          onClick={() => go(1)}
          disabled={page <= 1 || pending}
          ariaLabel="First page"
          className="rounded-l-lg"
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </PageButton>
        <PageButton
          onClick={() => go(page - 1)}
          disabled={page <= 1 || pending}
          ariaLabel="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </PageButton>
        <span className="px-3 py-1.5 text-xs text-ink-muted tabular-nums dark:text-slate-400">
          Page{" "}
          <span className="font-medium text-ink dark:text-slate-100">
            {page}
          </span>{" "}
          /{" "}
          <span className="font-medium text-ink dark:text-slate-100">
            {totalPages}
          </span>
        </span>
        <PageButton
          onClick={() => go(page + 1)}
          disabled={page >= totalPages || pending}
          ariaLabel="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </PageButton>
        <PageButton
          onClick={() => go(totalPages)}
          disabled={page >= totalPages || pending}
          ariaLabel="Last page"
          className="rounded-r-lg"
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex h-8 w-8 items-center justify-center border-r border-slate-200 text-ink-muted transition last:border-r-0 hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${className}`}
    >
      {children}
    </button>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function ChevronsLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
    </svg>
  );
}
function ChevronsRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
    </svg>
  );
}
