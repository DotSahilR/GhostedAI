import {
  caspianListChannels,
  caspianListConnections,
  caspianListConversations,
  caspianListConversationMessages,
  caspianSendMessage,
} from "./client.js";
import { mapCaspianConversationToConversation, mapCaspianMessages } from "./mapper.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/index.js";
import { recordOutboundMessage } from "../integrations/shared.js";
import { logger } from "../config/logger.js";
import { connectedAccountRepository } from "../repositories/connected-account.repository.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import type { ConnectedAccount } from "../schema/index.js";
import { connectedAccountService } from "../services/connected-account.service.js";

const SYNC_MAX_CONVERSATIONS = 50;

export const caspianService = {
  status(): { configured: boolean; baseUrl: string } {
    return {
      configured: Boolean(env.CASPIAN_BASE_URL && env.CASPIAN_API_KEY),
      baseUrl: env.CASPIAN_BASE_URL,
    };
  },

  async connect(
    userId: string,
    input: { apiKey?: string; accountName?: string },
  ): Promise<ConnectedAccount> {
    const apiKey = input.apiKey || env.CASPIAN_API_KEY;
    if (!apiKey) {
      throw new AppError("Caspian API key is required", 400);
    }
    const channels = await caspianListChannels(apiKey);
    const connections = await caspianListConnections(apiKey);
    const accountName = input.accountName || connections[0]?.address || "Caspian Account";
    const externalId = connections[0]?.id || channels[0]?.id || "default";
    const data = {
      provider: "caspian" as const,
      accountName,
      externalId,
      accessToken: apiKey,
      refreshToken: null,
      tokenExpiresAt: null,
      status: "connected" as const,
      permissions: ["read", "send"],
      description: `${channels.length} channel(s), ${connections.length} connection(s)`,
    };
    const existing = await connectedAccountRepository.findByProviderExternal(
      userId,
      "caspian",
      externalId,
    );
    if (existing) {
      return connectedAccountRepository.update(
        existing.id,
        userId,
        data,
      ) as Promise<ConnectedAccount>;
    }
    return connectedAccountRepository.create({ ...data, userId });
  },

  async sync(
    accountId: string,
    userId: string,
  ): Promise<{ account: string; conversations: number; messages: number }> {
    const account = await assertConnectedCaspian(accountId, userId);
    const apiKey = account.accessToken!;
    const caspianConversations = await caspianListConversations(apiKey);
    let conversations = 0;
    let syncedMessages = 0;
    for (const conv of caspianConversations.slice(0, SYNC_MAX_CONVERSATIONS)) {
      const conversationData = mapCaspianConversationToConversation(conv);
      const existing = await conversationRepository.findByExternalThreadId(
        conv.id,
        userId,
      );
      let conversationId: string;
      if (existing) {
        conversationId = existing.id;
        await conversationRepository.update(existing.id, userId, {
          ...conversationData,
          accountId,
        });
      } else {
        const created = await conversationRepository.create({
          ...conversationData,
          userId,
          accountId,
        });
        conversationId = created.id;
        conversations += 1;
      }
      const messages = await caspianListConversationMessages(apiKey, conv.id);
      for (const row of mapCaspianMessages(
        messages,
        account.id,
        account.externalId ?? "",
        conversationId,
      )) {
        const duplicate = await messageRepository.findByExternalMessageId(
          row.externalMessageId,
        );
        if (duplicate) {
          continue;
        }
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
    const account = await assertConnectedCaspian(input.accountId, userId);
    if (!input.conversationId) {
      throw new AppError("conversationId is required to send via Caspian", 400);
    }
    const sent = await caspianSendMessage(account.accessToken!, input.conversationId, {
      text: input.body,
    });
    await recordOutboundMessage({
      userId,
      accountId: account.id,
      conversationId: input.conversationId,
      body: input.body,
      externalMessageId: sent.id,
    });
    return { messageId: sent.id, to: input.to, conversationId: input.conversationId };
  },

  async syncAllConnected(): Promise<Array<{ userId: string; accountId: string; ok: boolean }>> {
    const accounts = await connectedAccountRepository.listAllByProvider("caspian");
    const results: Array<{ userId: string; accountId: string; ok: boolean }> = [];
    for (const account of accounts) {
      if (account.status !== "connected") {
        continue;
      }
      try {
        await caspianService.sync(account.id, account.userId);
        results.push({ userId: account.userId, accountId: account.id, ok: true });
      } catch (error) {
        logger.warn(
          `[caspian] sync failed for ${account.externalId ?? account.accountName}: ${
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
    if (account.provider !== "caspian") {
      throw new AppError("Account is not a Caspian account", 400);
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

async function assertConnectedCaspian(
  accountId: string,
  userId: string,
): Promise<ConnectedAccount> {
  const account = await connectedAccountService.get(userId, accountId);
  if (account.provider !== "caspian") {
    throw new AppError("Account is not a Caspian account", 400);
  }
  if (account.status !== "connected" || !account.accessToken) {
    throw new AppError("Caspian account is not connected", 400);
  }
  return account;
}
