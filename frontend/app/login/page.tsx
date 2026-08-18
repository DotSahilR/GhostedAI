import type { Metadata } from "next";

import { LoginPage } from "@/components/pages/login-page";

export const metadata: Metadata = {
  title: "Log in — Ghosted AI",
  description: "Log in to Ghosted AI to manage your tracked conversations and follow-ups.",
  openGraph: {
    title: "Log in — Ghosted AI",
    description: "Access your autonomous follow-up dashboard.",
  },
};

export default function Login() {
  return <LoginPage />;
}
