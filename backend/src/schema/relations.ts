import { relations } from "drizzle-orm";
import { activityLogs } from "./activity-logs.js";
import { connectedAccounts } from "./connected-accounts.js";
import { conversations } from "./conversations.js";
import { followupDrafts } from "./followup-drafts.js";
import { followupHistory } from "./followup-history.js";
import { messages } from "./messages.js";
import { notifications } from "./notifications.js";
import { refreshTokens } from "./refresh-tokens.js";
import { settings } from "./settings.js";
import { trackingRules } from "./tracking-rules.js";
import { users } from "./users.js";

export const usersRelations = relations(users, ({ many, one }) => ({
  refreshTokens: many(refreshTokens),
  connectedAccounts: many(connectedAccounts),
  conversations: many(conversations),
  trackingRules: many(trackingRules),
  followupDrafts: many(followupDrafts),
  followupHistory: many(followupHistory),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
  settings: one(settings),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const connectedAccountsRelations = relations(connectedAccounts, ({ many, one }) => ({
  user: one(users, {
    fields: [connectedAccounts.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
  messages: many(messages),
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  account: one(connectedAccounts, {
    fields: [conversations.accountId],
    references: [connectedAccounts.id],
  }),
  messages: many(messages),
  drafts: many(followupDrafts),
  history: many(followupHistory),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  account: one(connectedAccounts, {
    fields: [messages.accountId],
    references: [connectedAccounts.id],
  }),
}));

export const trackingRulesRelations = relations(trackingRules, ({ one }) => ({
  user: one(users, {
    fields: [trackingRules.userId],
    references: [users.id],
  }),
}));

export const followupDraftsRelations = relations(followupDrafts, ({ many, one }) => ({
  conversation: one(conversations, {
    fields: [followupDrafts.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [followupDrafts.userId],
    references: [users.id],
  }),
  history: many(followupHistory),
}));

export const followupHistoryRelations = relations(followupHistory, ({ one }) => ({
  conversation: one(conversations, {
    fields: [followupHistory.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [followupHistory.userId],
    references: [users.id],
  }),
  draft: one(followupDrafts, {
    fields: [followupHistory.draftId],
    references: [followupDrafts.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}));
