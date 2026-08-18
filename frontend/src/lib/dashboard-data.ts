
export type SimpleStatus = "waiting" | "needs-follow-up" | "completed";

export interface AttentionItem {
  id: string;
  name: string;
  company: string;
  initials: string;
  avatarHue: number;
  title: string;
  platform: "gmail" | "telegram" | "caspian";
  daysWaiting: number;
  status: SimpleStatus;
  explanation: string;
  recommendation: string;
  lastMessageDirection?: "inbound" | "outbound" | null;
}

export const simpleStatusMeta: Record<SimpleStatus, { label: string; chip: string }> = {
  waiting: {
    label: "Waiting",
    chip: "border-status-waiting/25 bg-status-waiting/10 text-status-waiting",
  },
  "needs-follow-up": {
    label: "Needs Follow-up",
    chip: "border-status-ghosted/25 bg-status-ghosted/10 text-status-ghosted",
  },
  completed: {
    label: "Completed",
    chip: "border-status-completed/25 bg-status-completed/10 text-status-completed",
  },
};
