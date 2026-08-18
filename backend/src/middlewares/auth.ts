import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/token.service.js";
import { ACCESS_TOKEN_COOKIE } from "../constants/index.js";
import { AppError } from "../errors/index.js";
import { userRepository } from "../repositories/user.repository.js";
import { toAuthUser } from "../utils/user.js";

function extractAccessToken(req: Request): string | undefined {
  const cookieToken = req.cookies[ACCESS_TOKEN_COOKIE];
  if (cookieToken) {
    return cookieToken;
  }
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }
  return undefined;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractAccessToken(req);
  if (!token) {
    throw new AppError("Authentication required", 401);
  }
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw new AppError("User not found", 401);
  }
  req.user = toAuthUser(user);
  next();
}
