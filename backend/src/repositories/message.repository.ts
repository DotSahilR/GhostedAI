import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import type { Message, NewMessage } from "../schema/index.js";
import { messages } from "../schema/index.js";

export const messageRepository = {
  async create(data: NewMessage): Promise<Message> {
    const [row] = await db.insert(messages).values(data).returning();
    return row as Message;
  },

  async listByConversation(conversationId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.sentAt));
  },

  async findLatest(conversationId: string): Promise<Message | null> {
    const [row] = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.sentAt))
      .limit(1);
    return row ?? null;
  },

  async findByExternalMessageId(externalMessageId: string): Promise<Message | null> {
    const [row] = await db
      .select()
      .from(messages)
      .where(eq(messages.externalMessageId, externalMessageId));
    return row ?? null;
  },

  async findLastDirections(
    conversationIds: string[],
  ): Promise<Map<string, "inbound" | "outbound">> {
    if (conversationIds.length === 0) return new Map();
    const rows = await db
      .select({
        conversationId: messages.conversationId,
        direction: messages.direction,
      })
      .from(messages)
      .where(inArray(messages.conversationId, conversationIds))
      .orderBy(desc(messages.sentAt));
    const seen = new Set<string>();
    const map = new Map<string, "inbound" | "outbound">();
    for (const row of rows) {
      if (!seen.has(row.conversationId)) {
        seen.add(row.conversationId);
        map.set(row.conversationId, row.direction as "inbound" | "outbound");
      }
    }
    return map;
  },
};
