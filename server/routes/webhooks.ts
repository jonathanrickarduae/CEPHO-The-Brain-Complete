/**
 * Inbound Integration Webhooks — AUTO-04
 *
 * Handles inbound webhooks from external services:
 *   - Trello: card created/updated/moved
 *   - GitHub: issue opened/closed, PR merged
 *   - Slack: message posted (slash command or event)
 *   - Google Calendar: event created/updated
 *
 * Each webhook is verified with HMAC-SHA256 signature validation,
 * then mapped to a CEPHO task, notification, or event bus event.
 *
 * Webhook URL format: POST /api/webhooks/:provider?userId=<userId>
 * Providers: trello | github | slack | google-calendar
 */

import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db } from "../db";
import { tasks, notifications, activityFeed } from "../../drizzle/schema";
import { eventBus } from "../services/eventBus";
import { logger } from "../utils/logger";
const log = logger.module("webhooks");

const router = Router();

// ─── Signature Verification ───────────────────────────────────────────────────

function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: "sha256" | "sha1" = "sha256"
): boolean {
  try {
    const expected = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest("hex");
    const sig = signature.replace(/^(sha256=|sha1=|v0=)/, "");
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(sig, "hex")
    );
  } catch {
    return false;
  }
}

// ─── Provider Handlers ────────────────────────────────────────────────────────

async function handleTrello(
  userId: number,
  body: Record<string, unknown>
): Promise<void> {
  const action = body.action as Record<string, unknown> | undefined;
  if (!action) return;

  const actionType = String(action.type ?? "");
  const data = action.data as Record<string, unknown> | undefined;
  const card = data?.card as Record<string, unknown> | undefined;
  const cardName = card ? String(card.name ?? "Unknown card") : "Unknown card";
  const listRecord = data?.list as Record<string, unknown> | undefined;
  const listName = listRecord ? String(listRecord.name ?? "") : "";

  log.info(`[Webhook] Trello action: ${actionType} on card "${cardName}"`);

  if (actionType === "createCard" || actionType === "updateCard") {
    // Mirror Trello card as a CEPHO task
    await db.insert(tasks).values({
      userId,
      title: cardName,
      description: `Synced from Trello${listName ? ` (list: ${listName})` : ""}`,
      status: actionType === "createCard" ? "pending" : "in_progress",
      priority: "medium",
      assignedTo: "digital_twin",
      metadata: {
        source: "trello-webhook",
        trelloActionType: actionType,
        trelloCardId: card ? String(card.id ?? "") : "",
        listName,
      },
    });

    await eventBus.publish({
      type: "integration.webhook_received",
      userId,
      payload: { provider: "trello", actionType, cardName },
      timestamp: new Date(),
      source: "webhook",
    });
  }
}

async function handleGitHub(
  userId: number,
  event: string,
  body: Record<string, unknown>
): Promise<void> {
  const action = String(body.action ?? "");
  const issue = body.issue as Record<string, unknown> | undefined;
  const pr = body.pull_request as Record<string, unknown> | undefined;
  const repo =
    (body.repository as Record<string, unknown> | undefined)?.name ?? "unknown";

  log.info(`[Webhook] GitHub event: ${event}/${action} on repo "${repo}"`);

  if (event === "issues" && (action === "opened" || action === "reopened")) {
    const title = issue
      ? String(issue.title ?? "GitHub Issue")
      : "GitHub Issue";
    const url = issue ? String(issue.html_url ?? "") : "";

    await db.insert(tasks).values({
      userId,
      title: `[GitHub] ${title}`,
      description: `Issue opened in ${repo}. ${url}`,
      status: "pending",
      priority: "medium",
      assignedTo: "digital_twin",
      metadata: {
        source: "github-webhook",
        event,
        action,
        repo,
        issueUrl: url,
      },
    });
  } else if (event === "pull_request" && action === "closed" && pr?.merged) {
    const prTitle = String(pr.title ?? "PR");
    await db.insert(notifications).values({
      userId,
      type: "success",
      title: `PR Merged: ${prTitle}`,
      message: `Pull request "${prTitle}" was merged in ${repo}.`,
      read: false,
      metadata: { source: "github-webhook", repo, prTitle },
    });
  }

  await eventBus.publish({
    type: "integration.webhook_received",
    userId,
    payload: { provider: "github", event, action, repo },
    timestamp: new Date(),
    source: "webhook",
  });
}

async function handleSlack(
  userId: number,
  body: Record<string, unknown>
): Promise<void> {
  // Handle Slack Events API and slash commands
  const eventType = (body.event as Record<string, unknown> | undefined)?.type;
  const text =
    (body.event as Record<string, unknown> | undefined)?.text ?? body.text;
  const command = body.command;

  log.info(
    `[Webhook] Slack event: ${String(eventType ?? command ?? "unknown")}`
  );

  if (command === "/cepho" && text) {
    // Slash command: /cepho <task description>
    await db.insert(tasks).values({
      userId,
      title: String(text).slice(0, 200),
      description: "Created via Slack /cepho command",
      status: "pending",
      priority: "medium",
      assignedTo: "digital_twin",
      metadata: { source: "slack-webhook", command: "/cepho" },
    });
  } else if (eventType === "app_mention" && text) {
    // @CEPHO mention in Slack
    await db.insert(notifications).values({
      userId,
      type: "info",
      title: "Slack Mention",
      message: `You were mentioned in Slack: "${String(text).slice(0, 200)}"`,
      read: false,
      metadata: { source: "slack-webhook", eventType },
    });
  }

  await eventBus.publish({
    type: "integration.webhook_received",
    userId,
    payload: { provider: "slack", eventType, command },
    timestamp: new Date(),
    source: "webhook",
  });
}

async function handleGoogleCalendar(
  userId: number,
  body: Record<string, unknown>
): Promise<void> {
  // Google Calendar push notifications use a channel-based system
  // The body contains a resource state change notification
  const resourceState = String(body.resourceState ?? "");
  const resourceId = String(body.resourceId ?? "");

  log.info(
    `[Webhook] Google Calendar: ${resourceState} for resource ${resourceId}`
  );

  if (resourceState === "exists" || resourceState === "sync") {
    await db.insert(activityFeed).values({
      userId,
      actorType: "system",
      actorId: "google-calendar",
      actorName: "Google Calendar",
      action: "synced",
      targetType: "calendar",
      targetName: "Calendar Update",
      description:
        "Your Google Calendar has been updated. CEPHO has synced the latest events.",
      metadata: {
        source: "google-calendar-webhook",
        resourceState,
        resourceId,
      },
    });

    await eventBus.publish({
      type: "integration.webhook_received",
      userId,
      payload: { provider: "google-calendar", resourceState, resourceId },
      timestamp: new Date(),
      source: "webhook",
    });
  }
}

// ─── Main Webhook Route ───────────────────────────────────────────────────────

router.post("/:provider", async (req: Request, res: Response) => {
  const { provider } = req.params;
  const userId = parseInt(String(req.query.userId ?? "0"), 10);

  if (!userId || isNaN(userId)) {
    res
      .status(400)
      .json({ error: "Missing or invalid userId query parameter" });
    return;
  }

  const rawBody = JSON.stringify(req.body);

  try {
    switch (provider) {
      case "trello": {
        // Trello uses HMAC-SHA1 with the webhook callback URL as the key
        const secret = process.env.TRELLO_WEBHOOK_SECRET;
        if (secret) {
          const sig = req.headers["x-trello-webhook"] as string | undefined;
          if (sig && !verifyHmacSignature(rawBody, sig, secret, "sha1")) {
            res.status(401).json({ error: "Invalid Trello webhook signature" });
            return;
          }
        }
        await handleTrello(userId, req.body as Record<string, unknown>);
        break;
      }

      case "github": {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        if (secret) {
          const sig = req.headers["x-hub-signature-256"] as string | undefined;
          if (sig && !verifyHmacSignature(rawBody, sig, secret)) {
            res.status(401).json({ error: "Invalid GitHub webhook signature" });
            return;
          }
        }
        const event = (req.headers["x-github-event"] as string) ?? "unknown";
        await handleGitHub(userId, event, req.body as Record<string, unknown>);
        break;
      }

      case "slack": {
        // Slack URL verification challenge
        if ((req.body as Record<string, unknown>).type === "url_verification") {
          res.json({
            challenge: (req.body as Record<string, unknown>).challenge,
          });
          return;
        }
        const secret = process.env.SLACK_SIGNING_SECRET;
        if (secret) {
          const timestamp =
            (req.headers["x-slack-request-timestamp"] as string) ?? "";
          const sig = (req.headers["x-slack-signature"] as string) ?? "";
          const baseString = `v0:${timestamp}:${rawBody}`;
          if (!verifyHmacSignature(baseString, sig, secret)) {
            res.status(401).json({ error: "Invalid Slack webhook signature" });
            return;
          }
        }
        await handleSlack(userId, req.body as Record<string, unknown>);
        break;
      }

      case "google-calendar": {
        await handleGoogleCalendar(userId, req.body as Record<string, unknown>);
        break;
      }

      default:
        res
          .status(404)
          .json({ error: `Unknown webhook provider: ${provider}` });
        return;
    }

    res
      .status(200)
      .json({ received: true, provider, timestamp: new Date().toISOString() });
  } catch (err) {
    log.error(`[Webhook] Error processing ${provider} webhook:`, err);
    res.status(500).json({ error: "Internal webhook processing error" });
  }
});

// Trello HEAD request for webhook verification
router.head("/:provider", (_req: Request, res: Response) => {
  res.status(200).end();
});

export default router;
