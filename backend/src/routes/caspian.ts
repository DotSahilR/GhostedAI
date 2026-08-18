import { Router } from "express";
import { caspianController } from "../controllers/caspian.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  caspianConnectSchema,
  caspianDisconnectSchema,
  caspianSendSchema,
  caspianSyncSchema,
} from "../validators/caspian.validators.js";

const router = Router();

router.post("/webhook", caspianController.webhook);

router.use(authenticate);

router.get("/status", caspianController.status);
router.post("/connect", validate(caspianConnectSchema), caspianController.connect);
router.post("/sync", validate(caspianSyncSchema), caspianController.sync);
router.post("/send", validate(caspianSendSchema), caspianController.send);
router.post("/disconnect", validate(caspianDisconnectSchema), caspianController.disconnect);

export default router;
