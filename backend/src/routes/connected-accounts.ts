import { Router } from "express";
import { connectedAccountController } from "../controllers/connected-account.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  listQuerySchema,
  uuidParamSchema,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validate.js";
import {
  createConnectedAccountSchema,
  updateConnectedAccountSchema,
} from "../validators/connected-account.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listQuerySchema), connectedAccountController.list);
router.post("/", validate(createConnectedAccountSchema), connectedAccountController.create);
router.get("/:id", validateParams(uuidParamSchema), connectedAccountController.get);
router.patch(
  "/:id",
  validateParams(uuidParamSchema),
  validate(updateConnectedAccountSchema),
  connectedAccountController.update,
);
router.delete("/:id", validateParams(uuidParamSchema), connectedAccountController.remove);

export default router;
