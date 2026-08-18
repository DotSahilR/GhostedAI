import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ranges = [7, 30, 90] as const;

interface DateRangeSwitchProps {
  value: number;
  onChange: (days: number) => void;
}

export function DateRangeSwitch({ value, onChange }: DateRangeSwitchProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-surface-1 p-0.5">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            value === range ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === range && (
            <motion.span
              layoutId="date-range-active"
              className="absolute inset-0 rounded-md bg-surface-3 ring-1 ring-border-strong"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <span className="relative">{range}d</span>
        </button>
      ))}
    </div>
  );
}
