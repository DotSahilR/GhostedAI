import { settingsRepository } from "../repositories/settings.repository.js";
import type { NewSettings } from "../schema/index.js";

export const settingsService = {
  async get(userId: string) {
    const existing = await settingsRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    return settingsRepository.create({ userId });
  },

  async update(userId: string, data: Partial<NewSettings>) {
    return settingsRepository.upsert(userId, data);
  },
};
