import type {
  AiProvider,
  AnalyzeInput,
  DraftContent,
  GenerateDraftInput,
  RewriteInput,
  SummarizeInput,
} from "../types.js";
import {
  buildAnalysisPrompt,
  buildDraftPrompt,
  buildRewritePrompt,
  buildSummarizePrompt,
  buildTonePrompt,
} from "../prompts.js";
import { extractJson, type CompletionOptions } from "../http.js";

export type CompleteFn = (options: CompletionOptions) => Promise<string>;

export function createLlmProvider(name: string, complete: CompleteFn): AiProvider {
  return {
    name,

    async generateDraft(input: GenerateDraftInput): Promise<DraftContent> {
      const text = await complete({
        system:
          "You are an expert follow-up copywriter. Respond with strictly valid JSON and nothing else.",
        prompt: buildDraftPrompt(input),
      });
      const parsed = extractJson<{ subject?: string; body?: string }>(text);
      return {
        subject: parsed.subject?.trim() || input.subject,
        body: parsed.body?.trim() || text,
      };
    },

    async summarize(input: SummarizeInput) {
      const text = await complete({
        system: "You write concise, accurate conversation summaries.",
        prompt: buildSummarizePrompt(input),
      });
      return { summary: text };
    },

    async rewrite(input: RewriteInput) {
      const text = await complete({
        system:
          "You rewrite follow-up messages while preserving every factual detail and the proposed next step.",
        prompt: buildRewritePrompt(input),
      });
      return { body: text };
    },

    async adjustTone(input: RewriteInput) {
      const text = await complete({
        system:
          "You adjust the tone of follow-up messages while keeping their meaning and details intact.",
        prompt: buildTonePrompt(input),
      });
      return { body: text };
    },

    async analyze(input: AnalyzeInput) {
      const text = await complete({
        system:
          "You analyze sales follow-up conversations. Respond with strictly valid JSON and nothing else.",
        prompt: buildAnalysisPrompt(input),
      });
      const parsed = extractJson<{
        reasoning?: string;
        recommendedWaitDays?: number;
        urgency?: string;
      }>(text);
      const urgency =
        parsed.urgency === "low" || parsed.urgency === "medium" || parsed.urgency === "high"
          ? parsed.urgency
          : "medium";
      return {
        reasoning: parsed.reasoning?.trim() || "No reasoning returned.",
        recommendedWaitDays: Math.max(
          0,
          Math.min(7, Math.round(Number(parsed.recommendedWaitDays ?? 0))),
        ),
        urgency,
      };
    },
  };
}
