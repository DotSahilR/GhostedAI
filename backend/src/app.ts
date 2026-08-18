import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { morganStream } from "./config/logger.js";
import { API_PREFIX, JSON_BODY_LIMIT } from "./constants/index.js";
import { errorHandler } from "./middlewares/error.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiLimiter } from "./middlewares/rate-limiter.js";
import { apiRouter } from "./routes/index.js";
import { resolveCorsOrigin } from "./utils/cors.js";

export const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(helmet());

app.use(cors({ origin: resolveCorsOrigin, credentials: true }));

app.use(express.json({
  limit: JSON_BODY_LIMIT,
  verify: (req, _res, buf) => {
    (req as unknown as Record<string, unknown>).rawBody = buf;
  },
}));

app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));

app.use(cookieParser(env.SESSION_SECRET));

app.use(
  morgan(":method :url :status :response-time ms - :remote-addr", { stream: morganStream }),
);

app.use(apiLimiter);

app.use(API_PREFIX, apiRouter);

app.use(notFoundHandler);

app.use(errorHandler);
