"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSaveSettings, useSettings } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import { trackableCategories, profileTypes } from "@/lib/mock-data";
import { ChipList } from "@/components/automation/chip-list";
import { ToneRadio, tones, type ToneId } from "@/components/automation/tone-radio";
import { SummaryPanel } from "@/components/automation/summary-panel";

const waitOptions = [2, 3, 5, 7];
const channelOptions = ["Telegram", "Slack", "Email"];
const defaultProfile = profileTypes[0]!;

export function AutomationPage() {
  const { data: settings } = useSettings();
  const save = useSaveSettings();

  const [trackedOverride, setTrackedOverride] = useState<string[] | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [ignoredOverride, setIgnoredOverride] = useState<string[] | null>(null);
  const [waitDaysOverride, setWaitDaysOverride] = useState<number | null>(null);
  const [autoSendOverride, setAutoSendOverride] = useState<boolean | null>(null);
  const [maxFollowUpsOverride, setMaxFollowUpsOverride] = useState<number[] | null>(null);
  const [toneOverride, setToneOverride] = useState<ToneId | null>(null);
  const [channelsOverride, setChannelsOverride] = useState<string[] | null>(null);
  const [quietStartOverride, setQuietStartOverride] = useState<string | null>(null);
  const [quietEndOverride, setQuietEndOverride] = useState<string | null>(null);

  const tracked = trackedOverride ?? settings?.trackCategories ?? defaultProfile.track;
  const ignored = ignoredOverride ?? settings?.ignoreCategories ?? defaultProfile.ignore.concat(["Job Alerts"]);
  const waitDays = waitDaysOverride ?? settings?.waitDays ?? defaultProfile.waitDays;
  const autoSend = autoSendOverride ?? settings?.autoSend ?? defaultProfile.autoSend;
  const maxFollowUps = maxFollowUpsOverride ?? [settings?.maxFollowUps ?? defaultProfile.maxFollowUps];
  const tone = toneOverride ?? (settings?.defaultTone as ToneId) ?? "professional";
  const quietStart = quietStartOverride ?? settings?.workingHoursStart ?? "21:00";
  const quietEnd = quietEndOverride ?? settings?.workingHoursEnd ?? "08:00";
  const channels =
    channelsOverride ??
    (() => {
      const chans: string[] = [];
      if (settings?.telegramNotifications) chans.push("Telegram");
      if (settings?.emailNotifications) chans.push("Email");
      if (settings?.inAppNotifications) chans.push("Slack");
      return chans.length ? chans : ["Telegram", "Email"];
    })();

  const toggleCategory = (cat: string) => {
    setTrackedOverride(tracked.includes(cat) ? tracked.filter((c) => c !== cat) : [...tracked, cat]);
  };

  const toggleChannel = (channel: string) => {
    setChannelsOverride(channels.includes(channel) ? channels.filter((c) => c !== channel) : [...channels, channel]);
  };

  const resetToDefaults = () => {
    setTrackedOverride(defaultProfile.track);
    setKeywords([]);
    setIgnoredOverride(defaultProfile.ignore);
    setWaitDaysOverride(defaultProfile.waitDays);
    setAutoSendOverride(defaultProfile.autoSend);
    setMaxFollowUpsOverride([defaultProfile.maxFollowUps]);
    setToneOverride("professional");
    setChannelsOverride(["Telegram", "Email"]);
    setQuietStartOverride("21:00");
    setQuietEndOverride("08:00");
    toast.success(`Reset to ${defaultProfile.name} profile defaults`);
  };

  const handleSave = () => {
    save.mutate(
      {
        waitDays,
        maxFollowUps: maxFollowUps[0] ?? 3,
        autoSend,
        defaultTone: tone,
        trackCategories: [...tracked, ...keywords],
        ignoreCategories: ignored,
        workingHoursStart: quietStart,
        workingHoursEnd: quietEnd,
        emailNotifications: channels.includes("Email"),
        telegramNotifications: channels.includes("Telegram"),
        inAppNotifications: channels.includes("Slack"),
      },
      {
        onSuccess: () => toast.success("Automation rules saved"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Save failed"),
      },
    );
  };

  const allTracked = [...tracked, ...keywords];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Automation Rules"
        description="Tell Ghosted AI exactly what to watch for, how long to wait, and how it should follow up for you."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              Reset to defaults
            </Button>
            <Button size="sm" onClick={handleSave} disabled={save.isPending}>
              Save changes
            </Button>
          </>
        }
      />
      <div className="grid gap-6 px-4 py-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">What to track</CardTitle>
              <p className="text-xs text-muted-foreground">Choose the categories of conversation Ghosted AI should monitor.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {trackableCategories.map((cat) => (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground"
                  >
                    <Checkbox checked={tracked.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                    {cat}
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">Custom keywords</p>
                <ChipList
                  items={keywords}
                  onAdd={(v) => setKeywords((prev) => (prev.includes(v) ? prev : [...prev, v]))}
                  onRemove={(v) => setKeywords((prev) => prev.filter((k) => k !== v))}
                  placeholder="e.g. retainer, purchase order..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Ignore list</CardTitle>
              <p className="text-xs text-muted-foreground">Threads matching these are never tracked or followed up on.</p>
            </CardHeader>
            <CardContent>
              <ChipList
                items={ignored}
                onAdd={(v) => setIgnoredOverride(ignored.includes(v) ? ignored : [...ignored, v])}
                onRemove={(v) => setIgnoredOverride(ignored.filter((k) => k !== v))}
                placeholder="Add something to ignore..."
                tone="danger"
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Waiting period</CardTitle>
              <p className="text-xs text-muted-foreground">How long to wait for a reply before flagging a thread as ghosted.</p>
            </CardHeader>
            <CardContent>
              <div className="inline-flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
                {waitOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWaitDaysOverride(d)}
                    className={cn(
                      "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                      waitDays === d
                        ? "bg-surface-3 text-foreground ring-1 ring-border-strong"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Auto follow-up</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Let Ghosted AI send drafts automatically instead of waiting for approval.</p>
              </div>
              <Switch checked={autoSend} onCheckedChange={setAutoSendOverride} />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Maximum follow-ups</p>
                <span className="font-mono text-sm text-accent-bright">{maxFollowUps[0]}</span>
              </div>
              <Slider min={1} max={5} step={1} value={maxFollowUps} onValueChange={setMaxFollowUpsOverride} />
              <div className="flex justify-between px-0.5 text-[11px] text-subtle">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Follow-up tone</CardTitle>
              <p className="text-xs text-muted-foreground">Pick the voice Ghosted AI writes with. Preview a sample line for each.</p>
            </CardHeader>
            <CardContent>
              <ToneRadio value={tone} onChange={setToneOverride} />
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Reminder channel</CardTitle>
              <p className="text-xs text-muted-foreground">Where should Ghosted AI notify you about activity?</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {channelOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    channels.includes(c)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Quiet hours</CardTitle>
              <p className="text-xs text-muted-foreground">Ghosted AI won't send follow-ups during this window.</p>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStartOverride(e.target.value)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEndOverride(e.target.value)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <SummaryPanel
            tracked={allTracked}
            waitDays={waitDays}
            autoSend={autoSend}
            maxFollowUps={maxFollowUps[0] ?? 3}
            tone={(tones.find((t) => t.id === tone)?.label ?? "Professional").toLowerCase()}
            channels={channels}
          />
        </div>
      </div>
    </div>
  );
}
