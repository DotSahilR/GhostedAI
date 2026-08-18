import { Router, type NextFunction, type Request, type Response } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { followupDraftController } from "../controllers/followup-draft.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { uuidParamSchema, validate, validateParams } from "../middlewares/validate.js";
import { generateDraftSchema, rewriteDraftSchema } from "../validators/ai.validators.js";
import { createFollowupDraftSchema, updateFollowupDraftSchema } from "../validators/followup-draft.validators.js";
import { AppError } from "../errors/index.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/generate", validate(generateDraftSchema), aiController.generate);
router.post("/:id/regenerate", validateParams(uuidParamSchema), validate(generateDraftSchema), aiController.regenerate);
router.post("/:id/rewrite", validateParams(uuidParamSchema), validate(rewriteDraftSchema), aiController.rewrite);
router.post("/:id/tone", validateParams(uuidParamSchema), validate(rewriteDraftSchema), aiController.adjustTone);
router.post("/", validate(createFollowupDraftSchema), (req: Request, _res: Response, next: NextFunction) => {
  if (req.params.conversationId) {
    return void followupDraftController.create(req, _res);
  }
  return next(new AppError("conversationId is required to create a draft", 400));
});
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.params.conversationId) {
    return void followupDraftController.listByConversation(req, res);
  }
  return void followupDraftController.list(req, res);
});
router.get("/:id", validateParams(uuidParamSchema), followupDraftController.get);
router.patch("/:id", validateParams(uuidParamSchema), validate(updateFollowupDraftSchema), followupDraftController.update);
router.delete("/:id", validateParams(uuidParamSchema), followupDraftController.remove);

export default router;
