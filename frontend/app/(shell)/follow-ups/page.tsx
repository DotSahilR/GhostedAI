import type { Metadata } from "next";

import { FollowUpsPage } from "@/components/pages/follow-ups-page";

export const metadata: Metadata = {
  title: "Follow-ups — Ghosted AI",
  description:
    "Drag conversations across your follow-up pipeline: Waiting, Needs Review, Ready to Send, Sent and Completed.",
  openGraph: {
    title: "Follow-ups — Ghosted AI",
    description: "Your follow-up pipeline as a drag-and-drop board.",
  },
};

export default function FollowUps() {
  return <FollowUpsPage />;
}
