import type { Request } from "../domain/types";
import type { RequestRepository } from "./RequestRepository";

export class InMemoryRequestRepository implements RequestRepository {
  private rows = new Map<string, Request>();

  constructor(initial: Request[] = []) {
    for (const r of initial) this.rows.set(r.id, deepClone(r));
  }

  async list(): Promise<Request[]> {
    return Array.from(this.rows.values()).map(deepClone);
  }

  async findById(id: string): Promise<Request | null> {
    const row = this.rows.get(id);
    return row ? deepClone(row) : null;
  }

  async insert(request: Request): Promise<Request> {
    if (this.rows.has(request.id)) {
      throw new Error(`Duplicate request id: ${request.id}`);
    }
    this.rows.set(request.id, deepClone(request));
    return deepClone(request);
  }

  async update(request: Request): Promise<Request> {
    if (!this.rows.has(request.id)) {
      throw new Error(`Request ${request.id} does not exist`);
    }
    this.rows.set(request.id, deepClone(request));
    return deepClone(request);
  }
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
