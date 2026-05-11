"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function NotesPanel({
  request,
  actor,
  onUpdated,
}: {
  request: RequestRecord;
  actor: string;
  onUpdated: (next: RequestRecord) => void;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.addNote(request.id, {
        body: body.trim(),
        actor: actor.trim() || undefined,
      });
      onUpdated(updated);
      setBody("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to add note.");
    } finally {
      setBusy(false);
    }
  }

  const sortedNotes = [...request.notes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink dark:text-slate-100">
          Notes
        </h2>
        <span className="text-xs text-ink-subtle dark:text-slate-500">
          {sortedNotes.length} note{sortedNotes.length === 1 ? "" : "s"}
        </span>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea
          className="input min-h-[80px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note for the reviewer or for the record…"
        />
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy || !body.trim()}
          >
            {busy ? "Adding…" : "Add note"}
          </button>
        </div>
      </form>

      <ul className="mt-5 space-y-3">
        {sortedNotes.length === 0 && (
          <li className="rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-ink-subtle dark:border-slate-700 dark:text-slate-500">
            No notes yet.
          </li>
        )}
        {sortedNotes.map((n) => (
          <li
            key={n.id}
            className="rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="flex items-center justify-between text-xs text-ink-subtle dark:text-slate-500">
              <span className="font-medium text-ink-muted dark:text-slate-300">
                {n.author}
              </span>
              <time dateTime={n.createdAt}>{formatDateTime(n.createdAt)}</time>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink dark:text-slate-100">
              {n.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
