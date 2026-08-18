import { cn } from "@/lib/utils";
import {
  statusMeta,
  priorityMeta,
  platformMeta,
  type ConversationStatus,
  type Priority,
  type Platform,
} from "@/lib/mock-data";

export function StatusBadge({
  status,
  className,
}: {
  status: ConversationStatus;
  className?: string;
}) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = priorityMeta[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        meta.chip,
      )}
    >
      {meta.label}
    </span>
  );
}

export function PlatformChip({ platform }: { platform: Platform }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      <span className="font-mono text-[10px]">{platformMeta[platform].short}</span>
      {platformMeta[platform].label}
    </span>
  );
}

export function Avatar({
  initials,
  hue,
  size = 40,
}: {
  initials: string;
  hue: number;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display text-xs font-semibold ring-1 ring-border"
      style={{
        width: size,
        height: size,
        background: `oklch(0.955 0.02 ${hue})`,
        color: `oklch(0.42 0.08 ${hue})`,
        fontSize: size * 0.34,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
