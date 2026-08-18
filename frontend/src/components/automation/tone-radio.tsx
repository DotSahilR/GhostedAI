import { cn } from "@/lib/utils";

export const tones = [
  {
    id: "professional",
    label: "Professional",
    sample: "\"Just circling back on this — happy to hop on a quick call if that's easier. Let me know either way.\"",
  },
  {
    id: "friendly",
    label: "Friendly",
    sample: "\"Hey! Just floating this back up in case it slipped through — no rush, just let me know what you think 🙂\"",
  },
  {
    id: "formal",
    label: "Formal",
    sample: "\"I am writing to follow up on the message below. Please let me know if you require any additional information.\"",
  },
] as const;

export type ToneId = (typeof tones)[number]["id"];

export function ToneRadio({ value, onChange }: { value: ToneId; onChange: (v: ToneId) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tones.map((tone) => (
        <button
          type="button"
          key={tone.id}
          onClick={() => onChange(tone.id)}
          className={cn(
            "flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
            value === tone.id
              ? "border-primary bg-primary/5"
              : "border-border bg-surface-2 hover:border-border-strong",
          )}
        >
          <span className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{tone.label}</span>
            <span
              className={cn(
                "size-3.5 shrink-0 rounded-full border",
                value === tone.id ? "border-primary bg-primary" : "border-border",
              )}
            />
          </span>
          <span className="text-xs italic leading-relaxed text-muted-foreground">{tone.sample}</span>
        </button>
      ))}
    </div>
  );
}
