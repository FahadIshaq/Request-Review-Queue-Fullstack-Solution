import fs from "fs/promises";
import path from "path";
import type { Request } from "../domain/types";
import type { RequestRepository } from "./RequestRepository";

export class JsonFileRequestRepository implements RequestRepository {
  private rows = new Map<string, Request>();
  private loaded = false;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async load(seed: () => Request[]): Promise<void> {
    if (this.loaded) return;
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      const contents = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(contents) as Request[];
      for (const r of parsed) this.rows.set(r.id, r);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;

      const seeded = seed();
      for (const r of seeded) this.rows.set(r.id, r);
      await this.persist();
    }

    this.loaded = true;
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
    await this.persist();
    return deepClone(request);
  }

  async update(request: Request): Promise<Request> {
    if (!this.rows.has(request.id)) {
      throw new Error(`Request ${request.id} does not exist`);
    }
    this.rows.set(request.id, deepClone(request));
    await this.persist();
    return deepClone(request);
  }

  private persist(): Promise<void> {
    const snapshot = Array.from(this.rows.values());
    const tmp = this.filePath + ".tmp";
    const data = JSON.stringify(snapshot, null, 2);

    this.writeChain = this.writeChain
      .catch(() => {})
      .then(async () => {
        await fs.writeFile(tmp, data, "utf8");
        await fs.rename(tmp, this.filePath);
      });
    return this.writeChain;
  }
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
