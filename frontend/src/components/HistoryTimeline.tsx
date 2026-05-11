import type { HistoryEvent } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const EVENT_LABEL: Record<HistoryEvent["type"], string> = {
  CREATED: "Created",
  STATUS_CHANGED: "Status changed",
  OWNER_CHANGED: "Owner changed",
  NOTE_ADDED: "Note added",
};

const EVENT_DOT: Record<HistoryEvent["type"], string> = {
  CREATED: "bg-slate-400",
  STATUS_CHANGED: "bg-blue-500",
  OWNER_CHANGED: "bg-indigo-500",
  NOTE_ADDED: "bg-amber-500",
};

export function HistoryTimeline({ events }: { events: HistoryEvent[] }) {
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section className="card p-6">
      <h2 className="text-base font-semibold text-ink dark:text-slate-100">
        Activity history
      </h2>

      <ol className="mt-4 space-y-4">
        {sorted.map((ev) => (
          <li key={ev.id} className="relative flex gap-3">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_DOT[ev.type]}`}
              aria-hidden
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-medium text-ink dark:text-slate-100">
                  {EVENT_LABEL[ev.type]}
                </span>
                <time
                  className="text-xs text-ink-subtle dark:text-slate-500"
                  dateTime={ev.at}
                  title={ev.at}
                >
                  {formatDateTime(ev.at)}
                </time>
              </div>
              <p className="text-sm text-ink-muted dark:text-slate-400">
                {describe(ev)}
              </p>
              <p className="text-xs text-ink-subtle dark:text-slate-500">
                by {ev.actor}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function describe(ev: HistoryEvent): string {
  switch (ev.type) {
    case "CREATED":
      return `Request "${ev.payload.title}" submitted.`;
    case "STATUS_CHANGED":
      return [
        `${STATUS_LABELS[ev.payload.from]} → ${STATUS_LABELS[ev.payload.to]}.`,
        ev.payload.rejectionReason
          ? `Reason: ${ev.payload.rejectionReason}`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
    case "OWNER_CHANGED": {
      const from = ev.payload.from ?? "unassigned";
      const to = ev.payload.to ?? "unassigned";
      return `${from} → ${to}.`;
    }
    case "NOTE_ADDED":
      return `“${ev.payload.preview}”`;
  }
}
