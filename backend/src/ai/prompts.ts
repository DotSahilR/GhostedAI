import type {
  AiMessage,
  AnalyzeInput,
  DraftTone,
  GenerateDraftInput,
  RewriteInput,
  SummarizeInput,
} from "./types.js";

export const TONE_LABELS: Record<DraftTone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  formal: "Formal",
};

export function toneLabel(tone: DraftTone): string {
  return TONE_LABELS[tone];
}

export function buildDraftPrompt(input: GenerateDraftInput): string {
  const lines = [
    `Recipient: ${input.recipientName}`,
    input.company ? `Company: ${input.company}` : null,
    `Subject: ${input.subject}`,
    input.category ? `Category: ${input.category}` : null,
    `Platform: ${input.platform}`,
    `Days waiting for a reply: ${input.daysWaiting}`,
    `Follow-ups already sent: ${input.followUpsSent}`,
    `Tone: ${toneLabel(input.tone)}`,
    `Variant: ${input.variant}`,
    input.value ? `Deal value: ${input.value}` : null,
    `Last message in thread: ${input.lastMessage ?? "(none)"}`,
    "Recent messages:",
    ...input.recentMessages.map((message) => `[${message.direction}] ${message.body}`),
  ].filter((line): line is string => line !== null);
  return [
    `Write a short, human follow-up message to ${input.recipientName}`,
    input.company ? ` at ${input.company}` : "",
    ` about "${input.subject}". It has been ${input.daysWaiting} days without a reply.`,
    "Keep it brief, specific and low-pressure. Only propose a concrete next step such as a short call or a quick answer to a single question. Do not invent facts.",
    `Use a ${toneLabel(input.tone).toLowerCase()} tone.`,
    "Respond with valid JSON only in this exact shape: {\"subject\":\"<email subject line>\",\"body\":\"<full email body with newlines as \\n>\"}",
    "",
    "Context:",
    lines.join("\n"),
  ].join("");
}

export function buildSummarizePrompt(input: SummarizeInput): string {
  const lines = [
    `Recipient: ${input.recipientName}`,
    `Subject: ${input.subject}`,
    `Platform: ${input.platform}`,
    "Messages:",
    ...input.messages.map((message) => `[${message.direction}] ${message.body}`),
  ];
  return [
    "Summarize the following conversation in 2-3 clear sentences.",
    "Focus on the current state of the thread, what decision is pending, and what was promised.",
    "Do not invent facts.",
    "",
    lines.join("\n"),
  ].join("\n");
}

export function buildRewritePrompt(input: RewriteInput): string {
  const parts = [
    `Rewrite the following follow-up message in a ${toneLabel(input.tone).toLowerCase()} tone.`,
    "Keep it brief, specific and low-pressure. Preserve any factual details and the single proposed next step.",
    input.instructions ? `Additional instructions: ${input.instructions}` : null,
    "Respond with the rewritten message body only. Do not add a subject line.",
    "",
    "Original message:",
    input.body,
  ];
  return parts.filter((line): line is string => line !== null).join("\n");
}

export function buildTonePrompt(input: RewriteInput): string {
  return [
    `Rewrite the following follow-up message using a ${toneLabel(input.tone).toLowerCase()} tone.`,
    "Keep the meaning, details and any proposed next step intact.",
    "Respond with the rewritten message body only.",
    "",
    "Original message:",
    input.body,
  ].join("\n");
}

export function buildAnalysisPrompt(input: AnalyzeInput): string {
  const lines = [
    `Recipient: ${input.recipientName}`,
    `Subject: ${input.subject}`,
    `Category: ${input.category || "(uncategorized)"}`,
    `Priority: ${input.priority}`,
    `Days waiting: ${input.daysWaiting}`,
    `Follow-ups already sent: ${input.followUpsSent}`,
    `Last message: ${input.lastMessage ?? "(none)"}`,
    "Recent messages:",
    ...input.recentMessages.map((message) => `[${message.direction}] ${message.body}`),
  ];
  return [
    "Analyze this follow-up conversation.",
    "Return valid JSON only in this exact shape:",
    "{\"reasoning\":\"<one short paragraph explaining the best next action>\",\"recommendedWaitDays\":<number 0-7>,\"urgency\":\"low\"|\"medium\"|\"high\"}",
    "recommendedWaitDays is how many more days to wait before following up.",
    "",
    lines.join("\n"),
  ].join("\n");
}
