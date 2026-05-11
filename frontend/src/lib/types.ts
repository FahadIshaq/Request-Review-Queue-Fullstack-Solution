export const STATUSES = [
  "NEW",
  "IN_REVIEW",
  "NEEDS_INFO",
  "APPROVED",
  "REJECTED",
] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type DueState = "ON_TRACK" | "DUE_SOON" | "OVERDUE" | "NO_DUE_DATE";

export interface Note {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

export type HistoryEvent =
  | {
      id: string;
      type: "CREATED";
      at: string;
      actor: string;
      payload: { title: string };
    }
  | {
      id: string;
      type: "STATUS_CHANGED";
      at: string;
      actor: string;
      payload: { from: Status; to: Status; rejectionReason?: string };
    }
  | {
      id: string;
      type: "OWNER_CHANGED";
      at: string;
      actor: string;
      payload: { from: string | null; to: string | null };
    }
  | {
      id: string;
      type: "NOTE_ADDED";
      at: string;
      actor: string;
      payload: { noteId: string; preview: string };
    };

export interface RequestRecord {
  id: string;
  title: string;
  submitter: string;
  status: Status;
  priority: Priority;
  owner: string | null;
  dueDate: string | null;
  requiredFieldsComplete: boolean;
  rejectionReason: string | null;
  notes: Note[];
  history: HistoryEvent[];
  createdAt: string;
  updatedAt: string;
  dueState: DueState;
}

export const STATUS_LABELS: Record<Status, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  NEEDS_INFO: "Needs info",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const STATUS_PILL: Record<Status, string> = {
  NEW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  NEEDS_INFO:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  APPROVED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export const PRIORITY_PILL: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export const DUE_PILL: Record<DueState, string> = {
  ON_TRACK: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  DUE_SOON:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  NO_DUE_DATE:
    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export const DUE_LABEL: Record<DueState, string> = {
  ON_TRACK: "On track",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
  NO_DUE_DATE: "No due date",
};
