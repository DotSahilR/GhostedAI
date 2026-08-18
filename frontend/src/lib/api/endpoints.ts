import { apiRequest } from "./client";
import type {
  ApiActivityLog,
  ApiAnalysis,
  ApiAutomationRunResult,
  ApiAutomationStatus,
  ApiAnalyticsSummary,
  ApiConfigStatus,
  ApiConnectedAccount,
  ApiConversation,
  ApiFollowupDraft,
  ApiFollowupHistory,
  ApiMessage,
  ApiNotification,
  ApiSettings,
  ApiTrackingRule,
  ApiUser,
  Paginated,
} from "./types";

export interface ApiPage {
  page?: number;
  pageSize?: number;
}

export const authApi = {
  login: (input: { email: string; password: string }) =>
    apiRequest<{ user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  register: (input: { name: string; email: string; password: string }) =>
    apiRequest<{ user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () =>
    apiRequest<Record<string, never>>("/auth/logout", { method: "POST" }),
  profile: () => apiRequest<{ user: ApiUser }>("/auth/profile"),
};

export const conversationApi = {
  list: (params: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.priority) query.set("priority", params.priority);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    query.set("pageSize", String(Math.min(params.pageSize ?? 100, 100)));
    return apiRequest<Paginated<ApiConversation>>(`/conversations?${query.toString()}`);
  },
  get: (id: string) => apiRequest<{ conversation: ApiConversation }>(`/conversations/${id}`),
  update: (id: string, data: Partial<ApiConversation>) =>
    apiRequest<{ conversation: ApiConversation }>(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    apiRequest<Record<string, never>>(`/conversations/${id}`, { method: "DELETE" }),
  messages: (id: string) =>
    apiRequest<{ messages: ApiMessage[] }>(`/conversations/${id}/messages`),
  analysis: (id: string) =>
    apiRequest<{ analysis: ApiAnalysis }>(`/conversations/${id}/analysis`),
};

export const draftApi = {
  listByConversation: (conversationId: string) =>
    apiRequest<{ drafts: ApiFollowupDraft[] }>(
      `/conversations/${conversationId}/drafts`,
    ),
  generate: (conversationId: string, input: { tone?: string; variant?: number } = {}) =>
    apiRequest<{ draft: ApiFollowupDraft }>(
      `/conversations/${conversationId}/drafts/generate`,
      { method: "POST", body: JSON.stringify(input) },
    ),
  regenerate: (draftId: string, input: { tone?: string; variant?: number } = {}) =>
    apiRequest<{ draft: ApiFollowupDraft }>(`/drafts/${draftId}/regenerate`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (draftId: string, data: Partial<ApiFollowupDraft>) =>
    apiRequest<{ draft: ApiFollowupDraft }>(`/drafts/${draftId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const historyApi = {
  listByConversation: (conversationId: string, page: ApiPage = {}) => {
    const query = new URLSearchParams();
    if (page.page) query.set("page", String(page.page));
    query.set("pageSize", String(page.pageSize ?? 100));
    return apiRequest<Paginated<ApiFollowupHistory>>(
      `/conversations/${conversationId}/followups?${query.toString()}`,
    );
  },
};

export const settingsApi = {
  get: () => apiRequest<{ settings: ApiSettings }>("/settings"),
  update: (data: Partial<ApiSettings>) =>
    apiRequest<{ settings: ApiSettings }>("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const trackingRuleApi = {
  list: () => apiRequest<{ rules: ApiTrackingRule[] }>("/tracking-rules"),
  create: (data: Partial<ApiTrackingRule>) =>
    apiRequest<{ rule: ApiTrackingRule }>("/tracking-rules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ApiTrackingRule>) =>
    apiRequest<{ rule: ApiTrackingRule }>(`/tracking-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    apiRequest<Record<string, never>>(`/tracking-rules/${id}`, { method: "DELETE" }),
};

export const accountApi = {
  list: () => apiRequest<{ accounts: ApiConnectedAccount[] }>("/accounts"),
  remove: (id: string) =>
    apiRequest<Record<string, never>>(`/accounts/${id}`, { method: "DELETE" }),
  gmailStatus: () =>
    apiRequest<{ status: { configured: boolean; callbackUrl: string } }>("/gmail/status"),
  gmailAuthUrl: () =>
    apiRequest<{ url: string }>("/gmail/auth-url"),
  gmailSync: (accountId: string, newerThanDays?: number) =>
    apiRequest<Record<string, unknown>>("/gmail/sync", {
      method: "POST",
      body: JSON.stringify({ accountId, newerThanDays }),
    }),
  gmailDisconnect: (accountId: string) =>
    apiRequest<{ account: ApiConnectedAccount }>("/gmail/disconnect", {
      method: "POST",
      body: JSON.stringify({ accountId }),
    }),
  caspianStatus: () =>
    apiRequest<{ status: { configured: boolean; baseUrl: string } }>("/caspian/status"),
  caspianConnect: (input: { apiKey?: string; accountName?: string }) =>
    apiRequest<{ account: ApiConnectedAccount }>("/caspian/connect", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  caspianSync: (accountId: string) =>
    apiRequest<Record<string, unknown>>("/caspian/sync", {
      method: "POST",
      body: JSON.stringify({ accountId }),
    }),
  caspianDisconnect: (accountId: string) =>
    apiRequest<{ account: ApiConnectedAccount }>("/caspian/disconnect", {
      method: "POST",
      body: JSON.stringify({ accountId }),
    }),
};

export const notificationApi = {
  list: (page: ApiPage = {}) => {
    const query = new URLSearchParams();
    if (page.page) query.set("page", String(page.page));
    query.set("pageSize", String(page.pageSize ?? 50));
    return apiRequest<Paginated<ApiNotification>>(`/notifications?${query.toString()}`);
  },
  unreadCount: () => apiRequest<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) =>
    apiRequest<{ notification: ApiNotification }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    apiRequest<Record<string, never>>("/notifications/read-all", { method: "PATCH" }),
};

export const activityApi = {
  list: (page: ApiPage = {}) => {
    const query = new URLSearchParams();
    if (page.page) query.set("page", String(page.page));
    query.set("pageSize", String(page.pageSize ?? 30));
    return apiRequest<Paginated<ApiActivityLog>>(`/activity-logs?${query.toString()}`);
  },
};

export const automationApi = {
  status: () => apiRequest<ApiAutomationStatus>("/automation/status"),
  run: (phase: "prepare" | "send" | "all" = "all") =>
    apiRequest<ApiAutomationRunResult>("/automation/run", {
      method: "POST",
      body: JSON.stringify({ phase }),
    }),
};

export const configApi = {
  status: () => apiRequest<ApiConfigStatus>("/config/status"),
};

export const analyticsApi = {
  summary: (days: number = 30) =>
    apiRequest<ApiAnalyticsSummary>(`/analytics/summary?days=${days}`),
};
