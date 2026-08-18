import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { connectedAccounts } from "./connected-accounts.js";
import { conversations } from "./conversations.js";
import { messageDirectionEnum } from "./enums.js";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => connectedAccounts.id, {
      onDelete: "set null",
    }),
    direction: messageDirectionEnum("direction").notNull(),
    body: text("body").notNull(),
    externalMessageId: text("external_message_id"),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("messages_conversation_id_idx").on(table.conversationId)],
);

export type Message = typeof messages.$inferSelect;

export type NewMessage = typeof messages.$inferInsert;
