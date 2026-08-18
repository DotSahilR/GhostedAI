import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence } from "motion/react";

import { KanbanCard } from "./kanban-card";
import type { Conversation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function KanbanColumn({
  id,
  title,
  dotClass,
  items,
}: {
  id: string;
  title: string;
  dotClass: string;
  items: Conversation[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col rounded-lg border border-border bg-surface-1/40 sm:w-[300px]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <span className={cn("size-2 shrink-0 rounded-full", dotClass)} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2.5 p-2.5 transition-colors",
          isOver && "bg-primary/5",
        )}
      >
        <AnimatePresence initial={false}>
          {items.map((c) => (
            <KanbanCard key={c.id} conversation={c} />
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="grid flex-1 place-items-center rounded-md border border-dashed border-border py-8 text-center text-[11px] text-subtle">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
