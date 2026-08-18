import { cn } from "@/lib/utils";

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-8 place-items-center rounded-md bg-surface-1 ring-1 ring-border">
        <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
          <defs>
            <linearGradient id="ghosted-mark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent-bright)" />
            </linearGradient>
          </defs>
          <path
            d="M12 2.5c-4 0-7 3-7 6.9v11.2l2.4-1.8 2.3 1.8 2.3-1.8 2.3 1.8 2.4-1.8 2.3 1.8V9.4c0-3.9-3-6.9-7-6.9Z"
            fill="url(#ghosted-mark)"
          />
          <circle cx="9.4" cy="9.6" r="1.25" fill="var(--background)" />
          <circle cx="14.6" cy="9.6" r="1.25" fill="var(--background)" />
        </svg>
      </span>
      {showWord && (
        <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
          Ghosted<span className="text-muted-foreground"> AI</span>
        </span>
      )}
    </span>
  );
}
