import { z } from "zod";

export const createConnectedAccountSchema = z.object({
  provider: z.literal("caspian"),
  accountName: z.string().trim().min(1).max(255),
  externalId: z.string().trim().max(255).optional(),
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
  tokenExpiresAt: z.string().datetime().optional(),
  status: z.enum(["connected", "disconnected", "error"]).optional(),
  permissions: z.array(z.string()).max(50).optional(),
  description: z.string().max(500).optional(),
});

export const updateConnectedAccountSchema = createConnectedAccountSchema.partial();
