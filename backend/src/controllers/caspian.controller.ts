import type { Request, Response } from "express";
import { caspianService } from "../caspian/service.js";
import { verifyCaspianSignature } from "../caspian/webhook-verify.js";
import { logger } from "../config/logger.js";
import { processReplies } from "../automation/engine.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import { recordInboundMessage } from "../integrations/shared.js";
import { successResponse } from "../utils/apiResponse.js";
import { requireUser } from "../utils/request.js";

const processedEvents = new Set<string>();

export const caspianController = {
  async status(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const status = caspianService.status();
    res.status(200).json(successResponse("Caspian integration status", { status }));
  },

  async connect(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const account = await caspianService.connect(user.id, req.body);
    res.status(201).json(successResponse("Caspian account connected", { account }));
  },

  async sync(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const result = await caspianService.sync(req.body.accountId, user.id);
    res.status(200).json(successResponse("Caspian synced successfully", result));
  },

  async webhook(req: Request, res: Response): Promise<void> {
    const rawBody = (req as unknown as Record<string, unknown>).rawBody as Buffer | undefined;
    const signature = req.headers["x-caspian-signature"] as string | undefined;
    if (!verifyCaspianSignature(rawBody, signature)) {
      logger.warn("[caspian] webhook signature verification failed");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
    res.status(200).json({ success: true });
    const body = req.body as Record<string, unknown>;
    const eventId = body.eventId as string | undefined;
    const threadId = body.threadId as string | undefined;
    const messageId = body.messageId as string | undefined;
    const from = body.from as string | undefined;
    const text = body.body as string | undefined;

    if (eventId && processedEvents.has(eventId)) {
      return;
    }
    if (eventId) {
      processedEvents.add(eventId);
      if (processedEvents.size > 10000) {
        const first = processedEvents.values().next().value;
        if (first !== undefined) {
          processedEvents.delete(first);
        }
      }
    }

    if (threadId && messageId && from && text) {
      const conversation = await conversationRepository.findByExternalThreadIdOnly(threadId);
      if (conversation) {
        const duplicate = await messageRepository.findByExternalMessageId(messageId);
        if (!duplicate) {
          await recordInboundMessage({
            userId: conversation.userId,
            accountId: conversation.accountId,
            conversationId: conversation.id,
            body: text,
            externalMessageId: messageId,
          });
          logger.info(`[caspian] inbound message recorded for thread ${threadId}`);
        }
      }
    }

    void (async () => {
      try {
        const results = await caspianService.syncAllConnected();
        const affected = new Set(results.filter((r) => r.ok).map((r) => r.userId));
        for (const userId of affected) {
          await processReplies(userId);
        }
        logger.info(`[caspian] webhook processed (${affected.size} account(s) synced)`);
      } catch (error) {
        logger.warn(
          `[caspian] webhook processing failed: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    })();
  },

  async send(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const result = await caspianService.send(user.id, req.body);
    res.status(200).json(successResponse("Message sent successfully", result));
  },

  async disconnect(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const account = await caspianService.disconnect(req.body.accountId, user.id);
    res.status(200).json(successResponse("Caspian account disconnected", { account }));
  },
};
