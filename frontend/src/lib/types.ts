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
  NEW: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  NEEDS_INFO: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export const PRIORITY_PILL: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-indigo-100 text-indigo-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export const DUE_PILL: Record<DueState, string> = {
  ON_TRACK: "bg-slate-100 text-slate-600",
  DUE_SOON: "bg-amber-100 text-amber-800",
  OVERDUE: "bg-red-100 text-red-800",
  NO_DUE_DATE: "bg-slate-100 text-slate-500",
};

export const DUE_LABEL: Record<DueState, string> = {
  ON_TRACK: "On track",
  DUE_SOON: "Due soon",
  OVERDUE: "Overdue",
  NO_DUE_DATE: "No due date",
};
