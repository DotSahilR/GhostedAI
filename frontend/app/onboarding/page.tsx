import type { Metadata } from "next";

import { OnboardingPage } from "@/components/pages/onboarding-page";

export const metadata: Metadata = {
  title: "Get started — Ghosted AI",
  description:
    "Set up Ghosted AI in minutes: connect your accounts, choose a profile and define your automation rules.",
  openGraph: {
    title: "Get started — Ghosted AI",
    description: "Onboard your autonomous follow-up agent.",
  },
};

export default function Onboarding() {
  return <OnboardingPage />;
}
