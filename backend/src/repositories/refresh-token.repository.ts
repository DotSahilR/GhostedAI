import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewRefreshToken, RefreshToken } from "../schema/index.js";
import { refreshTokens } from "../schema/index.js";

export const refreshTokenRepository = {
  async create(data: NewRefreshToken): Promise<RefreshToken> {
    const [row] = await db.insert(refreshTokens).values(data).returning();
    return row as RefreshToken;
  },

  async findActiveByHash(tokenHash: string): Promise<RefreshToken | null> {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));
    return row ?? null;
  },

  async revokeById(id: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, id));
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  },
};
