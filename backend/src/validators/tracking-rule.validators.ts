import { z } from "zod";

export const createTrackingRuleSchema = z.object({
  name: z.string().trim().min(1).max(255),
  event: z.enum(["no_reply"]).optional(),
  waitMinutes: z.number().int().min(1).max(525_600).optional(),
  maxFollowUps: z.number().int().min(0).max(100).optional(),
  tone: z.enum(["professional", "friendly", "formal"]).optional(),
  category: z.string().trim().max(255).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateTrackingRuleSchema = createTrackingRuleSchema.partial();
