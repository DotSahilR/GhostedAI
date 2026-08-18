import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { activityLogs } from "../schema/index.js";
import { conversations } from "../schema/index.js";
import { followupDrafts } from "../schema/index.js";

export const analyticsRepository = {
  async countConversations(userId: string): Promise<number> {
    return db.$count(conversations, eq(conversations.userId, userId));
  },

  async statusDistribution(userId: string): Promise<Array<{ status: string; count: number }>> {
    const rows = await db
      .select({ status: conversations.status, count: sql<number>`count(*)::int` })
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .groupBy(conversations.status);
    return rows.map((row) => ({ status: row.status, count: Number(row.count) }));
  },

  async priorityDistribution(userId: string): Promise<Array<{ priority: string; count: number }>> {
    const rows = await db
      .select({ priority: conversations.priority, count: sql<number>`count(*)::int` })
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .groupBy(conversations.priority);
    return rows.map((row) => ({ priority: row.priority, count: Number(row.count) }));
  },

  async platformDistribution(userId: string): Promise<Array<{ platform: string; count: number }>> {
    const rows = await db
      .select({ platform: conversations.platform, count: sql<number>`count(*)::int` })
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .groupBy(conversations.platform);
    return rows.map((row) => ({ platform: row.platform ?? "other", count: Number(row.count) }));
  },

  async countSentDrafts(userId: string): Promise<number> {
    return db.$count(followupDrafts, and(eq(followupDrafts.userId, userId), eq(followupDrafts.status, "sent")));
  },

  async countActivitySince(userId: string, action: string, since: Date): Promise<number> {
    return db.$count(
      activityLogs,
      and(
        eq(activityLogs.userId, userId),
        eq(activityLogs.action, action),
        gte(activityLogs.createdAt, since),
      ),
    );
  },

  async recentActivity(userId: string, since: Date): Promise<Array<{ action: string; createdAt: Date }>> {
    return db
      .select({ action: activityLogs.action, createdAt: activityLogs.createdAt })
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), gte(activityLogs.createdAt, since)))
      .orderBy(sql`${activityLogs.createdAt} asc`);
  },

  async completedConversationStats(userId: string): Promise<{
    count: number;
    totalDaysWaiting: number;
    totalValue: number;
  }> {
    const rows = await db
      .select({
        daysWaiting: conversations.daysWaiting,
        value: conversations.value,
      })
      .from(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.status, "completed")));
    let totalDaysWaiting = 0;
    let totalValue = 0;
    for (const row of rows) {
      totalDaysWaiting += row.daysWaiting ?? 0;
      const parsed = Number(String(row.value ?? "").replace(/[^0-9.]/g, ""));
      if (Number.isFinite(parsed)) {
        totalValue += parsed;
      }
    }
    return { count: rows.length, totalDaysWaiting, totalValue };
  },
};
