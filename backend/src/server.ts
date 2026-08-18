import { app } from "./app.js";
import { startCronJobs, stopCronJobs } from "./automation/scheduler.js";
import { logger } from "./config/logger.js";
import { APP_NAME, API_PREFIX, SHUTDOWN_TIMEOUT_MS } from "./constants/index.js";
import { env } from "./config/env.js";
import { closeDatabase, pingDatabase } from "./db/index.js";

const server = app.listen(env.PORT, () => {
  logger.info(
    `${APP_NAME} server listening on http://localhost:${env.PORT}${API_PREFIX} (${env.NODE_ENV})`,
  );
  void pingDatabase()
    .then((connected) => {
      if (connected) {
        logger.info("Database connection established");
      } else {
        logger.warn("Database connection could not be established");
      }
    })
    .catch(() => {
      logger.warn("Database connection could not be established");
    });
  startCronJobs();
});

function shutdown(signal: string): void {
  logger.info(`${signal} received, shutting down gracefully`);
  stopCronJobs();
  server.close(() => {
    void closeDatabase().finally(() => {
      logger.info("Shutdown complete");
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
