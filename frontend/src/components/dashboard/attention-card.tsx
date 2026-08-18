"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Clock3, Mail, Send as SendIcon, PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/app/badges";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  type AttentionItem,
  simpleStatusMeta,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const platformIcon = { gmail: Mail, telegram: SendIcon, caspian: Sparkles } as const;
const platformLabel = { gmail: "Gmail", telegram: "Telegram", caspian: "Caspian" } as const;

export function AttentionCard({ item, index }: { item: AttentionItem; index: number }) {
  const PlatformIcon = platformIcon[item.platform];
  const status = simpleStatusMeta[item.status];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar initials={item.initials} hue={item.avatarHue} size={44} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">{item.name}</p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  status.chip,
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{item.company}</p>
            <p className="mt-3 text-sm font-medium text-foreground">{item.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <PlatformIcon className="size-3.5" />
                {platformLabel[item.platform]}
              </span>
              {item.daysWaiting > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  Waiting {item.daysWaiting} day{item.daysWaiting === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.explanation}</p>
            <p className="mt-3 text-sm">
              <span className="text-subtle">Recommended action: </span>
              <span className="font-medium text-foreground">{item.recommendation}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast(`Snoozed ${item.name}`, { description: "We'll check again tomorrow." })}
          >
            Snooze
          </Button>
          <Button asChild size="sm">
            <Link href={`/conversations/${item.id}`}>Review Follow-up</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function AllCaughtUp() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface-1/50 px-6 py-20 text-center">
      <div className="grid size-14 place-items-center rounded-full border border-border bg-surface-2">
        <PartyPopper className="size-6 text-subtle" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">🎉 Great job! You're all caught up.</p>
        <p className="mt-1 text-sm text-muted-foreground">No follow-ups are needed today.</p>
      </div>
      <Button asChild variant="secondary" size="sm">
        <Link href="/conversations">View Completed Conversations</Link>
      </Button>
    </div>
  );
}
