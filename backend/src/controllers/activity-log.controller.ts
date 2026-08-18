import type { Request, Response } from "express";
import { activityLogService } from "../services/activity-log.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";
import { requireUser } from "../utils/request.js";

export const activityLogController = {
  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const result = await activityLogService.list(user.id, parsePagination(req.query));
    res.status(200).json(successResponse("Activity logs retrieved", result));
  },
};
