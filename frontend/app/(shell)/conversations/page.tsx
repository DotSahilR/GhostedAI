import type { Metadata } from "next";

import { ConversationsPage } from "@/components/pages/conversations-page";

export const metadata: Metadata = {
  title: "Conversations — Ghosted AI",
  description:
    "Browse every tracked conversation across Gmail, Slack, Telegram, WhatsApp and Discord, filter by status, priority and platform.",
  openGraph: {
    title: "Conversations — Ghosted AI",
    description: "Every tracked conversation, filterable by status, priority, platform and category.",
  },
};

export default function Conversations() {
  return <ConversationsPage />;
}
