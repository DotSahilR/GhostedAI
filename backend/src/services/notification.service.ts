import { AppError } from "../errors/index.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import type { PaginationInput } from "../utils/pagination.js";
import { toPaginated } from "../utils/pagination.js";

export const notificationService = {
  async list(userId: string, pagination: PaginationInput, unreadOnly: boolean) {
    const { items, total } = await notificationRepository.listByUser(userId, pagination, unreadOnly);
    return toPaginated(items, total, pagination);
  },

  async unreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  async markRead(userId: string, id: string) {
    const notification = await notificationRepository.markRead(id, userId);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    return notification;
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
  },
};
