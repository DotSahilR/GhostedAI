import type { Request, Response } from "express";
import { conversationService } from "../services/conversation.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";
import { param, requireUser } from "../utils/request.js";

export const conversationController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const conversation = await conversationService.create(user.id, req.body);
    res.status(201).json(successResponse("Conversation created", { conversation }));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const result = await conversationService.list(
      user.id,
      {
        status: parseOptionalString(req.query.status),
        priority: parseOptionalString(req.query.priority),
        accountId: parseOptionalString(req.query.accountId),
        search: parseOptionalString(req.query.search),
      },
      parsePagination(req.query),
    );
    res.status(200).json(successResponse("Conversations retrieved", result));
  },

  async get(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const conversation = await conversationService.get(user.id, param(req, "id"));
    res.status(200).json(successResponse("Conversation retrieved", { conversation }));
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const conversation = await conversationService.update(user.id, param(req, "id"), req.body);
    res.status(200).json(successResponse("Conversation updated", { conversation }));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    await conversationService.remove(user.id, param(req, "id"));
    res.status(200).json(successResponse("Conversation deleted", {}));
  },

  async listMessages(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const messages = await conversationService.listMessages(user.id, param(req, "id"));
    res.status(200).json(successResponse("Messages retrieved", { messages }));
  },

  async addMessage(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const message = await conversationService.addMessage(user.id, param(req, "id"), req.body);
    res.status(201).json(successResponse("Message added", { message }));
  },
};

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
