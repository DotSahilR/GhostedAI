import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updateSettingsSchema } from "../validators/settings.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", settingsController.get);
router.patch("/", validate(updateSettingsSchema), settingsController.update);

export default router;
