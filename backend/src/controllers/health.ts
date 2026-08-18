import type { Request, Response } from "express";
import { APP_NAME, API_VERSION } from "../constants/index.js";
import { pingDatabase } from "../db/index.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const databaseConnected = await pingDatabase();
  res
    .status(200)
    .json(
      successResponse("Health check successful", {
        service: APP_NAME,
        status: "ok",
        version: API_VERSION,
        database: databaseConnected ? "connected" : "disconnected",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    );
}
