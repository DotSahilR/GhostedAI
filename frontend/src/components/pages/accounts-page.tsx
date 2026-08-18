"use client";

import { Plus, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataState } from "@/components/shared/data-state";
import {
  useAccounts,
  useConfigStatus,
  useCreateTrackingRule,
  useDeleteTrackingRule,
  useTrackingRules,
} from "@/hooks/use-data";
import { AccountCard } from "@/components/accounts/account-card";

function TrackingRulesCard() {
  const rulesQuery = useTrackingRules();
  const { data: rules = [] } = rulesQuery;
  const create = useCreateTrackingRule();
  const remove = useDeleteTrackingRule();
  const [name, setName] = useState("");
  const [waitDays, setWaitDays] = useState("3");
  const [tone, setTone] = useState("professional");

  const handleCreate = () => {
    if (!name.trim()) return;
    create.mutate(
      {
        name: name.trim(),
        waitMinutes: Number(waitDays) * 24 * 60,
        tone: tone as "professional" | "friendly" | "formal",
        category: null,
      },
      {
        onSuccess: () => {
          setName("");
          toast.success("Tracking rule created");
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Create failed"),
      },
    );
  };

  return (
    <Card className="border-border bg-surface-1">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Tracking rules</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Rules decide when a silent thread becomes a follow-up.
            </p>
          </div>
        </div>

        <DataState
          isLoading={rulesQuery.isLoading}
          isError={rulesQuery.isError}
          error={rulesQuery.error}
          onRetry={() => void rulesQuery.refetch()}
          skeleton={<div className="h-10 animate-pulse rounded-lg bg-primary/10" />}
        >
          <div className="flex flex-col gap-2">
            {rules.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
                No rules yet. Create your first rule below.
              </p>
            )}
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Wait {Math.round(rule.waitMinutes / 1440)}d · {rule.maxFollowUps} max · {rule.tone}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate(rule.id, {
                      onSuccess: () => toast.success("Rule deleted"),
                      onError: (error) =>
                        toast.error(error instanceof Error ? error.message : "Delete failed"),
                    })
                  }
                >
                  {remove.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        </DataState>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="rule-name" className="text-xs">Rule name</Label>
              <Input
                id="rule-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Proposal follow-up"
                className="h-9 bg-surface-1"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Wait</Label>
              <Select value={waitDays} onValueChange={setWaitDays}>
                <SelectTrigger className="h-9 bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 5, 7].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} day{d === 1 ? "" : "s"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-9 bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={create.isPending || !name.trim()} className="self-start">
            {create.isPending && <Loader2 className="size-3.5 animate-spin" />} Add rule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountsPage() {
  const accountsQuery = useAccounts();
  const { data: accounts = [] } = accountsQuery;
  const rulesQuery = useTrackingRules();
  const { data: rules = [] } = rulesQuery;
  const { data: config } = useConfigStatus();
  const isLoading = accountsQuery.isLoading || rulesQuery.isLoading;
  const isError = accountsQuery.isError || rulesQuery.isError;
  const error = accountsQuery.error ?? rulesQuery.error;
  const retry = () => {
    void accountsQuery.refetch();
    void rulesQuery.refetch();
  };

  const connectedCount = accounts.filter((a) => a.status === "connected").length;
  const lastSync = accounts[0]?.lastSync ?? "—";

  return (
    <div className="flex flex-col">
      <PageHeader title="Connected Accounts" description="Every inbox and messaging app Ghosted AI is watching for you, in one place." />
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
        <DataState isLoading={isLoading} isError={isError} error={error} onRetry={retry}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border bg-surface-1">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">Connected accounts</p>
              <p className="mt-2 font-display text-2xl font-semibold text-foreground">{connectedCount} / {accounts.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-surface-1">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">Tracking rules</p>
              <p className="mt-2 font-display text-2xl font-semibold text-foreground">{rules.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-surface-1">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">Last sync</p>
              <p className="mt-2 font-display text-2xl font-semibold text-foreground">{lastSync}</p>
            </CardContent>
          </Card>
        </div>

        <TrackingRulesCard />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-border bg-surface-1/50 px-6 py-14 text-center text-sm text-subtle">
              No channels connected yet. Finish onboarding to start tracking.
            </p>
          )}
          {accounts.map((account) => (
            <AccountCard key={account.id ?? account.platform} account={account} />
          ))}
          <button
            type="button"
            onClick={() => toast("Browse the channel directory to add a new source")}
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-1/40 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Plus className="size-5" />
            <span className="text-sm font-medium">Add a channel</span>
          </button>
        </div>
        </DataState>

        <Card className="border-border bg-surface-1">
          <CardContent className="flex gap-3 p-5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-completed" />
            <div>
              <p className="text-sm font-semibold text-foreground">What Ghosted AI can and can't read</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Ghosted AI only scans threads matching your tracking rules — proposals, invoices, applications and similar
                categories you've opted into. It never reads personal, financial or health-related messages, never stores
                full message bodies longer than 30 days, and every automated send goes out from your own connected
                account, never from Ghosted AI's infrastructure. You can revoke access at any time from this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
