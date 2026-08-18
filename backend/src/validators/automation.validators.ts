import { z } from "zod";

export const runAutomationSchema = z.object({
  phase: z.enum(["prepare", "send", "all"]).optional(),
});
