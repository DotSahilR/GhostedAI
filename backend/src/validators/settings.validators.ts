import { z } from "zod";

export const updateSettingsSchema = z.object({
  profileType: z.string().trim().min(1).max(100).optional(),
  waitDays: z.number().int().min(0).max(365).optional(),
  maxFollowUps: z.number().int().min(0).max(100).optional(),
  autoSend: z.boolean().optional(),
  defaultTone: z.enum(["professional", "friendly", "formal"]).optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  workingHoursStart: z.string().trim().max(10).nullable().optional(),
  workingHoursEnd: z.string().trim().max(10).nullable().optional(),
  emailNotifications: z.boolean().optional(),
  telegramNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  trackCategories: z.array(z.string()).max(100).optional(),
  ignoreCategories: z.array(z.string()).max(100).optional(),
});
