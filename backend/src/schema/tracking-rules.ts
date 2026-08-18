import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { toneEnum, trackingRuleEventEnum } from "./enums.js";
import { users } from "./users.js";

export const trackingRules = pgTable(
  "tracking_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    event: trackingRuleEventEnum("event").notNull().default("no_reply"),
    waitMinutes: integer("wait_minutes").notNull().default(4320),
    maxFollowUps: integer("max_follow_ups").notNull().default(3),
    tone: toneEnum("tone").notNull().default("professional"),
    category: text("category"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("tracking_rules_user_id_idx").on(table.userId)],
);

export type TrackingRule = typeof trackingRules.$inferSelect;

export type NewTrackingRule = typeof trackingRules.$inferInsert;
