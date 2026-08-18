import type { Request, Response } from "express";
import { followupDraftService } from "../services/followup-draft.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { param, requireUser } from "../utils/request.js";

export const followupDraftController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const draft = await followupDraftService.create(user.id, param(req, "conversationId"), req.body);
    res.status(201).json(successResponse("Follow-up draft created", { draft }));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const drafts = await followupDraftService.listByUser(user.id);
    res.status(200).json(successResponse("Follow-up drafts retrieved", { drafts }));
  },

  async listByConversation(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const drafts = await followupDraftService.listByConversation(
      user.id,
      param(req, "conversationId"),
    );
    res.status(200).json(successResponse("Follow-up drafts retrieved", { drafts }));
  },

  async get(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const draft = await followupDraftService.get(user.id, param(req, "id"));
    res.status(200).json(successResponse("Follow-up draft retrieved", { draft }));
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const draft = await followupDraftService.update(user.id, param(req, "id"), req.body);
    res.status(200).json(successResponse("Follow-up draft updated", { draft }));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    await followupDraftService.remove(user.id, param(req, "id"));
    res.status(200).json(successResponse("Follow-up draft deleted", {}));
  },
};
