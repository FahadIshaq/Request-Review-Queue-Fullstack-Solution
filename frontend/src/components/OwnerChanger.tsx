"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";

export function OwnerChanger({
  request,
  owners,
  actor,
  onUpdated,
}: {
  request: RequestRecord;
  owners: string[];
  actor: string;
  onUpdated: (next: RequestRecord) => void;
}) {
  const [value, setValue] = useState<string>("");
  const [custom, setCustom] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = Array.from(
    new Set(owners.filter((o) => o !== request.owner))
  );

  async function submit() {
    const selected =
      value === "__unassign__" ? null : value === "__custom__" ? custom.trim() : value;
    if (selected === undefined || selected === request.owner) {
      setError("Pick a different owner.");
      return;
    }
    if (value === "__custom__" && !custom.trim()) {
      setError("Enter an owner name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await api.assignOwner(request.id, {
        owner: selected,
        actor: actor.trim() || undefined,
      });
      onUpdated(updated);
      setValue("");
      setCustom("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to update owner.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
        {request.owner ? "Reassign owner" : "Assign owner"}
      </h2>

      <div className="mt-3">
        <label className="label" htmlFor="owner-select">
          New owner
        </label>
        <select
          id="owner-select"
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">Select an owner…</option>
          {request.owner && (
            <option value="__unassign__">— Unassign —</option>
          )}
          {candidates.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value="__custom__">+ Add a new owner</option>
        </select>
      </div>

      {value === "__custom__" && (
        <div className="mt-3">
          <label className="label" htmlFor="owner-custom">
            New owner name
          </label>
          <input
            id="owner-custom"
            className="input"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. casey.diaz"
          />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary mt-4 w-full"
        disabled={busy || !value}
        onClick={submit}
      >
        {busy ? "Saving…" : "Save owner"}
      </button>
    </div>
  );
}
