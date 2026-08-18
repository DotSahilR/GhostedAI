import { Router } from "express";
import { configController } from "../controllers/config.controller.js";

const router = Router();

router.get("/status", configController.status);

export default router;
