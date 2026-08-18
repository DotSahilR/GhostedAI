import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireAuth } from "@/lib/session";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
