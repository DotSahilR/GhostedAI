"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/app-shell";
import { KanbanColumn } from "@/components/followups/kanban-column";
import { DataState } from "@/components/shared/data-state";
import { useConversations, useUpdateConversation } from "@/hooks/use-data";
import { platformMeta, type Conversation, type Platform } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ColumnKey = "waiting" | "needs-review" | "ready" | "sent" | "completed";

const columns: { key: ColumnKey; title: string; dotClass: string }[] = [
  { key: "waiting", title: "Waiting", dotClass: "bg-status-waiting" },
  { key: "needs-review", title: "Needs Review", dotClass: "bg-status-review" },
  { key: "ready", title: "Ready to Send", dotClass: "bg-status-ready" },
  { key: "sent", title: "Sent", dotClass: "bg-status-sent" },
  { key: "completed", title: "Completed", dotClass: "bg-status-completed" },
];

function columnForStatus(conversation: Conversation): ColumnKey {
  switch (conversation.status) {
    case "waiting":
      return "waiting";
    case "needs-review":
      return "needs-review";
    case "follow-up-ready":
      return conversation.followUpsSent > 0 ? "sent" : "ready";
    case "sent":
      return "sent";
    case "reply-received":
    case "completed":
      return "completed";
    default:
      return "waiting";
  }
}

const columnToStatus: Record<ColumnKey, "waiting" | "needs_followup" | "completed"> = {
  waiting: "waiting",
  "needs-review": "needs_followup",
  ready: "needs_followup",
  sent: "needs_followup",
  completed: "completed",
};

export function FollowUpsPage() {
  const conversationsQuery = useConversations();
  const { data: conversations = [] } = conversationsQuery;
  const updateConversation = useUpdateConversation();
  const [placement, setPlacement] = useState<Map<string, ColumnKey>>(new Map());
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || conversations.length === 0) return;
    const map = new Map<string, ColumnKey>();
    for (const c of conversations) {
      if (["archived", "paused"].includes(c.status)) continue;
      map.set(c.id, columnForStatus(c));
    }
    setPlacement(map);
    seeded.current = true;
  }, [conversations]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const boardConversations = useMemo(
    () =>
      conversations.filter(
        (c) => placement.has(c.id) && (platformFilter === "all" || c.platform === platformFilter),
      ),
    [conversations, placement, platformFilter],
  );

  const byColumn = useMemo(() => {
    const grouped: Record<ColumnKey, Conversation[]> = {
      waiting: [],
      "needs-review": [],
      ready: [],
      sent: [],
      completed: [],
    };
    for (const c of boardConversations) {
      const col = placement.get(c.id);
      if (col) grouped[col].push(c);
    }
    return grouped;
  }, [boardConversations, placement]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const conversationId = String(active.id);
    const targetColumn = String(over.id) as ColumnKey;
    const currentColumn = placement.get(conversationId);
    if (!columns.find((c) => c.key === targetColumn) || currentColumn === targetColumn) return;

    const conversation = conversations.find((c) => c.id === conversationId);
    const columnTitle = columns.find((c) => c.key === targetColumn)?.title;

    setPlacement((prev) => {
      const next = new Map(prev);
      next.set(conversationId, targetColumn);
      return next;
    });

    updateConversation.mutate(
      { id: conversationId, data: { status: columnToStatus[targetColumn] } },
      {
        onSuccess: () => toast.success(`${conversation?.name ?? "Conversation"} moved to ${columnTitle}`),
        onError: (error) => {
          setPlacement((prev) => {
            const next = new Map(prev);
            if (currentColumn) next.set(conversationId, currentColumn);
            return next;
          });
          toast.error(error instanceof Error ? error.message : "Failed to update status");
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Your live follow-up pipeline. Drag conversations between stages to update their status."
      />

      <div className="px-4 py-6 lg:px-8">
        <DataState
          isLoading={conversationsQuery.isLoading}
          isError={conversationsQuery.isError}
          error={conversationsQuery.error}
          onRetry={() => void conversationsQuery.refetch()}
        >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Platform:</span>
          <div className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-surface-1 p-0.5">
            <button
              onClick={() => setPlatformFilter("all")}
              className={cn(
                "rounded-[5px] px-2.5 py-1.5 text-xs font-semibold transition-colors",
                platformFilter === "all" ? "bg-surface-3 text-foreground" : "text-subtle hover:text-foreground",
              )}
            >
              All
            </button>
            {Object.entries(platformMeta).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setPlatformFilter(key as Platform)}
                className={cn(
                  "rounded-[5px] px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  platformFilter === key ? "bg-surface-3 text-foreground" : "text-subtle hover:text-foreground",
                )}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:overflow-visible">
            {columns.map((col) => (
              <KanbanColumn
                key={col.key}
                id={col.key}
                title={col.title}
                dotClass={col.dotClass}
                items={byColumn[col.key]}
              />
            ))}
          </div>
        </DndContext>
        </DataState>
      </div>
    </div>
  );
}
