import type { ReactNode } from "react";

import { RequireAuth } from "@/lib/session";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
