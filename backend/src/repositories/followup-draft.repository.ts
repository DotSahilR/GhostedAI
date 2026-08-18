import { and, asc, desc, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "../db/index.js";
import type { FollowupDraft, NewFollowupDraft } from "../schema/index.js";
import { followupDrafts } from "../schema/index.js";

export const followupDraftRepository = {
  async create(data: NewFollowupDraft): Promise<FollowupDraft> {
    const [row] = await db.insert(followupDrafts).values(data).returning();
    return row as FollowupDraft;
  },

  async findById(id: string, userId: string): Promise<FollowupDraft | null> {
    const [row] = await db
      .select()
      .from(followupDrafts)
      .where(and(eq(followupDrafts.id, id), eq(followupDrafts.userId, userId)));
    return row ?? null;
  },

  async listByUser(userId: string, limit = 50): Promise<FollowupDraft[]> {
    return db
      .select()
      .from(followupDrafts)
      .where(eq(followupDrafts.userId, userId))
      .orderBy(desc(followupDrafts.createdAt))
      .limit(limit);
  },

  async listByConversation(conversationId: string, userId: string): Promise<FollowupDraft[]> {
    return db
      .select()
      .from(followupDrafts)
      .where(
        and(
          eq(followupDrafts.conversationId, conversationId),
          eq(followupDrafts.userId, userId),
        ),
      )
      .orderBy(desc(followupDrafts.createdAt));
  },

  async listActiveByConversation(
    conversationId: string,
    userId: string,
  ): Promise<FollowupDraft[]> {
    return db
      .select()
      .from(followupDrafts)
      .where(
        and(
          eq(followupDrafts.conversationId, conversationId),
          eq(followupDrafts.userId, userId),
          inArray(followupDrafts.status, ["draft", "approved", "scheduled"]),
        ),
      )
      .orderBy(desc(followupDrafts.createdAt));
  },

  async discardByConversation(conversationId: string, userId: string): Promise<void> {
    await db
      .update(followupDrafts)
      .set({ status: "discarded", updatedAt: new Date() })
      .where(
        and(
          eq(followupDrafts.conversationId, conversationId),
          eq(followupDrafts.userId, userId),
          inArray(followupDrafts.status, ["draft", "approved", "scheduled"]),
        ),
      );
  },

  async listDueForSend(now: Date, limit = 200): Promise<FollowupDraft[]> {
    return db
      .select()
      .from(followupDrafts)
      .where(
        and(
          inArray(followupDrafts.status, ["approved", "scheduled"]),
          or(
            isNull(followupDrafts.scheduledAt),
            lte(followupDrafts.scheduledAt, now),
          ),
          or(
            isNull(followupDrafts.nextRetryAt),
            lte(followupDrafts.nextRetryAt, now),
          ),
        ),
      )
      .orderBy(asc(followupDrafts.scheduledAt))
      .limit(limit);
  },

  async update(
    id: string,
    userId: string,
    data: Partial<NewFollowupDraft>,
  ): Promise<FollowupDraft | null> {
    const [row] = await db
      .update(followupDrafts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(followupDrafts.id, id), eq(followupDrafts.userId, userId)))
      .returning();
    return row ?? null;
  },

  async remove(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(followupDrafts)
      .where(and(eq(followupDrafts.id, id), eq(followupDrafts.userId, userId)))
      .returning({ id: followupDrafts.id });
    return rows.length > 0;
  },
};
