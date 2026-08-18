export type DraftTone = "professional" | "friendly" | "formal";

export interface AiMessage {
  direction: "inbound" | "outbound";
  body: string;
}

export interface GenerateDraftInput {
  senderName: string;
  recipientName: string;
  company: string;
  subject: string;
  category: string;
  platform: string;
  daysWaiting: number;
  followUpsSent: number;
  tone: DraftTone;
  variant: number;
  recentMessages: AiMessage[];
  lastMessage: string | null;
  value: string | null;
}

export interface DraftContent {
  subject: string;
  body: string;
}

export interface SummarizeInput {
  recipientName: string;
  subject: string;
  platform: string;
  messages: AiMessage[];
}

export interface SummarizeResult {
  summary: string;
}

export interface RewriteInput {
  body: string;
  tone: DraftTone;
  subject?: string;
  instructions?: string;
}

export interface RewriteResult {
  body: string;
}

export interface AnalyzeInput {
  recipientName: string;
  subject: string;
  category: string;
  priority: string;
  daysWaiting: number;
  followUpsSent: number;
  tone: DraftTone;
  recentMessages: AiMessage[];
  lastMessage: string | null;
}

export interface AnalyzeResult {
  reasoning: string;
  recommendedWaitDays: number;
  urgency: "low" | "medium" | "high";
}

export interface AiProvider {
  readonly name: string;
  generateDraft(input: GenerateDraftInput): Promise<DraftContent>;
  summarize(input: SummarizeInput): Promise<SummarizeResult>;
  rewrite(input: RewriteInput): Promise<RewriteResult>;
  adjustTone(input: RewriteInput): Promise<RewriteResult>;
  analyze(input: AnalyzeInput): Promise<AnalyzeResult>;
}
