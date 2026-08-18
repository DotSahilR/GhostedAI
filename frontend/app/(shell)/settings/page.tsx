import type { Metadata } from "next";

import { SettingsPage } from "@/components/pages/settings-page";

export const metadata: Metadata = {
  title: "Settings — Ghosted AI",
  description:
    "Manage your Ghosted AI profile, workspace, appearance, notifications, automation and security preferences.",
  openGraph: {
    title: "Settings — Ghosted AI",
    description: "Profile, workspace, notifications and security settings for your follow-up agent.",
  },
};

export default function Settings() {
  return <SettingsPage />;
}
