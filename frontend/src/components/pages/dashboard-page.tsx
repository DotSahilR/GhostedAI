"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, Plus, Check, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AttentionCard, AllCaughtUp } from "@/components/dashboard/attention-card";
import { DataState } from "@/components/shared/data-state";
import type { AttentionItem, SimpleStatus } from "@/lib/dashboard-data";
import { platformMeta } from "@/lib/mock-data";
import { useSession } from "@/lib/session";
import { useAccounts, useActivityLog, useConversations, useRunAutomation } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

function SummaryCard({ label, value, index, small }: { label: string; value: string; index: number; small?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={small ? "mt-2 text-base font-medium text-foreground" : "mt-2 text-2xl font-semibold text-foreground"}>{value}</p>
    </motion.div>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function FilterButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

type DirectionFilter = "all" | "sent" | "received";

export function DashboardPage() {
  const { user } = useSession();
  const conversationsQuery = useConversations();
  const { data: conversations = [] } = conversationsQuery;
  const { data: activity = [] } = useActivityLog();
  const { data: accounts = [] } = useAccounts();
  const runAutomation = useRunAutomation();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");

  const items = useMemo<AttentionItem[]>(() => {
    return conversations
      .filter(
        (c) =>
          c.status === "waiting" ||
          c.status === "needs-review" ||
          c.status === "follow-up-ready",
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        initials: c.initials,
        avatarHue: c.avatarHue,
        title: c.subject,
        platform: c.platform,
        daysWaiting: c.daysWaiting,
        status: (c.status === "waiting" ? "waiting" : "needs-follow-up") as SimpleStatus,
        explanation:
          c.daysWaiting > 0
            ? `No reply for ${c.daysWaiting} day${c.daysWaiting === 1 ? "" : "s"}.`
            : "Newly tracked thread.",
        recommendation: c.nextAction,
        lastMessageDirection: c.lastMessageDirection,
      }));
  }, [conversations]);

  const filteredItems = useMemo(() => {
    if (directionFilter === "all") return items;
    return items.filter((i) => i.lastMessageDirection === (directionFilter === "sent" ? "outbound" : "inbound"));
  }, [items, directionFilter]);

  const needing = items.filter((i) => i.status !== "completed");
  const sentCount = items.filter((i) => i.lastMessageDirection === "outbound").length;
  const receivedCount = items.filter((i) => i.lastMessageDirection === "inbound").length;
  const waiting = conversations.filter((c) => c.status === "waiting").length;
  const needsFollowUp = conversations.filter(
    (c) => c.status === "needs-review" || c.status === "follow-up-ready",
  ).length;
  const completed = conversations.filter((c) => c.status === "completed").length;
  const accountLabel =
    accounts.length > 0
      ? accounts.map((a) => platformMeta[a.platform].label).join(" · ")
      : "0 connected";
  const recentActivity = activity.slice(0, 5);

  const runScan = () => {
    runAutomation.mutate("all", {
      onSuccess: () => toast.success("Scan complete", { description: "Your inboxes are up to date." }),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Scan failed"),
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 pb-20 lg:px-8 lg:py-14">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {greeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Ghosted AI found {needing.length} conversation{needing.length === 1 ? "" : "s"} that need{needing.length === 1 ? "s" : ""} your attention today.
          </p>
          <p className="mt-1 text-sm text-subtle">
            Monitoring {conversations.length} important conversations.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" disabled>
            <Plus className="size-4" />
            New Tracking Rule
          </Button>
          <Button onClick={runScan} disabled={runAutomation.isPending}>
            <RefreshCw className={runAutomation.isPending ? "size-4 animate-spin" : "size-4"} />
            Run Scan
          </Button>
        </div>
      </header>

      <DataState
        isLoading={conversationsQuery.isLoading}
        isError={conversationsQuery.isError}
        error={conversationsQuery.error}
        onRetry={() => void conversationsQuery.refetch()}
      >
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard index={0} label="Waiting" value={String(waiting)} />
          <SummaryCard index={1} label="Needs Follow-up" value={String(needsFollowUp)} />
          <SummaryCard index={2} label="Completed" value={String(completed)} />
          <SummaryCard index={3} label="Connected Accounts" small value={accountLabel} />
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Conversations Needing Attention
            </h2>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-1 p-1">
              <FilterButton
                active={directionFilter === "all"}
                onClick={() => setDirectionFilter("all")}
                label="All"
              />
              <FilterButton
                active={directionFilter === "sent"}
                onClick={() => setDirectionFilter("sent")}
                label="Sent"
                icon={<ArrowUpRight className="size-3.5" />}
              />
              <FilterButton
                active={directionFilter === "received"}
                onClick={() => setDirectionFilter("received")}
                label="Received"
                icon={<ArrowDownLeft className="size-3.5" />}
              />
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {filteredItems.length === 0 ? (
              <AllCaughtUp />
            ) : (
              filteredItems.map((item, i) => <AttentionCard key={item.id} item={item} index={i} />)
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-subtle">
              No activity yet. Connect an account to get started.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Check className="size-4 shrink-0 text-status-completed" />
                  <span className="flex-1 text-sm text-foreground">{a.title}</span>
                  <span className="text-xs text-subtle">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </DataState>
    </div>
  );
}
