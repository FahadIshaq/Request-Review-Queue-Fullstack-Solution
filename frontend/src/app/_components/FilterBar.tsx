"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/types";

type Filters = {
  status?: Status;
  owner?: string;
  due?: "due_soon" | "overdue";
  q?: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export function FilterBar({
  owners,
  initial,
}: {
  owners: string[];
  initial: Filters;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(initial.q ?? "");

  useEffect(() => {
    setSearch(initial.q ?? "");
  }, [initial.q]);

  useEffect(() => {
    const current = initial.q ?? "";
    if (search === current) return;
    const handle = setTimeout(() => {
      pushFilter("q", search.trim() || undefined);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function pushFilter(key: "status" | "owner" | "due" | "q", value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  return (
    <div className="card space-y-3 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr]">
        <div>
          <label className="label" htmlFor="filter-status">
            Status
          </label>
          <select
            id="filter-status"
            className="input"
            value={initial.status ?? ""}
            onChange={(e) => pushFilter("status", e.target.value || undefined)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-owner">
            Owner
          </label>
          <select
            id="filter-owner"
            className="input"
            value={initial.owner ?? ""}
            onChange={(e) => pushFilter("owner", e.target.value || undefined)}
          >
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-due">
            Due
          </label>
          <select
            id="filter-due"
            className="input"
            value={initial.due ?? ""}
            onChange={(e) =>
              pushFilter("due", (e.target.value as Filters["due"]) || undefined)
            }
          >
            <option value="">Any due date</option>
            <option value="due_soon">Due in next 7 days</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-q">
            Search
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle dark:text-slate-500" />
            <input
              id="filter-q"
              className="input pl-9"
              placeholder="title, submitter, or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {pending && (
              <span className="absolute right-3 top-1/2 inline-block h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500 dark:border-slate-700 dark:border-t-brand-300" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
