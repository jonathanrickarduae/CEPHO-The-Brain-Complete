/**
 * Push Notifications Router
 *
 * Handles Web Push subscriptions and sending push notifications to users.
 * Uses VAPID keys for authentication with the push service.
 *
 * Flow:
 *   1. Client calls getVapidPublicKey() to get the server's VAPID public key
 *   2. Client subscribes via the browser Push API using the VAPID key
 *   3. Client calls subscribe() with the PushSubscription object
 *   4. Server stores the subscription in the DB
 *   5. Any server-side code can call sendPushToUser() to push a notification
 */
import { z } from "zod";
import webpush from "web-push";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { pushSubscriptions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../utils/logger";

const log = logger.module("PushNotifications");

// ── VAPID key initialisation ─────────────────────────────────────────────────
let vapidInitialised = false;

function ensureVapid() {
  if (vapidInitialised) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@cepho.ai";

  if (!publicKey || !privateKey) {
    log.warn(
      "VAPID keys not configured. Push notifications will be unavailable. " +
        "Generate keys with: node -e \"const wp=require('web-push'); console.log(JSON.stringify(wp.generateVAPIDKeys()))\""
    );
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidInitialised = true;
  log.info("VAPID keys configured, push notifications enabled");
}

// Initialise on module load
ensureVapid();

// ── Push subscription schema ─────────────────────────────────────────────────
const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  expirationTime: z.number().nullable().optional(),
});

// ── Router ───────────────────────────────────────────────────────────────────
export const pushNotificationsRouter = router({
  /**
   * Get the server's VAPID public key.
   * The client needs this to subscribe to push notifications.
   */
  getVapidPublicKey: protectedProcedure.query(() => {
    const publicKey = process.env.VAPID_PUBLIC_KEY ?? null;
    return { publicKey, enabled: !!publicKey };
  }),

  /**
   * Register a push subscription for the current user.
   * Called after the browser creates a PushSubscription.
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        subscription: PushSubscriptionSchema,
        deviceName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Upsert: if the endpoint already exists for this user, update it
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.subscription.endpoint)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(pushSubscriptions)
          .set({
            p256dh: input.subscription.keys.p256dh,
            auth: input.subscription.keys.auth,
            deviceName: input.deviceName ?? null,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, existing[0].id));
        return { success: true, action: "updated" as const };
      }

      await db.insert(pushSubscriptions).values({
        userId: ctx.user.id,
        endpoint: input.subscription.endpoint,
        p256dh: input.subscription.keys.p256dh,
        auth: input.subscription.keys.auth,
        deviceName: input.deviceName ?? null,
      });

      return { success: true, action: "created" as const };
    }),

  /**
   * Unsubscribe a push subscription.
   */
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.endpoint)
          )
        );
      return { success: true };
    }),

  /**
   * List active push subscriptions for the current user.
   */
  listSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const subs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        deviceName: pushSubscriptions.deviceName,
        createdAt: pushSubscriptions.createdAt,
      })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, ctx.user.id));

    return { subscriptions: subs };
  }),

  /**
   * Send a test push notification to the current user's devices.
   */
  sendTest: protectedProcedure.mutation(async ({ ctx }) => {
    const sent = await sendPushToUser(ctx.user.id, {
      title: "The Brain — Test Notification",
      body: "Push notifications are working correctly.",
      url: "/",
    });
    return { sent };
  }),
});

// ── Server-side helper: send push to a user ──────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  actions?: Array<{ action: string; title: string }>;
}

/**
 * Send a push notification to all registered devices for a user.
 * Returns the number of successfully sent notifications.
 */
export async function sendPushToUser(
  userId: number,
  payload: PushPayload
): Promise<number> {
  if (!vapidInitialised) {
    log.debug("Push notifications not configured, skipping");
    return 0;
  }

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  if (subs.length === 0) return 0;

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
    icon: payload.icon ?? "/icons/icon-192x192.png",
    badge: payload.badge ?? "/icons/badge-72x72.png",
    actions: payload.actions ?? [],
  });

  let sent = 0;
  const expiredEndpoints: number[] = [];

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payloadString
        );
        sent++;
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : 0;
        if (statusCode === 410 || statusCode === 404) {
          // Subscription expired or invalid — mark for cleanup
          expiredEndpoints.push(sub.id);
        } else {
          log.error("Failed to send push notification:", err);
        }
      }
    })
  );

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    await Promise.allSettled(
      expiredEndpoints.map(id =>
        db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id))
      )
    );
    log.info(
      `Cleaned up ${expiredEndpoints.length} expired push subscriptions`
    );
  }

  return sent;
}
