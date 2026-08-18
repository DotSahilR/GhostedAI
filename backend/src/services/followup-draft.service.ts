import { AppError } from "../errors/index.js";
import { aiService } from "./ai.service.js";
import { conversationService } from "./conversation.service.js";
import { followupDraftRepository } from "../repositories/followup-draft.repository.js";
import type { NewFollowupDraft } from "../schema/index.js";
import type { DraftTone } from "../ai/types.js";

export const followupDraftService = {
  async create(userId: string, conversationId: string, data: Omit<NewFollowupDraft, "conversationId" | "userId">) {
    await conversationService.getOwned(conversationId, userId);
    return followupDraftRepository.create({
      ...data,
      conversationId,
      userId,
    });
  },

  async listByUser(userId: string) {
    return followupDraftRepository.listByUser(userId);
  },

  async listByConversation(userId: string, conversationId: string) {
    await conversationService.getOwned(conversationId, userId);
    return followupDraftRepository.listByConversation(conversationId, userId);
  },

  async get(userId: string, id: string) {
    const draft = await followupDraftRepository.findById(id, userId);
    if (!draft) {
      throw new AppError("Follow-up draft not found", 404);
    }
    return draft;
  },

  async update(userId: string, id: string, data: Partial<NewFollowupDraft>) {
    const draft = await followupDraftRepository.update(id, userId, data);
    if (!draft) {
      throw new AppError("Follow-up draft not found", 404);
    }
    return draft;
  },

  async remove(userId: string, id: string) {
    const deleted = await followupDraftRepository.remove(id, userId);
    if (!deleted) {
      throw new AppError("Follow-up draft not found", 404);
    }
  },

  async generate(
    userId: string,
    conversationId: string,
    options: { tone?: DraftTone; variant?: number },
  ) {
    await conversationService.getOwned(conversationId, userId);
    const existing = await followupDraftRepository.listByConversation(conversationId, userId);
    const nextVariant = Math.max(0, ...existing.map((draft) => draft.variant)) + 1;
    const content = await aiService.generate(userId, conversationId, {
      tone: options.tone,
      variant: options.variant ?? nextVariant,
    });
    return followupDraftRepository.create({
      conversationId,
      userId,
      tone: content.tone,
      subject: content.subject,
      body: content.body,
      variant: content.variant,
      status: "draft",
    });
  },

  async regenerate(
    userId: string,
    id: string,
    options: { tone?: DraftTone; variant?: number },
  ) {
    const draft = await followupDraftRepository.findById(id, userId);
    if (!draft) {
      throw new AppError("Follow-up draft not found", 404);
    }
    const content = await aiService.generate(userId, draft.conversationId, {
      tone: options.tone ?? draft.tone,
      variant: options.variant ?? draft.variant + 1,
    });
    const updated = await followupDraftRepository.update(id, userId, {
      tone: content.tone,
      subject: content.subject,
      body: content.body,
      variant: content.variant,
    });
    if (!updated) {
      throw new AppError("Follow-up draft not found", 404);
    }
    return updated;
  },
};
