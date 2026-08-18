import { completeGemini } from "../http.js";
import { createLlmProvider } from "./base.js";

export const geminiProvider = createLlmProvider("gemini", completeGemini);
