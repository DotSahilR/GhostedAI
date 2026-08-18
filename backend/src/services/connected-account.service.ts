import { AppError } from "../errors/index.js";
import { connectedAccountRepository } from "../repositories/connected-account.repository.js";
import type { NewConnectedAccount } from "../schema/index.js";

export const connectedAccountService = {
  async create(userId: string, data: NewConnectedAccount) {
    return connectedAccountRepository.create({ ...data, userId });
  },

  async list(userId: string) {
    return connectedAccountRepository.listByUser(userId);
  },

  async get(userId: string, id: string) {
    const account = await connectedAccountRepository.findById(id, userId);
    if (!account) {
      throw new AppError("Connected account not found", 404);
    }
    return account;
  },

  async update(userId: string, id: string, data: Partial<NewConnectedAccount>) {
    const account = await connectedAccountRepository.update(id, userId, data);
    if (!account) {
      throw new AppError("Connected account not found", 404);
    }
    return account;
  },

  async remove(userId: string, id: string) {
    const deleted = await connectedAccountRepository.remove(id, userId);
    if (!deleted) {
      throw new AppError("Connected account not found", 404);
    }
  },
};
