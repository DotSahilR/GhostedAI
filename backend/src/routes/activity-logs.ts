import { Router } from "express";
import { activityLogController } from "../controllers/activity-log.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { listQuerySchema, validateQuery } from "../middlewares/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listQuerySchema), activityLogController.list);

export default router;
