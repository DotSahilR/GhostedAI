import { caspianService } from "../../caspian/service.js";
import type { CommunicationProvider, SendInput, SendResult, SyncResult, SyncAllResult } from "../types.js";

export const caspianProvider: CommunicationProvider = {
  name: "caspian",

  async send(input: SendInput): Promise<SendResult> {
    const result = await caspianService.send(input.userId, {
      accountId: input.accountId,
      to: input.to,
      subject: input.subject,
      body: input.body,
      conversationId: input.conversationId,
    });
    return { provider: "caspian", messageId: result.messageId };
  },

  async sync(accountId: string, userId: string): Promise<SyncResult> {
    return caspianService.sync(accountId, userId);
  },

  async syncAllConnected(): Promise<SyncAllResult[]> {
    return caspianService.syncAllConnected();
  },
};
