import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Check, FileEdit, RefreshCw, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import type { Draft } from "@/lib/mock-data";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface DraftCardProps {
  draft: Draft;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onApprove?: () => void;
  onSave?: (body: string, subject: string) => void;
  onSend?: (body: string, subject: string) => void;
  generating?: boolean;
  regenerating?: boolean;
  approving?: boolean;
  sending?: boolean;
}

export function DraftCard({
  draft,
  onGenerate,
  onRegenerate,
  onApprove,
  onSave,
  onSend,
  generating,
  regenerating,
  approving,
  sending,
}: DraftCardProps) {
  const [body, setBody] = useState(draft.body);
  const [subject, setSubject] = useState(draft.subject);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(body);
  const [approved, setApproved] = useState(false);

  const hasDraft = Boolean(draft.id);
  const busy = Boolean(generating || regenerating || approving || sending);

  const handleApprove = () => {
    setApproved(true);
    if (onApprove) onApprove();
  };

  const handleSave = () => {
    setBody(draftText);
    setSubject(subject);
    setEditing(false);
    if (onSave) {
      onSave(draftText, subject);
    } else {
      toast("Edits saved");
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    } else {
      toast.success("Draft regenerated with a fresh variant");
    }
  };

  return (
    <div className="surface-card rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
          {hasDraft ? <FileEdit className="size-4" /> : <Sparkles className="size-4" />}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Generated Follow-up</p>
          <p className="text-xs text-subtle">
            {hasDraft ? `Generated ${draft.generatedAt} · variant ${draft.variant}` : "No draft yet"}
          </p>
        </div>
        {approved && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-status-completed/25 bg-status-completed/10 px-2 py-0.5 text-[11px] font-semibold text-status-completed">
            <Check className="size-3" />
            Approved
          </span>
        )}
      </div>

      {generating ? (
        <div className="mt-4 space-y-2 rounded-md border border-border bg-surface-1 p-4">
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      ) : !hasDraft ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-surface-1/50 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Ghosted AI hasn't drafted a follow-up for this conversation yet.
          </p>
          <Button size="sm" className="gap-1.5" onClick={onGenerate} disabled={busy}>
            <Sparkles className="size-3.5" />
            Generate follow-up
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-md border border-border bg-surface-1 px-3 py-2">
            <p className="text-[11px] text-subtle">Subject</p>
            {editing ? (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
              />
            ) : (
              <p className="text-sm font-medium text-foreground">{subject}</p>
            )}
          </div>

          <div className="mt-3">
            {regenerating ? (
              <div className="space-y-2 rounded-md border border-border bg-surface-1 p-4">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            ) : editing ? (
              <Textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={10}
                className="resize-none bg-surface-1 font-mono text-sm leading-relaxed"
              />
            ) : (
              <motion.pre
                key={body}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-pre-wrap rounded-md border border-border bg-surface-1 p-4 font-mono text-[13px] leading-relaxed text-foreground"
              >
                {body}
              </motion.pre>
            )}
          </div>

          <p className="mt-2 text-[11px] text-subtle">{wordCount(editing ? draftText : body)} words</p>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleApprove}
              disabled={approved || busy}
            >
              <Check className="size-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={() => {
                if (editing) {
                  handleSave();
                } else {
                  setDraftText(body);
                  setEditing(true);
                }
              }}
            >
              {editing ? <Check className="size-3.5" /> : <FileEdit className="size-3.5" />}
              {editing ? "Save" : "Edit"}
            </Button>
            {editing && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground"
                onClick={() => {
                  setDraftText(body);
                  setEditing(false);
                }}
              >
                <X className="size-3.5" />
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className={`size-3.5 ${regenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto gap-1.5"
              onClick={() => {
                if (onSend) {
                  const currentBody = editing ? draftText : body;
                  const currentSubject = editing ? subject : subject;
                  onSend(currentBody, currentSubject);
                } else {
                  toast.success("Follow-up sent successfully");
                }
              }}
              disabled={busy}
            >
              <Send className="size-3.5" />
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
