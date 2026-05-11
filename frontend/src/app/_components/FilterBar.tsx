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

  function clear() {
    setSearch("");
    startTransition(() => {
      router.push("/");
    });
  }

  const hasFilters =
    Boolean(initial.status || initial.owner || initial.due || initial.q) ||
    Boolean(search.trim());

  return (
    <div className="card space-y-3 p-4">
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
            <option value="">All</option>
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
            <option value="">Any</option>
            <option value="due_soon">Due in next 7 days</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-q">
            Search
          </label>
          <input
            id="filter-q"
            className="input"
            placeholder="title, submitter, or owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex h-6 items-center justify-end gap-3 text-xs">
        <span
          className={`text-ink-subtle transition-opacity ${
            pending ? "opacity-100" : "opacity-0"
          }`}
          aria-live="polite"
        >
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 align-middle" />
          <span className="ml-2">Updating…</span>
        </span>
        <button
          type="button"
          className="btn btn-secondary py-1"
          onClick={clear}
          disabled={pending || !hasFilters}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
