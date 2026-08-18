import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { followupActionEnum } from "./enums.js";
import { followupDrafts } from "./followup-drafts.js";
import { users } from "./users.js";

export const followupHistory = pgTable(
  "followup_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    draftId: uuid("draft_id").references(() => followupDrafts.id, { onDelete: "set null" }),
    action: followupActionEnum("action").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("followup_history_conversation_id_idx").on(table.conversationId)],
);

export type FollowupHistory = typeof followupHistory.$inferSelect;

export type NewFollowupHistory = typeof followupHistory.$inferInsert;
