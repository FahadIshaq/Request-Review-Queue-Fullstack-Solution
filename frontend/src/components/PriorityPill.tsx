import { PRIORITY_PILL, type Priority } from "@/lib/types";

export function PriorityPill({ priority }: { priority: Priority }) {
  return <span className={`pill ${PRIORITY_PILL[priority]}`}>{priority}</span>;
}
