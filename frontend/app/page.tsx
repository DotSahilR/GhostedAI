import type { Metadata } from "next";

import { SiteNav } from "@/components/marketing/site-nav";
import { Hero } from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "Ghosted AI — Never let an important conversation die",
  description:
    "Ghosted AI automatically tracks important conversations, detects overdue replies, generates intelligent follow-ups, and sends them across Gmail, Slack, Telegram, WhatsApp and Discord.",
  openGraph: {
    title: "Ghosted AI — Never let an important conversation die",
    description:
      "Your autonomous AI follow-up agent. It tracks, detects, drafts and sends — so you never lose a deal to a full inbox again.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteNav />
      <main>
        <div className="h-16 bg-[#0a0a0a]" aria-hidden="true" />
        <Hero />
      </main>
    </div>
  );
}
