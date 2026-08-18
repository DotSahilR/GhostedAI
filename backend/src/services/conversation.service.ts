import { AppError } from "../errors/index.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import type { NewConversation } from "../schema/index.js";
import type { PaginationInput } from "../utils/pagination.js";
import { toPaginated } from "../utils/pagination.js";

export interface ConversationListParams {
  status?: string;
  priority?: string;
  accountId?: string;
  search?: string;
}

export const conversationService = {
  async create(userId: string, data: NewConversation) {
    return conversationRepository.create({ ...data, userId });
  },

  async list(userId: string, filters: ConversationListParams, pagination: PaginationInput) {
    const { items, total } = await conversationRepository.list({
      ...filters,
      userId,
      pagination,
    });
    const directions = await messageRepository.findLastDirections(
      items.map((c) => c.id),
    );
    const enriched = items.map((c) => ({
      ...c,
      lastMessageDirection: directions.get(c.id) ?? null,
    }));
    return toPaginated(enriched, total, pagination);
  },

  async get(userId: string, id: string) {
    const conversation = await conversationRepository.findById(id, userId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }
    return conversation;
  },

  async update(userId: string, id: string, data: Partial<NewConversation>) {
    const conversation = await conversationRepository.update(id, userId, data);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }
    return conversation;
  },

  async remove(userId: string, id: string) {
    const deleted = await conversationRepository.remove(id, userId);
    if (!deleted) {
      throw new AppError("Conversation not found", 404);
    }
  },

  async getOwned(id: string, userId: string) {
    const conversation = await conversationRepository.findById(id, userId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }
    return conversation;
  },

  async listMessages(userId: string, conversationId: string) {
    await conversationService.getOwned(conversationId, userId);
    return messageRepository.listByConversation(conversationId);
  },

  async addMessage(
    userId: string,
    conversationId: string,
    data: { direction: "inbound" | "outbound"; body: string },
  ) {
    const conversation = await conversationService.getOwned(conversationId, userId);
    const message = await messageRepository.create({
      conversationId,
      accountId: conversation.accountId ?? null,
      direction: data.direction,
      body: data.body,
    });
    await conversationRepository.update(conversationId, userId, {
      lastMessage: data.body.slice(0, 200),
      lastMessageAt: new Date(),
    });
    return message;
  },
};
