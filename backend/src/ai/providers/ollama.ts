import { completeOllama } from "../http.js";
import { createLlmProvider } from "./base.js";

export const ollamaProvider = createLlmProvider("ollama", completeOllama);
