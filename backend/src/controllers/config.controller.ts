import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { aiProviderStatus } from "../ai/index.js";
import { caspianService } from "../caspian/service.js";
import { pingDatabase } from "../db/index.js";
import { successResponse } from "../utils/apiResponse.js";

export const configController = {
  async status(_req: Request, res: Response): Promise<void> {
    const [databaseConnected, ai] = await Promise.all([
      pingDatabase(),
      Promise.resolve(aiProviderStatus()),
    ]);
    res.status(200).json(
      successResponse("Configuration status retrieved", {
        database: {
          configured: Boolean(env.DATABASE_URL),
          connected: databaseConnected,
        },
        auth: {
          google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL),
        },
        caspian: caspianService.status(),
        ai,
        scheduler: {
          enabled: env.CRON_ENABLED,
          prepare: env.CRON_PREPARE,
          send: env.CRON_SEND,
        },
      }),
    );
  },
};
