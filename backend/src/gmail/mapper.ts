import type { GmailThread, GmailMessage } from "./types.js";
import { cleanEmailText } from "./email-cleaner.js";

export interface ConversationData {
  externalThreadId: string;
  name: string;
  handle: string;
  company: string;
  subject: string;
  platform: "gmail";
  status: "waiting";
  priority: "medium";
  daysWaiting: number;
  confidence: number;
  followUpsSent: number;
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

function extractNameFromEmail(from: string): string {
  if (!from) return "Unknown";
  const match = from.match(/^"?([^"<]+)"?\s*</);
  if (match && match[1]) return match[1].trim();
  const parts = from.split("@");
  return parts[0] || "Unknown";
}

function extractDomainFromEmail(email: string): string {
  if (!email) return "";
  const match = email.match(/@([^>]+)/);
  if (match && match[1]) return match[1];
  return "";
}

export function mapGmailThreadToConversation(thread: GmailThread, userEmail?: string): ConversationData {
  const lowerEmail = userEmail?.toLowerCase() || "";
  const lastFrom = thread.from.toLowerCase();
  const isReceived = lowerEmail && !lastFrom.includes(lowerEmail);

  const contactEmail = isReceived
    ? (thread.from || thread.to)
    : (thread.to || thread.from);

  const name = extractNameFromEmail(contactEmail);
  const domain = extractDomainFromEmail(contactEmail);
  const lastMessageAt = thread.date ? new Date(thread.date) : null;
  const daysWaiting = lastMessageAt
    ? Math.floor((Date.now() - lastMessageAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    externalThreadId: thread.id,
    name: name || "Unknown",
    handle: contactEmail || "",
    company: domain,
    subject: thread.subject || "(no subject)",
    platform: "gmail",
    status: "waiting",
    priority: "medium",
    daysWaiting,
    confidence: 0,
    followUpsSent: 0,
    lastMessage: cleanEmailText(thread.snippet || ""),
    lastMessageAt,
  };
}

export function mapGmailMessages(
  messages: GmailMessage[],
  accountId: string,
  userEmail: string,
  conversationId: string,
): MessageData[] {
  const lowerEmail = userEmail.toLowerCase();
  return messages.map((message) => ({
    conversationId,
    accountId,
    direction: message.from.toLowerCase().includes(lowerEmail) ? "outbound" : "inbound",
    body: cleanEmailText(message.body || ""),
    externalMessageId: message.id,
    sentAt: message.date ? new Date(message.date) : new Date(),
  }));
}
