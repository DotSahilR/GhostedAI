import type { Request, Response } from "express";
import { followupHistoryService } from "../services/followup-history.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";
import { param, requireUser } from "../utils/request.js";

export const followupHistoryController = {
  async listByConversation(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const history = await followupHistoryService.listByConversation(
      user.id,
      param(req, "conversationId"),
    );
    res.status(200).json(successResponse("Follow-up history retrieved", { history }));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const result = await followupHistoryService.listByUser(user.id, parsePagination(req.query));
    res.status(200).json(successResponse("Follow-up history retrieved", result));
  },
};
