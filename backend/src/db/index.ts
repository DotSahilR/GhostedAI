import { logger } from "../config/logger.js";
import { pool } from "./connection.js";

export { db, pool } from "./connection.js";

export async function pingDatabase(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    logger.warn("Database ping failed", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
