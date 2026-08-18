import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { ActivityLog, NewActivityLog } from "../schema/index.js";
import { activityLogs } from "../schema/index.js";
import type { PaginationInput } from "../utils/pagination.js";

export const activityLogRepository = {
  async create(data: NewActivityLog): Promise<ActivityLog> {
    const [row] = await db.insert(activityLogs).values(data).returning();
    return row as ActivityLog;
  },

  async listByUser(
    userId: string,
    pagination: PaginationInput,
  ): Promise<{ items: ActivityLog[]; total: number }> {
    const where = eq(activityLogs.userId, userId);
    const total = await db.$count(activityLogs, where);
    const items = await db
      .select()
      .from(activityLogs)
      .where(where)
      .orderBy(desc(activityLogs.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
    return { items, total };
  },
};
