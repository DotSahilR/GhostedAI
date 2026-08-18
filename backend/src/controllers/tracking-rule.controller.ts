import type { Request, Response } from "express";
import { trackingRuleService } from "../services/tracking-rule.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { param, requireUser } from "../utils/request.js";

export const trackingRuleController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const rule = await trackingRuleService.create(user.id, req.body);
    res.status(201).json(successResponse("Tracking rule created", { rule }));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const rules = await trackingRuleService.list(user.id);
    res.status(200).json(successResponse("Tracking rules retrieved", { rules }));
  },

  async get(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const rule = await trackingRuleService.get(user.id, param(req, "id"));
    res.status(200).json(successResponse("Tracking rule retrieved", { rule }));
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const rule = await trackingRuleService.update(user.id, param(req, "id"), req.body);
    res.status(200).json(successResponse("Tracking rule updated", { rule }));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    await trackingRuleService.remove(user.id, param(req, "id"));
    res.status(200).json(successResponse("Tracking rule deleted", {}));
  },
};
