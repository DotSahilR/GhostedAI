import type {
  Activity,
  AiAnalysis,
  AppNotification,
  Conversation,
  ConversationStatus,
  Draft,
  Platform,
  Priority,
  TimelineEvent,
} from "@/lib/mock-data";
import type {
  ApiActivityLog,
  ApiAnalysis,
  ApiConnectedAccount,
  ApiConversation,
  ApiFollowupDraft,
  ApiFollowupHistory,
  ApiMessage,
  ApiNotification,
  ApiTone,
} from "./types";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function hueOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  return hash;
}

export function timeAgo(value: string | null | undefined): string {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  if (diff < MINUTE_MS) return "Just now";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)} min ago`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)} hr ago`;
  if (diff < 7 * DAY_MS) return `${Math.floor(diff / DAY_MS)} days ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatWhen(value: string | null | undefined): string {
  if (!value) return "Just now";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  const yesterday = new Date(now.getTime() - DAY_MS);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

export function mapPlatform(platform: string | null | undefined): Platform {
  if (platform === "gmail" || platform === "caspian") {
    return platform;
  }
  return "caspian";
}

export function mapToneLabel(tone: ApiTone): AiAnalysis["tone"] {
  if (tone === "friendly") return "Friendly";
  if (tone === "formal") return "Formal";
  return "Professional";
}

export function mapStatus(
  conversation: ApiConversation,
  drafts: ApiFollowupDraft[] = [],
): ConversationStatus {
  switch (conversation.status) {
    case "waiting":
      return "waiting";
    case "needs_followup": {
      const latest = drafts[0];
      return latest?.status === "draft" ? "needs-review" : "follow-up-ready";
    }
    case "completed":
      return "completed";
    case "paused":
      return "paused";
    case "archived":
      return "archived";
    default:
      return "waiting";
  }
}

export function toDraft(draft: ApiFollowupDraft): Draft {
  return {
    id: draft.id,
    subject: draft.subject,
    body: draft.body,
    generatedAt: formatWhen(draft.createdAt),
    variant: draft.variant,
  };
}

export function defaultDraft(conversation: ApiConversation): Draft {
  return {
    subject: `Re: ${conversation.subject}`,
    body: "",
    generatedAt: "Not generated yet",
    variant: 1,
  };
}

export function toAnalysis(analysis: ApiAnalysis): AiAnalysis {
  return {
    conversationType: analysis.conversationType,
    priority: analysis.priority,
    status: analysis.status,
    confidence: analysis.confidence,
    recommendedWait: analysis.recommendedWait,
    reasoning: analysis.reasoning,
    tone: analysis.tone,
    urgency: analysis.urgency,
  };
}

export function defaultAnalysis(conversation: ApiConversation): AiAnalysis {
  const remaining = Math.max(3 - conversation.daysWaiting, 0);
  return {
    conversationType: conversation.category ?? "Conversation",
    priority: conversation.priority,
    status: conversation.status.replace("_", " "),
    confidence: conversation.confidence,
    recommendedWait:
      remaining === 0 ? "Follow up now" : `${remaining} more day(s)`,
    reasoning:
      conversation.daysWaiting > 0
        ? `${conversation.daysWaiting} day(s) of silence on this ${(conversation.category ?? "conversation").toLowerCase()} thread. A short, low-pressure nudge that restates the single decision needed has the highest expected reply rate.`
        : "This thread was just tracked. No follow-up is recommended yet.",
    tone: mapToneLabel("professional"),
    urgency: conversation.priority === "high" ? "High" : conversation.priority === "medium" ? "Medium" : "Low",
  };
}

function timelineEvents(
  conversation: ApiConversation,
  messages: ApiMessage[] = [],
  history: ApiFollowupHistory[] = [],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const created = formatWhen(conversation.createdAt);
  events.push({
    id: "evt-original",
    kind: "original",
    title: `Original message sent to ${conversation.name}`,
    timestamp: created,
    body: conversation.lastMessage ?? `Subject: ${conversation.subject}`,
  });
  events.push({
    id: "evt-waiting",
    kind: "waiting",
    title: "No reply detected — tracking started",
    timestamp: formatWhen(conversation.createdAt),
    body: "Ghosted AI began monitoring this thread against your waiting rule.",
  });

  if (history.length > 0) {
    for (const entry of history) {
      if (!["draft_generated", "followup_sent", "reply_received", "completed", "archived"].includes(entry.action)) {
        continue;
      }
      events.push({
        id: `evt-${entry.id}`,
        kind: entry.action === "draft_generated" ? "draft" : (entry.action as TimelineEvent["kind"]),
        title: entry.title,
        timestamp: formatWhen(entry.createdAt),
        body: entry.body ?? undefined,
      });
    }
  } else if (conversation.followUpsSent > 0) {
    events.push({
      id: "evt-draft",
      kind: "draft",
      title: "Follow-up draft generated",
      timestamp: formatWhen(conversation.updatedAt),
    });
    events.push({
      id: "evt-sent",
      kind: "sent",
      title: `Follow-up sent to ${conversation.name}`,
      timestamp: formatWhen(conversation.lastMessageAt ?? conversation.updatedAt),
    });
  }

  for (const message of messages) {
    events.push({
      id: `evt-msg-${message.id}`,
      kind: message.direction === "inbound" ? "reply" : "sent",
      title:
        message.direction === "inbound"
          ? `${conversation.name} replied`
          : `Follow-up sent to ${conversation.name}`,
      timestamp: formatWhen(message.sentAt),
      body: message.body,
    });
  }

  if (conversation.status === "completed") {
    events.push({
      id: "evt-completed",
      kind: "completed",
      title: "Opportunity marked complete",
      timestamp: formatWhen(conversation.updatedAt),
      body: "Conversation resolved. Removed from active tracking.",
    });
  }

  const unique = new Map<string, TimelineEvent>();
  for (const event of events) {
    const key = `${event.title}::${event.body ?? ""}`;
    if (!unique.has(key)) {
      unique.set(key, event);
    }
  }
  return Array.from(unique.values());
}

export function toConversation(
  conversation: ApiConversation,
  extras: {
    messages?: ApiMessage[];
    history?: ApiFollowupHistory[];
    drafts?: ApiFollowupDraft[];
    analysis?: ApiAnalysis;
  } = {},
): Conversation {
  const drafts = extras.drafts ?? [];
  const status = mapStatus(conversation, drafts);
  return {
    id: conversation.id,
    name: conversation.name,
    handle: conversation.handle,
    company: conversation.company ?? "",
    avatarHue: hueOf(conversation.id),
    initials: initialsOf(conversation.name),
    subject: conversation.subject,
    category: (conversation.category ?? "Conversation") as Conversation["category"],
    platform: mapPlatform(conversation.platform),
    status,
    priority: conversation.priority,
    daysWaiting: conversation.daysWaiting,
    lastMessage: conversation.lastMessage ?? "",
    lastMessageDirection: conversation.lastMessageDirection ?? null,
    lastActivity: timeAgo(conversation.lastMessageAt ?? conversation.updatedAt),
    confidence: conversation.confidence,
    nextAction: conversation.nextAction ?? "Awaiting reply",
    followUpsSent: conversation.followUpsSent,
    value: conversation.value ?? "—",
    timeline: timelineEvents(conversation, extras.messages, extras.history),
    analysis: extras.analysis ? toAnalysis(extras.analysis) : defaultAnalysis(conversation),
    draft: drafts[0] ? toDraft(drafts[0]) : defaultDraft(conversation),
  };
}

export function toAccount(account: ApiConnectedAccount) {
  const platform = mapPlatform(account.provider);
  return {
    id: account.id,
    platform,
    status: account.status,
    account: account.accountName,
    lastSync: account.lastSyncedAt ? timeAgo(account.lastSyncedAt) : "—",
    permissions: account.permissions.map((permission) =>
      permission === "read" ? "Read threads" : "Send messages",
    ),
    description: account.description ?? "",
  };
}

export function toNotification(notification: ApiNotification): AppNotification {
  return {
    id: notification.id,
    type: notification.type as AppNotification["type"],
    title: notification.title,
    detail: notification.detail ?? "",
    time: timeAgo(notification.createdAt),
    unread: !notification.isRead,
  };
}

export function toActivity(log: ApiActivityLog): Activity {
  const kindMap: Record<string, Activity["kind"]> = {
    tracking_started: "waiting",
    draft_generated: "draft",
    followup_sent: "sent",
    reply_received: "reply",
    completed: "completed",
    archived: "completed",
    paused: "paused",
    resumed: "waiting",
    connection: "connection",
  };
  return {
    id: log.id,
    kind: kindMap[log.action] ?? "waiting",
    title: log.title ?? log.action,
    detail: log.detail ?? "",
    time: timeAgo(log.createdAt),
  };
}
