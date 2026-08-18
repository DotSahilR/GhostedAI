import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChipList({
  items,
  onAdd,
  onRemove,
  placeholder,
  tone = "neutral",
}: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
  tone?: "neutral" | "danger";
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              tone === "danger"
                ? "border-status-ghosted/25 bg-status-ghosted/10 text-status-ghosted"
                : "border-border bg-surface-2 text-foreground",
            )}
          >
            {item}
            <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
          placeholder={placeholder}
          className="h-9 bg-surface-2"
        />
        <Button type="button" variant="secondary" size="sm" onClick={submit} className="shrink-0">
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}
