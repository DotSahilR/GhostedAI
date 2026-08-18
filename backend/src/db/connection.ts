import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import * as schema from "../schema/index.js";

function buildPoolConfig(): { connectionString: string; ssl: object | false } {
  let connectionString = env.DATABASE_URL;
  let ssl: object | false = false;

  if (env.DATABASE_SSL) {
    ssl = { rejectUnauthorized: false };
    const qIndex = connectionString.indexOf("?");
    if (qIndex !== -1) {
      const base = connectionString.slice(0, qIndex);
      const params = new URLSearchParams(connectionString.slice(qIndex + 1));
      params.delete("sslmode");
      const remaining = params.toString();
      connectionString = remaining ? `${base}?${remaining}` : base;
    }
  }

  return { connectionString, ssl };
}

const poolConfig = buildPoolConfig();

export const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  logger.error("Unexpected error on idle database client", error.message);
});

export const db = drizzle(pool, { schema });
