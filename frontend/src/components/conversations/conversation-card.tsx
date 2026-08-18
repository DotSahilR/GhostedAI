"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Clock3, PauseCircle, Archive, Eye, FileEdit } from "lucide-react";
import { toast } from "sonner";

import { Avatar, PlatformChip, PriorityBadge, StatusBadge } from "@/components/app/badges";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Actions({ conversation, className }: { conversation: Conversation; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Button asChild size="sm" variant="secondary" className="h-8 gap-1.5 text-xs">
        <Link href={`/conversations/${conversation.id}`}>
          <Eye className="size-3.5" />
          View
        </Link>
      </Button>
      <Button asChild size="sm" variant="secondary" className="h-8 gap-1.5 text-xs">
        <Link href={`/conversations/${conversation.id}`}>
          <FileEdit className="size-3.5" />
          Review Draft
        </Link>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1.5 text-xs text-muted-foreground"
        onClick={() => toast(`Tracking paused for ${conversation.name}`)}
      >
        <PauseCircle className="size-3.5" />
        Pause
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1.5 text-xs text-muted-foreground"
        onClick={() => toast(`${conversation.subject} archived`)}
      >
        <Archive className="size-3.5" />
        Archive
      </Button>
    </div>
  );
}

export function ConversationCard({ conversation, index }: { conversation: Conversation; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="surface-card flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar initials={conversation.initials} hue={conversation.avatarHue} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{conversation.name}</p>
            <p className="truncate text-xs text-subtle">{conversation.company}</p>
          </div>
        </div>
        <PriorityBadge priority={conversation.priority} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{conversation.subject}</p>
        <p className="mt-0.5 text-xs text-subtle">{conversation.category}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <PlatformChip platform={conversation.platform} />
        <StatusBadge status={conversation.status} />
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Clock3 className="size-3" />
          {conversation.daysWaiting}d waiting
        </span>
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        “{conversation.lastMessage}”
      </p>

      <p className="text-xs text-muted-foreground">
        <span className="text-subtle">Next: </span>
        {conversation.nextAction}
      </p>

      <Actions conversation={conversation} className="mt-auto border-t border-border pt-3" />
    </motion.div>
  );
}

export function ConversationRow({ conversation, index }: { conversation: Conversation; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="surface-card flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar initials={conversation.initials} hue={conversation.avatarHue} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{conversation.name}</p>
            <span className="text-xs text-subtle">·</span>
            <p className="truncate text-xs text-subtle">{conversation.company}</p>
          </div>
          <p className="truncate text-sm text-muted-foreground">{conversation.subject}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:w-auto">
        <PlatformChip platform={conversation.platform} />
        <StatusBadge status={conversation.status} />
        <PriorityBadge priority={conversation.priority} />
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Clock3 className="size-3" />
          {conversation.daysWaiting}d
        </span>
      </div>

      <Actions conversation={conversation} />
    </motion.div>
  );
}
