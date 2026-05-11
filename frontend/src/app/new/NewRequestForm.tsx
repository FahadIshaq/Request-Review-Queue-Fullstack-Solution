"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { PRIORITIES, type Priority } from "@/lib/types";

export function NewRequestForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    submitter: "",
    priority: "MEDIUM" as Priority,
    owner: "",
    dueDate: "",
    requiredFieldsComplete: false,
    actor: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createRequest({
        title: form.title.trim(),
        submitter: form.submitter.trim(),
        priority: form.priority,
        owner: form.owner.trim() || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        requiredFieldsComplete: form.requiredFieldsComplete,
        actor: form.actor.trim() || form.submitter.trim() || undefined,
      });
      router.push(`/requests/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to create request.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="new-title">
          Title
        </label>
        <input
          id="new-title"
          required
          className="input"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="What needs to be reviewed?"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="new-submitter">
            Submitter
          </label>
          <input
            id="new-submitter"
            required
            className="input"
            value={form.submitter}
            onChange={(e) =>
              setForm((f) => ({ ...f, submitter: e.target.value }))
            }
            placeholder="alex@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="new-priority">
            Priority
          </label>
          <select
            id="new-priority"
            className="input"
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value as Priority }))
            }
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="new-owner">
            Owner (optional)
          </label>
          <input
            id="new-owner"
            className="input"
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
            placeholder="e.g. jordan.lee"
          />
        </div>
        <div>
          <label className="label" htmlFor="new-due">
            Due date (optional)
          </label>
          <input
            id="new-due"
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, dueDate: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="new-actor">
          Acting as (optional)
        </label>
        <input
          id="new-actor"
          className="input"
          value={form.actor}
          onChange={(e) => setForm((f) => ({ ...f, actor: e.target.value }))}
          placeholder="Who is recording this action?"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.requiredFieldsComplete}
          onChange={(e) =>
            setForm((f) => ({ ...f, requiredFieldsComplete: e.target.checked }))
          }
        />
        Required fields are complete (eligible for approval)
      </label>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create request"}
        </button>
      </div>
    </form>
  );
}
