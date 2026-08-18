import { z } from "zod";

export const generateDraftSchema = z.object({
  tone: z.enum(["professional", "friendly", "formal"]).optional(),
  variant: z.number().int().positive().optional(),
});

export const rewriteDraftSchema = z.object({
  body: z.string().trim().min(1).max(10_000),
  tone: z.enum(["professional", "friendly", "formal"]).default("professional"),
  instructions: z.string().trim().max(500).optional(),
});

