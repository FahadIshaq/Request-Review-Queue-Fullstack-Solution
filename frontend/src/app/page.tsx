import Link from "next/link";
import { api, DEFAULT_PAGE_SIZE } from "@/lib/api";
import {
  STATUSES,
  STATUS_LABELS,
  type Status,
  type RequestRecord,
} from "@/lib/types";
import { StatusPill } from "@/components/StatusPill";
import { PriorityPill } from "@/components/PriorityPill";
import { DuePill } from "@/components/DuePill";
import { formatDate } from "@/lib/format";
import { FilterBar } from "./_components/FilterBar";
import { Pagination } from "./_components/Pagination";
import { ActiveFilters } from "./_components/ActiveFilters";

type SearchParams = {
  status?: string;
  owner?: string;
  due?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

function parseStatus(value: string | undefined): Status | undefined {
  return STATUSES.includes(value as Status) ? (value as Status) : undefined;
}

function parseDue(value: string | undefined): "due_soon" | "overdue" | undefined {
  if (value === "due_soon" || value === "overdue") return value;
  return undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = {
    status: parseStatus(searchParams.status),
    owner: searchParams.owner?.trim() || undefined,
    due: parseDue(searchParams.due),
    q: searchParams.q?.trim() || undefined,
  };
  const page = parsePositiveInt(searchParams.page, 1);
  const pageSize = parsePositiveInt(searchParams.pageSize, DEFAULT_PAGE_SIZE);

  const [paged, owners, overdueCount, dueSoonCount, needsInfoCount] =
    await Promise.all([
      api
        .listRequests({ ...filters, page, pageSize })
        .catch(() => ({
          data: [] as RequestRecord[],
          page: 1,
          pageSize,
          total: 0,
          totalPages: 1,
        })),
      api.listOwners().catch(() => []),
      api
        .listRequests({ due: "overdue", pageSize: 1 })
        .then((r) => r.total)
        .catch(() => 0),
      api
        .listRequests({ due: "due_soon", pageSize: 1 })
        .then((r) => r.total)
        .catch(() => 0),
      api
        .listRequests({ status: "NEEDS_INFO", pageSize: 1 })
        .then((r) => r.total)
        .catch(() => 0),
    ]);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink dark:text-slate-100 sm:text-3xl">
            Review queue
          </h1>
          <p className="text-sm text-ink-muted dark:text-slate-400">
            Triage incoming requests — change status, assign owners, and keep a
            full audit trail.
          </p>
        </div>
        <Link href="/new" className="btn btn-primary">
          <PlusIcon className="h-4 w-4" />
          New request
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Total" value={paged.total} tone="neutral" />
        <KpiTile label="Overdue" value={overdueCount} tone="danger" href="/?due=overdue" />
        <KpiTile label="Due in 7d" value={dueSoonCount} tone="warning" href="/?due=due_soon" />
        <KpiTile label="Needs info" value={needsInfoCount} tone="info" href="/?status=NEEDS_INFO" />
      </div>

      <FilterBar owners={owners} initial={filters} />

      <ActiveFilters
        filters={filters}
        active={Boolean(
          filters.status || filters.owner || filters.due || filters.q
        )}
      />

      {paged.data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Submitter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paged.data.map((r) => (
                  <tr
                    key={r.id}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/requests/${r.id}`}
                        className="font-medium text-ink decoration-brand-300 underline-offset-4 transition group-hover:underline dark:text-slate-100"
                      >
                        {r.title}
                      </Link>
                      <div className="mt-0.5 font-mono text-[11px] text-ink-subtle dark:text-slate-500">
                        {r.id}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityPill priority={r.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted dark:text-slate-400">
                      {r.owner ?? (
                        <span className="italic text-ink-subtle dark:text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-muted dark:text-slate-400">
                          {formatDate(r.dueDate)}
                        </span>
                        <DuePill state={r.dueState} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted dark:text-slate-400">
                      {r.submitter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={paged.page}
            pageSize={paged.pageSize}
            total={paged.total}
            totalPages={paged.totalPages}
          />
        </div>
      )}
    </div>
  );
}

type Tone = "neutral" | "warning" | "danger" | "info";
const TONE_RING: Record<Tone, string> = {
  neutral: "ring-slate-200/80 dark:ring-slate-800",
  warning:
    "ring-amber-200/70 hover:ring-amber-300/80 dark:ring-amber-900/40 dark:hover:ring-amber-700/60",
  danger:
    "ring-red-200/70 hover:ring-red-300/80 dark:ring-red-900/40 dark:hover:ring-red-700/60",
  info: "ring-blue-200/70 hover:ring-blue-300/80 dark:ring-blue-900/40 dark:hover:ring-blue-700/60",
};
const TONE_VALUE: Record<Tone, string> = {
  neutral: "text-ink dark:text-slate-100",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-red-700 dark:text-red-300",
  info: "text-blue-700 dark:text-blue-300",
};

function KpiTile({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: number;
  tone: Tone;
  href?: string;
}) {
  const Wrapper: React.ElementType = href ? Link : "div";
  const wrapperProps = href ? { href } : {};
  return (
    <Wrapper
      {...wrapperProps}
      className={`block rounded-xl bg-white p-4 shadow-soft ring-1 transition dark:bg-slate-900 ${TONE_RING[tone]} ${href ? "hover:shadow-card" : ""}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle dark:text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${TONE_VALUE[tone]}`}>
        {value}
      </div>
    </Wrapper>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        <InboxIcon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-ink dark:text-slate-100">
          No requests match these filters.
        </p>
        <p className="text-sm text-ink-muted dark:text-slate-400">
          Adjust or clear the filters above, or{" "}
          <Link
            className="text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-900 dark:text-brand-300 dark:hover:text-brand-100"
            href="/new"
          >
            create a new request
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 13h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 13v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-7.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}
