import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewSettings, Settings } from "../schema/index.js";
import { settings } from "../schema/index.js";

export const settingsRepository = {
  async create(data: NewSettings): Promise<Settings> {
    const [row] = await db.insert(settings).values(data).returning();
    return row as Settings;
  },

  async findByUserId(userId: string): Promise<Settings | null> {
    const [row] = await db.select().from(settings).where(eq(settings.userId, userId));
    return row ?? null;
  },

  async upsert(userId: string, data: Partial<NewSettings>): Promise<Settings> {
    const existing = await settingsRepository.findByUserId(userId);
    if (existing) {
      const [row] = await db
        .update(settings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(settings.id, existing.id))
        .returning();
      return row as Settings;
    }
    const [row] = await db
      .insert(settings)
      .values({ userId, ...data })
      .returning();
    return row as Settings;
  },
};
