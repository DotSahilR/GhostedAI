"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  MessagesSquare,
  Send,
  Plug,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Check,
  Reply,
  PauseCircle,
  AlertTriangle,
  CalendarRange,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { useSession } from "@/lib/session";
import {
  useConversations,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-data";
import { initialsOf } from "@/lib/api/adapters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/conversations", label: "Conversations", icon: MessagesSquare },
  { to: "/accounts", label: "Connected Accounts", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = nav;

const notifIcon = {
  sent: Send,
  reply: Reply,
  completed: Check,
  paused: PauseCircle,
  connection: AlertTriangle,
  summary: CalendarRange,
  info: Bell,
} as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            href={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-surface-1 text-foreground"
                : "text-muted-foreground hover:bg-surface-1/60 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
              />
            )}
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-base">Notifications</SheetTitle>
          <SheetDescription className="flex items-center justify-between gap-4 text-xs text-subtle">
            <span>{unreadCount ?? 0} unread · updated just now</span>
            {(unreadCount ?? 0) > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="font-semibold text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-subtle">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n, i) => {
              const Icon = notifIcon[n.type];
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (n.unread) markRead.mutate(n.id);
                  }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex w-full gap-3 border-b border-border px-5 py-4 text-left transition-colors hover:bg-surface-1/60",
                    n.unread && "bg-surface-1/40",
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                      {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-subtle">{n.time}</p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, logout: sessionLogout } = useSession();
  const { data: unreadCount } = useUnreadCount();
  const { data: conversations } = useConversations();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await sessionLogout();
    } catch {
    }
    queryClient.clear();
  };

  const userName = user?.name ?? "Account";
  const userEmail = user?.email ?? "";
  const unread = unreadCount ?? 0;
  const trackedCount = conversations?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <button
            className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-surface-1 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4.5" />
          </button>
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>
          <div className="relative ml-4 hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input
              placeholder="Search conversations, people, companies…"
              className="h-9 w-full rounded-md border border-border bg-surface-1 pl-9 pr-16 text-sm text-foreground placeholder:text-subtle focus:border-primary/60 focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-subtle">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
            </button>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-surface-1"
            >
              <span
                className="grid size-8 place-items-center rounded-full bg-surface-2 font-display text-xs font-semibold text-foreground ring-1 ring-border"
              >
                {initialsOf(userName)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-xs font-semibold text-foreground">{userName}</span>
                <span className="block text-[11px] text-subtle">{userEmail || "Ghosted AI"}</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-subtle sm:block" />
            </Link>
            <button
              onClick={handleLogout}
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border px-3 py-5 lg:block">
          <NavList />
          <div className="mt-6 rounded-lg border border-border bg-surface-1 p-4">
            <p className="eyebrow text-subtle">Monitoring</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-status-completed" />
              </span>
              Automatic follow-ups enabled
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-subtle">
              {trackedCount > 0
                ? `Monitoring ${trackedCount} important conversation${trackedCount === 1 ? "" : "s"}.`
                : "Connect an inbox to start tracking."}
            </p>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-border bg-background p-4 lg:hidden"
              >
                <div className="mb-6 flex items-center justify-between">
                  <Logo />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-1"
                    aria-label="Close menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <NavList onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4">
          {mobileNav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold",
                  active ? "text-primary" : "text-subtle",
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-4 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export { Button };
