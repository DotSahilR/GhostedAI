import { aiProvider } from "../ai/index.js";
import { localProvider } from "../ai/providers/local.js";
import type { DraftTone, GenerateDraftInput } from "../ai/types.js";
import { toneLabel } from "../ai/prompts.js";
import { AppError } from "../errors/index.js";
import { messageRepository } from "../repositories/message.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { conversationService } from "./conversation.service.js";
import { settingsService } from "./settings.service.js";
import { logger } from "../config/logger.js";

export interface DraftGenerationOptions {
  tone?: DraftTone;
  variant?: number;
}

export interface RewriteOptions {
  body: string;
  tone: DraftTone;
  instructions?: string;
}

async function resilient<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (aiProvider.name === "local") {
    return fallback();
  }
  try {
    return await primary();
  } catch (error) {
    logger.warn(
      `AI provider "${aiProvider.name}" failed, using local fallback: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return fallback();
  }
}

function buildInput(
  conversation: {
    name: string;
    company: string | null;
    subject: string;
    category: string | null;
    platform: string | null;
    daysWaiting: number;
    followUpsSent: number;
    lastMessage: string | null;
    value: string | null;
  },
  user: { name: string },
  messages: Array<{ direction: "inbound" | "outbound"; body: string }>,
  tone: DraftTone,
  variant: number,
): GenerateDraftInput {
  return {
    senderName: user.name,
    recipientName: conversation.name,
    company: conversation.company ?? "",
    subject: conversation.subject,
    category: conversation.category ?? "",
    platform: conversation.platform ?? "caspian",
    daysWaiting: conversation.daysWaiting,
    followUpsSent: conversation.followUpsSent,
    tone,
    variant,
    recentMessages: messages.slice(0, 10).map((message) => ({
      direction: message.direction,
      body: message.body,
    })),
    lastMessage: conversation.lastMessage,
    value: conversation.value,
  };
}

export const aiService = {
  async generate(
    userId: string,
    conversationId: string,
    options: DraftGenerationOptions,
  ) {
    const [conversation, settings, user] = await Promise.all([
      conversationService.getOwned(conversationId, userId),
      settingsService.get(userId),
      userRepository.findById(userId),
    ]);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const messages = await messageRepository.listByConversation(conversationId);
    const tone: DraftTone = options.tone ?? settings.defaultTone;
    const variant = options.variant ?? 1;
    const input = buildInput(conversation, user, messages, tone, variant);
    const content = await resilient(
      () => aiProvider.generateDraft(input),
      () => localProvider.generateDraft(input),
    );
    return { ...content, tone, variant };
  },

  async analyze(userId: string, conversationId: string) {
    const [conversation, settings] = await Promise.all([
      conversationService.getOwned(conversationId, userId),
      settingsService.get(userId),
    ]);
    const remaining = Math.max(settings.waitDays - conversation.daysWaiting, 0);
    const messages = await messageRepository.listByConversation(conversationId);
    const analysisInput = {
      recipientName: conversation.name,
      subject: conversation.subject,
      category: conversation.category ?? "",
      priority: conversation.priority,
      daysWaiting: conversation.daysWaiting,
      followUpsSent: conversation.followUpsSent,
      tone: settings.defaultTone,
      recentMessages: messages.slice(0, 10).map((message) => ({
        direction: message.direction,
        body: message.body,
      })),
      lastMessage: conversation.lastMessage,
    };
    const providerResult = await resilient(
      () => aiProvider.analyze(analysisInput),
      () => localProvider.analyze(analysisInput),
    );
    return {
      conversationType: conversation.category ?? "General",
      priority: conversation.priority,
      status: conversation.status,
      confidence: conversation.confidence,
      recommendedWait:
        providerResult.recommendedWaitDays === 0
          ? "Follow up now"
          : `${providerResult.recommendedWaitDays} more day(s)`,
      recommendedWaitDays: providerResult.recommendedWaitDays,
      reasoning: providerResult.reasoning,
      tone: toneLabel(settings.defaultTone),
      urgency: providerResult.urgency,
    };
  },

  async summarizeConversation(userId: string, conversationId: string) {
    const [conversation, messages] = await Promise.all([
      conversationService.getOwned(conversationId, userId),
      messageRepository.listByConversation(conversationId),
    ]);
    const input = {
      recipientName: conversation.name,
      subject: conversation.subject,
      platform: conversation.platform ?? "caspian",
      messages: messages.slice(0, 20).map((message) => ({
        direction: message.direction,
        body: message.body,
      })),
    };
    const result = await resilient(
      () => aiProvider.summarize(input),
      () => localProvider.summarize(input),
    );
    return result;
  },

  async rewriteDraft(options: RewriteOptions) {
    const input = {
      body: options.body,
      tone: options.tone,
      instructions: options.instructions,
    };
    const result = await resilient(
      () => aiProvider.rewrite(input),
      () => localProvider.rewrite(input),
    );
    return result;
  },

  async adjustTone(options: RewriteOptions) {
    const input = { body: options.body, tone: options.tone };
    const result = await resilient(
      () => aiProvider.adjustTone(input),
      () => localProvider.adjustTone(input),
    );
    return result;
  },
};
