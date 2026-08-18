import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface-1/40 px-6 py-20 text-center">
      <div className="grid size-14 place-items-center rounded-full border border-border bg-surface-2">
        <Inbox className="size-6 text-subtle" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">No conversations match your filters</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try adjusting your search or clearing filters to see more results.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}
