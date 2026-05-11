import { STATUS_LABELS, STATUS_PILL, type Status } from "@/lib/types";

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`pill ${STATUS_PILL[status]}`}>{STATUS_LABELS[status]}</span>
  );
}
