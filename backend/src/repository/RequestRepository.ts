import type { Request } from "../domain/types";

export interface RequestRepository {
  list(): Promise<Request[]>;
  findById(id: string): Promise<Request | null>;
  insert(request: Request): Promise<Request>;
  update(request: Request): Promise<Request>;
}
