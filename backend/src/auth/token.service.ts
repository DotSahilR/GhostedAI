import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.js";
import { ACCESS_TOKEN_COOKIE, APP_NAME, REFRESH_TOKEN_COOKIE } from "../constants/index.js";
import { AppError } from "../errors/index.js";
import { parseDurationToMs } from "../utils/duration.js";

export interface AccessTokenPayload {
  sub: string;
  type: "access";
}

const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? "none" : "lax",
  path: "/",
  ...(env.NODE_ENV === "development" ? { domain: "localhost" } : {}),
  maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
};

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? "none" : "lax",
  path: "/",
  ...(env.NODE_ENV === "development" ? { domain: "localhost" } : {}),
  maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
};

export function signAccessToken(userId: string): string {
  return jwt.sign({ type: "access", sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: APP_NAME,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === "string" || payload.type !== "access") {
    throw new AppError("Invalid access token", 401);
  }
  if (typeof payload.sub !== "string") {
    throw new AppError("Invalid access token", 401);
  }
  return { sub: payload.sub, type: "access" };
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshCookieOptions);
}

export function clearAuthCookies(res: Response): void {
  const clearOpts = {
    path: "/",
    ...(env.NODE_ENV === "development" ? { domain: "localhost" } : {}),
  };
  res.clearCookie(ACCESS_TOKEN_COOKIE, clearOpts);
  res.clearCookie(REFRESH_TOKEN_COOKIE, clearOpts);
}
