import { Router } from "express";
import { trackingRuleController } from "../controllers/tracking-rule.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  uuidParamSchema,
  validate,
  validateParams,
} from "../middlewares/validate.js";
import {
  createTrackingRuleSchema,
  updateTrackingRuleSchema,
} from "../validators/tracking-rule.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", trackingRuleController.list);
router.post("/", validate(createTrackingRuleSchema), trackingRuleController.create);
router.get("/:id", validateParams(uuidParamSchema), trackingRuleController.get);
router.patch(
  "/:id",
  validateParams(uuidParamSchema),
  validate(updateTrackingRuleSchema),
  trackingRuleController.update,
);
router.delete("/:id", validateParams(uuidParamSchema), trackingRuleController.remove);

export default router;
