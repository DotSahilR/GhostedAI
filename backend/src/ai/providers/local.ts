import type {
  AiProvider,
  AnalyzeInput,
  AnalyzeResult,
  DraftContent,
  DraftTone,
  GenerateDraftInput,
  RewriteInput,
  RewriteResult,
  SummarizeInput,
  SummarizeResult,
} from "../types.js";

const GREETINGS: Record<DraftTone, (name: string) => string> = {
  professional: (name) => `Hi ${name},`,
  friendly: (name) => `Hey ${name},`,
  formal: (name) => `Dear ${name},`,
};

const ASKS: Record<DraftTone, string> = {
  professional:
    "Is this still something you'd like to move forward with? If it's easier, I'm happy to jump on a 15-minute call this week and walk through it together.",
  friendly:
    "Is this still on your radar? A quick yes or no is all I need — happy to adjust if the timing isn't right.",
  formal:
    "Please let me know whether you wish to proceed, or if there is anything I can clarify.",
};

const SIGNOFFS: Record<DraftTone, string> = {
  professional: "Best,",
  friendly: "Cheers,",
  formal: "Regards,",
};

const OPENERS: Array<(input: GenerateDraftInput) => string> = [
  (input) =>
    `Just floating this back to the top of your inbox — I shared the ${input.category || "details"} around ${input.daysWaiting + 1} days ago and wanted to make sure it didn't get buried.`,
  (input) =>
    `I wanted to circle back on the ${input.category || "conversation"} we discussed — it's been a few days and I wanted to check whether you've had a chance to look it over.`,
  (input) =>
    `I know your inbox gets busy, so I wanted to gently nudge this ${input.category || "thread"} back up the list and see if you'd like to take it forward.`,
];

function summarizeMessages(messages: { direction: "inbound" | "outbound"; body: string }[]): string {
  const latest = messages[0];
  if (!latest) {
    return "The thread has no messages recorded yet.";
  }
  const own = messages.filter((message) => message.direction === "outbound");
  const inbound = messages.filter((message) => message.direction === "inbound");
  if (inbound.length === 0) {
    return "The thread is one-sided so far — awaiting the recipient's first reply.";
  }
  if (own.length >= 1 && inbound.length >= 1) {
    return `The recipient replied, but the thread has gone quiet after ${inbound.length} incoming message(s).`;
  }
  return "The thread has an active exchange with the recipient.";
}

function urgencyFor(input: AnalyzeInput): AnalyzeResult["urgency"] {
  const recommendedWaitDays = Math.max(
    0,
    Math.min(7, Math.round(input.daysWaiting / 2)),
  );
  if (input.priority === "high" && input.daysWaiting >= recommendedWaitDays) {
    return "high";
  }
  if (input.daysWaiting >= 3) {
    return "medium";
  }
  return "low";
}

export const localProvider: AiProvider = {
  name: "local",

  async generateDraft(input: GenerateDraftInput): Promise<DraftContent> {
    const firstName = input.recipientName.split(" ")[0] || input.recipientName;
    const opener = OPENERS[(input.variant - 1) % OPENERS.length]!;
    const openerText = opener(input);
    const subject = input.subject.startsWith("Re:") ? input.subject : `Re: ${input.subject}`;
    const body = [
      GREETINGS[input.tone](firstName),
      "",
      openerText,
      "",
      ASKS[input.tone],
      input.value ? `For reference, the deal is valued at ${input.value}.` : null,
      "",
      SIGNOFFS[input.tone],
      input.senderName,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
    return { subject, body };
  },

  async summarize(input: SummarizeInput): Promise<SummarizeResult> {
    return { summary: summarizeMessages(input.messages) };
  },

  async rewrite(input: RewriteInput): Promise<RewriteResult> {
    const intro =
      input.tone === "formal"
        ? "Thank you for your time. Please see the updated version below."
        : input.tone === "friendly"
          ? "Here's a friendlier version of the note:"
          : "Here is a revised version of the note:";
    return {
      body: [intro, "", input.body.trim()].join("\n"),
    };
  },

  async adjustTone(input: RewriteInput): Promise<RewriteResult> {
    const greeting =
      input.tone === "formal"
        ? "Dear recipient,"
        : input.tone === "friendly"
          ? "Hey there,"
          : "Hi,";
    return {
      body: [greeting, "", input.body.trim()].join("\n"),
    };
  },

  async analyze(input: AnalyzeInput): Promise<AnalyzeResult> {
    const recommendedWaitDays = Math.max(
      0,
      Math.min(7, Math.round(input.daysWaiting / 2)),
    );
    const reasoning = `The recipient acknowledged the thread but never committed to a next step. ${input.daysWaiting} day(s) of silence on a ${input.category || "conversation"} thread of ${input.priority} priority suggests a short, low-pressure nudge that restates the single decision needed has the highest expected reply rate.`;
    return {
      reasoning,
      recommendedWaitDays,
      urgency: urgencyFor(input),
    };
  },
};
