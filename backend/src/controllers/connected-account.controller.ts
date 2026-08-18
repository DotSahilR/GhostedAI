import type { Request, Response } from "express";
import { connectedAccountService } from "../services/connected-account.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { param, requireUser } from "../utils/request.js";

export const connectedAccountController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const account = await connectedAccountService.create(user.id, req.body);
    res.status(201).json(successResponse("Connected account created", { account }));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const accounts = await connectedAccountService.list(user.id);
    res.status(200).json(successResponse("Connected accounts retrieved", { accounts }));
  },

  async get(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const account = await connectedAccountService.get(user.id, param(req, "id"));
    res.status(200).json(successResponse("Connected account retrieved", { account }));
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const account = await connectedAccountService.update(user.id, param(req, "id"), req.body);
    res.status(200).json(successResponse("Connected account updated", { account }));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    await connectedAccountService.remove(user.id, param(req, "id"));
    res.status(200).json(successResponse("Connected account deleted", {}));
  },
};
