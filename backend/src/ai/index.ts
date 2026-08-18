import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { AiProvider } from "./types.js";
import { localProvider } from "./providers/local.js";
import { geminiProvider } from "./providers/gemini.js";
import { openaiProvider } from "./providers/openai.js";
import { ollamaProvider } from "./providers/ollama.js";

const PROVIDER_CONFIG: Record<
  string,
  { provider: AiProvider; configured: boolean; missing: string }
> = {
  local: { provider: localProvider, configured: true, missing: "" },
  gemini: {
    provider: geminiProvider,
    configured: Boolean(env.GEMINI_API_KEY),
    missing: "GEMINI_API_KEY",
  },
  openai: {
    provider: openaiProvider,
    configured: Boolean(env.OPENAI_API_KEY),
    missing: "OPENAI_API_KEY",
  },
  ollama: {
    provider: ollamaProvider,
    configured: Boolean(env.OLLAMA_BASE_URL),
    missing: "OLLAMA_BASE_URL",
  },
};

export function resolveProvider(): AiProvider {
  const entry = PROVIDER_CONFIG[env.AI_PROVIDER];
  if (!entry) {
    logger.warn(
      `AI provider "${env.AI_PROVIDER}" is not supported, falling back to "local"`,
    );
    return localProvider;
  }
  if (!entry.configured) {
    logger.warn(
      `AI provider "${env.AI_PROVIDER}" is not configured (missing ${entry.missing}), falling back to "local"`,
    );
    return localProvider;
  }
  return entry.provider;
}

export const aiProvider = resolveProvider();

export function aiProviderStatus(): {
  configured: string;
  active: string;
} {
  return {
    configured: env.AI_PROVIDER,
    active: aiProvider.name,
  };
}
