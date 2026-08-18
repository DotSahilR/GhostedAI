import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/apiResponse.js";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json(errorResponse("Route not found", { path: req.originalUrl, method: req.method }));
}
