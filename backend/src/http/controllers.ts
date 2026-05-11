import type { NextFunction, Request as ExpressRequest, Response } from "express";
import { z } from "zod";
import { PRIORITIES, STATUSES } from "../domain/types";
import type { RequestService, ListFilters } from "../services/RequestService";

const createSchema = z.object({
  title: z.string().min(1, "title is required"),
  submitter: z.string().min(1, "submitter is required"),
  priority: z.enum(PRIORITIES).optional(),
  owner: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  requiredFieldsComplete: z.boolean().optional(),
  actor: z.string().optional(),
});

const listSchema = z.object({
  status: z.enum(STATUSES).optional(),
  owner: z.string().optional(),
  due: z.enum(["due_soon", "overdue"]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

const statusSchema = z.object({
  status: z.enum(STATUSES),
  rejectionReason: z.string().optional(),
  actor: z.string().optional(),
});

const ownerSchema = z.object({
  owner: z.string().nullable(),
  actor: z.string().optional(),
});

const noteSchema = z.object({
  body: z.string().min(1, "body is required"),
  actor: z.string().optional(),
});

export function buildControllers(service: RequestService) {
  return {
    async create(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const input = createSchema.parse(req.body ?? {});
        const created = await service.create(input);
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },

    async list(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const { page, pageSize, ...filters } = listSchema.parse(req.query);
        const all = await service.list(filters as ListFilters);
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * pageSize;
        const data = all.slice(start, start + pageSize);
        res.json({ data, page: safePage, pageSize, total, totalPages });
      } catch (err) {
        next(err);
      }
    },

    async getById(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const result = await service.getById(req.params.id);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async changeStatus(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const input = statusSchema.parse(req.body ?? {});
        const result = await service.changeStatus(req.params.id, input);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async assignOwner(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const input = ownerSchema.parse(req.body ?? {});
        const result = await service.assignOwner(req.params.id, input);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async addNote(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const input = noteSchema.parse(req.body ?? {});
        const result = await service.addNote(req.params.id, input);
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },

    async getHistory(req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const history = await service.getHistory(req.params.id);
        res.json({ data: history });
      } catch (err) {
        next(err);
      }
    },

    async listOwners(_req: ExpressRequest, res: Response, next: NextFunction) {
      try {
        const owners = await service.listOwners();
        res.json({ data: owners });
      } catch (err) {
        next(err);
      }
    },
  };
}
