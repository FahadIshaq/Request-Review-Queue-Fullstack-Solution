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
        <header className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-ink-subtle">
                {request.id}
              </div>
              <h1 className="text-2xl font-semibold text-ink">
                {request.title}
              </h1>
              <p className="text-sm text-ink-muted">
                Submitted by{" "}
                <span className="font-medium">{request.submitter}</span> ·{" "}
                {formatDateTime(request.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={request.status} />
              <PriorityPill priority={request.priority} />
              <DuePill state={request.dueState} />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Field label="Owner">
              {request.owner ?? (
                <span className="italic text-ink-subtle">Unassigned</span>
              )}
            </Field>
            <Field label="Due date">{formatDate(request.dueDate)}</Field>
            <Field label="Required fields">
              {request.requiredFieldsComplete ? (
                <span className="font-medium text-emerald-700">Complete</span>
              ) : (
                <span className="font-medium text-amber-700">Incomplete</span>
              )}
            </Field>
            <Field label="Last updated">
              {formatDateTime(request.updatedAt)}
            </Field>
          </dl>

          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <div className="font-semibold">Rejection reason</div>
              <div>{request.rejectionReason}</div>
            </div>
          )}
        </header>

        <NotesPanel request={request} actor={actor} onUpdated={handleUpdated} />
        <HistoryTimeline events={request.history} />
      </section>

      <aside className="space-y-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Acting as
          </h2>
          <p className="mt-1 text-xs text-ink-subtle">
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
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
        {label}
      </dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}

function CurrentStatusCard({ request }: { request: RequestRecord }) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Current status
      </h2>
      <div className="mt-3 flex items-center gap-2">
        <StatusPill status={request.status} />
        <span className="text-sm text-ink-muted">
          {STATUS_LABELS[request.status]}
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-subtle">
        {request.requiredFieldsComplete
          ? "Required fields are complete — eligible for approval."
          : "Required fields are incomplete — cannot be approved yet."}
      </p>
    </div>
  );
}
