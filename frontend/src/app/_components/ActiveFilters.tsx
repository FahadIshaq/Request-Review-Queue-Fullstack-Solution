"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { STATUS_LABELS, type Status } from "@/lib/types";

type Filters = {
  status?: Status;
  owner?: string;
  due?: "due_soon" | "overdue";
  q?: string;
};

const DUE_LABELS = {
  due_soon: "Due soon",
  overdue: "Overdue",
} as const;

export function ActiveFilters({
  filters,
  active,
}: {
  filters: Filters;
  active: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (!active) return null;

  function remove(key: keyof Filters) {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/?${qs}` : "/"));
  }

  function clearAll() {
    startTransition(() => router.push("/"));
  }

  const chips: Array<{ key: keyof Filters; label: string; value: string }> = [];
  if (filters.status)
    chips.push({
      key: "status",
      label: "Status",
      value: STATUS_LABELS[filters.status],
    });
  if (filters.owner)
    chips.push({
      key: "owner",
      label: "Owner",
      value: filters.owner === "unassigned" ? "Unassigned" : filters.owner,
    });
  if (filters.due)
    chips.push({
      key: "due",
      label: "Due",
      value: DUE_LABELS[filters.due],
    });
  if (filters.q)
    chips.push({
      key: "q",
      label: "Search",
      value: `“${filters.q}”`,
    });

  if (chips.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 transition-opacity ${pending ? "opacity-60" : "opacity-100"}`}
    >
      <span className="text-xs font-medium text-ink-subtle dark:text-slate-500">
        Filtered by:
      </span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => remove(c.key)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1.5 text-xs font-medium text-ink-muted shadow-soft transition hover:border-slate-300 hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          aria-label={`Remove ${c.label} filter`}
        >
          <span className="text-ink-subtle dark:text-slate-500">{c.label}:</span>
          <span className="text-ink dark:text-slate-100">{c.value}</span>
          <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-100 text-ink-subtle transition group-hover:bg-slate-200 group-hover:text-ink dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-100">
            <CloseIcon className="h-2.5 w-2.5" />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
      >
        Clear all
      </button>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
