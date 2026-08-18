import { useState } from "react";
import { toast } from "sonner";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDisconnectAccount, useSyncAccount } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import { platformMeta, type Account } from "@/lib/mock-data";

const glyphs = { gmail: Mail, caspian: Sparkles } as const;
const tints: Record<string, string> = {
  gmail: "text-status-ghosted bg-status-ghosted/10",
  caspian: "text-accent-bright bg-accent/10",
};

const statusMeta = {
  connected: { label: "Connected", chip: "bg-status-completed/10 text-status-completed border-status-completed/25" },
  error: { label: "Needs attention", chip: "bg-status-waiting/10 text-status-waiting border-status-waiting/25" },
  disconnected: { label: "Not connected", chip: "bg-surface-2 text-subtle border-border" },
} as const;

export function AccountCard({ account }: { account: Account }) {
  const [status, setStatus] = useState(account.status);
  const sync = useSyncAccount(account.platform);
  const disconnect = useDisconnectAccount(account.platform);
  const loading = sync.isPending || disconnect.isPending;
  const Glyph = glyphs[account.platform];
  const meta = statusMeta[status];

  const handleSync = () => {
    if (!account.id) {
      toast("This channel is not connected yet");
      return;
    }
    sync.mutate({ accountId: account.id }, {
      onSuccess: () => {
        setStatus("connected");
        toast.success(`${platformMeta[account.platform].label} synced`);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Sync failed"),
    });
  };

  const handleDisconnect = () => {
    if (!account.id) return;
    disconnect.mutate(account.id, {
      onSuccess: () => {
        setStatus("disconnected");
        toast.success(`${platformMeta[account.platform].label} disconnected`);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Disconnect failed"),
    });
  };

  return (
    <Card className="border-border bg-surface-1">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", tints[account.platform])}>
            <Glyph className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{platformMeta[account.platform].label}</p>
            <p className="text-xs text-muted-foreground">{account.description}</p>
          </div>
        </div>
        <span className={cn("inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", meta.chip)}>
          {meta.label}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{account.account}</span>
          <span>Last sync: {account.lastSync}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {account.permissions.map((p) => (
            <span key={p} className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
              {p}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {status === "connected" && (
            <>
              <Button size="sm" variant="outline" disabled={loading} onClick={handleSync}>
                {loading && <Loader2 className="size-3.5 animate-spin" />} Sync now
              </Button>
              <Button size="sm" variant="ghost" disabled={loading} onClick={handleDisconnect} className="text-status-ghosted hover:text-status-ghosted">
                Disconnect
              </Button>
            </>
          )}
          {status === "error" && (
            <Button size="sm" disabled={loading} onClick={handleSync}>
              {loading && <Loader2 className="size-3.5 animate-spin" />} Reconnect
            </Button>
          )}
          {status === "disconnected" && (
            <Button size="sm" disabled={loading} onClick={() => toast("Connect from the onboarding flow")}>
              {loading && <Loader2 className="size-3.5 animate-spin" />} Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
