import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { accountProviderEnum, accountStatusEnum } from "./enums.js";
import { users } from "./users.js";

export const connectedAccounts = pgTable(
  "connected_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: accountProviderEnum("provider").notNull(),
    accountName: text("account_name").notNull(),
    externalId: text("external_id"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    status: accountStatusEnum("status").notNull().default("disconnected"),
    permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
    description: text("description"),
    watchTopic: text("watch_topic"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [table.userId],
);

export type ConnectedAccount = typeof connectedAccounts.$inferSelect;

export type NewConnectedAccount = typeof connectedAccounts.$inferInsert;
