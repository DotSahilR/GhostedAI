import { motion } from "motion/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Clock3 } from "lucide-react";

import { Avatar, PriorityBadge } from "@/components/app/badges";
import { Progress } from "@/components/ui/progress";
import type { Conversation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function KanbanCard({ conversation }: { conversation: Conversation }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: conversation.id,
  });

  return (
    <motion.div
      layout
      layoutId={conversation.id}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      className={cn(
        "surface-card cursor-grab touch-none select-none rounded-lg border border-border bg-card p-3 active:cursor-grabbing",
        isDragging && "z-50 opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar initials={conversation.initials} hue={conversation.avatarHue} size={30} />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{conversation.name}</p>
            <p className="truncate text-[11px] text-subtle">{conversation.company}</p>
          </div>
        </div>
        <PriorityBadge priority={conversation.priority} />
      </div>

      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {conversation.subject}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-subtle">
          <Clock3 className="size-3" />
          {conversation.daysWaiting}d
        </span>
        <div className="flex w-16 items-center gap-1">
          <Progress value={conversation.confidence} className="h-1" />
          <span className="font-mono text-[10px] text-subtle">{conversation.confidence}%</span>
        </div>
      </div>
    </motion.div>
  );
}
