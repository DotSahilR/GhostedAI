import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { toneEnum } from "./enums.js";
import { users } from "./users.js";

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  profileType: text("profile_type").notNull().default("freelancer"),
  waitDays: integer("wait_days").notNull().default(3),
  maxFollowUps: integer("max_follow_ups").notNull().default(3),
  autoSend: boolean("auto_send").notNull().default(true),
  defaultTone: toneEnum("default_tone").notNull().default("professional"),
  timezone: text("timezone").notNull().default("UTC"),
  workingHoursStart: text("working_hours_start"),
  workingHoursEnd: text("working_hours_end"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  telegramNotifications: boolean("telegram_notifications").notNull().default(true),
  inAppNotifications: boolean("in_app_notifications").notNull().default(true),
  trackCategories: jsonb("track_categories").$type<string[]>().notNull().default([]),
  ignoreCategories: jsonb("ignore_categories").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Settings = typeof settings.$inferSelect;

export type NewSettings = typeof settings.$inferInsert;
