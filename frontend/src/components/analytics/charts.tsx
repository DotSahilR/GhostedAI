import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiAnalyticsSummary } from "@/lib/api/types";

const weeklyConfig = {
  sent: { label: "Sent", color: "var(--chart-1)" },
  replies: { label: "Replies", color: "var(--chart-5)" },
} satisfies ChartConfig;

const monthlyConfig = {
  sent: { label: "Sent", color: "var(--chart-1)" },
  replies: { label: "Replies", color: "var(--chart-5)" },
} satisfies ChartConfig;

const platformColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const priorityColors = ["var(--status-ghosted)", "var(--status-waiting)", "var(--surface-3)"];

function buildConfig(entries: { name: string }[], colors: string[]): ChartConfig {
  return entries.reduce((acc, entry, i) => {
    acc[entry.name] = { label: entry.name, color: colors[i % colors.length] ?? "var(--chart-1)" };
    return acc;
  }, {} as ChartConfig);
}

export function WeeklyActivityChart({ data }: { data: ApiAnalyticsSummary["series"]["weekly"] }) {
  return (
    <Card className="border-border bg-surface-1">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Weekly activity</CardTitle>
        <p className="text-xs text-muted-foreground">Follow-ups sent vs. replies received</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={weeklyConfig} className="h-64 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={28} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="sent" fill="var(--color-sent)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="replies" fill="var(--color-replies)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MonthlyPerformanceChart({ data }: { data: ApiAnalyticsSummary["series"]["monthly"] }) {
  return (
    <Card className="border-border bg-surface-1">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Monthly performance</CardTitle>
        <p className="text-xs text-muted-foreground">Follow-ups sent and replies received over time</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={monthlyConfig} className="h-64 w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-sent)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillReplies" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-replies)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--color-replies)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={28} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area dataKey="sent" type="monotone" stroke="var(--color-sent)" fill="url(#fillSent)" strokeWidth={2} />
            <Area dataKey="replies" type="monotone" stroke="var(--color-replies)" fill="url(#fillReplies)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function PlatformDistributionChart({ data }: { data: ApiAnalyticsSummary["platforms"] }) {
  const config = buildConfig(
    data.map((entry) => ({ name: entry.platform })),
    platformColors,
  );
  const total = data.reduce((a, b) => a + b.count, 0) || 1;
  return (
    <Card className="border-border bg-surface-1">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Platform distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Where tracked conversations originate</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <ChartContainer config={config} className="mx-auto aspect-square h-52 w-52">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="platform" hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="platform" innerRadius={55} outerRadius={80} strokeWidth={3} stroke="var(--surface-1)">
              {data.map((entry, i) => (
                <Cell key={entry.platform} fill={platformColors[i % platformColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex w-full flex-col gap-2">
          {data.map((p, i) => (
            <div key={p.platform} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ background: platformColors[i % platformColors.length] }} />
                {p.platform}
              </span>
              <span className="font-mono text-xs text-foreground">{Math.round((p.count / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PriorityDistributionChart({ data }: { data: ApiAnalyticsSummary["priorities"] }) {
  const config = buildConfig(
    data.map((entry) => ({ name: entry.priority })),
    priorityColors,
  );
  const total = data.reduce((a, b) => a + b.count, 0) || 1;
  return (
    <Card className="border-border bg-surface-1">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Priority distribution</CardTitle>
        <p className="text-xs text-muted-foreground">AI-assigned priority across tracked threads</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <ChartContainer config={config} className="mx-auto aspect-square h-52 w-52">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="priority" hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="priority" innerRadius={55} outerRadius={80} strokeWidth={3} stroke="var(--surface-1)">
              {data.map((entry, i) => (
                <Cell key={entry.priority} fill={priorityColors[i % priorityColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex w-full flex-col gap-2">
          {data.map((p, i) => (
            <div key={p.priority} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ background: priorityColors[i % priorityColors.length] }} />
                {p.priority}
              </span>
              <span className="font-mono text-xs text-foreground">{Math.round((p.count / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletionFunnelChart({ funnel }: { funnel: ApiAnalyticsSummary["funnel"] }) {
  const stages = [
    { stage: "Waiting", value: funnel.waiting },
    { stage: "Needs follow-up", value: funnel.needsFollowup },
    { stage: "Completed", value: funnel.completed },
    { stage: "Paused", value: funnel.paused },
    { stage: "Archived", value: funnel.archived },
  ];
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <Card className="border-border bg-surface-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Conversation funnel</CardTitle>
        <p className="text-xs text-muted-foreground">Where tracked threads stand today</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {stages.map((stage, i) => {
          const pct = (stage.value / max) * 100;
          const prev = i > 0 ? stages[i - 1]?.value : null;
          const drop = prev ? Math.round(((prev - stage.value) / prev) * 100) : null;
          return (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-sm font-medium text-foreground">{stage.stage}</span>
              <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-surface-2">
                <div
                  className="h-full rounded-md"
                  style={{
                    width: `${pct}%`,
                    background: "var(--chart-1)",
                  }}
                />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-sm text-foreground">{stage.value}</span>
              <span className="w-16 shrink-0 text-right text-xs text-status-ghosted">
                {drop !== null ? `-${drop}%` : ""}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
