"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/types";

type Filters = {
  status?: Status;
  owner?: string;
  due?: "due_soon" | "overdue";
  q?: string;
};

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

  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  function clear() {
    startTransition(() => {
      router.push("/");
    });
  }

  const hasFilters =
    initial.status || initial.owner || initial.due || initial.q;

  return (
    <div className="card flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[160px] flex-1">
        <label className="label" htmlFor="filter-status">
          Status
        </label>
        <select
          id="filter-status"
          className="input"
          defaultValue={initial.status ?? ""}
          onChange={(e) => setParam("status", e.target.value || undefined)}
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[160px] flex-1">
        <label className="label" htmlFor="filter-owner">
          Owner
        </label>
        <select
          id="filter-owner"
          className="input"
          defaultValue={initial.owner ?? ""}
          onChange={(e) => setParam("owner", e.target.value || undefined)}
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

      <div className="min-w-[160px] flex-1">
        <label className="label" htmlFor="filter-due">
          Due
        </label>
        <select
          id="filter-due"
          className="input"
          defaultValue={initial.due ?? ""}
          onChange={(e) =>
            setParam("due", (e.target.value as Filters["due"]) || undefined)
          }
        >
          <option value="">Any</option>
          <option value="due_soon">Due in next 7 days</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="min-w-[200px] flex-[2]">
        <label className="label" htmlFor="filter-q">
          Search
        </label>
        <input
          id="filter-q"
          className="input"
          placeholder="title, submitter, or owner…"
          defaultValue={initial.q ?? ""}
          onChange={(e) => setParam("q", e.target.value || undefined)}
        />
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        {hasFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clear}
            disabled={pending}
          >
            Clear
          </button>
        )}
        {pending && (
          <span className="text-xs text-ink-subtle">Updating…</span>
        )}
      </div>
    </div>
  );
}
