import rateLimit from "express-rate-limit";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "../constants/index.js";
import { errorResponse } from "../utils/apiResponse.js";

export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many requests, please try again later"),
});

export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many requests, please try again later"),
});
