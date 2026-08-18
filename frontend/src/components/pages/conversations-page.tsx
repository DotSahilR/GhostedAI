"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";

import { PageHeader } from "@/components/app/app-shell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConversationCard, ConversationRow } from "@/components/conversations/conversation-card";
import { EmptyState } from "@/components/conversations/empty-state";
import { DataState } from "@/components/shared/data-state";
import { useConversations } from "@/hooks/use-data";
import {
  statusMeta,
  priorityMeta,
  platformMeta,
  type Category,
  type ConversationStatus,
  type Priority,
  type Platform,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "oldest" | "priority" | "longest-waiting";

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function ConversationsPage() {
  const conversationsQuery = useConversations();
  const { data: conversations = [] } = conversationsQuery;
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [status, setStatus] = useState<ConversationStatus | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const categories = useMemo(
    () => Array.from(new Set(conversations.map((c) => c.category))) as Category[],
    [conversations],
  );

  const filtered = useMemo(() => {
    let list = conversations.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q);
      return (
        matchesQuery &&
        (status === "all" || c.status === status) &&
        (priority === "all" || c.priority === priority) &&
        (platform === "all" || c.platform === platform) &&
        (category === "all" || c.category === category)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.daysWaiting - b.daysWaiting;
        case "priority":
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "longest-waiting":
          return b.daysWaiting - a.daysWaiting;
        case "newest":
        default:
          return b.daysWaiting - a.daysWaiting === 0 ? 0 : a.daysWaiting - b.daysWaiting;
      }
    });

    return list;
  }, [query, status, priority, platform, category, sort, conversations]);

  const activeFilters = [
    status !== "all" ? { key: "status", label: statusMeta[status].label, clear: () => setStatus("all") } : null,
    priority !== "all"
      ? { key: "priority", label: priorityMeta[priority].label + " priority", clear: () => setPriority("all") }
      : null,
    platform !== "all"
      ? { key: "platform", label: platformMeta[platform].label, clear: () => setPlatform("all") }
      : null,
    category !== "all" ? { key: "category", label: category, clear: () => setCategory("all") } : null,
    query.trim() ? { key: "query", label: `“${query.trim()}”`, clear: () => setQuery("") } : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setQuery("");
    setStatus("all");
    setPriority("all");
    setPlatform("all");
    setCategory("all");
  };

  return (
    <div>
      <PageHeader
        title="Conversations"
        description="Every thread Ghosted AI is tracking across your connected accounts, with live status and priority."
      />

      <div className="px-4 py-6 lg:px-8">
        <DataState
          isLoading={conversationsQuery.isLoading}
          isError={conversationsQuery.isError}
          error={conversationsQuery.error}
          onRetry={() => void conversationsQuery.refetch()}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, company or subject…"
                className="h-9 bg-surface-1 pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={(v) => setStatus(v as ConversationStatus | "all")}>
                <SelectTrigger className="h-9 w-[150px] bg-surface-1 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(statusMeta).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "all")}>
                <SelectTrigger className="h-9 w-[130px] bg-surface-1 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priority</SelectItem>
                  {Object.entries(priorityMeta).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform | "all")}>
                <SelectTrigger className="h-9 w-[130px] bg-surface-1 text-xs">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  {Object.entries(platformMeta).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
                <SelectTrigger className="h-9 w-[150px] bg-surface-1 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-9 w-[160px] bg-surface-1 text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="longest-waiting">Longest waiting</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-surface-1 p-0.5 md:ml-0">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "grid size-8 place-items-center rounded-sm transition-colors",
                    view === "grid" ? "bg-surface-3 text-foreground" : "text-subtle hover:text-foreground",
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "grid size-8 place-items-center rounded-sm transition-colors",
                    view === "list" ? "bg-surface-3 text-foreground" : "text-subtle hover:text-foreground",
                  )}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {f.label}
                  <X className="size-3" />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-subtle">
          {filtered.length} conversation{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState onClear={clearAll} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c, i) => (
                <ConversationCard key={c.id} conversation={c} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((c, i) => (
                <ConversationRow key={c.id} conversation={c} index={i} />
              ))}
            </div>
          )}
        </div>
        </DataState>
      </div>
    </div>
  );
}
