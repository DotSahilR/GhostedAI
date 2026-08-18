import { Router } from "express";
import { automationController } from "../controllers/automation.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { runAutomationSchema } from "../validators/automation.validators.js";

const router = Router();

router.use(authenticate);

router.get("/status", automationController.status);
router.post("/run", validate(runAutomationSchema), automationController.run);

export default router;
