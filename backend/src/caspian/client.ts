import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "../errors/index.js";
import type {
  CaspianChannel,
  CaspianConnection,
  CaspianConversation,
  CaspianMessage,
} from "./types.js";

function apiUrl(path: string): string {
  const base = env.CASPIAN_BASE_URL.replace(/\/+$/, "");
  return `${base}${path}`;
}

function assertConfigured(): void {
  if (!env.CASPIAN_BASE_URL) {
    throw new AppError("Caspian integration is not configured", 500);
  }
}

async function caspianRequest<T>(
  path: string,
  input: { apiKey: string; method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown },
): Promise<T> {
  assertConfigured();
  if (!input.apiKey) {
    throw new AppError("Caspian API key is required", 400);
  }
  const { data } = await axios.request<T>({
    url: apiUrl(path),
    method: input.method ?? "GET",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    data: input.body,
  });
  return data;
}

export async function caspianListChannels(apiKey: string): Promise<CaspianChannel[]> {
  return caspianRequest<CaspianChannel[]>("/v1/channels", { apiKey });
}

export async function caspianListConnections(apiKey: string): Promise<CaspianConnection[]> {
  return caspianRequest<CaspianConnection[]>("/v1/connections", { apiKey });
}

export async function caspianListConversations(apiKey: string): Promise<CaspianConversation[]> {
  return caspianRequest<CaspianConversation[]>("/v1/conversations", { apiKey });
}

export async function caspianListConversationMessages(
  apiKey: string,
  conversationId: string,
): Promise<CaspianMessage[]> {
  return caspianRequest<CaspianMessage[]>(`/v1/conversations/${conversationId}/messages`, { apiKey });
}

export async function caspianSendMessage(
  apiKey: string,
  conversationId: string,
  input: { text: string; html?: string },
): Promise<{ id: string }> {
  return caspianRequest<{ id: string }>(`/v1/conversations/${conversationId}/messages`, {
    apiKey,
    method: "POST",
    body: input,
  });
}
