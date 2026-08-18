import type { Metadata } from "next";

import { AccountsPage } from "@/components/pages/accounts-page";

export const metadata: Metadata = {
  title: "Connected Accounts — Ghosted AI",
  description:
    "Manage the inboxes and messaging apps Ghosted AI monitors on your behalf.",
  openGraph: {
    title: "Connected Accounts — Ghosted AI",
    description: "Manage the inboxes and messaging apps Ghosted AI monitors on your behalf.",
  },
};

export default function Accounts() {
  return <AccountsPage />;
}
