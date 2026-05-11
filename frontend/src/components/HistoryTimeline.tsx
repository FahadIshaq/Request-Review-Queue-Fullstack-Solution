import type { HistoryEvent } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const EVENT_LABEL: Record<HistoryEvent["type"], string> = {
  CREATED: "Created",
  STATUS_CHANGED: "Status changed",
  OWNER_CHANGED: "Owner changed",
  NOTE_ADDED: "Note added",
};

const EVENT_STYLE: Record<
  HistoryEvent["type"],
  { dot: string; ring: string; icon: (props: { className?: string }) => JSX.Element }
> = {
  CREATED: {
    dot: "bg-slate-400 dark:bg-slate-500",
    ring: "ring-slate-100 dark:ring-slate-800",
    icon: SparkIcon,
  },
  STATUS_CHANGED: {
    dot: "bg-brand-500 dark:bg-brand-400",
    ring: "ring-brand-50 dark:ring-brand-900/30",
    icon: ArrowRightIcon,
  },
  OWNER_CHANGED: {
    dot: "bg-indigo-500 dark:bg-indigo-400",
    ring: "ring-indigo-50 dark:ring-indigo-900/30",
    icon: UserIcon,
  },
  NOTE_ADDED: {
    dot: "bg-amber-500 dark:bg-amber-400",
    ring: "ring-amber-50 dark:ring-amber-900/30",
    icon: NoteIcon,
  },
};

export function HistoryTimeline({ events }: { events: HistoryEvent[] }) {
  const sorted = [...events].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink dark:text-slate-100">
          Activity history
        </h2>
        <span className="text-xs text-ink-subtle dark:text-slate-500">
          {sorted.length} event{sorted.length === 1 ? "" : "s"}
        </span>
      </div>

      <ol className="relative mt-5 space-y-5 border-l border-slate-200 pl-6 dark:border-slate-800">
        {sorted.map((ev) => {
          const style = EVENT_STYLE[ev.type];
          const Icon = style.icon;
          return (
            <li key={ev.id} className="relative">
              <span
                className={`absolute -left-[33px] top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white ring-4 ${style.ring} dark:bg-slate-900`}
                aria-hidden
              >
                <span
                  className={`grid h-3.5 w-3.5 place-items-center rounded-full text-white ${style.dot}`}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-medium text-ink dark:text-slate-100">
                  {EVENT_LABEL[ev.type]}
                </span>
                <time
                  className="font-mono text-[11px] text-ink-subtle dark:text-slate-500"
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
                by{" "}
                <span className="font-medium text-ink-muted dark:text-slate-400">
                  {ev.actor}
                </span>
              </p>
            </li>
          );
        })}
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

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}
function NoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h7" />
    </svg>
  );
}
