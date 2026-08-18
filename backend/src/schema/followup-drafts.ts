import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { draftStatusEnum, toneEnum } from "./enums.js";
import { users } from "./users.js";

export const followupDrafts = pgTable(
  "followup_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tone: toneEnum("tone").notNull().default("professional"),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: draftStatusEnum("status").notNull().default("draft"),
    variant: integer("variant").notNull().default(1),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    retryCount: integer("retry_count").notNull().default(0),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("followup_drafts_conversation_id_idx").on(table.conversationId)],
);

export type FollowupDraft = typeof followupDrafts.$inferSelect;

export type NewFollowupDraft = typeof followupDrafts.$inferInsert;
