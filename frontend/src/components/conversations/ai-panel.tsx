import { useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AiAnalysis } from "@/lib/mock-data";

const tones = ["Professional", "Friendly", "Formal"] as const;
const urgencies = ["High", "Medium", "Low"] as const;

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-surface-1 p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-[5px] px-2.5 py-1.5 text-xs font-semibold transition-colors",
            value === opt ? "bg-surface-3 text-foreground" : "text-subtle hover:text-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function AiAnalysisCard({ analysis }: { analysis: AiAnalysis }) {
  const [tone, setTone] = useState<(typeof tones)[number]>(analysis.tone);
  const [urgency, setUrgency] = useState<(typeof urgencies)[number]>(analysis.urgency);

  return (
    <div className="surface-card rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-md bg-accent/10 text-accent-bright">
          <BrainCircuit className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">AI Analysis</p>
          <p className="text-xs text-subtle">Generated from thread context</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border bg-surface-1 px-3 py-2">
          <p className="text-subtle">Type</p>
          <p className="mt-0.5 font-semibold text-foreground">{analysis.conversationType}</p>
        </div>
        <div className="rounded-md border border-border bg-surface-1 px-3 py-2">
          <p className="text-subtle">Current status</p>
          <p className="mt-0.5 font-semibold text-foreground">{analysis.status}</p>
        </div>
        <div className="rounded-md border border-border bg-surface-1 px-3 py-2">
          <p className="text-subtle">Priority</p>
          <p className="mt-0.5 font-semibold capitalize text-foreground">{analysis.priority}</p>
        </div>
        <div className="rounded-md border border-border bg-surface-1 px-3 py-2">
          <p className="text-subtle">Recommended wait</p>
          <p className="mt-0.5 font-semibold text-foreground">{analysis.recommendedWait}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-subtle">
            <Sparkles className="size-3.5 text-accent-bright" />
            Confidence score
          </span>
          <span className="font-mono font-semibold text-foreground">{analysis.confidence}%</span>
        </div>
        <Progress value={analysis.confidence} className="mt-2 h-2" />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{analysis.reasoning}</p>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">Tone</span>
          <Segmented value={tone} options={tones} onChange={setTone} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">Urgency</span>
          <Segmented value={urgency} options={urgencies} onChange={setUrgency} />
        </div>
      </div>
    </div>
  );
}
