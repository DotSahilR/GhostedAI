import cron, { type ScheduledTask } from "node-cron";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { getProvider } from "../integrations/registry.js";
import { prepareFollowUps, processReplies, sendFollowUps } from "./engine.js";

let prepareTask: ScheduledTask | null = null;
let sendTask: ScheduledTask | null = null;
let prepareRunning = false;
let sendRunning = false;

async function syncAllProviders(): Promise<void> {
  const providers = ["gmail", "caspian"];
  for (const name of providers) {
    const provider = getProvider(name);
    if (!provider) continue;
    try {
      const results = await provider.syncAllConnected();
      const ok = results.filter((r) => r.ok).length;
      const failed = results.length - ok;
      if (failed > 0) {
        logger.warn(`[automation:prepare] ${name} sync: ${failed} failed, ${ok} succeeded`);
      }
    } catch (error) {
      logger.warn(
        `[automation:prepare] ${name} sync failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }
}

export function startCronJobs(): void {
  if (!env.CRON_ENABLED || prepareTask) {
    return;
  }
  prepareTask = cron.schedule(env.CRON_PREPARE, () => {
    if (prepareRunning) {
      return;
    }
    prepareRunning = true;
    syncAllProviders()
      .then(() => processReplies())
      .then(() => prepareFollowUps())
      .then((prepared) => {
        const totalWork = prepared.started + prepared.generated + prepared.archived;
        if (totalWork > 0) {
          logger.info(`[automation:prepare] completed: ${JSON.stringify(prepared)}`);
        }
      })
      .catch((error) => logger.error("[automation:prepare] failed", error))
      .finally(() => {
        prepareRunning = false;
      });
  });
  sendTask = cron.schedule(env.CRON_SEND, () => {
    if (sendRunning) {
      return;
    }
    sendRunning = true;
    void sendFollowUps()
      .then((result) => {
        const totalWork = result.sent + result.failed;
        if (totalWork > 0) {
          logger.info(`[automation:send] completed: ${JSON.stringify(result)}`);
        }
      })
      .catch((error) => logger.error("[automation:send] failed", error))
      .finally(() => {
        sendRunning = false;
      });
  });
  logger.info(
    `Automation scheduler started (prepare: ${env.CRON_PREPARE}, send: ${env.CRON_SEND})`,
  );
}

export function stopCronJobs(): void {
  prepareTask?.stop();
  sendTask?.stop();
  prepareTask = null;
  sendTask = null;
}
