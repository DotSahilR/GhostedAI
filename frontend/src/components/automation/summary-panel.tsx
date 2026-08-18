import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function SummaryPanel({
  tracked,
  waitDays,
  autoSend,
  maxFollowUps,
  tone,
  channels,
}: {
  tracked: string[];
  waitDays: number;
  autoSend: boolean;
  maxFollowUps: number;
  tone: string;
  channels: string[];
}) {
  const trackedLabel =
    tracked.length === 0
      ? "nothing yet"
      : tracked.length === 1
        ? tracked[0]
        : `${tracked.slice(0, -1).join(", ")} and ${tracked[tracked.length - 1]}`;

  return (
    <Card className="sticky top-20 border-border bg-surface-1">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4 text-accent-bright" />
        <CardTitle className="text-sm font-semibold text-foreground">Rule summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-foreground">
          Track <span className="font-semibold text-accent-bright">{trackedLabel}</span>, wait{" "}
          <span className="font-semibold text-accent-bright">{waitDays} day{waitDays === 1 ? "" : "s"}</span>, then{" "}
          {autoSend ? (
            <>
              automatically send up to{" "}
              <span className="font-semibold text-accent-bright">
                {maxFollowUps} {tone} follow-up{maxFollowUps === 1 ? "" : "s"}
              </span>
              .
            </>
          ) : (
            <>
              draft up to{" "}
              <span className="font-semibold text-accent-bright">
                {maxFollowUps} {tone} follow-up{maxFollowUps === 1 ? "" : "s"}
              </span>{" "}
              for your review.
            </>
          )}
        </p>
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Alerts sent via</p>
          <p className="mt-1 text-sm text-foreground">
            {channels.length ? channels.join(", ") : "No reminder channels selected"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
