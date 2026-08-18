import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";
import { z } from "zod";

export function validate(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    next();
  };
}

export function validateParams(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(result.error);
      return;
    }
    next();
  };
}

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid id parameter"),
});

export const uuidConversationSchema = z.object({
  conversationId: z.string().uuid("Invalid conversationId parameter"),
});

export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .passthrough();
