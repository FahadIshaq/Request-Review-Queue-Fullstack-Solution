import { Router } from "express";
import type { RequestService } from "../services/RequestService";
import { buildControllers } from "./controllers";

export function buildRouter(service: RequestService): Router {
  const router = Router();
  const c = buildControllers(service);

  router.get("/requests", c.list);
  router.post("/requests", c.create);
  router.get("/requests/:id", c.getById);
  router.patch("/requests/:id/status", c.changeStatus);
  router.patch("/requests/:id/owner", c.assignOwner);
  router.post("/requests/:id/notes", c.addNote);
  router.get("/requests/:id/history", c.getHistory);

  router.get("/owners", c.listOwners);

  return router;
}
