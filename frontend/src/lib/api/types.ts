export type ApiProvider = "gmail" | "caspian";

export type ApiAccountStatus = "connected" | "disconnected" | "error";

export type ApiConversationStatus = "waiting" | "needs_followup" | "completed" | "paused" | "archived";

export type ApiPriority = "high" | "medium" | "low";

export type ApiTone = "professional" | "friendly" | "formal";

export type ApiMessageDirection = "inbound" | "outbound";

export type ApiDraftStatus = "draft" | "approved" | "scheduled" | "sent" | "discarded";

export type ApiNotificationType =
  | "info"
  | "sent"
  | "reply"
  | "completed"
  | "paused"
  | "connection"
  | "summary";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: "local" | "google";
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface ApiConnectedAccount {
  id: string;
  provider: ApiProvider;
  accountName: string;
  externalId: string | null;
  accessToken: string | null;
  status: ApiAccountStatus;
  permissions: string[];
  description: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiConversation {
  id: string;
  accountId: string | null;
  externalThreadId: string | null;
  name: string;
  handle: string;
  company: string | null;
  avatarUrl: string | null;
  subject: string;
  category: string | null;
  platform: ApiProvider | null;
  status: ApiConversationStatus;
  priority: ApiPriority;
  daysWaiting: number;
  lastMessage: string | null;
  lastMessageDirection: "inbound" | "outbound" | null;
  nextAction: string | null;
  confidence: number;
  followUpsSent: number;
  value: string | null;
  lastMessageAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  accountId: string | null;
  direction: ApiMessageDirection;
  body: string;
  externalMessageId: string | null;
  sentAt: string;
  createdAt: string;
}

export interface ApiFollowupDraft {
  id: string;
  conversationId: string;
  tone: ApiTone;
  subject: string;
  body: string;
  status: ApiDraftStatus;
  variant: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFollowupHistory {
  id: string;
  conversationId: string;
  action: string;
  title: string;
  body: string | null;
  draftId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiSettings {
  id: string;
  userId: string;
  profileType: string;
  waitDays: number;
  maxFollowUps: number;
  autoSend: boolean;
  defaultTone: ApiTone;
  timezone: string;
  workingHoursStart: string | null;
  workingHoursEnd: string | null;
  emailNotifications: boolean;
  telegramNotifications: boolean;
  inAppNotifications: boolean;
  trackCategories: string[];
  ignoreCategories: string[];
}

export interface ApiTrackingRule {
  id: string;
  name: string;
  event: "no_reply";
  waitMinutes: number;
  maxFollowUps: number;
  tone: ApiTone;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotification {
  id: string;
  type: ApiNotificationType;
  title: string;
  detail: string | null;
  channel: "in_app" | "email";
  isRead: boolean;
  readAt: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiActivityLog {
  id: string;
  action: string;
  title: string | null;
  detail: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiAnalysis {
  conversationType: string;
  priority: ApiPriority;
  status: string;
  confidence: number;
  recommendedWait: string;
  reasoning: string;
  tone: "Professional" | "Friendly" | "Formal";
  urgency: "High" | "Medium" | "Low";
}

export interface ApiAutomationStatus {
  enabled: boolean;
  prepare: string;
  send: string;
}

export interface ApiAutomationRunResult {
  phase: string;
  result: {
    completed: number;
    started: number;
    generated: number;
    archived: number;
    active: number;
    sent: number;
    skipped: number;
    failed: number;
  };
}

export interface ApiConfigStatus {
  database: { configured: boolean; connected: boolean };
  auth: { google: boolean };
  gmail: { configured: boolean; callbackUrl: string };
  caspian: { configured: boolean; baseUrl: string };
  ai: { configured: string; active: string };
  scheduler: { enabled: boolean; prepare: string; send: string };
}

export interface ApiAnalyticsSummary {
  kpis: {
    tracked: number;
    sent: number;
    replies: number;
    responseRate: number;
    avgResponseHours: number;
    conversionRate: number;
    opportunityValue: number;
  };
  series: {
    weekly: Array<{ date: string; sent: number; replies: number }>;
    monthly: Array<{ month: string; sent: number; replies: number }>;
  };
  platforms: Array<{ platform: string; count: number }>;
  priorities: Array<{ priority: string; count: number }>;
  funnel: {
    waiting: number;
    needsFollowup: number;
    completed: number;
    paused: number;
    archived: number;
  };
  insights: Array<{ title: string; detail: string }>;
  windowDays: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
