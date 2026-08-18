import type { Request, Response } from "express";
import { gmailService } from "../gmail/service.js";
import { logger } from "../config/logger.js";
import { successResponse } from "../utils/apiResponse.js";
import { requireUser } from "../utils/request.js";
import { env } from "../config/env.js";

export const gmailController = {
  async authUrl(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64url");
    const url = gmailService.getAuthUrl(state);
    res.status(200).json(successResponse("Gmail auth URL generated", { url }));
  },

  async callback(req: Request, res: Response): Promise<void> {
    const { code, state } = req.query;
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }
    let userId: string;
    if (state && typeof state === "string") {
      try {
        const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
        userId = parsed.userId;
      } catch {
        res.status(400).json({ error: "Invalid state parameter" });
        return;
      }
    } else {
      res.status(400).json({ error: "State parameter is required" });
      return;
    }
    try {
      const account = await gmailService.connectFromCode(userId, code);
      logger.info(`[gmail] account connected for user ${userId}: ${account.accountName}`);
      try {
        const syncResult = await gmailService.sync(account.id, userId);
        logger.info(`[gmail] initial sync completed: ${syncResult.conversations} conversations, ${syncResult.messages} messages`);
      } catch (syncError) {
        logger.warn(`[gmail] initial sync failed: ${syncError instanceof Error ? syncError.message : "unknown error"}`);
      }
      const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/accounts?gmail=connected`);
    } catch (error) {
      logger.error(`[gmail] OAuth callback failed: ${error instanceof Error ? error.message : "unknown error"}`);
      const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/accounts?gmail=error`);
    }
  },

  async status(req: Request, res: Response): Promise<void> {
    const configured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GMAIL_CALLBACK_URL);
    res.status(200).json(successResponse("Gmail integration status", {
      status: { configured, callbackUrl: env.GMAIL_CALLBACK_URL },
    }));
  },

  async sync(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const newerThanDays = req.body.newerThanDays;
    const result = await gmailService.sync(req.body.accountId, user.id, { newerThanDays });
    res.status(200).json(successResponse("Gmail synced successfully", result));
  },

  async disconnect(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const account = await gmailService.disconnect(req.body.accountId, user.id);
    res.status(200).json(successResponse("Gmail account disconnected", { account }));
  },
};
