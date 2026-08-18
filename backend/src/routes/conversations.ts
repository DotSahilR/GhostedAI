import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { conversationController } from "../controllers/conversation.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  listQuerySchema,
  uuidParamSchema,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validate.js";
import {
  createConversationSchema,
  updateConversationSchema,
} from "../validators/conversation.validators.js";
import { createMessageSchema } from "../validators/message.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listQuerySchema), conversationController.list);
router.post("/", validate(createConversationSchema), conversationController.create);
router.get("/:id/analysis", validateParams(uuidParamSchema), aiController.analyze);
router.post("/:id/summarize", validateParams(uuidParamSchema), aiController.summarize);
router.get("/:id/messages", validateParams(uuidParamSchema), conversationController.listMessages);
router.post(
  "/:id/messages",
  validateParams(uuidParamSchema),
  validate(createMessageSchema),
  conversationController.addMessage,
);
router.get("/:id", validateParams(uuidParamSchema), conversationController.get);
router.patch(
  "/:id",
  validateParams(uuidParamSchema),
  validate(updateConversationSchema),
  conversationController.update,
);
router.delete("/:id", validateParams(uuidParamSchema), conversationController.remove);

export default router;
