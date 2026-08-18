"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5">
      <nav
        className={cn(
          "mx-auto flex h-[68px] w-full max-w-[1000px] items-center justify-between rounded-full border border-white/10 bg-[#111114]/85 pl-4 pr-3 backdrop-blur-xl transition-shadow duration-300",
          scrolled
            ? "shadow-[0_10px_30px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]"
            : "shadow-[0_4px_16px_rgba(0,0,0,0.16),0_10px_30px_rgba(0,0,0,0.22)]",
        )}
        style={{ marginTop: "24px" }}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] ring-1 ring-white/60">
            <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
              <defs>
                <linearGradient id="site-nav-ghost" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent-bright)" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5c-4 0-7 3-7 6.9v11.2l2.4-1.8 2.3 1.8 2.3-1.8 2.3 1.8 2.4-1.8 2.3 1.8V9.4c0-3.9-3-6.9-7-6.9Z"
                fill="url(#site-nav-ghost)"
              />
              <circle cx="9.4" cy="9.6" r="1.25" fill="#ffffff" />
              <circle cx="14.6" cy="9.6" r="1.25" fill="#ffffff" />
            </svg>
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-white">
            Ghosted<span className="text-white/45"> AI</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/login"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-[1.03] hover:bg-white/90 active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
