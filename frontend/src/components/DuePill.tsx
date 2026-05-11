import { DUE_LABEL, DUE_PILL, type DueState } from "@/lib/types";

export function DuePill({ state }: { state: DueState }) {
  if (state === "NO_DUE_DATE") return null;
  return <span className={`pill ${DUE_PILL[state]}`}>{DUE_LABEL[state]}</span>;
}
