import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewNotification, Notification } from "../schema/index.js";
import { notifications } from "../schema/index.js";
import type { PaginationInput } from "../utils/pagination.js";

export const notificationRepository = {
  async create(data: NewNotification): Promise<Notification> {
    const [row] = await db.insert(notifications).values(data).returning();
    return row as Notification;
  },

  async createMany(items: NewNotification[]): Promise<Notification[]> {
    return db.insert(notifications).values(items).returning();
  },

  async findById(id: string, userId: string): Promise<Notification | null> {
    const [row] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return row ?? null;
  },

  async listByUser(
    userId: string,
    pagination: PaginationInput,
    unreadOnly = false,
  ): Promise<{ items: Notification[]; total: number }> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }
    const where = and(...conditions);
    const total = await db.$count(notifications, where);
    const items = await db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
    return { items, total };
  },

  async countUnread(userId: string): Promise<number> {
    return db.$count(notifications, and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  },

  async markRead(id: string, userId: string): Promise<Notification | null> {
    const [row] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return row ?? null;
  },

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  },

  async remove(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });
    return rows.length > 0;
  },
};
