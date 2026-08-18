import { z } from "zod";

export const createConversationSchema = z.object({
  accountId: z.string().uuid().optional(),
  externalThreadId: z.string().trim().max(255).optional(),
  name: z.string().trim().min(1).max(255),
  handle: z.string().trim().min(1).max(255),
  company: z.string().trim().max(255).optional(),
  avatarUrl: z.string().url().optional(),
  subject: z.string().trim().min(1).max(500),
  category: z.string().trim().max(255).optional(),
  platform: z.literal("caspian").optional(),
  status: z
    .enum(["waiting", "needs_followup", "completed", "paused", "archived"])
    .optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  daysWaiting: z.number().int().min(0).optional(),
  lastMessage: z.string().max(1000).optional(),
  nextAction: z.string().max(500).optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  followUpsSent: z.number().int().min(0).optional(),
  value: z.string().max(100).optional(),
  nextFollowUpAt: z.string().datetime().optional(),
});

export const updateConversationSchema = createConversationSchema.partial();
