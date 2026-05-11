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

export interface Request {
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
}

export interface RequestWithDueState extends Request {
  dueState: DueState;
}
