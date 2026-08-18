import type { Metadata } from "next";

import { AutomationPage } from "@/components/pages/automation-page";

export const metadata: Metadata = {
  title: "Automation Rules — Ghosted AI",
  description:
    "Configure what Ghosted AI tracks, how long it waits, and how it follows up on your behalf.",
  openGraph: {
    title: "Automation Rules — Ghosted AI",
    description: "Configure what Ghosted AI tracks, how long it waits, and how it follows up on your behalf.",
  },
};

export default function Automation() {
  return <AutomationPage />;
}
