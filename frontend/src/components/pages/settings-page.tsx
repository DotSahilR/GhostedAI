"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  User,
  Building2,
  Palette,
  Bell,
  Workflow,
  ShieldCheck,
  TriangleAlert,
  Monitor,
  Smartphone,
  Download,
  PauseOctagon,
  Trash2,
  ArrowUpRight,
} from "lucide-react";

import { PageHeader } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSaveSettings, useSettings } from "@/hooks/use-data";
import { useSession } from "@/lib/session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "automation", label: "Automation", icon: Workflow },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "danger", label: "Danger Zone", icon: TriangleAlert },
] as const;

type SectionId = (typeof sections)[number]["id"];

function Card({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-1">
      <header className="border-b border-border px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="px-5 py-5">{children}</div>
      {footer && (
        <footer className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</footer>
      )}
    </section>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const members = [
  { name: "Arjun Kapoor", email: "arjun@ghosted.ai", role: "Owner", initials: "AK" },
  { name: "Divya Menon", email: "divya@ghosted.ai", role: "Admin", initials: "DM" },
  { name: "Sam Whitfield", email: "sam@ghosted.ai", role: "Member", initials: "SW" },
];

const notifyRows = [
  "Follow-up sent",
  "Reply received",
  "Conversation completed",
  "Connection lost",
  "Weekly summary",
];

const sessions = [
  { device: "MacBook Pro · Chrome", location: "Bengaluru, IN", time: "Active now", icon: Monitor },
  { device: "iPhone 15 · Safari", location: "Bengaluru, IN", time: "2 hours ago", icon: Smartphone },
  { device: "Windows · Edge", location: "Pune, IN", time: "4 days ago", icon: Monitor },
];

const themes = [
  { id: "dark", name: "Dark", hint: "Charcoal surfaces on black" },
  { id: "midnight", name: "Midnight", hint: "Deeper blue-tinted canvas" },
  { id: "system", name: "System", hint: "Match your OS setting" },
];

const accents = [
  { id: "blue", varName: "var(--primary)" },
  { id: "purple", varName: "var(--accent-bright)" },
  { id: "cyan", varName: "var(--status-review)" },
  { id: "green", varName: "var(--status-completed)" },
  { id: "amber", varName: "var(--status-waiting)" },
];

export function SettingsPage() {
  const { user } = useSession();
  const { data: settings } = useSettings();
  const save = useSaveSettings();

  const [active, setActive] = useState<SectionId>("profile");
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("blue");
  const [density, setDensity] = useState("comfortable");
  const [profileType, setProfileType] = useState("freelancer");
  const [timezone, setTimezone] = useState("Asia/Kolkata (GMT+5:30)");
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() =>
    Object.fromEntries(
      notifyRows.map((r) => [r, { email: true, push: r !== "Weekly summary", telegram: r === "Reply received" }]),
    ),
  );
  const [twoFactor, setTwoFactor] = useState(true);
  const [globalPause, setGlobalPause] = useState(false);

  const toggleMatrix = (row: string, col: string) =>
    setMatrix((m) => ({ ...m, [row]: { ...m[row], [col]: !m[row]?.[col] } }));

  const saveProfile = () => {
    save.mutate(
      { profileType, timezone: timezone.split(" ")[0] },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Save failed"),
      },
    );
  };

  const userName = user?.name ?? "Account";
  const userEmail = user?.email ?? "";
  const waitDays = settings?.waitDays ?? 3;
  const maxFollowUps = settings?.maxFollowUps ?? 3;
  const toneLabel = settings?.defaultTone
    ? settings.defaultTone.charAt(0).toUpperCase() + settings.defaultTone.slice(1)
    : "Professional";

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Settings"
        description="Control your profile, workspace, channels and how autonomously the agent behaves."
        actions={
          <Button size="sm" onClick={() => toast.success("Settings saved")}>
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <nav className="flex gap-1.5 overflow-x-auto lg:sticky lg:top-24 lg:h-fit lg:flex-col lg:overflow-visible">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active === s.id
                  ? "bg-surface-1 text-foreground"
                  : "text-muted-foreground hover:bg-surface-1/60 hover:text-foreground",
                s.id === "danger" && active === s.id && "text-destructive",
              )}
            >
              <s.icon className="size-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-5"
        >
          {active === "profile" && (
            <Card
              title="Profile"
              description="How you appear in follow-ups sent on your behalf."
              footer={
                <Button size="sm" onClick={saveProfile} disabled={save.isPending}>
                  Save profile
                </Button>
              }
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span
                    className="grid size-16 place-items-center rounded-full bg-surface-2 text-foreground font-display text-lg font-semibold ring-1 ring-border"
                  >
                    {userName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" size="sm" onClick={() => toast("Avatar upload is coming soon")}>
                      Change photo
                    </Button>
                    <p className="text-xs text-subtle">PNG or JPG, up to 2 MB.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" defaultValue={userName} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={userEmail} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={profileType} onValueChange={setProfileType}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="founder">Startup Founder</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tz">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="tz">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</SelectItem>
                        <SelectItem value="Europe/London (GMT)">Europe/London (GMT)</SelectItem>
                        <SelectItem value="America/Los_Angeles (GMT-8)">America/Los_Angeles (GMT-8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sig">Signature</Label>
                  <Textarea
                    id="sig"
                    rows={4}
                    defaultValue={`Best,\n${userName}`}
                  />
                  <p className="text-xs text-subtle">
                    Appended to every follow-up the agent sends on your behalf.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {active === "workspace" && (
            <>
              <Card title="Workspace" description="Shared tracking rules and billing live here.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="ws">Workspace name</Label>
                    <Input id="ws" defaultValue="Ghosted Studio" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Input id="plan" defaultValue="Pro — 5 seats" readOnly />
                  </div>
                </div>
              </Card>
              <Card
                title="Members"
                description="People who can see and act on tracked opportunities."
                footer={
                  <div className="flex w-full items-center gap-2">
                    <Input placeholder="teammate@company.com" className="max-w-xs" />
                    <Button size="sm" onClick={() => toast.success("Invitation sent")}>
                      Invite
                    </Button>
                  </div>
                }
              >
                <div className="divide-y divide-border">
                  {members.map((m) => (
                    <div key={m.email} className="flex items-center gap-3 py-3">
                      <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-foreground ring-1 ring-border">
                        {m.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                      </div>
                      <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {active === "appearance" && (
            <Card title="Appearance" description="Ghosted AI is built dark-first for long working sessions.">
              <div className="flex flex-col gap-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        toast.success(`${t.name} theme applied`);
                      }}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors",
                        theme === t.id
                          ? "border-primary bg-surface-2"
                          : "border-border bg-surface-1 hover:border-border-strong",
                      )}
                    >
                      <div className="mb-3 h-16 overflow-hidden rounded-md border border-border bg-background">
                        <div className="h-3 border-b border-border bg-surface-1" />
                        <div className="flex h-full gap-1 p-1.5">
                          <div className="w-1/4 rounded-sm bg-surface-1" />
                          <div className="flex-1 rounded-sm bg-surface-2" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.hint}</p>
                    </button>
                  ))}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground">Accent colour</p>
                  <div className="mt-3 flex gap-2.5">
                    {accents.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        aria-label={a.id}
                        className={cn(
                          "size-8 rounded-full ring-offset-2 ring-offset-background transition-all",
                          accent === a.id ? "ring-2 ring-foreground" : "ring-1 ring-border",
                        )}
                        style={{ background: a.varName }}
                      />
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground">Density</p>
                  <div className="mt-3 inline-flex rounded-md border border-border bg-surface-2 p-1">
                    {["compact", "comfortable"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={cn(
                          "rounded px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                          density === d
                            ? "bg-surface-1 text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {active === "notifications" && (
            <Card
              title="Notifications"
              description="Choose where each agent event reaches you."
              footer={
                <Button size="sm" onClick={() => toast.success("Notification preferences saved")}>
                  Save preferences
                </Button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-125 text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
                        Event
                      </th>
                      {["email", "push", "telegram"].map((c) => (
                        <th
                          key={c}
                          className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-subtle"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notifyRows.map((row) => (
                      <tr key={row}>
                        <td className="py-3 text-sm text-foreground">{row}</td>
                        {["email", "push", "telegram"].map((col) => (
                          <td key={col} className="py-3 text-center">
                            <Switch
                              checked={!!matrix[row]?.[col]}
                              onCheckedChange={() => toggleMatrix(row, col)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {active === "automation" && (
            <Card title="Automation" description="Global controls for the follow-up agent.">
              <div className="divide-y divide-border">
                <Row
                  title="Pause all automation"
                  description="Keeps tracking threads but stops every outgoing follow-up."
                >
                  <Switch
                    checked={globalPause}
                    onCheckedChange={(v) => {
                      setGlobalPause(v);
                      toast(v ? "All automation paused" : "Automation resumed");
                    }}
                  />
                </Row>
                <Row title="Waiting time" description={`Currently ${waitDays} day${waitDays === 1 ? "" : "s"} before a thread is flagged as ghosted.`}>
                  <span className="text-sm font-medium text-muted-foreground">{waitDays} day{waitDays === 1 ? "" : "s"}</span>
                </Row>
                <Row title="Maximum follow-ups" description="The agent stops after this many attempts.">
                  <span className="text-sm font-medium text-muted-foreground">{maxFollowUps} per thread</span>
                </Row>
                <Row title="Tone" description="Applied to every generated draft.">
                  <span className="text-sm font-medium text-muted-foreground">{toneLabel}</span>
                </Row>
              </div>
              <div className="mt-5">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/automation">
                    Manage rules
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {active === "security" && (
            <>
              <Card title="Security" description="Protect the account that can send messages as you.">
                <div className="divide-y divide-border">
                  <Row
                    title="Two-factor authentication"
                    description="Required for sending automation to stay enabled."
                  >
                    <Switch
                      checked={twoFactor}
                      onCheckedChange={(v) => {
                        setTwoFactor(v);
                        toast(v ? "Two-factor enabled" : "Two-factor disabled");
                      }}
                    />
                  </Row>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cur">Current password</Label>
                    <Input id="cur" type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new">New password</Label>
                    <Input id="new" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => toast.success("Password updated")}
                >
                  Update password
                </Button>
              </Card>
              <Card title="Active sessions" description="Devices currently signed in to this workspace.">
                <div className="divide-y divide-border">
                  {sessions.map((s) => (
                    <div key={s.device} className="flex items-center gap-3 py-3">
                      <span className="grid size-9 place-items-center rounded-md bg-surface-2 text-muted-foreground">
                        <s.icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{s.device}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.location} · {s.time}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success("Session revoked")}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {active === "danger" && (
            <section className="rounded-xl border border-destructive/30 bg-surface-1">
              <header className="border-b border-destructive/30 px-5 py-4">
                <h2 className="font-display text-sm font-semibold text-destructive">Danger zone</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  These actions affect every tracked conversation in the workspace.
                </p>
              </header>
              <div className="divide-y divide-border px-5">
                <Row title="Export data" description="Download all conversations, drafts and analytics as JSON.">
                  <Button variant="secondary" size="sm" onClick={() => toast.success("Export queued")}>
                    <Download className="size-3.5" />
                    Export
                  </Button>
                </Row>
                <Row title="Pause all automation" description="Stop every outgoing follow-up immediately.">
                  <Button variant="secondary" size="sm" onClick={() => toast("All automation paused")}>
                    <PauseOctagon className="size-3.5" />
                    Pause
                  </Button>
                </Row>
                <Row title="Delete account" description="Permanently removes your workspace and history.">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                        <AlertDialogDescription>
                          All 22 tracked conversations, generated drafts and analytics history will be
                          permanently erased. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toast.error("Account deletion is disabled in the demo")}>
                          Yes, delete everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Row>
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  );
}
