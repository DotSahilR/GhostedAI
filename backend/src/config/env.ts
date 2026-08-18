import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("30d"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL: z.string().default(""),
  GMAIL_CALLBACK_URL: z.string().default(""),
  AI_PROVIDER: z.string().default("local"),
  AI_MODEL: z.string().default("gemini-2.0-flash"),
  GEMINI_API_KEY: z.string().default(""),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_BASE_URL: z.string().default("https://api.openai.com/v1"),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  CASPIAN_API_KEY: z.string().default(""),
  CASPIAN_BASE_URL: z.string().default(""),
  CASPIAN_WEBHOOK_SECRET: z.string().default(""),
  CRON_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  CRON_PREPARE: z.string().default("*/5 * * * *"),
  CRON_SEND: z.string().default("* * * * *"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "http", "debug", "trace", "silent"])
    .default("info"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  console.error("Invalid environment variables");
  for (const issue of issues) {
    console.error(`  - ${issue}`);
  }
  process.exit(1);
}

export const env = result.data;
