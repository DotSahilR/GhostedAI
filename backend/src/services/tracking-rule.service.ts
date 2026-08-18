import { AppError } from "../errors/index.js";
import { trackingRuleRepository } from "../repositories/tracking-rule.repository.js";
import type { NewTrackingRule } from "../schema/index.js";

export const trackingRuleService = {
  async create(userId: string, data: NewTrackingRule) {
    return trackingRuleRepository.create({ ...data, userId });
  },

  async list(userId: string) {
    return trackingRuleRepository.listByUser(userId);
  },

  async get(userId: string, id: string) {
    const rule = await trackingRuleRepository.findById(id, userId);
    if (!rule) {
      throw new AppError("Tracking rule not found", 404);
    }
    return rule;
  },

  async update(userId: string, id: string, data: Partial<NewTrackingRule>) {
    const rule = await trackingRuleRepository.update(id, userId, data);
    if (!rule) {
      throw new AppError("Tracking rule not found", 404);
    }
    return rule;
  },

  async remove(userId: string, id: string) {
    const deleted = await trackingRuleRepository.remove(id, userId);
    if (!deleted) {
      throw new AppError("Tracking rule not found", 404);
    }
  },
};
