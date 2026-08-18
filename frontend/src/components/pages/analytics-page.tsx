"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { KpiStrip } from "@/components/analytics/kpi-strip";
import { DateRangeSwitch } from "@/components/analytics/date-range";
import { InsightsPanel } from "@/components/analytics/insights";
import {
  WeeklyActivityChart,
  MonthlyPerformanceChart,
  PlatformDistributionChart,
  PriorityDistributionChart,
  CompletionFunnelChart,
} from "@/components/analytics/charts";
import { DataState } from "@/components/shared/data-state";
import { useAnalytics } from "@/hooks/use-data";

export function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, error, refetch } = useAnalytics(days);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Analytics"
        description="A closer look at how your follow-up automation is performing across every tracked thread."
        actions={<DateRangeSwitch value={days} onChange={setDays} />}
      />
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
        <DataState isLoading={isLoading} isError={isError} error={error} onRetry={() => void refetch()}>
          {data ? (
            <div className="flex flex-col gap-6">
              <KpiStrip kpis={data.kpis} />
              <div className="grid gap-4 lg:grid-cols-2">
                <WeeklyActivityChart data={data.series.weekly} />
                <MonthlyPerformanceChart data={data.series.monthly} />
                <PlatformDistributionChart data={data.platforms} />
                <PriorityDistributionChart data={data.priorities} />
                <CompletionFunnelChart funnel={data.funnel} />
              </div>
              <InsightsPanel insights={data.insights} />
            </div>
          ) : null}
        </DataState>
      </div>
    </div>
  );
}
