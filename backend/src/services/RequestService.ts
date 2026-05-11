import { randomUUID } from "crypto";
import { DomainError, NotFoundError } from "../domain/errors";
import { canTransitionTo, dueState } from "../domain/rules";
import type {
  DueState,
  HistoryEvent,
  Note,
  Priority,
  Request,
  RequestWithDueState,
  Status,
} from "../domain/types";
import type { RequestRepository } from "../repository/RequestRepository";

export interface CreateRequestInput {
  title: string;
  submitter: string;
  priority?: Priority;
  owner?: string | null;
  dueDate?: string | null;
  requiredFieldsComplete?: boolean;
  actor?: string;
}

export interface ListFilters {
  status?: Status;
  owner?: string;
  due?: "due_soon" | "overdue";
  q?: string;
}

export interface ChangeStatusInput {
  status: Status;
  rejectionReason?: string;
  actor?: string;
}

export interface AssignOwnerInput {
  owner: string | null;
  actor?: string;
}

export interface AddNoteInput {
  body: string;
  actor?: string;
}

const SYSTEM_ACTOR = "system";

export class RequestService {
  constructor(
    private readonly repo: RequestRepository,
    private readonly clock: () => Date = () => new Date(),
    private readonly idGen: () => string = () => randomUUID()
  ) {}

  async create(input: CreateRequestInput): Promise<RequestWithDueState> {
    const now = this.clock().toISOString();
    const actor = input.actor?.trim() || SYSTEM_ACTOR;

    if (!input.title?.trim()) {
      throw new DomainError("invalid_request", "Title is required.", 400);
    }
    if (!input.submitter?.trim()) {
      throw new DomainError("invalid_request", "Submitter is required.", 400);
    }
    if (input.dueDate && Number.isNaN(Date.parse(input.dueDate))) {
      throw new DomainError("invalid_request", "dueDate must be a valid ISO date.", 400);
    }

    const id = this.idGen();
    const request: Request = {
      id,
      title: input.title.trim(),
      submitter: input.submitter.trim(),
      status: "NEW",
      priority: input.priority ?? "MEDIUM",
      owner: input.owner?.trim() || null,
      dueDate: input.dueDate ?? null,
      requiredFieldsComplete: input.requiredFieldsComplete ?? false,
      rejectionReason: null,
      notes: [],
      history: [
        {
          id: this.idGen(),
          type: "CREATED",
          at: now,
          actor,
          payload: { title: input.title.trim() },
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.repo.insert(request);
    return this.decorate(saved);
  }

  async list(filters: ListFilters = {}): Promise<RequestWithDueState[]> {
    const all = await this.repo.list();
    const now = this.clock();

    const decorated = all.map((r) => this.decorate(r, now));

    const filtered = decorated.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;

      if (filters.owner !== undefined) {
        const wanted = filters.owner.trim().toLowerCase();
        if (wanted === "" || wanted === "unassigned") {
          if (r.owner !== null) return false;
        } else if ((r.owner ?? "").toLowerCase() !== wanted) {
          return false;
        }
      }

      if (filters.due === "due_soon" && r.dueState !== "DUE_SOON") return false;
      if (filters.due === "overdue" && r.dueState !== "OVERDUE") return false;

      if (filters.q) {
        const needle = filters.q.trim().toLowerCase();
        const haystack = [r.title, r.submitter, r.owner ?? ""].join(" ").toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getById(id: string): Promise<RequestWithDueState> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError(`Request ${id} not found.`);
    return this.decorate(row);
  }

  async changeStatus(
    id: string,
    input: ChangeStatusInput
  ): Promise<RequestWithDueState> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError(`Request ${id} not found.`);

    const next = input.status;
    const rejectionReason = input.rejectionReason?.trim() || null;

    const check = canTransitionTo({
      current: row.status,
      next,
      requiredFieldsComplete: row.requiredFieldsComplete,
      rejectionReason,
    });
    if (!check.ok) throw new DomainError(check.code, check.message);

    const now = this.clock().toISOString();
    const actor = input.actor?.trim() || SYSTEM_ACTOR;

    const event: HistoryEvent = {
      id: this.idGen(),
      type: "STATUS_CHANGED",
      at: now,
      actor,
      payload: {
        from: row.status,
        to: next,
        ...(rejectionReason ? { rejectionReason } : {}),
      },
    };

    const updated: Request = {
      ...row,
      status: next,
      rejectionReason: next === "REJECTED" ? rejectionReason : row.rejectionReason,
      history: [...row.history, event],
      updatedAt: now,
    };

    const saved = await this.repo.update(updated);
    return this.decorate(saved);
  }

  async assignOwner(
    id: string,
    input: AssignOwnerInput
  ): Promise<RequestWithDueState> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError(`Request ${id} not found.`);

    const newOwner = input.owner?.trim() ? input.owner.trim() : null;
    if (newOwner === row.owner) {
      throw new DomainError(
        "owner_unchanged",
        newOwner
          ? `Request is already assigned to ${newOwner}.`
          : "Request is already unassigned."
      );
    }

    const now = this.clock().toISOString();
    const actor = input.actor?.trim() || SYSTEM_ACTOR;

    const event: HistoryEvent = {
      id: this.idGen(),
      type: "OWNER_CHANGED",
      at: now,
      actor,
      payload: { from: row.owner, to: newOwner },
    };

    const updated: Request = {
      ...row,
      owner: newOwner,
      history: [...row.history, event],
      updatedAt: now,
    };

    const saved = await this.repo.update(updated);
    return this.decorate(saved);
  }

  async addNote(id: string, input: AddNoteInput): Promise<RequestWithDueState> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError(`Request ${id} not found.`);

    const body = input.body?.trim();
    if (!body) {
      throw new DomainError("invalid_note", "Note body cannot be empty.", 400);
    }

    const now = this.clock().toISOString();
    const actor = input.actor?.trim() || SYSTEM_ACTOR;

    const note: Note = {
      id: this.idGen(),
      body,
      author: actor,
      createdAt: now,
    };

    const event: HistoryEvent = {
      id: this.idGen(),
      type: "NOTE_ADDED",
      at: now,
      actor,
      payload: {
        noteId: note.id,
        preview: body.length > 80 ? body.slice(0, 77) + "…" : body,
      },
    };

    const updated: Request = {
      ...row,
      notes: [...row.notes, note],
      history: [...row.history, event],
      updatedAt: now,
    };

    const saved = await this.repo.update(updated);
    return this.decorate(saved);
  }

  async getHistory(id: string): Promise<HistoryEvent[]> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError(`Request ${id} not found.`);
    return [...row.history].sort((a, b) => a.at.localeCompare(b.at));
  }

  async listOwners(): Promise<string[]> {
    const all = await this.repo.list();
    const set = new Set<string>();
    for (const r of all) if (r.owner) set.add(r.owner);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private decorate(row: Request, now: Date = this.clock()): RequestWithDueState {
    const state: DueState = dueState(row, now);
    return { ...row, dueState: state };
  }
}
