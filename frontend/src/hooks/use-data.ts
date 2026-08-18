"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toAccount, toActivity, toConversation, toNotification } from "@/lib/api/adapters";
import {
  accountApi,
  activityApi,
  analyticsApi,
  authApi,
  automationApi,
  configApi,
  conversationApi,
  draftApi,
  historyApi,
  notificationApi,
  settingsApi,
  trackingRuleApi,
} from "@/lib/api/endpoints";
import type { ApiConversation, ApiSettings, ApiTrackingRule } from "@/lib/api/types";
import type { Conversation } from "@/lib/mock-data";

export const queryKeys = {
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversation", id] as const,
  settings: ["settings"] as const,
  rules: ["tracking-rules"] as const,
  accounts: ["accounts"] as const,
  notifications: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  activity: ["activity"] as const,
  automation: ["automation"] as const,
  config: ["config"] as const,
  analytics: ["analytics"] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      const result = await conversationApi.list({ pageSize: 100 });
      return result.items.map((item) => toConversation(item));
    },
  });
}

export function useConversationDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.conversation(id),
    enabled: Boolean(id),
    queryFn: async (): Promise<Conversation> => {
      const [detail, messages, drafts, history, analysis] = await Promise.all([
        conversationApi.get(id),
        conversationApi.messages(id),
        draftApi.listByConversation(id),
        historyApi.listByConversation(id),
        conversationApi.analysis(id),
      ]);
      return toConversation(detail.conversation, {
        messages: messages.messages,
        drafts: drafts.drafts,
        history: history.items,
        analysis: analysis.analysis,
      });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      const { settings } = await settingsApi.get();
      return settings;
    },
  });
}

export function useTrackingRules() {
  return useQuery({
    queryKey: queryKeys.rules,
    queryFn: async () => {
      const { rules } = await trackingRuleApi.list();
      return rules;
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => {
      const { accounts } = await accountApi.list();
      return accounts.map(toAccount);
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const result = await notificationApi.list();
      return result.items.map(toNotification);
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.unread,
    queryFn: async () => {
      const { count } = await notificationApi.unreadCount();
      return count;
    },
  });
}

export function useActivityLog() {
  return useQuery({
    queryKey: queryKeys.activity,
    queryFn: async () => {
      const result = await activityApi.list();
      return result.items.map(toActivity);
    },
  });
}

export function useAutomationStatus() {
  return useQuery({
    queryKey: queryKeys.automation,
    queryFn: () => automationApi.status(),
  });
}

export function useConfigStatus() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: async () => {
      const result = await configApi.status();
      return result;
    },
  });
}

export function useAnalytics(days: number = 30) {
  return useQuery({
    queryKey: [...queryKeys.analytics, days] as const,
    queryFn: () => analyticsApi.summary(days),
    staleTime: 30_000,
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiConversation> }) =>
      conversationApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useGenerateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, tone }: { conversationId: string; tone?: string }) =>
      draftApi.generate(conversationId, tone ? { tone } : {}),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversation(variables.conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useRegenerateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, tone }: { draftId: string; tone?: string }) =>
      draftApi.regenerate(draftId, tone ? { tone } : {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useApproveDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => draftApi.update(draftId, { status: "approved" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      draftId,
      subject,
      body,
    }: {
      draftId: string;
      subject: string;
      body: string;
    }) => draftApi.update(draftId, { subject, body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSendDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ draftId }: { draftId: string; conversationId: string }) => {
      await draftApi.update(draftId, { status: "approved" });
      const run = await automationApi.run("send");
      return run;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversation(variables.conversationId) });
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ApiSettings>) => settingsApi.update(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

export function useCreateTrackingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ApiTrackingRule>) => trackingRuleApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rules });
    },
  });
}

export function useUpdateTrackingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiTrackingRule> }) =>
      trackingRuleApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rules });
    },
  });
}

export function useDeleteTrackingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trackingRuleApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rules });
    },
  });
}

export function useSyncAccount(provider: "gmail" | "caspian") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, newerThanDays }: { accountId: string; newerThanDays?: number }) => {
      if (provider === "gmail") return accountApi.gmailSync(accountId, newerThanDays);
      return accountApi.caspianSync(accountId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useDisconnectAccount(provider: "gmail" | "caspian") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => {
      if (provider === "gmail") return accountApi.gmailDisconnect(accountId);
      return accountApi.caspianDisconnect(accountId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useConnectAccount(provider: "caspian") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { apiKey?: string; accountName?: string }) =>
      accountApi.caspianConnect(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useGmailAuthUrl() {
  return useQuery({
    queryKey: ["gmail-auth-url"] as const,
    queryFn: async () => {
      const result = await accountApi.gmailAuthUrl();
      return result.url;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unread });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unread });
    },
  });
}

export function useRunAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phase: "prepare" | "send" | "all" = "all") => automationApi.run(phase),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unread });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      void queryClient.clear();
    },
  });
}
