import type { Metadata } from "next";

import { AnalyticsPage } from "@/components/pages/analytics-page";

export const metadata: Metadata = {
  title: "Analytics — Ghosted AI",
  description:
    "Track follow-up performance, response times and conversion trends across every connected channel.",
  openGraph: {
    title: "Analytics — Ghosted AI",
    description:
      "Track follow-up performance, response times and conversion trends across every connected channel.",
  },
};

export default function Analytics() {
  return <AnalyticsPage />;
}
