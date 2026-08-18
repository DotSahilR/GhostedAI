import { dispatchFollowUp } from "./dispatcher.js";
import { resolvePolicy, isWithinWorkingHours, getRetryDelayMs, MAX_RETRIES } from "./policy.js";
import { aiService } from "../services/ai.service.js";
import { logger } from "../config/logger.js";
import { activityLogRepository } from "../repositories/activity-log.repository.js";
import { connectedAccountService } from "../services/connected-account.service.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { followupDraftRepository } from "../repositories/followup-draft.repository.js";
import { followupHistoryRepository } from "../repositories/followup-history.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";

const SCAN_LIMIT = 200;

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

export interface AutomationRunResult {
  completed: number;
  started: number;
  generated: number;
  archived: number;
  active: number;
  sent: number;
  skipped: number;
  failed: number;
}

async function recordHistory(input: {
  userId: string;
  conversationId: string;
  action: "tracking_started" | "draft_generated" | "followup_sent" | "reply_received" | "completed" | "archived";
  title: string;
  body?: string;
  draftId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  await followupHistoryRepository.create({
    conversationId: input.conversationId,
    userId: input.userId,
    draftId: input.draftId,
    action: input.action,
    title: input.title,
    body: input.body,
    details: input.details,
  });
}

async function recordNotification(input: {
  userId: string;
  type: "info" | "sent" | "reply" | "completed" | "paused" | "connection" | "summary";
  title: string;
  detail: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await notificationRepository.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    detail: input.detail,
    channel: "in_app",
    data: input.data,
  });
}

async function recordActivity(input: {
  userId: string;
  action: string;
  title: string;
  detail: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await activityLogRepository.create({
    userId: input.userId,
    action: input.action,
    title: input.title,
    detail: input.detail,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY_MS));
}

export async function processReplies(userId?: string): Promise<{ completed: number }> {
  const conversations = await conversationRepository.listForAutomation(userId, SCAN_LIMIT);
  let completed = 0;
  for (const conversation of conversations) {
    if (userId && conversation.userId !== userId) {
      continue;
    }
    const latest = await messageRepository.findLatest(conversation.id);
    if (!latest || latest.direction !== "inbound" || conversation.followUpsSent < 1) {
      continue;
    }
    await conversationRepository.update(conversation.id, conversation.userId, {
      status: "completed",
      nextFollowUpAt: null,
      nextAction: "Resolved — reply received",
    });
    await followupDraftRepository.discardByConversation(conversation.id, conversation.userId);
    await recordHistory({
      userId: conversation.userId,
      conversationId: conversation.id,
      action: "reply_received",
      title: `Reply received from ${conversation.name}`,
      body: latest.body,
      details: { messageId: latest.id },
    });
    await recordHistory({
      userId: conversation.userId,
      conversationId: conversation.id,
      action: "completed",
      title: "Conversation marked complete",
      body: "Reply received — removed from active tracking.",
    });
    await recordNotification({
      userId: conversation.userId,
      type: "reply",
      title: "Reply received",
      detail: `${conversation.name} replied after ${conversation.daysWaiting} day(s)`,
      data: { conversationId: conversation.id },
    });
    await recordActivity({
      userId: conversation.userId,
      action: "reply_received",
      title: `Reply received from ${conversation.name}`,
      detail: conversation.subject,
      entityType: "conversation",
      entityId: conversation.id,
    });
    completed += 1;
  }
  return { completed };
}

export async function prepareFollowUps(userId?: string): Promise<{
  started: number;
  generated: number;
  archived: number;
  active: number;
}> {
  const conversations = await conversationRepository.listForAutomation(userId, SCAN_LIMIT);
  let started = 0;
  let generated = 0;
  let archived = 0;
  let active = 0;
  for (const conversation of conversations) {
    if (userId && conversation.userId !== userId) {
      continue;
    }
    const now = new Date();
    const policy = await resolvePolicy(conversation.userId, conversation);
    const daysWaiting = conversation.lastMessageAt
      ? daysBetween(conversation.lastMessageAt, now)
      : conversation.daysWaiting;

    if (conversation.followUpsSent >= policy.maxFollowUps) {
      await conversationRepository.update(conversation.id, conversation.userId, {
        status: "archived",
        nextFollowUpAt: null,
        daysWaiting,
        nextAction: "Automation stopped — max follow-ups reached",
      });
      await recordHistory({
        userId: conversation.userId,
        conversationId: conversation.id,
        action: "archived",
        title: "Max follow-ups reached",
        body: `Stopped after ${conversation.followUpsSent} follow-up(s) with no reply.`,
      });
      await recordNotification({
        userId: conversation.userId,
        type: "summary",
        title: "Max follow-ups reached",
        detail: `${conversation.name} · ${conversation.subject}`,
        data: { conversationId: conversation.id },
      });
      archived += 1;
      continue;
    }

    if (conversation.status === "waiting") {
      if (!conversation.nextFollowUpAt) {
        await conversationRepository.update(conversation.id, conversation.userId, {
          nextFollowUpAt: new Date(now.getTime() + policy.waitMinutes * MINUTE_MS),
          daysWaiting,
        });
        await recordHistory({
          userId: conversation.userId,
          conversationId: conversation.id,
          action: "tracking_started",
          title: `Tracking started for ${conversation.name}`,
          body: `Monitoring against a ${policy.waitMinutes} minute wait window.`,
        });
        await recordActivity({
          userId: conversation.userId,
          action: "tracking_started",
          title: `Tracking started for ${conversation.name}`,
          detail: conversation.subject,
          entityType: "conversation",
          entityId: conversation.id,
        });
        started += 1;
        continue;
      }
      if (conversation.nextFollowUpAt.getTime() > now.getTime()) {
        if (daysWaiting !== conversation.daysWaiting) {
          await conversationRepository.update(conversation.id, conversation.userId, {
            daysWaiting,
          });
        }
        continue;
      }
    }

    const activeDrafts = await followupDraftRepository.listActiveByConversation(
      conversation.id,
      conversation.userId,
    );
    if (activeDrafts.length > 0) {
      if (conversation.status !== "needs_followup") {
        await conversationRepository.update(conversation.id, conversation.userId, {
          status: "needs_followup",
          nextFollowUpAt: null,
          daysWaiting,
          nextAction: "Approve and send",
        });
      }
      active += 1;
      continue;
    }

    const variant = conversation.followUpsSent + 1;
    const content = await aiService.generate(conversation.userId, conversation.id, {
      tone: policy.tone,
      variant,
    });
    const draft = await followupDraftRepository.create({
      conversationId: conversation.id,
      userId: conversation.userId,
      tone: content.tone,
      subject: content.subject,
      body: content.body,
      variant: content.variant,
      status: policy.autoSend ? "scheduled" : "draft",
      scheduledAt: policy.autoSend ? now : null,
    });
    await conversationRepository.update(conversation.id, conversation.userId, {
      status: "needs_followup",
      nextFollowUpAt: null,
      daysWaiting,
      nextAction: policy.autoSend ? "Sending automatically" : "Approve and send",
    });
    await recordHistory({
      userId: conversation.userId,
      conversationId: conversation.id,
      action: "draft_generated",
      title: `Follow-up draft generated for ${conversation.name}`,
      body: content.body,
      draftId: draft.id,
      details: { variant: content.variant, tone: content.tone },
    });
    await recordNotification({
      userId: conversation.userId,
      type: "info",
      title: "Draft generated",
      detail: `${conversation.name} · ${conversation.subject}`,
      data: { conversationId: conversation.id, draftId: draft.id },
    });
    await recordActivity({
      userId: conversation.userId,
      action: "draft_generated",
      title: `Draft generated for ${conversation.name}`,
      detail: `${conversation.subject} · ${content.tone}`,
      entityType: "conversation",
      entityId: conversation.id,
    });
    generated += 1;
  }
  return { started, generated, archived, active };
}

export async function sendFollowUps(
  userId?: string,
  dispatch: typeof dispatchFollowUp = dispatchFollowUp,
): Promise<{
  sent: number;
  skipped: number;
  failed: number;
}> {
  const drafts = await followupDraftRepository.listDueForSend(new Date(), SCAN_LIMIT);
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const draft of drafts) {
    if (userId && draft.userId !== userId) {
      continue;
    }
    if (draft.status === "sent") {
      skipped += 1;
      continue;
    }
    try {
      const conversation = await conversationRepository.findById(
        draft.conversationId,
        draft.userId,
      );
      if (!conversation || !["waiting", "needs_followup"].includes(conversation.status)) {
        await followupDraftRepository.update(draft.id, draft.userId, {
          status: "discarded",
        });
        continue;
      }
      const account = conversation.accountId
        ? await connectedAccountService.get(draft.userId, conversation.accountId)
        : null;
      if (
        !account ||
        account.status !== "connected" ||
        !account.accessToken ||
        !account.permissions.includes("send") ||
        account.provider !== conversation.platform
      ) {
        skipped += 1;
        continue;
      }
      const policy = await resolvePolicy(draft.userId, conversation);
      const now = new Date();
      const { allowed, nextValidTime } = isWithinWorkingHours(
        policy.timezone,
        policy.workingHoursStart,
        policy.workingHoursEnd,
        now,
      );
      if (!allowed) {
        await followupDraftRepository.update(draft.id, draft.userId, {
          nextRetryAt: nextValidTime,
        });
        skipped += 1;
        continue;
      }
      const result = await dispatch({
        userId: draft.userId,
        accountId: account.id,
        provider: conversation.platform,
        to: conversation.handle,
        subject: draft.subject,
        body: draft.body,
        conversationId: conversation.id,
      });
      const followUpsSent = conversation.followUpsSent + 1;
      const reachedMax = followUpsSent >= policy.maxFollowUps;
      await followupDraftRepository.update(draft.id, draft.userId, {
        status: "sent",
        sentAt: now,
        retryCount: 0,
        nextRetryAt: null,
        lastError: null,
      });
      await conversationRepository.update(conversation.id, draft.userId, {
        status: reachedMax ? "needs_followup" : "waiting",
        nextFollowUpAt: reachedMax
          ? null
          : new Date(now.getTime() + policy.waitMinutes * MINUTE_MS),
        nextAction: reachedMax
          ? "Awaiting reply — max follow-ups reached"
          : "Awaiting reply",
        followUpsSent,
      });
      await recordHistory({
        userId: draft.userId,
        conversationId: conversation.id,
        action: "followup_sent",
        title: `Follow-up #${followUpsSent} sent to ${conversation.name}`,
        body: draft.body,
        draftId: draft.id,
        details: {
          provider: result.provider,
          externalMessageId: result.messageId,
        },
      });
      await recordNotification({
        userId: draft.userId,
        type: "sent",
        title: "Follow-up sent",
        detail: `${conversation.name} · ${conversation.subject}`,
        data: {
          conversationId: conversation.id,
          draftId: draft.id,
          externalMessageId: result.messageId,
        },
      });
      await recordActivity({
        userId: draft.userId,
        action: "followup_sent",
        title: `Follow-up #${followUpsSent} sent to ${conversation.name}`,
        detail: conversation.subject,
        entityType: "conversation",
        entityId: conversation.id,
        metadata: { provider: result.provider },
      });
      sent += 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown error";
      logger.error(
        `[automation] send failed for draft ${draft.id}: ${errorMessage}`,
      );
      const currentRetry = draft.retryCount ?? 0;
      const nextRetry = currentRetry + 1;
      if (nextRetry >= MAX_RETRIES) {
        await followupDraftRepository.update(draft.id, draft.userId, {
          status: "failed",
          retryCount: nextRetry,
          lastError: errorMessage,
          nextRetryAt: null,
        });
        const conversation = await conversationRepository.findById(
          draft.conversationId,
          draft.userId,
        );
        if (conversation) {
          await recordNotification({
            userId: draft.userId,
            type: "info",
            title: "Follow-up failed",
            detail: `Follow-up to ${conversation.name} could not be sent after ${nextRetry} attempt(s). Channel: ${conversation.platform ?? "unknown"}.`,
            data: {
              conversationId: conversation.id,
              draftId: draft.id,
              channel: conversation.platform,
              retryCount: nextRetry,
            },
          });
          await recordActivity({
            userId: draft.userId,
            action: "send_failed",
            title: `Follow-up to ${conversation.name} failed`,
            detail: `${conversation.subject} · ${errorMessage.slice(0, 200)}`,
            entityType: "conversation",
            entityId: conversation.id,
          });
        }
      } else {
        const delayMs = getRetryDelayMs(currentRetry);
        await followupDraftRepository.update(draft.id, draft.userId, {
          retryCount: nextRetry,
          lastError: errorMessage,
          nextRetryAt: new Date(Date.now() + delayMs),
        });
      }
      failed += 1;
    }
  }
  return { sent, skipped, failed };
}

export async function runAutomationCycle(userId?: string): Promise<AutomationRunResult> {
  const replies = await processReplies(userId);
  const prepared = await prepareFollowUps(userId);
  const sent = await sendFollowUps(userId);
  return { ...replies, ...prepared, ...sent };
}
