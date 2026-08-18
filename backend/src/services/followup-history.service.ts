import { followupHistoryRepository } from "../repositories/followup-history.repository.js";
import type { PaginationInput } from "../utils/pagination.js";
import { toPaginated } from "../utils/pagination.js";
import { conversationService } from "./conversation.service.js";

export const followupHistoryService = {
  async listByConversation(userId: string, conversationId: string) {
    await conversationService.getOwned(conversationId, userId);
    return followupHistoryRepository.listByConversation(conversationId, userId);
  },

  async listByUser(userId: string, pagination: PaginationInput) {
    const { items, total } = await followupHistoryRepository.listByUser(userId, pagination);
    return toPaginated(items, total, pagination);
  },
};
