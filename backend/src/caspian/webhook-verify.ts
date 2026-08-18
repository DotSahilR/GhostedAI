import crypto from "node:crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function verifyCaspianSignature(rawBody: Buffer | undefined, signature: string | undefined): boolean {
  const secret = env.CASPIAN_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }
  if (!rawBody || !signature) {
    return false;
  }
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBytes = Buffer.from(signature, "hex");
    const expectedBytes = Buffer.from(expected, "hex");
    if (sigBytes.length !== expectedBytes.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBytes, expectedBytes);
  } catch (error) {
    logger.warn(
      `[caspian] webhook signature verification error: ${
        error instanceof Error ? error.message : "unknown"
      }`,
    );
    return false;
  }
}
