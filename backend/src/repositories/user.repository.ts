import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewUser, User } from "../schema/index.js";
import { users } from "../schema/index.js";

export const userRepository = {
  async create(data: NewUser): Promise<User> {
    const [row] = await db.insert(users).values(data).returning();
    return row as User;
  },

  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    return row ?? null;
  },

  async updateLastLoginAt(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  },

  async linkGoogle(
    id: string,
    data: { googleId: string; avatarUrl: string | null },
  ): Promise<User> {
    const [row] = await db
      .update(users)
      .set({
        googleId: data.googleId,
        ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return row as User;
  },
};
