import { and, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import type { Conversation, NewConversation } from "../schema/index.js";
import { conversations } from "../schema/index.js";
import type { PaginationInput } from "../utils/pagination.js";

export interface ConversationListFilter {
  userId: string;
  status?: string;
  priority?: string;
  accountId?: string;
  search?: string;
  pagination: PaginationInput;
}

export const conversationRepository = {
  async create(data: NewConversation): Promise<Conversation> {
    const [row] = await db.insert(conversations).values(data).returning();
    return row as Conversation;
  },

  async findById(id: string, userId: string): Promise<Conversation | null> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return row ?? null;
  },

  async findByExternalThreadId(threadId: string, userId: string): Promise<Conversation | null> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.externalThreadId, threadId), eq(conversations.userId, userId)),
      );
    return row ?? null;
  },

  async findByExternalThreadIdOnly(threadId: string): Promise<Conversation | null> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.externalThreadId, threadId));
    return row ?? null;
  },

  async list(filter: ConversationListFilter): Promise<{ items: Conversation[]; total: number }> {
    const conditions: (SQL<unknown> | undefined)[] = [
      eq(conversations.userId, filter.userId),
    ];
    if (filter.status) {
      conditions.push(eq(conversations.status, filter.status as Conversation["status"]));
    }
    if (filter.priority) {
      conditions.push(eq(conversations.priority, filter.priority as Conversation["priority"]));
    }
    if (filter.accountId) {
      conditions.push(eq(conversations.accountId, filter.accountId));
    }
    if (filter.search) {
      conditions.push(
        or(
          ilike(conversations.name, `%${filter.search}%`),
          ilike(conversations.handle, `%${filter.search}%`),
          ilike(conversations.subject, `%${filter.search}%`),
        ),
      );
    }
    const where = and(...conditions.filter((c): c is SQL => c !== undefined));
    const total = await db.$count(conversations, where);
    const items = await db
      .select()
      .from(conversations)
      .where(where)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(filter.pagination.limit)
      .offset(filter.pagination.offset);
    return { items, total };
  },

  async listForAutomation(userId?: string, limit = 200): Promise<Conversation[]> {
    const conditions = [
      inArray(conversations.status, ["waiting", "needs_followup"]),
    ];
    if (userId) {
      conditions.push(eq(conversations.userId, userId));
    }
    return db
      .select()
      .from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit);
  },

  async update(
    id: string,
    userId: string,
    data: Partial<NewConversation>,
  ): Promise<Conversation | null> {
    const [row] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return row ?? null;
  },

  async remove(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning({ id: conversations.id });
    return rows.length > 0;
  },
};
