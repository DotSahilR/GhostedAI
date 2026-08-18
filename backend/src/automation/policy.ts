import type { DraftTone } from "../ai/types.js";
import { trackingRuleRepository } from "../repositories/tracking-rule.repository.js";
import type { Conversation } from "../schema/index.js";
import { settingsService } from "../services/settings.service.js";

export interface AutomationPolicy {
  waitMinutes: number;
  maxFollowUps: number;
  tone: DraftTone;
  autoSend: boolean;
  timezone: string;
  workingHoursStart: string | null;
  workingHoursEnd: string | null;
}

export async function resolvePolicy(
  userId: string,
  conversation: Conversation,
): Promise<AutomationPolicy> {
  const [settings, rules] = await Promise.all([
    settingsService.get(userId),
    trackingRuleRepository.listActiveByUser(userId),
  ]);
  const rule =
    rules.find(
      (candidate) =>
        candidate.category && conversation.category === candidate.category,
    ) ?? rules[0];
  const conversationAutoSend = conversation.autoSend;
  return {
    waitMinutes: rule?.waitMinutes ?? settings.waitDays * 24 * 60,
    maxFollowUps: rule?.maxFollowUps ?? settings.maxFollowUps,
    tone: rule?.tone ?? settings.defaultTone,
    autoSend: conversationAutoSend ?? settings.autoSend,
    timezone: settings.timezone ?? "UTC",
    workingHoursStart: settings.workingHoursStart,
    workingHoursEnd: settings.workingHoursEnd,
  };
}

const RETRY_DELAYS_MS = [60_000, 300_000, 900_000];
export const MAX_RETRIES = RETRY_DELAYS_MS.length;

export function getRetryDelayMs(retryCount: number): number {
  const delay = RETRY_DELAYS_MS[retryCount];
  return delay !== undefined ? delay : RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]!;
}

export function isWithinWorkingHours(
  timezone: string,
  workingHoursStart: string | null,
  workingHoursEnd: string | null,
  now: Date,
): { allowed: boolean; nextValidTime: Date } {
  if (!workingHoursStart || !workingHoursEnd) {
    return { allowed: true, nextValidTime: now };
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const currentHour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const currentMinute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const currentMinutes = currentHour * 60 + currentMinute;
  const [startH = 0, startM = 0] = workingHoursStart.split(":").map(Number);
  const [endH = 0, endM = 0] = workingHoursEnd.split(":").map(Number);
  const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
  const endMinutes = (endH ?? 0) * 60 + (endM ?? 0);
  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
    return { allowed: true, nextValidTime: now };
  }
  const nextValid = new Date(now);
  if (currentMinutes < startMinutes) {
    const diffMs = (startMinutes - currentMinutes) * 60_000;
    nextValid.setTime(now.getTime() + diffMs);
  } else {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const diffMs =
      ((24 * 60 - currentMinutes + startMinutes) % (24 * 60)) * 60_000;
    nextValid.setTime(now.getTime() + diffMs);
  }
  return { allowed: false, nextValidTime: nextValid };
}
