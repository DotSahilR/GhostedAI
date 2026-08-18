import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { ApiAnalyticsSummary } from "@/lib/api/types";

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

interface KpiCardProps {
  label: string;
  value: number;
  format: (value: number) => string;
  index: number;
}

function KpiCard({ label, value, format, index }: KpiCardProps) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="surface-card rounded-xl border border-border bg-surface-1 p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {format(animated)}
        </span>
      </div>
    </motion.div>
  );
}

export function KpiStrip({ kpis }: { kpis: ApiAnalyticsSummary["kpis"] }) {
  const cards: Omit<KpiCardProps, "index">[] = [
    { label: "Tracked", value: kpis.tracked, format: (v) => Math.round(v).toLocaleString() },
    { label: "Follow-ups sent", value: kpis.sent, format: (v) => Math.round(v).toLocaleString() },
    { label: "Replies received", value: kpis.replies, format: (v) => Math.round(v).toLocaleString() },
    { label: "Reply rate", value: kpis.responseRate, format: (v) => `${Math.round(v)}%` },
    { label: "Avg. response", value: kpis.avgResponseHours, format: (v) => `${Math.round(v)}h` },
    { label: "Pipeline value", value: kpis.opportunityValue, format: (v) => `$${Math.round(v)}K` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((kpi, i) => (
        <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} format={kpi.format} index={i} />
      ))}
    </div>
  );
}
