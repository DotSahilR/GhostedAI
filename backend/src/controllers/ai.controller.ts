import type { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { followupDraftService } from "../services/followup-draft.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { param, requireUser } from "../utils/request.js";

export const aiController = {
  async generate(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const draft = await followupDraftService.generate(
      user.id,
      param(req, "conversationId"),
      req.body,
    );
    res.status(201).json(successResponse("Follow-up draft generated", { draft }));
  },

  async regenerate(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const draft = await followupDraftService.regenerate(user.id, param(req, "id"), req.body);
    res.status(200).json(successResponse("Follow-up draft regenerated", { draft }));
  },

  async analyze(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const analysis = await aiService.analyze(user.id, param(req, "id"));
    res.status(200).json(successResponse("Conversation analysis retrieved", { analysis }));
  },

  async summarize(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const result = await aiService.summarizeConversation(user.id, param(req, "id"));
    res.status(200).json(successResponse("Conversation summary generated", result));
  },

  async rewrite(req: Request, res: Response): Promise<void> {
    requireUser(req);
    const result = await aiService.rewriteDraft(req.body);
    res.status(200).json(successResponse("Draft rewritten", result));
  },

  async adjustTone(req: Request, res: Response): Promise<void> {
    requireUser(req);
    const result = await aiService.adjustTone(req.body);
    res.status(200).json(successResponse("Draft tone adjusted", result));
  },
};
