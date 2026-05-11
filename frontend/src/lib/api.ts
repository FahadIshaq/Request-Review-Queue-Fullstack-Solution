import type { HistoryEvent, RequestRecord, Status } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : (rest.body as BodyInit | undefined),
    ...rest,
  });

  if (!res.ok) {
    let body: { code?: string; message?: string; issues?: unknown } = {};
    try {
      body = await res.json();
    } catch {
      // ignore parse failures
    }
    throw new ApiError(
      res.status,
      body.code ?? "request_failed",
      body.message ?? `Request to ${path} failed (${res.status})`,
      body.issues
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface ListParams {
  status?: Status;
  owner?: string;
  due?: "due_soon" | "overdue";
  q?: string;
}

export const api = {
  async listRequests(params: ListParams = {}): Promise<RequestRecord[]> {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") q.set(k, String(v));
    }
    const suffix = q.toString() ? `?${q.toString()}` : "";
    const res = await request<{ data: RequestRecord[] }>(`/requests${suffix}`);
    return res.data;
  },

  async getRequest(id: string): Promise<RequestRecord> {
    return request<RequestRecord>(`/requests/${id}`);
  },

  async createRequest(input: {
    title: string;
    submitter: string;
    priority?: string;
    owner?: string | null;
    dueDate?: string | null;
    requiredFieldsComplete?: boolean;
    actor?: string;
  }): Promise<RequestRecord> {
    return request<RequestRecord>(`/requests`, {
      method: "POST",
      json: input,
    });
  },

  async changeStatus(
    id: string,
    input: { status: Status; rejectionReason?: string; actor?: string }
  ): Promise<RequestRecord> {
    return request<RequestRecord>(`/requests/${id}/status`, {
      method: "PATCH",
      json: input,
    });
  },

  async assignOwner(
    id: string,
    input: { owner: string | null; actor?: string }
  ): Promise<RequestRecord> {
    return request<RequestRecord>(`/requests/${id}/owner`, {
      method: "PATCH",
      json: input,
    });
  },

  async addNote(
    id: string,
    input: { body: string; actor?: string }
  ): Promise<RequestRecord> {
    return request<RequestRecord>(`/requests/${id}/notes`, {
      method: "POST",
      json: input,
    });
  },

  async listOwners(): Promise<string[]> {
    const res = await request<{ data: string[] }>(`/owners`);
    return res.data;
  },

  async getHistory(id: string): Promise<HistoryEvent[]> {
    const res = await request<{ data: HistoryEvent[] }>(
      `/requests/${id}/history`
    );
    return res.data;
  },
};
