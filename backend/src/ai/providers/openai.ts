import { completeOpenAI } from "../http.js";
import { createLlmProvider } from "./base.js";

export const openaiProvider = createLlmProvider("openai", completeOpenAI);
