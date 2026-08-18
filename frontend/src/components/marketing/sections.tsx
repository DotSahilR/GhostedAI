import Link from "next/link";
import {
  Radar,
  Brain,
  Send,
  Workflow,
  ShieldCheck,
  BarChart3,
  Mail,
  MessageSquare,
  Quote,
  Check,
  Inbox,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/marketing/reveal";
import { Hero } from "@/components/marketing/hero-pixel";

export { Hero };

const steps = [
  {
    title: "Connect your channels",
    body: "Link Gmail and Caspian to track conversations and send follow-ups.",
    icon: Inbox,
  },
  {
    title: "Ghosted AI watches quietly",
    body: "It classifies conversations and tracks the ones that matter — proposals, invoices, applications.",
    icon: Radar,
  },
  {
    title: "It detects when you've been ghosted",
    body: "When a reply is overdue, our AI flags it and drafts a tailored follow-up in your voice.",
    icon: Brain,
  },
  {
    title: "Follow-ups go out on autopilot",
    body: "Approve once, or let auto-send handle it — replies land back in one dashboard.",
    icon: Send,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-surface-1/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="display-md mt-4 text-foreground">
            From ghosted to closed, on autopilot.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="surface-card h-full rounded-xl border border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-md bg-surface-2 text-primary">
                    <s.icon className="size-5" />
                  </div>
                  <span className="font-mono text-xs text-subtle">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyGhosted() {
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">Why Ghosted AI</span>
            <h2 className="display-md mt-4 text-foreground">
              It's not another inbox. It's an opportunity dashboard.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Email clients show you everything, sorted by time. Ghosted AI shows you
              only what's at risk — ranked by priority, value and how long it's been
              waiting — so you act on the deals and people that matter, not the noise.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                "No unified inbox to babysit — just the conversations that need you",
                "AI-generated context, not just a thread you have to re-read",
                "Follow-ups drafted and sent for you, not another 'to-do' to remember",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="surface-card rounded-2xl border border-border p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 rounded-xl border border-border-strong bg-surface-2 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Target className="size-4 text-accent-bright" />
                    Opportunity dashboard
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ranked by priority, value, and days waiting
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-1 p-4">
                  <p className="text-xs text-muted-foreground">Traditional inbox</p>
                  <p className="mt-3 font-mono text-2xl text-foreground">1,284</p>
                  <p className="mt-1 text-xs text-subtle">unread, unsorted</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-1 p-4">
                  <p className="text-xs text-muted-foreground">Ghosted AI</p>
                  <p className="mt-3 font-mono text-2xl text-primary">7</p>
                  <p className="mt-1 text-xs text-subtle">need action today</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Radar, title: "Smart detection", body: "AI classifies every conversation and flags the ones going cold before you notice." },
  { icon: Brain, title: "Context-aware drafts", body: "Follow-ups written in your tone, referencing the actual thread — not generic templates." },
  { icon: Workflow, title: "Automation rules", body: "Set wait times, max follow-ups, and auto-send per profile — freelancer, sales, recruiting and more." },
  { icon: Mail, title: "Multi-channel", body: "Works across Gmail and Caspian-supported channels from a single dashboard." },
  { icon: ShieldCheck, title: "Full control", body: "Review-before-send or let it run on autopilot — you decide per rule, per channel." },
  { icon: BarChart3, title: "Real analytics", body: "Track response rates, revenue recovered and time saved with clear, actionable charts." },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border bg-surface-1/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Features</span>
          <h2 className="display-md mt-4 text-foreground">Everything you need to stop ghosting yourself.</h2>
        </Reveal>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="surface-card h-full rounded-xl border border-border p-6 transition-colors hover:border-border-strong">
                <div className="grid size-11 place-items-center rounded-md bg-surface-2 text-accent-bright">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Priya Nair", role: "Freelance Designer", quote: "I closed two proposals that had gone completely cold. Ghosted AI followed up exactly when I would have, if I'd remembered.", initials: "PN" },
  { name: "Marcus Webb", role: "Founder, Loopline", quote: "It caught an investor thread I'd totally lost track of during a fundraise. That follow-up alone paid for a year of the tool.", initials: "MW" },
  { name: "Sana Iqbal", role: "Technical Recruiter", quote: "Candidates stop ghosting back when a thoughtful nudge lands at the right moment. My pipeline finally moves.", initials: "SI" },
];

export function Testimonials() {
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Loved by builders</span>
          <h2 className="display-md mt-4 text-foreground">Conversations that would've died. Revived.</h2>
        </Reveal>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="surface-card flex h-full flex-col rounded-xl border border-border p-6">
                <Quote className="size-6 text-primary/60" />
                <p className="mt-4 flex-1 text-sm text-foreground">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="grid size-9 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "/mo",
    blurb: "For trying out AI-powered follow-ups.",
    features: ["1 connected account", "20 tracked conversations", "Manual send only", "Email support"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/mo",
    blurb: "For freelancers and small teams closing real deals.",
    features: ["5 connected accounts", "Unlimited tracked conversations", "Auto-send with rules", "Priority support", "Full analytics suite"],
    cta: "Get started",
    featured: true,
  },
  {
    name: "Agency",
    price: "$99",
    cadence: "/mo",
    blurb: "For agencies managing multiple client pipelines.",
    features: ["Unlimited accounts", "Team seats & roles", "Custom automation profiles", "Dedicated onboarding", "SLA support"],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border bg-surface-1/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="display-md mt-4 text-foreground">Simple pricing that scales with your pipeline.</h2>
        </Reveal>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col rounded-xl border p-7 ${
                  t.featured
                    ? "border-primary/40 bg-surface-2 shadow-[0_0_0_1px_var(--primary)]"
                    : "border-border bg-surface-1"
                }`}
              >
                {t.featured && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-foreground">{t.price}</span>
                  <span className="text-sm text-muted-foreground">{t.cadence}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className="mt-7">
                  <Button className="w-full" variant={t.featured ? "default" : "outline"}>
                    {t.cta}
                  </Button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Is Ghosted AI another inbox app?", a: "No. Ghosted AI doesn't replace your inbox — it sits alongside your existing accounts, watching for conversations that go quiet and surfacing only what needs action." },
  { q: "Which platforms can I connect?", a: "Gmail and Caspian today, with more channels on the roadmap." },
  { q: "Will it send messages without my approval?", a: "Only if you turn on auto-send for a given automation rule. Otherwise every follow-up sits in a review queue until you approve it." },
  { q: "How does it know what to ignore?", a: "During onboarding you choose a profile (Freelancer, Sales, Recruiter, etc.) that prefills sensible track/ignore rules — fully editable afterward." },
  { q: "Can I customize the wait time before a follow-up?", a: "Yes — set it per rule from 2 to 7+ days, along with a maximum number of follow-ups per conversation." },
  { q: "Is my data secure?", a: "We use read/send scoped OAuth permissions per platform and never store full message bodies longer than needed to generate a draft." },
];

export function Faq() {
  return (
    <section id="faq" className="border-b border-border py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="display-md mt-4 text-foreground">Questions, answered.</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="aurora relative overflow-hidden border-b border-border py-20">
      <div className="hairline-grid pointer-events-none absolute inset-0" />
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="display-md text-foreground">Stop losing deals to a full inbox.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Set up your first automation profile in under five minutes — no credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/onboarding">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              I already have an account
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-surface-1/30 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4"><Logo /></div>
            <p className="max-w-xs text-sm text-muted-foreground">
              The autonomous follow-up agent that keeps your important conversations alive.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
              <li><a href="#" className="hover:text-foreground">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-subtle">© {new Date().getFullYear()} Ghosted AI. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-subtle">
            <MessageSquare className="size-3.5" />
            Built for people who follow through.
          </div>
        </div>
      </div>
    </footer>
  );
}
