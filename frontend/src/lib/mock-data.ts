
export type Platform = "gmail" | "caspian";

export type ConversationStatus =
  | "waiting"
  | "ghosted"
  | "needs-review"
  | "follow-up-ready"
  | "sent"
  | "reply-received"
  | "completed"
  | "archived"
  | "paused";

export type Priority = "high" | "medium" | "low";

export type Category =
  | "Proposal"
  | "Invoice"
  | "Job Application"
  | "Sales"
  | "Partnership"
  | "Recruitment"
  | "Consultation"
  | "Collaboration"
  | "Contract"
  | "Client Discussion";

export type TimelineKind =
  | "original"
  | "waiting"
  | "analysis"
  | "draft"
  | "sent"
  | "reply"
  | "completed";

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  title: string;
  timestamp: string;
  body?: string;
}

export interface AiAnalysis {
  conversationType: string;
  priority: Priority;
  status: string;
  confidence: number;
  recommendedWait: string;
  reasoning: string;
  tone: "Professional" | "Friendly" | "Formal";
  urgency: "High" | "Medium" | "Low";
}

export interface Draft {
  id?: string;
  subject: string;
  body: string;
  generatedAt: string;
  variant: number;
}

export interface Conversation {
  id: string;
  name: string;
  handle: string;
  company: string;
  avatarHue: number;
  initials: string;
  subject: string;
  category: Category;
  platform: Platform;
  status: ConversationStatus;
  priority: Priority;
  daysWaiting: number;
  lastMessage: string;
  lastMessageDirection: "inbound" | "outbound" | null;
  lastActivity: string;
  confidence: number;
  nextAction: string;
  followUpsSent: number;
  value: string;
  timeline: TimelineEvent[];
  analysis: AiAnalysis;
  draft: Draft;
}

export const platformMeta: Record<Platform, { label: string; short: string }> = {
  gmail: { label: "Gmail", short: "GM" },
  caspian: { label: "Caspian", short: "CA" },
};

export const statusMeta: Record<
  ConversationStatus,
  { label: string; dot: string; chip: string }
> = {
  waiting: {
    label: "Waiting",
    dot: "bg-status-waiting",
    chip: "bg-status-waiting/10 text-status-waiting border-status-waiting/25",
  },
  ghosted: {
    label: "Ghosted",
    dot: "bg-status-ghosted",
    chip: "bg-status-ghosted/10 text-status-ghosted border-status-ghosted/25",
  },
  "needs-review": {
    label: "Needs Review",
    dot: "bg-status-review",
    chip: "bg-status-review/10 text-status-review border-status-review/25",
  },
  "follow-up-ready": {
    label: "Follow-up Ready",
    dot: "bg-status-ready",
    chip: "bg-status-ready/10 text-status-ready border-status-ready/25",
  },
  sent: {
    label: "Sent",
    dot: "bg-status-sent",
    chip: "bg-status-sent/10 text-status-sent border-status-sent/25",
  },
  "reply-received": {
    label: "Reply Received",
    dot: "bg-status-reply",
    chip: "bg-status-reply/10 text-status-reply border-status-reply/25",
  },
  completed: {
    label: "Completed",
    dot: "bg-status-completed",
    chip: "bg-status-completed/10 text-status-completed border-status-completed/25",
  },
  archived: {
    label: "Archived",
    dot: "bg-status-archived",
    chip: "bg-status-archived/10 text-subtle border-border",
  },
  paused: {
    label: "Paused",
    dot: "bg-status-paused",
    chip: "bg-status-paused/10 text-subtle border-border",
  },
};

export const priorityMeta: Record<Priority, { label: string; chip: string }> = {
  high: { label: "High", chip: "bg-status-ghosted/10 text-status-ghosted border-status-ghosted/25" },
  medium: {
    label: "Medium",
    chip: "bg-status-waiting/10 text-status-waiting border-status-waiting/25",
  },
  low: { label: "Low", chip: "bg-surface-2 text-muted-foreground border-border" },
};

export interface Activity {
  id: string;
  kind: TimelineKind | "paused" | "connection";
  title: string;
  detail: string;
  time: string;
}

export interface AppNotification {
  id: string;
  type: "sent" | "reply" | "completed" | "paused" | "connection" | "summary" | "info";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export interface Account {
  id?: string;
  platform: Platform;
  status: "connected" | "disconnected" | "error";
  account: string;
  lastSync: string;
  permissions: string[];
  description: string;
}

export interface ProfileType {
  id: string;
  name: string;
  blurb: string;
  track: string[];
  ignore: string[];
  waitDays: number;
  maxFollowUps: number;
  autoSend: boolean;
}

export const profileTypes: ProfileType[] = [
  { id: "freelancer", name: "Freelancer", blurb: "Proposals, invoices and client threads.", track: ["Proposal Emails", "Invoice Emails", "Client Discussions"], ignore: ["OTP", "Newsletters", "Spam"], waitDays: 3, maxFollowUps: 3, autoSend: true },
  { id: "recruiter", name: "Recruiter", blurb: "Candidate outreach and interview loops.", track: ["Candidate Outreach", "Interview Scheduling", "Offer Threads"], ignore: ["OTP", "Job Boards", "Newsletters"], waitDays: 2, maxFollowUps: 4, autoSend: true },
  { id: "sales", name: "Sales", blurb: "Pipeline, demos and pricing threads.", track: ["Sales Pitches", "Demo Follow-ups", "Pricing Discussions"], ignore: ["OTP", "Newsletters", "Support Tickets"], waitDays: 2, maxFollowUps: 5, autoSend: true },
  { id: "founder", name: "Startup Founder", blurb: "Investors, partnerships and hiring.", track: ["Investor Intros", "Partnership Requests", "Hiring Threads"], ignore: ["OTP", "Newsletters", "Product Updates"], waitDays: 3, maxFollowUps: 3, autoSend: false },
  { id: "jobseeker", name: "Job Seeker", blurb: "Applications, referrals and interviews.", track: ["Job Applications", "Referral Requests", "Interview Scheduling"], ignore: ["OTP", "Job Alerts", "Newsletters"], waitDays: 5, maxFollowUps: 2, autoSend: false },
  { id: "agency", name: "Agency", blurb: "Retainers, contracts and delivery.", track: ["Contracts", "Retainer Renewals", "Client Discussions"], ignore: ["OTP", "Vendor Spam", "Newsletters"], waitDays: 3, maxFollowUps: 4, autoSend: true },
];

export const trackableCategories = [
  "Proposal Emails",
  "Invoices",
  "Job Applications",
  "Client Discussions",
  "Contracts",
  "Recruitment",
];
