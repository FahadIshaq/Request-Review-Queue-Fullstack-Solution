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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-ink-muted dark:text-slate-400">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-ink dark:text-slate-100">
              {start}–{end}
            </span>{" "}
            of{" "}
            <span className="font-medium text-ink dark:text-slate-100">
              {total}
            </span>
          </>
        )}
        {pending && (
          <span className="ml-3 inline-flex items-center text-xs text-ink-subtle dark:text-slate-500">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-200" />
            <span className="ml-1.5">Loading…</span>
          </span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary py-1"
          onClick={() => go(1)}
          disabled={page <= 1 || pending}
          aria-label="First page"
        >
          « First
        </button>
        <button
          type="button"
          className="btn btn-secondary py-1"
          onClick={() => go(page - 1)}
          disabled={page <= 1 || pending}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>
        <span className="px-2 text-xs text-ink-muted dark:text-slate-400">
          Page{" "}
          <span className="font-medium text-ink dark:text-slate-100">
            {page}
          </span>{" "}
          of{" "}
          <span className="font-medium text-ink dark:text-slate-100">
            {totalPages}
          </span>
        </span>
        <button
          type="button"
          className="btn btn-secondary py-1"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages || pending}
          aria-label="Next page"
        >
          Next ›
        </button>
        <button
          type="button"
          className="btn btn-secondary py-1"
          onClick={() => go(totalPages)}
          disabled={page >= totalPages || pending}
          aria-label="Last page"
        >
          Last »
        </button>
      </div>
    </div>
  );
}
