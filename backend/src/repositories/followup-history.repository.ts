import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { FollowupHistory, NewFollowupHistory } from "../schema/index.js";
import { followupHistory } from "../schema/index.js";
import type { PaginationInput } from "../utils/pagination.js";

export const followupHistoryRepository = {
  async create(data: NewFollowupHistory): Promise<FollowupHistory> {
    const [row] = await db.insert(followupHistory).values(data).returning();
    return row as FollowupHistory;
  },

  async listByConversation(
    conversationId: string,
    userId: string,
  ): Promise<FollowupHistory[]> {
    return db
      .select()
      .from(followupHistory)
      .where(
        and(
          eq(followupHistory.conversationId, conversationId),
          eq(followupHistory.userId, userId),
        ),
      )
      .orderBy(desc(followupHistory.createdAt));
  },

  async listByUser(
    userId: string,
    pagination: PaginationInput,
  ): Promise<{ items: FollowupHistory[]; total: number }> {
    const where = eq(followupHistory.userId, userId);
    const total = await db.$count(followupHistory, where);
    const items = await db
      .select()
      .from(followupHistory)
      .where(where)
      .orderBy(desc(followupHistory.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
    return { items, total };
  },
};
