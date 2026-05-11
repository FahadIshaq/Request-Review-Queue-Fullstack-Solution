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
  NEW: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  IN_REVIEW:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-900/60",
  NEEDS_INFO:
    "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-900/60",
  APPROVED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-900/60",
  REJECTED:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-900/60",
};

export const PRIORITY_PILL: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  MEDIUM:
    "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-900/60",
  HIGH: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:ring-orange-900/60",
  URGENT:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-900/60",
};

export const DUE_PILL: Record<DueState, string> = {
  ON_TRACK:
    "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  DUE_SOON:
    "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-900/60",
  OVERDUE:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-900/60",
  NO_DUE_DATE:
    "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700",
};

export const DUE_LABEL: Record<DueState, string> = {
  ON_TRACK: "On track",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
  NO_DUE_DATE: "No due date",
};
