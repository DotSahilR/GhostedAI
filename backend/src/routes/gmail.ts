import { Router } from "express";
import { gmailController } from "../controllers/gmail.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { z } from "zod";

const router = Router();

const gmailSyncSchema = z.object({
  accountId: z.string().uuid(),
});

const gmailDisconnectSchema = z.object({
  accountId: z.string().uuid(),
});

router.get("/status", gmailController.status);
router.get("/auth-url", authenticate, gmailController.authUrl);
router.get("/callback", gmailController.callback);
router.post("/sync", authenticate, validate(gmailSyncSchema), gmailController.sync);
router.post("/disconnect", authenticate, validate(gmailDisconnectSchema), gmailController.disconnect);

export default router;
