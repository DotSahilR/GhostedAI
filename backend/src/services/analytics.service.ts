import { analyticsRepository } from "../repositories/analytics.repository.js";

const DAY_MS = 86_400_000;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const analyticsService = {
  async summary(userId: string, days = 30) {
    const clampedDays = Math.max(7, Math.min(90, days));
    const now = new Date();
    const since = new Date(now.getTime() - (clampedDays - 1) * DAY_MS);

    const [
      tracked,
      statusDistribution,
      priorityDistribution,
      platformDistribution,
      sentDrafts,
      replies,
      recentActivity,
      completed,
    ] = await Promise.all([
      analyticsRepository.countConversations(userId),
      analyticsRepository.statusDistribution(userId),
      analyticsRepository.priorityDistribution(userId),
      analyticsRepository.platformDistribution(userId),
      analyticsRepository.countSentDrafts(userId),
      analyticsRepository.countActivitySince(userId, "reply_received", since),
      analyticsRepository.recentActivity(userId, since),
      analyticsRepository.completedConversationStats(userId),
    ]);

    const statusMap = new Map(statusDistribution.map((row) => [row.status, row.count]));
    const completedCount = statusMap.get("completed") ?? 0;
    const avgResponseHours =
      completed.count > 0
        ? Math.round((completed.totalDaysWaiting / completed.count) * 24)
        : 0;
    const conversionRate = tracked > 0 ? Math.round((completedCount / tracked) * 100) : 0;
    const responseRate = sentDrafts > 0 ? Math.round((replies / sentDrafts) * 100) : 0;

    const buckets = new Map<string, { sent: number; replies: number }>();
    for (const activity of recentActivity) {
      const key = formatDay(activity.createdAt);
      const bucket = buckets.get(key) ?? { sent: 0, replies: 0 };
      if (activity.action === "followup_sent") {
        bucket.sent += 1;
      }
      if (activity.action === "reply_received") {
        bucket.replies += 1;
      }
      buckets.set(key, bucket);
    }
    const weekly: Array<{ date: string; sent: number; replies: number }> = [];
    const monthlyMap = new Map<string, { sent: number; replies: number }>();
    for (let i = clampedDays - 1; i >= 0; i -= 1) {
      const day = new Date(startOfDay(now).getTime() - i * DAY_MS);
      const key = formatDay(day);
      const bucket = buckets.get(key) ?? { sent: 0, replies: 0 };
      weekly.push({ date: key, ...bucket });
      const monthKey = key.slice(0, 7);
      const monthBucket = monthlyMap.get(monthKey) ?? { sent: 0, replies: 0 };
      monthBucket.sent += bucket.sent;
      monthBucket.replies += bucket.replies;
      monthlyMap.set(monthKey, monthBucket);
    }
    const monthly = Array.from(monthlyMap.entries()).map(([month, value]) => ({
      month,
      ...value,
    }));

    const platformLabels: Record<string, string> = {
      caspian: "Caspian",
      other: "Other",
    };
    const platforms = platformDistribution.map((row) => ({
      platform: platformLabels[row.platform] ?? row.platform,
      count: row.count,
    }));

    const priorities = priorityDistribution.map((row) => ({
      priority: row.priority,
      count: row.count,
    }));

    const funnel = {
      waiting: statusMap.get("waiting") ?? 0,
      needsFollowup: statusMap.get("needs_followup") ?? 0,
      completed: completedCount,
      paused: statusMap.get("paused") ?? 0,
      archived: statusMap.get("archived") ?? 0,
    };

    const insights: Array<{ title: string; detail: string }> = [];
    if (tracked === 0) {
      insights.push({
        title: "No conversations tracked yet",
        detail: "Connect an account and add tracking rules to start monitoring opportunities.",
      });
    } else {
      if (responseRate >= 50) {
        insights.push({
          title: "Strong reply rate",
          detail: `${responseRate}% of sent follow-ups received a reply in the last ${clampedDays} days.`,
        });
      } else {
        insights.push({
          title: "Replies are slow to arrive",
          detail: `Only ${responseRate}% of sent follow-ups have received a reply. Consider tightening wait days or tone.`,
        });
      }
      if (avgResponseHours > 0) {
        insights.push({
          title: "Average response time",
          detail: `Completed conversations resolve in about ${avgResponseHours} hour(s) on average.`,
        });
      }
      if (funnel.needsFollowup > 0) {
        insights.push({
          title: "Follow-ups waiting",
          detail: `${funnel.needsFollowup} conversation(s) currently need a follow-up draft approved or sent.`,
        });
      }
    }

    return {
      kpis: {
        tracked,
        sent: sentDrafts,
        replies,
        responseRate,
        avgResponseHours,
        conversionRate,
        opportunityValue: Math.round(completed.totalValue),
      },
      series: {
        weekly,
        monthly,
      },
      platforms,
      priorities,
      funnel,
      insights,
      windowDays: clampedDays,
    };
  },
};
