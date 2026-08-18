import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { requireUser } from "../utils/request.js";

export const analyticsController = {
  async summary(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const days = typeof req.query.days === "string" ? Number(req.query.days) : 30;
    const summary = await analyticsService.summary(user.id, days);
    res.status(200).json(successResponse("Analytics summary retrieved", summary));
  },
};
