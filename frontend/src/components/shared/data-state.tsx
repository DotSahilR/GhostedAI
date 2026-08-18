"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}

export function DataState({
  isLoading,
  isError,
  error,
  onRetry,
  skeleton,
  children,
}: DataStateProps) {
  if (isLoading) {
    return (
      skeleton ?? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-primary/10" />
          ))}
        </div>
      )
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-1/40 px-6 py-12 text-center">
        <div className="grid size-11 place-items-center rounded-full border border-border bg-surface-2">
          <AlertTriangle className="size-5 text-status-ghosted" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Couldn&apos;t load this data</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {error?.message ?? "Something went wrong while fetching."}
          </p>
        </div>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
