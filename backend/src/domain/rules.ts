import type { DueState, Request, Status } from "./types";

export const DUE_SOON_WINDOW_DAYS = 7;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TERMINAL_STATUSES: ReadonlySet<Status> = new Set(["APPROVED", "REJECTED"]);

const ALLOWED_TRANSITIONS: Record<Status, ReadonlyArray<Status>> = {
  NEW: ["IN_REVIEW", "NEEDS_INFO", "REJECTED"],
  IN_REVIEW: ["NEEDS_INFO", "APPROVED", "REJECTED"],
  NEEDS_INFO: ["IN_REVIEW", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

export type TransitionInput = {
  current: Status;
  next: Status;
  requiredFieldsComplete: boolean;
  rejectionReason?: string | null;
};

export type TransitionResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export function canTransitionTo(input: TransitionInput): TransitionResult {
  const { current, next, requiredFieldsComplete, rejectionReason } = input;

  if (current === next) {
    return {
      ok: false,
      code: "invalid_transition",
      message: `Request is already in status ${current}.`,
    };
  }

  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    return {
      ok: false,
      code: "invalid_transition",
      message: `Cannot move a request from ${current} to ${next}.`,
    };
  }

  if (next === "APPROVED" && !requiredFieldsComplete) {
    return {
      ok: false,
      code: "required_fields_incomplete",
      message:
        "Request cannot be approved until all required fields are complete.",
    };
  }

  if (next === "REJECTED" && !rejectionReason?.trim()) {
    return {
      ok: false,
      code: "rejection_reason_required",
      message: "A rejection reason is required to reject a request.",
    };
  }

  return { ok: true };
}

export function isTerminal(status: Status): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function dueState(
  request: Pick<Request, "dueDate" | "status">,
  now: Date = new Date()
): DueState {
  if (!request.dueDate) return "NO_DUE_DATE";
  if (isTerminal(request.status)) return "ON_TRACK";

  const dueMs = new Date(request.dueDate).getTime();
  if (Number.isNaN(dueMs)) return "NO_DUE_DATE";

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const windowEnd = startOfToday + DUE_SOON_WINDOW_DAYS * MS_PER_DAY;

  if (dueMs < startOfToday) return "OVERDUE";
  if (dueMs <= windowEnd) return "DUE_SOON";
  return "ON_TRACK";
}
