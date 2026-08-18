import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { connectedAccounts } from "./connected-accounts.js";
import { accountProviderEnum, conversationStatusEnum, priorityEnum } from "./enums.js";
import { users } from "./users.js";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => connectedAccounts.id, {
      onDelete: "set null",
    }),
    externalThreadId: text("external_thread_id"),
    name: text("name").notNull(),
    handle: text("handle").notNull(),
    company: text("company"),
    avatarUrl: text("avatar_url"),
    subject: text("subject").notNull(),
    category: text("category"),
    platform: accountProviderEnum("platform"),
    status: conversationStatusEnum("status").notNull().default("waiting"),
    priority: priorityEnum("priority").notNull().default("medium"),
    daysWaiting: integer("days_waiting").notNull().default(0),
    lastMessage: text("last_message"),
    nextAction: text("next_action"),
    confidence: integer("confidence").notNull().default(0),
    followUpsSent: integer("follow_ups_sent").notNull().default(0),
    value: text("value"),
    autoSend: boolean("auto_send"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("conversations_user_id_idx").on(table.userId)],
);

export type Conversation = typeof conversations.$inferSelect;

export type NewConversation = typeof conversations.$inferInsert;
