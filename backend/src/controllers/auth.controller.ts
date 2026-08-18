import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleProfile,
} from "../auth/oauth.service.js";
import { clearAuthCookies, setAuthCookies } from "../auth/token.service.js";
import { env } from "../config/env.js";
import { REFRESH_TOKEN_COOKIE } from "../constants/index.js";
import { AppError } from "../errors/index.js";
import { authService } from "../services/auth.service.js";
import { successResponse } from "../utils/apiResponse.js";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    setAuthCookies(res, result.tokens);
    res.status(201).json(successResponse("Account created successfully", { user: result.user }));
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    setAuthCookies(res, result.tokens);
    res.status(200).json(successResponse("Logged in successfully", { user: result.user }));
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const result = await authService.refresh(req.cookies[REFRESH_TOKEN_COOKIE]);
    setAuthCookies(res, result.tokens);
    res.status(200).json(successResponse("Tokens refreshed successfully", { user: result.user }));
  },

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.cookies[REFRESH_TOKEN_COOKIE]);
    clearAuthCookies(res);
    res.status(200).json(successResponse("Logged out successfully", {}));
  },

  async profile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const user = await authService.profile(req.user);
    res.status(200).json(successResponse("Profile retrieved successfully", { user }));
  },

  async google(req: Request, res: Response): Promise<void> {
    const state = randomBytes(32).toString("hex");
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      ...(env.NODE_ENV === "development" ? { domain: "localhost" } : {}),
      maxAge: OAUTH_STATE_MAX_AGE_MS,
    });
    res.redirect(buildGoogleAuthUrl(state));
  },

  async googleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code;
    const state = req.query.state;
    const expectedState = req.cookies[OAUTH_STATE_COOKIE];
    if (typeof code !== "string" || typeof state !== "string" || state !== expectedState) {
      throw new AppError("Invalid OAuth state", 400);
    }
    const { accessToken } = await exchangeGoogleCode(code);
    const profile = await fetchGoogleProfile(accessToken);
    const result = await authService.googleAuth(profile);
    setAuthCookies(res, result.tokens);
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });
    res.redirect(result.isNewUser ? `${env.FRONTEND_URL}/onboarding` : `${env.FRONTEND_URL}/dashboard`);
  },
};
