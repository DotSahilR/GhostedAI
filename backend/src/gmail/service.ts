import {
  buildGmailAuthUrl,
  exchangeGmailCode,
  getGmailProfile,
  listGmailThreads,
  getGmailThreadMessages,
  sendGmailMessage,
  didUserSendLastMessage,
} from "./client.js";
import { mapGmailThreadToConversation, mapGmailMessages } from "./mapper.js";
import { AppError } from "../errors/index.js";
import { recordOutboundMessage } from "../integrations/shared.js";
import { logger } from "../config/logger.js";
import { connectedAccountRepository } from "../repositories/connected-account.repository.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import type { ConnectedAccount } from "../schema/index.js";
import { connectedAccountService } from "../services/connected-account.service.js";

const SYNC_MAX_THREADS = 50;

export const gmailService = {
  getAuthUrl(state: string): string {
    return buildGmailAuthUrl(state);
  },

  async connectFromCode(userId: string, code: string): Promise<ConnectedAccount> {
    const tokens = await exchangeGmailCode(code);
    const profile = await getGmailProfile(tokens.accessToken, tokens.refreshToken);
    const data = {
      provider: "gmail" as const,
      accountName: profile.email,
      externalId: profile.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: new Date(tokens.expiryDate),
      status: "connected" as const,
      permissions: ["read", "send"],
      description: profile.email,
    };
    const existing = await connectedAccountRepository.findByProviderExternal(
      userId,
      "gmail",
      profile.userId,
    );
    if (existing) {
      return connectedAccountRepository.update(existing.id, userId, data) as Promise<ConnectedAccount>;
    }
    return connectedAccountRepository.create({ ...data, userId });
  },

  async connectManual(
    userId: string,
    input: { accessToken: string; refreshToken?: string; email?: string },
  ): Promise<ConnectedAccount> {
    const profile = await getGmailProfile(input.accessToken, input.refreshToken);
    const data = {
      provider: "gmail" as const,
      accountName: input.email || profile.email,
      externalId: profile.userId,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken || null,
      tokenExpiresAt: null,
      status: "connected" as const,
      permissions: ["read", "send"],
      description: profile.email,
    };
    const existing = await connectedAccountRepository.findByProviderExternal(
      userId,
      "gmail",
      profile.userId,
    );
    if (existing) {
      return connectedAccountRepository.update(existing.id, userId, data) as Promise<ConnectedAccount>;
    }
    return connectedAccountRepository.create({ ...data, userId });
  },

  async sync(
    accountId: string,
    userId: string,
    options: { newerThanDays?: number } = {},
  ): Promise<{ account: string; conversations: number; messages: number }> {
    const days = options.newerThanDays ?? 90;
    const account = await assertConnectedGmail(accountId, userId);
    const threads = await listGmailThreads(
      account.accessToken!,
      account.refreshToken || undefined,
      SYNC_MAX_THREADS,
      `newer_than:${days}d`,
      account.accountName,
    );
    let conversations = 0;
    let syncedMessages = 0;
    for (const thread of threads) {
      const userSentLast = await didUserSendLastMessage(
        thread.id,
        account.accessToken!,
        account.refreshToken || undefined,
        account.accountName,
      );
      const conversationData = mapGmailThreadToConversation(thread, account.accountName);
      const existing = await conversationRepository.findByExternalThreadId(thread.id, userId);
      let conversationId: string;
      if (existing) {
        conversationId = existing.id;
        const newStatus = userSentLast ? "waiting" : "completed";
        const updateData: Record<string, unknown> = {
          ...conversationData,
          accountId,
        };
        const currentStatus = existing.status;
        if (currentStatus === "waiting" || currentStatus === "completed") {
          updateData.status = newStatus;
        }
        await conversationRepository.update(existing.id, userId, updateData);
      } else {
        const created = await conversationRepository.create({
          ...conversationData,
          userId,
          accountId,
          status: userSentLast ? "waiting" : "completed",
        });
        conversationId = created.id;
        conversations += 1;
      }
      const messages = await getGmailThreadMessages(
        thread.id,
        account.accessToken!,
        account.refreshToken || undefined,
      );
      for (const row of mapGmailMessages(
        messages,
        account.id,
        account.accountName || "",
        conversationId,
      )) {
        const duplicate = await messageRepository.findByExternalMessageId(row.externalMessageId);
        if (duplicate) continue;
        await messageRepository.create(row);
        syncedMessages += 1;
      }
    }
    await connectedAccountRepository.update(account.id, userId, {
      status: "connected",
      lastSyncedAt: new Date(),
    });
    return { account: account.externalId ?? "", conversations, messages: syncedMessages };
  },

  async send(
    userId: string,
    input: {
      accountId: string;
      to: string;
      subject: string;
      body: string;
      conversationId?: string;
    },
  ): Promise<{ messageId: string; to: string; conversationId: string | null }> {
    const account = await assertConnectedGmail(input.accountId, userId);
    const sent = await sendGmailMessage(
      account.accessToken!,
      account.refreshToken || undefined,
      {
        to: input.to,
        subject: input.subject,
        body: input.body,
      },
    );
    let recordedConversationId: string | null = null;
    if (input.conversationId) {
      await recordOutboundMessage({
        userId,
        accountId: account.id,
        conversationId: input.conversationId,
        body: input.body,
        externalMessageId: sent.id,
      });
      recordedConversationId = input.conversationId;
    }
    return { messageId: sent.id, to: input.to, conversationId: recordedConversationId };
  },

  async syncAllConnected(): Promise<Array<{ userId: string; accountId: string; ok: boolean }>> {
    const accounts = await connectedAccountRepository.listAllByProvider("gmail");
    const results: Array<{ userId: string; accountId: string; ok: boolean }> = [];
    for (const account of accounts) {
      if (account.status !== "connected") continue;
      try {
        await gmailService.sync(account.id, account.userId);
        results.push({ userId: account.userId, accountId: account.id, ok: true });
      } catch (error) {
        logger.warn(
          `[gmail] sync failed for ${account.externalId ?? account.accountName}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
        results.push({ userId: account.userId, accountId: account.id, ok: false });
      }
    }
    return results;
  },

  async disconnect(accountId: string, userId: string): Promise<ConnectedAccount> {
    const account = await connectedAccountService.get(userId, accountId);
    if (account.provider !== "gmail") {
      throw new AppError("Account is not a Gmail account", 400);
    }
    const updated = await connectedAccountRepository.update(accountId, userId, {
      status: "disconnected",
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      lastSyncedAt: null,
    });
    if (!updated) {
      throw new AppError("Connected account not found", 404);
    }
    return updated;
  },
};

async function assertConnectedGmail(
  accountId: string,
  userId: string,
): Promise<ConnectedAccount> {
  const account = await connectedAccountService.get(userId, accountId);
  if (account.provider !== "gmail") {
    throw new AppError("Account is not a Gmail account", 400);
  }
  if (account.status !== "connected" || !account.accessToken) {
    throw new AppError("Gmail account is not connected", 400);
  }
  return account;
}
