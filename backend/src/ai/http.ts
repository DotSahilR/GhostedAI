import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "../errors/index.js";

export interface CompletionOptions {
  system: string;
  prompt: string;
  temperature?: number;
}

export async function completeGemini(options: CompletionOptions): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError("Gemini API key is not configured", 500);
  }
  const { data } = await axios.post<{
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  }>(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.AI_MODEL}:generateContent`,
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: options.system },
            { text: options.prompt },
          ],
        },
      ],
      generationConfig: { temperature: options.temperature ?? 0.7 },
    },
    { params: { key: env.GEMINI_API_KEY } },
  );
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("");
  if (!text) {
    throw new AppError("Gemini returned an empty completion", 502);
  }
  return text.trim();
}

export async function completeOpenAI(options: CompletionOptions): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    throw new AppError("OpenAI API key is not configured", 500);
  }
  const { data } = await axios.post<{
    choices?: Array<{ message?: { content?: string } }>;
  }>(
    `${env.OPENAI_BASE_URL}/chat/completions`,
    {
      model: env.AI_MODEL,
      temperature: options.temperature ?? 0.7,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.prompt },
      ],
    },
    { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } },
  );
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new AppError("OpenAI returned an empty completion", 502);
  }
  return text.trim();
}

export async function completeOllama(options: CompletionOptions): Promise<string> {
  const { data } = await axios.post<{ response?: string }>(
    `${env.OLLAMA_BASE_URL}/api/generate`,
    {
      model: env.AI_MODEL,
      prompt: [options.system, options.prompt].join("\n\n"),
      stream: false,
      options: { temperature: options.temperature ?? 0.7 },
    },
  );
  const text = data.response;
  if (!text) {
    throw new AppError("Ollama returned an empty completion", 502);
  }
  return text.trim();
}

export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new AppError("LLM response did not contain valid JSON", 502);
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
