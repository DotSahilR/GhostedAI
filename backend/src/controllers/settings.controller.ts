import type { Request, Response } from "express";
import { settingsService } from "../services/settings.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { requireUser } from "../utils/request.js";

export const settingsController = {
  async get(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const settings = await settingsService.get(user.id);
    res.status(200).json(successResponse("Settings retrieved", { settings }));
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const settings = await settingsService.update(user.id, req.body);
    res.status(200).json(successResponse("Settings updated", { settings }));
  },
};
