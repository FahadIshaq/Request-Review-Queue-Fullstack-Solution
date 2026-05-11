"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { StatusPill } from "@/components/StatusPill";
import { PriorityPill } from "@/components/PriorityPill";
import { DuePill } from "@/components/DuePill";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { NotesPanel } from "@/components/NotesPanel";
import { StatusChanger } from "@/components/StatusChanger";
import { OwnerChanger } from "@/components/OwnerChanger";
import {
  type RequestRecord,
  STATUS_LABELS,
} from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";

export function RequestDetail({
  initial,
  owners,
}: {
  initial: RequestRecord;
  owners: string[];
}) {
  const [request, setRequest] = useState<RequestRecord>(initial);
  const [actor, setActor] = useState<string>("");

  function handleUpdated(next: RequestRecord) {
    setRequest(next);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-6">
        <header className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-50/60 via-white to-white p-6 dark:from-brand-900/20 dark:via-slate-900 dark:to-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle dark:text-slate-500">
                  {request.id}
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-slate-100 sm:text-[1.75rem]">
                  {request.title}
                </h1>
                <p className="text-sm text-ink-muted dark:text-slate-400">
                  Submitted by{" "}
                  <span className="font-medium text-ink dark:text-slate-200">
                    {request.submitter}
                  </span>{" "}
                  · {formatDateTime(request.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusPill status={request.status} />
                <PriorityPill priority={request.priority} />
                <DuePill state={request.dueState} />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-200/80 text-sm dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-4 sm:divide-y-0">
            <Field label="Owner">
              {request.owner ?? (
                <span className="italic text-ink-subtle dark:text-slate-500">
                  Unassigned
                </span>
              )}
            </Field>
            <Field label="Due date">{formatDate(request.dueDate)}</Field>
            <Field label="Required fields">
              {request.requiredFieldsComplete ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
                  <DotIcon className="h-3.5 w-3.5" />
                  Incomplete
                </span>
              )}
            </Field>
            <Field label="Last updated">
              {formatDateTime(request.updatedAt)}
            </Field>
          </dl>

          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="border-t border-red-200/70 bg-red-50/70 px-6 py-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-red-700/80 dark:text-red-300/80">
                Rejection reason
              </div>
              <div className="mt-1 text-red-900 dark:text-red-100">
                {request.rejectionReason}
              </div>
            </div>
          )}
        </header>

        <NotesPanel request={request} actor={actor} onUpdated={handleUpdated} />
        <HistoryTimeline events={request.history} />
      </section>

      <aside className="space-y-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
            Acting as
          </h2>
          <p className="mt-1 text-xs text-ink-subtle dark:text-slate-500">
            Recorded on every history entry. Defaults to “system” if left blank.
          </p>
          <input
            className="input mt-2"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="e.g. jordan.lee"
          />
        </div>

        <StatusChanger
          request={request}
          actor={actor}
          onUpdated={handleUpdated}
        />

        <OwnerChanger
          request={request}
          owners={owners}
          actor={actor}
          onUpdated={handleUpdated}
        />

        <CurrentStatusCard request={request} />
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-subtle dark:text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink dark:text-slate-100">{children}</dd>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function CurrentStatusCard({ request }: { request: RequestRecord }) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
        Current status
      </h2>
      <div className="mt-3 flex items-center gap-2">
        <StatusPill status={request.status} />
        <span className="text-sm text-ink-muted dark:text-slate-400">
          {STATUS_LABELS[request.status]}
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-subtle dark:text-slate-500">
        {request.requiredFieldsComplete
          ? "Required fields are complete — eligible for approval."
          : "Required fields are incomplete — cannot be approved yet."}
      </p>
    </div>
  );
}
