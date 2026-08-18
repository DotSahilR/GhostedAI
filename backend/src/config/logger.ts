import { env } from "./env.js";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "http" | "debug" | "trace";

const LEVEL_WEIGHTS: Record<LogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  debug: 5,
  trace: 6,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  fatal: "FATAL",
  error: "ERROR",
  warn: "WARN",
  info: "INFO",
  http: "HTTP",
  debug: "DEBUG",
  trace: "TRACE",
};

const activeWeight = LEVEL_WEIGHTS[env.LOG_LEVEL as LogLevel] ?? LEVEL_WEIGHTS.info;

function write(level: LogLevel, message: string, args: unknown[]): void {
  if (LEVEL_WEIGHTS[level] > activeWeight) {
    return;
  }
  const timestamp = new Date().toISOString();
  const formatted = args
    .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
    .join(" ");
  const line = `[${timestamp}] ${LEVEL_LABELS[level]} ${message}${formatted ? ` ${formatted}` : ""}`;
  if (level === "fatal" || level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  fatal: (message: string, ...args: unknown[]): void => write("fatal", message, args),
  error: (message: string, ...args: unknown[]): void => write("error", message, args),
  warn: (message: string, ...args: unknown[]): void => write("warn", message, args),
  info: (message: string, ...args: unknown[]): void => write("info", message, args),
  http: (message: string, ...args: unknown[]): void => write("http", message, args),
  debug: (message: string, ...args: unknown[]): void => write("debug", message, args),
  trace: (message: string, ...args: unknown[]): void => write("trace", message, args),
};

export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
