import { gmailService } from "../../gmail/service.js";
import type { CommunicationProvider, SendInput, SendResult, SyncResult, SyncAllResult } from "../types.js";

export const gmailProvider: CommunicationProvider = {
  name: "gmail",

  async send(input: SendInput): Promise<SendResult> {
    const result = await gmailService.send(input.userId, {
      accountId: input.accountId,
      to: input.to,
      subject: input.subject,
      body: input.body,
      conversationId: input.conversationId,
    });
    return { provider: "gmail", messageId: result.messageId };
  },

  async sync(accountId: string, userId: string): Promise<SyncResult> {
    return gmailService.sync(accountId, userId);
  },

  async syncAllConnected(): Promise<SyncAllResult[]> {
    return gmailService.syncAllConnected();
  },
};
