import type { Request } from "express";
import { AppError } from "../errors/index.js";

export function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError("Missing route parameter", 400);
  }
  return value;
}
