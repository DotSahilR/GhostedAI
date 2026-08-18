import { motion } from "motion/react";
import {
  Mail,
  Clock3,
  BrainCircuit,
  FileEdit,
  Send,
  Reply,
  CheckCircle2,
} from "lucide-react";
import type { TimelineEvent, TimelineKind } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const kindMeta: Record<TimelineKind, { icon: typeof Mail; color: string; bubble?: boolean }> = {
  original: { icon: Mail, color: "text-muted-foreground bg-surface-2", bubble: true },
  waiting: { icon: Clock3, color: "text-status-waiting bg-status-waiting/10" },
  analysis: { icon: BrainCircuit, color: "text-accent-bright bg-accent/10" },
  draft: { icon: FileEdit, color: "text-status-review bg-status-review/10" },
  sent: { icon: Send, color: "text-status-sent bg-status-sent/10" },
  reply: { icon: Reply, color: "text-status-reply bg-status-reply/10", bubble: true },
  completed: { icon: CheckCircle2, color: "text-status-completed bg-status-completed/10" },
};

export function ConversationTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative flex flex-col gap-6">
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
      {events.map((event, i) => {
        const meta = kindMeta[event.kind];
        const Icon = meta.icon;
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
            className="relative flex gap-4 pl-0"
          >
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-background",
                meta.color,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                <p className="text-[11px] text-subtle">{event.timestamp}</p>
              </div>
              {event.body && (
                <div
                  className={cn(
                    "mt-2 rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground",
                    meta.bubble && "bg-surface-1",
                  )}
                >
                  {event.body}
                </div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
