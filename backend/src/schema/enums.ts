import { pgEnum } from "drizzle-orm/pg-core";

export const userProviderEnum = pgEnum("provider", ["local", "google"]);

export const accountProviderEnum = pgEnum("account_provider", ["gmail", "caspian"]);

export const accountStatusEnum = pgEnum("account_status", ["connected", "disconnected", "error"]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "waiting",
  "needs_followup",
  "completed",
  "paused",
  "archived",
]);

export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

export const toneEnum = pgEnum("tone", ["professional", "friendly", "formal"]);

export const messageDirectionEnum = pgEnum("message_direction", ["inbound", "outbound"]);

export const trackingRuleEventEnum = pgEnum("tracking_rule_event", ["no_reply"]);

export const draftStatusEnum = pgEnum("draft_status", [
  "draft",
  "approved",
  "scheduled",
  "sent",
  "discarded",
  "failed",
]);

export const followupActionEnum = pgEnum("followup_action", [
  "tracking_started",
  "draft_generated",
  "draft_approved",
  "followup_sent",
  "reply_received",
  "status_changed",
  "paused",
  "resumed",
  "completed",
  "archived",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "sent",
  "reply",
  "completed",
  "paused",
  "connection",
  "summary",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
]);
