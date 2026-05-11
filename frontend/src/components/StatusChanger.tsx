"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import {
  STATUS_LABELS,
  STATUSES,
  type RequestRecord,
  type Status,
} from "@/lib/types";

const ALLOWED: Record<Status, Status[]> = {
  NEW: ["IN_REVIEW", "NEEDS_INFO", "REJECTED"],
  IN_REVIEW: ["NEEDS_INFO", "APPROVED", "REJECTED"],
  NEEDS_INFO: ["IN_REVIEW", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

export function StatusChanger({
  request,
  actor,
  onUpdated,
}: {
  request: RequestRecord;
  actor: string;
  onUpdated: (next: RequestRecord) => void;
}) {
  const [next, setNext] = useState<Status | "">("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowed = ALLOWED[request.status];
  const showReason = next === "REJECTED";
  const wantsApprove = next === "APPROVED";
  const approveBlocked =
    wantsApprove && !request.requiredFieldsComplete;

  async function submit() {
    if (!next) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.changeStatus(request.id, {
        status: next,
        rejectionReason: showReason ? reason.trim() : undefined,
        actor: actor.trim() || undefined,
      });
      onUpdated(updated);
      setNext("");
      setReason("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to change status.");
    } finally {
      setBusy(false);
    }
  }

  if (allowed.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
          Change status
        </h2>
        <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
          This request is in a terminal state ({STATUS_LABELS[request.status]})
          and cannot transition further.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
        Change status
      </h2>

      <div className="mt-3">
        <label className="label" htmlFor="status-next">
          Move to
        </label>
        <select
          id="status-next"
          className="input"
          value={next}
          onChange={(e) => setNext(e.target.value as Status | "")}
        >
          <option value="">Select a new status…</option>
          {STATUSES.filter((s) => allowed.includes(s)).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {showReason && (
        <div className="mt-3">
          <label className="label" htmlFor="reject-reason">
            Rejection reason
          </label>
          <textarea
            id="reject-reason"
            className="input min-h-[80px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required to reject"
          />
        </div>
      )}

      {approveBlocked && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          Required fields are incomplete — approval will be rejected by the API.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary mt-4 w-full"
        disabled={
          busy ||
          !next ||
          (showReason && !reason.trim())
        }
        onClick={submit}
      >
        {busy ? "Saving…" : "Update status"}
      </button>
    </div>
  );
}
