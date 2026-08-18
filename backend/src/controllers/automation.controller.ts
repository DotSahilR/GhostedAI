import type { Request, Response } from "express";
import {
  prepareFollowUps,
  processReplies,
  runAutomationCycle,
  sendFollowUps,
} from "../automation/engine.js";
import { env } from "../config/env.js";
import { successResponse } from "../utils/apiResponse.js";
import { requireUser } from "../utils/request.js";

export const automationController = {
  async status(req: Request, res: Response): Promise<void> {
    requireUser(req);
    res.status(200).json(
      successResponse("Automation status", {
        enabled: env.CRON_ENABLED,
        prepare: env.CRON_PREPARE,
        send: env.CRON_SEND,
      }),
    );
  },

  async run(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const phase = req.body?.phase ?? "all";
    const result =
      phase === "prepare"
        ? {
            ...(await processReplies(user.id)),
            ...(await prepareFollowUps(user.id)),
          }
        : phase === "send"
          ? await sendFollowUps(user.id)
          : await runAutomationCycle(user.id);
    res.status(200).json(successResponse("Automation run completed", { phase, result }));
  },
};
