import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { errorResponse } from "../utils/apiResponse.js";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res
      .status(error.statusCode)
      .json(errorResponse(error.message, error.details ?? {}));
    return;
  }

  if (error instanceof ZodError) {
    res
      .status(400)
      .json(errorResponse("Validation failed", { issues: error.issues }));
    return;
  }

  if (isBodyParserError(error)) {
    res.status(error.status).json(errorResponse("Invalid request payload"));
    return;
  }

  logger.error(
    `Unhandled error on ${req.method} ${req.originalUrl}`,
    error instanceof Error ? error.stack : error,
  );

  const isProduction = env.NODE_ENV === "production";
  const details = isProduction ? {} : error instanceof Error ? error.stack : error;

  res.status(500).json(errorResponse("Internal server error", details));
}

function isBodyParserError(error: unknown): error is { status: number; type: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number" &&
    "type" in error
  );
}
