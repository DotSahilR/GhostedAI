import { z } from "zod";

export const createFollowupDraftSchema = z.object({
  tone: z.enum(["professional", "friendly", "formal"]).optional(),
  subject: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(50_000),
  status: z.enum(["draft", "approved", "scheduled", "sent", "discarded"]).optional(),
  variant: z.number().int().min(1).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  sentAt: z.string().datetime().nullable().optional(),
});

export const updateFollowupDraftSchema = createFollowupDraftSchema.partial();
