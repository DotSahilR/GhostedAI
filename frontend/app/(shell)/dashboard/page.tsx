import type { Metadata } from "next";

import { DashboardPage } from "@/components/pages/dashboard-page";

export const metadata: Metadata = {
  title: "Your Follow-ups Today — Ghosted AI",
  description:
    "See who hasn't replied, which conversations need attention today, and what Ghosted AI recommends you do next.",
  openGraph: {
    title: "Your Follow-ups Today — Ghosted AI",
    description:
      "A calm, simple dashboard that answers one question: who do I need to follow up with today?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Dashboard() {
  return <DashboardPage />;
}
