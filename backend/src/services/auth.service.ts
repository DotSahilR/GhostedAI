import bcrypt from "bcrypt";
import type { GoogleUserProfile } from "../auth/oauth.service.js";
import { generateRefreshToken, hashToken, signAccessToken } from "../auth/token.service.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/index.js";
import { refreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import type { AuthUser, PublicUser } from "../types/index.js";
import { parseDurationToMs } from "../utils/duration.js";
import { toPublicUser } from "../utils/user.js";

const BCRYPT_ROUNDS = 12;

const refreshLifetimeMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: PublicUser;
  tokens: TokenPair;
}

async function issueTokens(userId: string): Promise<TokenPair> {
  const refreshToken = generateRefreshToken();
  await refreshTokenRepository.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshLifetimeMs),
  });
  return {
    accessToken: signAccessToken(userId),
    refreshToken,
  };
}

export const authService = {
  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email,
      passwordHash,
      provider: "local",
    });
    const tokens = await issueTokens(user.id);
    return { user: toPublicUser(user), tokens };
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email.toLowerCase());
    if (!user?.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }
    await userRepository.updateLastLoginAt(user.id);
    const tokens = await issueTokens(user.id);
    return { user: toPublicUser(user), tokens };
  },

  async refresh(refreshToken: string | undefined): Promise<AuthResult> {
    if (!refreshToken) {
      throw new AppError("Refresh token required", 401);
    }
    const record = await refreshTokenRepository.findActiveByHash(hashToken(refreshToken));
    if (!record || record.expiresAt.getTime() <= Date.now()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
    await refreshTokenRepository.revokeById(record.id);
    const user = await userRepository.findById(record.userId);
    if (!user) {
      throw new AppError("User not found", 401);
    }
    const tokens = await issueTokens(user.id);
    return { user: toPublicUser(user), tokens };
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const record = await refreshTokenRepository.findActiveByHash(hashToken(refreshToken));
    if (record) {
      await refreshTokenRepository.revokeById(record.id);
    }
  },

  async googleAuth(
    profile: GoogleUserProfile,
  ): Promise<{ user: PublicUser; tokens: TokenPair; isNewUser: boolean }> {
    const email = profile.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);
    let user;
    let isNewUser = false;

    if (existing) {
      if (!existing.googleId) {
        user = await userRepository.linkGoogle(existing.id, {
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
        });
      } else {
        user = existing;
      }
    } else {
      isNewUser = true;
      const fallbackName = email.split("@")[0] ?? "User";
      user = await userRepository.create({
        name: profile.name ?? fallbackName,
        email,
        provider: "google",
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      });
    }

    await userRepository.updateLastLoginAt(user.id);
    const tokens = await issueTokens(user.id);
    return { user: toPublicUser(user), tokens, isNewUser };
  },

  async profile(authUser: AuthUser): Promise<PublicUser> {
    const user = await userRepository.findById(authUser.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return toPublicUser(user);
  },
};
