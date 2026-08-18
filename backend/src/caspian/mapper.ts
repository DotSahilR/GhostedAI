import type { CaspianConversation, CaspianMessage } from "./types.js";

export interface ConversationData {
  externalThreadId: string;
  name: string;
  handle: string;
  company: string;
  subject: string;
  platform: "caspian";
  lastMessage: string | null;
  lastMessageAt: Date | null;
}

export interface MessageData {
  conversationId: string;
  accountId: string;
  direction: "inbound" | "outbound";
  body: string;
  externalMessageId: string;
  sentAt: Date;
}

export function mapCaspianConversationToConversation(
  conversation: CaspianConversation,
): ConversationData {
  const subject = conversation.subject || "(no subject)";
  return {
    externalThreadId: conversation.id,
    name: subject,
    handle: conversation.connection_id,
    company: "",
    subject,
    platform: "caspian",
    lastMessage: null,
    lastMessageAt: conversation.created_at ? new Date(conversation.created_at) : null,
  };
}

export function mapCaspianMessages(
  messages: CaspianMessage[],
  accountId: string,
  accountExternalId: string,
  conversationId: string,
): MessageData[] {
  return messages.map((message) => ({
    conversationId,
    accountId,
    direction: message.sender?.address === accountExternalId ? "outbound" : "inbound",
    body: message.text || message.html || "",
    externalMessageId: message.id,
    sentAt: message.created_at ? new Date(message.created_at) : new Date(),
  }));
}
