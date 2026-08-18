"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Github,
  Briefcase,
  FileText,
  Receipt,
  FileSearch,
  TrendingUp,
  Users,
  Handshake,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";


const WORK_ITEMS = [
  { label: "Freelancer Projects", icon: Briefcase },
  { label: "Client Proposals", icon: FileText },
  { label: "Invoices & Payments", icon: Receipt },
  { label: "Job Applications", icon: FileSearch },
  { label: "Sales Follow-ups", icon: TrendingUp },
  { label: "Recruiting", icon: Users },
  { label: "Partnerships", icon: Handshake },
  { label: "Vendor Contracts", icon: PenLine },
];


type Pixel = {
  x: number;
  y: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInt: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  draw: () => void;
  appear: () => void;
  disappear: () => void;
  shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0,
    sizeStep: rand(0.12, 0.28),
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) {
        p.counter += p.counterStep;
        return;
      }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer();
      else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false;
      p.counter = 0;
      if (p.size <= 0) {
        p.isIdle = true;
        return;
      }
      p.size -= 0.1;
      p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed;
      else p.size += p.speed;
    },
  };

  return p;
}

type PixelCanvasProps = {
  colors: string[];
  gap?: number;
  speed?: number;
};

function PixelCanvas({ colors, gap = 5, speed = 30 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || colors.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];

    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }

    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;

    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();

      if (pixels.every((p) => p.isIdle)) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();

    const resizeObserver = new ResizeObserver(() => init());
    if (wrapRef.current) resizeObserver.observe(wrapRef.current);

    animate("appear");

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [init, animate]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}


interface PixelHeroProps {
  eyebrow?: string;
  word1?: string;
  word2?: string;
  description?: string;
  primaryCta?: string;
  primaryCtaMobile?: string;
  secondaryCta?: string;
  secondaryCtaMobile?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  githubUrl?: string;
  secondaryHref?: string;
  secondaryExternal?: boolean;
  secondaryIcon?: React.ComponentType<{ className?: string }> | null;
  marqueeLabel?: string;
  marqueeItems?: { label: string; icon: React.ComponentType<{ className?: string }> }[];
}

export function PixelHero({
  eyebrow,
  word1 = "Silent",
  word2 = "Precision.",
  description = "Minimalist interfaces driven by refined motion. Every calculated detail delivers an elevated digital experience.",
  primaryCta = "Explore Design",
  primaryCtaMobile = "Explore",
  secondaryCta = "View GitHub",
  secondaryCtaMobile = "GitHub",
  onPrimaryClick,
  onSecondaryClick,
  githubUrl = "https://github.com",
  secondaryHref,
  secondaryExternal = true,
  secondaryIcon = Github,
  marqueeLabel = "What kind of work are you tracking?",
  marqueeItems = WORK_ITEMS,
}: PixelHeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const SecondaryIcon = secondaryIcon;

  const colors = [
    "rgba(255,255,255,0.55)",
    "rgba(255,255,255,0.28)",
    "rgba(255,255,255,0.12)",
    "rgba(255,255,255,0.05)",
    "rgba(255,255,255,0.85)",
  ];

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#0a0a0a] flex flex-col justify-between md:justify-center md:gap-6 py-8 md:py-0 px-2 sm:px-6 overflow-hidden select-none isolate">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .ghosted-glass-text {
            color: transparent;
            background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 25%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.9) 55%, rgba(255, 255, 255, 0.2) 75%, rgba(255, 255, 255, 1) 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.3);
            filter: drop-shadow(0 15px 35px rgba(0,0,0,0.4)) drop-shadow(0 5px 10px rgba(0,0,0,0.2));
            animation: shimmer 8s linear infinite;
        }
        @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: 0% center; }
        }
      `}</style>

      {/* Permanent canvas background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <PixelCanvas colors={colors} gap={6} speed={30} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.92)_100%)] pointer-events-none opacity-90" />
      </div>

      {/* Top Container: Glass Header */}
      <div className="flex flex-col items-center justify-center text-center order-1 md:order-1 mt-28 sm:mt-0 pointer-events-none w-full">
        {eyebrow && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white/70 backdrop-blur-sm">
            {eyebrow}
          </div>
        )}
        <h1 className="ghosted-glass-text flex flex-row items-center justify-center gap-1.5 sm:gap-3 lg:gap-4 px-1 w-full flex-wrap text-2xl xs:text-[1.6rem] sm:text-3xl md:text-4xl lg:text-6xl leading-none">
          <span className="font-serif italic font-medium">{word1}</span>
          <span className="font-sans font-extrabold tracking-tighter">{word2}</span>
        </h1>
      </div>

      {/* Center Container: Description & Mobile Marquee */}
      <div className="flex flex-col items-center justify-center text-center my-auto md:my-0 order-2 md:order-2 px-1 w-full pointer-events-none">
        <p className="text-sm sm:text-lg md:text-xl font-light text-white/75 max-w-[95%] sm:max-w-md md:max-w-xl px-1 leading-relaxed">
          {description}
        </p>

        <div className="block md:hidden w-full mt-14 pointer-events-auto">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-5">
            {marqueeLabel}
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
            <div className="flex w-max gap-12 py-1 animate-marquee">
              <div className="flex gap-12 items-center">
                {marqueeItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <span key={i} className="flex items-center gap-2 text-sm text-white/55">
                      <Icon className="size-4 text-white/70" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-12 items-center" aria-hidden="true">
                {marqueeItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <span key={`c-${i}`} className="flex items-center gap-2 text-sm text-white/55">
                      <Icon className="size-4 text-white/70" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Container: CTA Row */}
      <div
        className={cn("pointer-events-auto flex flex-row items-center justify-center gap-3 mt-4 md:mt-10 mb-4 md:mb-0 order-4 md:order-3 transition-all duration-1000 transform px-1", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
        style={{ transitionDelay: "450ms" }}
      >
        <button
          onClick={onPrimaryClick}
          className="relative inline-flex h-10 md:h-12 items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-white px-4 md:px-8 text-xs md:text-sm font-semibold text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3),0_12px_24px_rgba(0,0,0,0.3)] ring-1 ring-white/20 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span className="inline md:hidden">{primaryCtaMobile}</span>
          <span className="hidden md:inline">{primaryCta}</span>
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <a
          href={secondaryHref ?? githubUrl}
          target={secondaryExternal ? "_blank" : undefined}
          rel={secondaryExternal ? "noopener noreferrer" : undefined}
          onClick={onSecondaryClick}
          className="relative inline-flex h-10 md:h-12 items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-white/10 px-4 md:px-8 text-xs md:text-sm font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.2),0_12px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/25 backdrop-blur-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {SecondaryIcon && <SecondaryIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          <span className="inline md:hidden">{secondaryCtaMobile}</span>
          <span className="hidden md:inline">{secondaryCta}</span>
        </a>
      </div>

      {/* Desktop-only Marquee Block */}
      <div
        className={cn("hidden md:flex absolute bottom-8 left-0 right-0 w-full z-10 pointer-events-auto flex-col items-center justify-center gap-4 transition-all duration-1000 transform order-3 md:order-4", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
        style={{ transitionDelay: "600ms" }}
      >
        <span className="text-xs uppercase tracking-wider text-white/40 font-medium select-none">
          {marqueeLabel}
        </span>
        <div className="relative w-full max-w-5xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
          <div className="flex w-max gap-16 py-3 animate-marquee">
            <div className="flex gap-16 items-center">
              {marqueeItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="flex items-center gap-2.5 text-sm text-white/55">
                    <Icon className="size-4 text-white/70" />
                    {item.label}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-16 items-center" aria-hidden="true">
              {marqueeItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={`c-${i}`} className="flex items-center gap-2.5 text-sm text-white/55">
                    <Icon className="size-4 text-white/70" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
