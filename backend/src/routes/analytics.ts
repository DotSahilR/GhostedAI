import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { listQuerySchema, validateQuery } from "../middlewares/validate.js";

const router = Router();

router.use(authenticate);

router.get("/summary", validateQuery(listQuerySchema), analyticsController.summary);

export default router;
