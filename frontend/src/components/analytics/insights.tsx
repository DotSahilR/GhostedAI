import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiAnalyticsSummary } from "@/lib/api/types";

export function InsightsPanel({ insights }: { insights: ApiAnalyticsSummary["insights"] }) {
  return (
    <Card className="border-border bg-surface-1">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4 text-accent-bright" />
        <CardTitle className="text-sm font-semibold text-foreground">AI insights</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-3">
            Not enough activity yet to surface insights.
          </p>
        ) : (
          insights.map((insight) => (
            <div key={insight.title} className="rounded-lg border border-border bg-surface-2 p-4">
              <p className="text-sm font-semibold text-foreground">{insight.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
