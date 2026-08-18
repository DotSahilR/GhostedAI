import { z } from "zod";

export const caspianConnectSchema = z.object({
  apiKey: z.string().trim().min(1).max(1024).optional(),
  accountName: z.string().trim().min(1).max(255).optional(),
});

export const caspianSyncSchema = z.object({
  accountId: z.string().uuid(),
});

export const caspianSendSchema = z.object({
  accountId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(50_000),
  conversationId: z.string().uuid().optional(),
});

export const caspianDisconnectSchema = z.object({
  accountId: z.string().uuid(),
});
