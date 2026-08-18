import { Router, type NextFunction, type Request, type Response } from "express";
import { followupHistoryController } from "../controllers/followup-history.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { uuidConversationSchema } from "../middlewares/validate.js";
import { AppError } from "../errors/index.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.params.conversationId) {
    const result = uuidConversationSchema.safeParse(req.params);
    if (!result.success) {
      return next(new AppError("Invalid conversationId parameter", 400));
    }
    return void followupHistoryController.listByConversation(req, res);
  }
  return void followupHistoryController.list(req, res);
});

export default router;
