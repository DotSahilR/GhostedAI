import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";
import { param, requireUser } from "../utils/request.js";

export const notificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const unreadOnly = req.query.unread === "true";
    const result = await notificationService.list(user.id, parsePagination(req.query), unreadOnly);
    res.status(200).json(successResponse("Notifications retrieved", result));
  },

  async unreadCount(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const count = await notificationService.unreadCount(user.id);
    res.status(200).json(successResponse("Unread count retrieved", { count }));
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const notification = await notificationService.markRead(user.id, param(req, "id"));
    res.status(200).json(successResponse("Notification marked as read", { notification }));
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    await notificationService.markAllRead(user.id);
    res.status(200).json(successResponse("All notifications marked as read", {}));
  },
};
