/**
 * Telegram Webhook Route
 *
 * In production, Telegram sends updates to POST /api/telegram/webhook
 * In development, the bot uses long polling instead.
 *
 * The webhook URL must be registered with Telegram:
 *   POST https://api.telegram.org/bot{TOKEN}/setWebhook
 *   { url: "https://your-domain.com/api/telegram/webhook" }
 *
 * This is done automatically on server startup in production.
 */

import { Router, Request, Response } from "express";
import { getTelegramBot } from "../services/telegram.service";
import { logger } from "../utils/logger";

const log = logger.module("TelegramWebhook");
const router = Router();

router.post("/webhook", (req: Request, res: Response) => {
  const bot = getTelegramBot();
  if (!bot) {
    res.status(503).json({ error: "Telegram bot not initialised" });
    return;
  }

  try {
    // Process the update — node-telegram-bot-api handles the routing
    bot.processUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    log.error("Webhook processing error", err);
    res.status(200).json({ ok: true }); // Always 200 to Telegram
  }
});

// Health check
router.get("/status", (_req: Request, res: Response) => {
  const bot = getTelegramBot();
  res.json({
    enabled: !!bot,
    mode: process.env.NODE_ENV === "production" ? "webhook" : "polling",
  });
});

export default router;
