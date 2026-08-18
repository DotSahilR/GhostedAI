import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";

export async function recordInboundMessage(input: {
  userId: string;
  accountId: string | null;
  conversationId: string;
  body: string;
  externalMessageId: string;
  receivedAt?: Date;
}): Promise<void> {
  await messageRepository.create({
    conversationId: input.conversationId,
    accountId: input.accountId,
    direction: "inbound",
    body: input.body,
    externalMessageId: input.externalMessageId,
    sentAt: input.receivedAt ?? new Date(),
  });
  await conversationRepository.update(input.conversationId, input.userId, {
    lastMessage: input.body.slice(0, 200),
    lastMessageAt: new Date(),
  });
}

export async function recordOutboundMessage(input: {
  userId: string;
  accountId: string;
  conversationId: string;
  body: string;
  externalMessageId: string;
  sentAt?: Date;
}): Promise<void> {
  await messageRepository.create({
    conversationId: input.conversationId,
    accountId: input.accountId,
    direction: "outbound",
    body: input.body,
    externalMessageId: input.externalMessageId,
    sentAt: input.sentAt ?? new Date(),
  });
  await conversationRepository.update(input.conversationId, input.userId, {
    lastMessage: input.body.slice(0, 200),
    lastMessageAt: new Date(),
  });
}
