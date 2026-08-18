import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  listQuerySchema,
  uuidParamSchema,
  validateParams,
  validateQuery,
} from "../middlewares/validate.js";

const router = Router();

router.use(authenticate);

router.get("/unread-count", notificationController.unreadCount);
router.patch("/read-all", notificationController.markAllRead);
router.get("/", validateQuery(listQuerySchema), notificationController.list);
router.patch("/:id/read", validateParams(uuidParamSchema), notificationController.markRead);

export default router;
