import { activityLogRepository } from "../repositories/activity-log.repository.js";
import type { PaginationInput } from "../utils/pagination.js";
import { toPaginated } from "../utils/pagination.js";

export const activityLogService = {
  async list(userId: string, pagination: PaginationInput) {
    const { items, total } = await activityLogRepository.listByUser(userId, pagination);
    return toPaginated(items, total, pagination);
  },
};
