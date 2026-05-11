import cors from "cors";
import express, { type Application } from "express";
import { RequestService } from "../services/RequestService";
import { errorHandler } from "./errors";
import { buildRouter } from "./routes";

export function buildApp(service: RequestService): Application {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => cb(null, origin ?? true),
      credentials: false,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api", buildRouter(service));

  app.use((_req, res) => {
    res.status(404).json({ code: "not_found", message: "Route not found." });
  });

  app.use(errorHandler);

  return app;
}
