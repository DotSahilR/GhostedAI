"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Clock, Sparkles, Send, Reply, CheckCircle2 } from "lucide-react";

const nodes = [
  { label: "Email", icon: Mail },
  { label: "Waiting", icon: Clock },
  { label: "AI", icon: Sparkles },
  { label: "Follow-up", icon: Send },
  { label: "Reply", icon: Reply },
  { label: "Success", icon: CheckCircle2 },
];

export function PipelineHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % nodes.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface-1 p-6 sm:p-10">
      <div className="hairline-grid pointer-events-none absolute inset-0 rounded-2xl opacity-40" />
      <div className="relative flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        {nodes.map((n, i) => {
          const isActive = i === active;
          const isDone = i < active;
          const Icon = n.icon;
          return (
            <div key={n.label} className="relative flex flex-1 flex-col items-center gap-3">
              <div className="flex w-full items-center">
                <motion.div
                  className="relative z-10 grid size-14 shrink-0 place-items-center rounded-xl border"
                  animate={{
                    borderColor: isActive
                      ? "var(--primary)"
                      : isDone
                        ? "var(--accent-bright)"
                        : "var(--border)",
                    backgroundColor: isActive ? "var(--surface-2)" : "var(--surface-1)",
                    scale: isActive ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-xl bg-primary/20"
                      animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  <Icon
                    className="relative size-6"
                    style={{
                      color: isActive
                        ? "var(--primary)"
                        : isDone
                          ? "var(--accent-bright)"
                          : "var(--muted-foreground)",
                    }}
                  />
                </motion.div>
                {i < nodes.length - 1 && (
                  <div className="relative mx-1 hidden h-px flex-1 overflow-hidden bg-border sm:block">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent-bright"
                      animate={{ width: i < active ? "100%" : "0%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                )}
              </div>
              <span
                className="text-xs font-medium transition-colors sm:absolute sm:top-16"
                style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                {n.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-10 border-t border-border pt-4 text-center sm:mt-16">
        <p className="text-xs text-subtle">
          Live pipeline preview — this is what Ghosted AI runs on every tracked conversation.
        </p>
      </div>
    </div>
  );
}
