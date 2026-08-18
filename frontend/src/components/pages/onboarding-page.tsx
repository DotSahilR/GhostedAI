"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  Sparkles,
  Rocket,
  Users,
  Building2,
  Briefcase,
  Target,
  User,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useConnectAccount, useSaveSettings } from "@/hooks/use-data";
import { accountApi } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";
import { profileTypes, trackableCategories, type Platform } from "@/lib/mock-data";
import type { ConnectionState, OnboardingState } from "@/components/onboarding/types";

const steps = ["Welcome", "Connect", "Profile", "Automation", "Finish"];

const platforms: { id: Platform; label: string; icon: typeof Mail; description: string }[] = [
  { id: "gmail", label: "Gmail", icon: Mail, description: "Track conversations and send follow-ups from your Gmail." },
  { id: "caspian", label: "Caspian", icon: Sparkles, description: "Deliver follow-ups across supported channels." },
];

const profileIcons: Record<string, typeof Briefcase> = {
  freelancer: Briefcase,
  recruiter: Users,
  sales: Target,
  founder: Rocket,
  jobseeker: User,
  agency: Building2,
};

const waitOptions = [2, 3, 5, 7];

export function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<OnboardingState>({
    connections: { gmail: "idle", caspian: "idle" },
    profileId: null,
    track: [],
    ignore: [],
    waitDays: 3,
    maxFollowUps: 3,
    autoSend: true,
  });
  const connectCaspian = useConnectAccount("caspian");
  const save = useSaveSettings();

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const canContinue =
    step === 2 ? !!state.profileId : true;

  const handleConnect = (platform: Platform) => {
    if (platform === "gmail") {
      setState((s) => ({ ...s, connections: { ...s.connections, gmail: "connecting" } }));
      accountApi.gmailAuthUrl().then(({ url }) => {
        window.location.href = url;
      }).catch(() => {
        setState((s) => ({ ...s, connections: { ...s.connections, gmail: "idle" } }));
        toast.error("Failed to start Gmail connection");
      });
      return;
    }
    setState((s) => ({ ...s, connections: { ...s.connections, [platform]: "connecting" } }));
    connectCaspian.mutate(
      {},
      {
        onSuccess: () => {
          setState((s) => ({ ...s, connections: { ...s.connections, [platform]: "connected" } }));
          toast.success(`${platform.charAt(0).toUpperCase()}${platform.slice(1)} connected`);
        },
        onError: (error) => {
          setState((s) => ({ ...s, connections: { ...s.connections, [platform]: "idle" } }));
          toast.error(error instanceof Error ? error.message : "Connection failed");
        },
      },
    );
  };

  const finish = () => {
    const profile = profileTypes.find((p) => p.id === state.profileId);
    save.mutate(
      {
        profileType: state.profileId ?? "freelancer",
        waitDays: state.waitDays,
        maxFollowUps: state.maxFollowUps,
        autoSend: state.autoSend,
        trackCategories: state.track,
        ignoreCategories: state.ignore,
      },
      {
        onSuccess: () => {
          toast.success(profile ? `${profile.name} profile saved` : "Settings saved");
          router.push("/dashboard");
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Save failed"),
      },
    );
  };

  const selectProfile = (id: string) => {
    const profile = profileTypes.find((p) => p.id === id);
    if (!profile) return;
    setState((s) => ({
      ...s,
      profileId: id,
      track: profile.track,
      ignore: profile.ignore,
      waitDays: profile.waitDays,
      maxFollowUps: profile.maxFollowUps,
      autoSend: profile.autoSend,
    }));
  };

  const toggleTrack = (cat: string) => {
    setState((s) => ({
      ...s,
      track: s.track.includes(cat) ? s.track.filter((c) => c !== cat) : [...s.track, cat],
    }));
  };

  const removeIgnore = (cat: string) => {
    setState((s) => ({ ...s, ignore: s.ignore.filter((c) => c !== cat) }));
  };

  const selectedProfile = profileTypes.find((p) => p.id === state.profileId);
  const connectedCount = Object.values(state.connections).filter((c) => c === "connected").length;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <span className="text-xs text-subtle">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
          <div className="mt-2 flex justify-between">
            {steps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "text-[11px] font-medium",
                  i <= step ? "text-foreground" : "text-subtle",
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-2xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {step === 0 && <WelcomeStep />}
              {step === 1 && (
                <ConnectStep connections={state.connections} onConnect={handleConnect} />
              )}
              {step === 2 && (
                <ProfileStep selectedId={state.profileId} onSelect={selectProfile} />
              )}
              {step === 3 && selectedProfile && (
                <AutomationStep
                  state={state}
                  setState={setState}
                  toggleTrack={toggleTrack}
                  removeIgnore={removeIgnore}
                />
              )}
              {step === 4 && (
                <FinishStep
                  profileName={selectedProfile?.name ?? "Custom"}
                  connectedCount={connectedCount}
                  state={state}
                  onFinish={finish}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {step < 4 && (
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <Button
                variant="ghost"
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button onClick={() => goTo(step + 1)} disabled={!canContinue} className="gap-2">
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function WelcomeStep() {
  const points = [
    { icon: Sparkles, title: "AI that watches for you", body: "Every important thread is classified and tracked automatically." },
    { icon: Rocket, title: "Follow-ups, drafted and sent", body: "Context-aware messages go out on your schedule, in your tone." },
    { icon: Target, title: "Focus on what matters", body: "A ranked opportunity list instead of a noisy inbox." },
  ];
  return (
    <div className="text-center">
      <span className="eyebrow">Welcome to Ghosted AI</span>
      <h1 className="display-md mt-4 text-foreground">Let's set up your follow-up agent.</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        This takes about five minutes. We'll connect your accounts, pick a profile that
        matches your work, and tune your automation rules.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {points.map((p) => (
          <div key={p.title} className="surface-card rounded-xl border border-border p-5 text-left">
            <div className="grid size-9 place-items-center rounded-md bg-surface-2 text-primary">
              <p.icon className="size-4.5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">{p.title}</h3>
            <p className="mt-1.5 text-xs text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectStep({
  connections,
  onConnect,
}: {
  connections: Record<Platform, ConnectionState>;
  onConnect: (p: Platform) => void;
}) {
  return (
    <div>
      <span className="eyebrow">Connect accounts</span>
      <h2 className="display-md mt-3 text-foreground">Where should we watch for conversations?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect at least one account. You can add more anytime from Settings.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        {platforms.map((p) => {
          const conn = connections[p.id];
          return (
            <div
              key={p.id}
              className="surface-card flex items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 text-foreground">
                  <p.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
              </div>
              <Button
                variant={conn === "connected" ? "secondary" : "outline"}
                size="sm"
                disabled={conn === "connecting"}
                onClick={() => onConnect(p.id)}
                className="w-32 shrink-0 gap-2"
              >
                {conn === "connecting" && <Loader2 className="size-3.5 animate-spin" />}
                {conn === "connected" && <Check className="size-3.5 text-status-completed" />}
                {conn === "idle" && "Connect"}
                {conn === "connecting" && "Connecting"}
                {conn === "connected" && "Connected"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileStep({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <span className="eyebrow">Choose your profile</span>
      <h2 className="display-md mt-3 text-foreground">What kind of work are you tracking?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We'll prefill smart automation rules based on your choice — fully editable next.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {profileTypes.map((p) => {
          const Icon = profileIcons[p.id] ?? Briefcase;
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                "surface-card rounded-xl border p-5 text-left transition-colors",
                active ? "border-primary bg-surface-2" : "border-border hover:border-border-strong",
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("grid size-10 place-items-center rounded-md", active ? "bg-primary/15 text-primary" : "bg-surface-2 text-foreground")}>
                  <Icon className="size-5" />
                </div>
                {active && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">{p.blurb}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AutomationStep({
  state,
  setState,
  toggleTrack,
  removeIgnore,
}: {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  toggleTrack: (c: string) => void;
  removeIgnore: (c: string) => void;
}) {
  return (
    <div>
      <span className="eyebrow">Automation rules</span>
      <h2 className="display-md mt-3 text-foreground">Tune it to how you work.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Prefilled from your profile — adjust anything before you're done.
      </p>

      <div className="mt-8 space-y-7">
        <div>
          <p className="text-sm font-semibold text-foreground">Track these categories</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {trackableCategories.map((cat) => (
              <label
                key={cat}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm text-foreground"
              >
                <Checkbox checked={state.track.includes(cat)} onCheckedChange={() => toggleTrack(cat)} />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Ignore</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.ignore.map((cat) => (
              <button
                key={cat}
                onClick={() => removeIgnore(cat)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground hover:border-destructive/40 hover:text-destructive"
              >
                {cat}
                <span className="text-subtle group-hover:text-destructive">×</span>
              </button>
            ))}
            {state.ignore.length === 0 && (
              <span className="text-xs text-subtle">Nothing ignored — everything will be tracked.</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Waiting time before follow-up</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {waitOptions.map((d) => (
              <button
                key={d}
                onClick={() => setState((s) => ({ ...s, waitDays: d }))}
                className={cn(
                  "rounded-md border py-2.5 text-sm font-medium transition-colors",
                  state.waitDays === d
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-1 text-muted-foreground hover:border-border-strong",
                )}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Max follow-ups per conversation</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setState((s) => ({ ...s, maxFollowUps: n }))}
                className={cn(
                  "rounded-md border py-2.5 text-sm font-medium transition-colors",
                  state.maxFollowUps === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-1 text-muted-foreground hover:border-border-strong",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Auto-send follow-ups</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Off means drafts wait for your approval before sending.
            </p>
          </div>
          <Switch
            checked={state.autoSend}
            onCheckedChange={(v) => setState((s) => ({ ...s, autoSend: v }))}
          />
        </div>
      </div>
    </div>
  );
}

function FinishStep({
  profileName,
  connectedCount,
  state,
  onFinish,
}: {
  profileName: string;
  connectedCount: number;
  state: OnboardingState;
  onFinish: () => void;
}) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-primary"
      >
        <Check className="size-8" />
      </motion.div>
      <h1 className="display-md mt-6 text-foreground">You're all set, {profileName.toLowerCase()}.</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Ghosted AI is now watching your connected accounts and will start surfacing
        conversations that need a follow-up.
      </p>

      <div className="surface-card mx-auto mt-9 max-w-md rounded-xl border border-border p-6 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Summary</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Connected accounts</dt>
            <dd className="font-medium text-foreground">{connectedCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Profile</dt>
            <dd className="font-medium text-foreground">{profileName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Waiting time</dt>
            <dd className="font-medium text-foreground">{state.waitDays} days</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Max follow-ups</dt>
            <dd className="font-medium text-foreground">{state.maxFollowUps}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Auto-send</dt>
            <dd className="font-medium text-foreground">{state.autoSend ? "On" : "Off"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-9">
        <Button size="lg" className="gap-2" onClick={onFinish}>
          Go to Dashboard
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
