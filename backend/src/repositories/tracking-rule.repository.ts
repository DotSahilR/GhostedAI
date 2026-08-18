import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewTrackingRule, TrackingRule } from "../schema/index.js";
import { trackingRules } from "../schema/index.js";

export const trackingRuleRepository = {
  async create(data: NewTrackingRule): Promise<TrackingRule> {
    const [row] = await db.insert(trackingRules).values(data).returning();
    return row as TrackingRule;
  },

  async findById(id: string, userId: string): Promise<TrackingRule | null> {
    const [row] = await db
      .select()
      .from(trackingRules)
      .where(and(eq(trackingRules.id, id), eq(trackingRules.userId, userId)));
    return row ?? null;
  },

  async listByUser(userId: string): Promise<TrackingRule[]> {
    return db
      .select()
      .from(trackingRules)
      .where(eq(trackingRules.userId, userId))
      .orderBy(desc(trackingRules.createdAt));
  },

  async listActiveByUser(userId: string): Promise<TrackingRule[]> {
    return db
      .select()
      .from(trackingRules)
      .where(and(eq(trackingRules.userId, userId), eq(trackingRules.isActive, true)))
      .orderBy(desc(trackingRules.createdAt));
  },

  async update(
    id: string,
    userId: string,
    data: Partial<NewTrackingRule>,
  ): Promise<TrackingRule | null> {
    const [row] = await db
      .update(trackingRules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(trackingRules.id, id), eq(trackingRules.userId, userId)))
      .returning();
    return row ?? null;
  },

  async remove(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(trackingRules)
      .where(and(eq(trackingRules.id, id), eq(trackingRules.userId, userId)))
      .returning({ id: trackingRules.id });
    return rows.length > 0;
  },
};
