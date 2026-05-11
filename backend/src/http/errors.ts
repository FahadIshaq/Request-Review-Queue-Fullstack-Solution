import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError, NotFoundError } from "../domain/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      code: "invalid_request",
      message: "Request body or query is invalid.",
      issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(err.httpStatus).json({ code: err.code, message: err.message });
    return;
  }

  if (err instanceof DomainError) {
    res.status(err.httpStatus).json({ code: err.code, message: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(500).json({
    code: "internal_error",
    message: "Something went wrong on our end.",
  });
}
