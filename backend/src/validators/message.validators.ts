import { z } from "zod";

export const createMessageSchema = z.object({
  direction: z.enum(["inbound", "outbound"]),
  body: z.string().trim().min(1).max(50_000),
  externalMessageId: z.string().trim().max(255).optional(),
  sentAt: z.string().datetime().optional(),
});
