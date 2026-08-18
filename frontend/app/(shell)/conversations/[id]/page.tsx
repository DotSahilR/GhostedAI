import type { Metadata } from "next";

import { ConversationDetailPage } from "@/components/pages/conversation-detail-page";

interface ConversationDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ConversationDetailProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Conversation ${id} — Ghosted AI`,
    description: "Timeline, AI analysis and generated follow-up for a tracked conversation.",
  };
}

export default async function ConversationDetail({ params }: ConversationDetailProps) {
  const { id } = await params;
  return <ConversationDetailPage id={id} />;
}
