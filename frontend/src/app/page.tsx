import Link from "next/link";
import { api } from "@/lib/api";
import { STATUSES, type Status } from "@/lib/types";
import { StatusPill } from "@/components/StatusPill";
import { PriorityPill } from "@/components/PriorityPill";
import { DuePill } from "@/components/DuePill";
import { formatDate } from "@/lib/format";
import { FilterBar } from "./_components/FilterBar";

type SearchParams = {
  status?: string;
  owner?: string;
  due?: string;
  q?: string;
};

function parseStatus(value: string | undefined): Status | undefined {
  return STATUSES.includes(value as Status) ? (value as Status) : undefined;
}

function parseDue(value: string | undefined): "due_soon" | "overdue" | undefined {
  if (value === "due_soon" || value === "overdue") return value;
  return undefined;
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

  const [requests, owners] = await Promise.all([
    api.listRequests(filters).catch(() => []),
    api.listOwners().catch(() => []),
  ]);

  const counts = countByDueState(requests);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Review queue</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {requests.length} request{requests.length === 1 ? "" : "s"}
            {counts.overdue > 0 && (
              <>
                {" · "}
                <span className="font-medium text-red-700">
                  {counts.overdue} overdue
                </span>
              </>
            )}
            {counts.dueSoon > 0 && (
              <>
                {" · "}
                <span className="font-medium text-amber-700">
                  {counts.dueSoon} due soon
                </span>
              </>
            )}
          </p>
        </div>
        <Link href="/new" className="btn btn-primary">
          + New request
        </Link>
      </div>

      <FilterBar owners={owners} initial={filters} />

      {requests.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-base font-medium text-ink">No requests match these filters.</p>
          <p className="text-sm text-ink-muted">
            Try clearing the filters above or{" "}
            <Link className="underline" href="/new">
              create a new request
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Submitter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/requests/${r.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {r.title}
                    </Link>
                    <div className="text-xs text-ink-subtle">{r.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityPill priority={r.priority} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {r.owner ?? <span className="italic text-ink-subtle">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted">{formatDate(r.dueDate)}</span>
                      <DuePill state={r.dueState} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{r.submitter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function countByDueState(requests: { dueState: string }[]) {
  let overdue = 0;
  let dueSoon = 0;
  for (const r of requests) {
    if (r.dueState === "OVERDUE") overdue++;
    if (r.dueState === "DUE_SOON") dueSoon++;
  }
  return { overdue, dueSoon };
}
