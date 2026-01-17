/**
 * Stripe Service
 * 
 * Handles Stripe checkout sessions and payment processing
 */

import Stripe from "stripe";
import { getDb } from "../db";
import { users, subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export { stripe };

interface CreateCheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: "subscription" | "payment";
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  priceId,
  successUrl,
  cancelUrl,
  mode = "subscription",
}: CreateCheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

// Store for Stripe customer IDs (in-memory cache, could be moved to DB)
const customerCache = new Map<number, string>();

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateCustomer(userId: number, email: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check cache first
  if (customerCache.has(userId)) {
    return customerCache.get(userId)!;
  }

  // Check if user exists
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  // Check if we have a subscription with Stripe customer ID for this user
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existingSub) {
    const meta = existingSub.metadata as { stripeCustomerId?: string } | null;
    if (meta?.stripeCustomerId) {
      customerCache.set(userId, meta.stripeCustomerId);
      return meta.stripeCustomerId;
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId: userId.toString(),
    },
  });

  customerCache.set(userId, customer.id);
  return customer.id;
}

/**
 * Handle successful checkout session
 */
export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userId = parseInt(session.client_reference_id || "0");
  if (!userId) {
    console.error("[Stripe] No user ID in checkout session");
    return;
  }

  // For subscription mode
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = typeof session.subscription === "string" 
      ? session.subscription 
      : session.subscription.id;

    // Store subscription reference in metadata
    await db.insert(subscriptions).values({
      userId,
      name: "CEPHO Pro",
      category: "productivity",
      cost: 49,
      billingCycle: "monthly",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
      metadata: {
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer as string,
        planId: "pro",
      },
    });

    console.log(`[Stripe] Subscription created for user ${userId}: ${subscriptionId}`);
  }

  // For one-time payment mode
  if (session.mode === "payment" && session.payment_intent) {
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;

    console.log(`[Stripe] Payment completed for user ${userId}: ${paymentIntentId}`);
    
    // Handle one-time purchase fulfillment based on metadata
    // Add credits, unlock features, etc.
  }
}

/**
 * Handle subscription updated
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userId = parseInt(subscription.metadata?.userId || "0");
  
  // Find subscription by stripeSubscriptionId in metadata
  const allSubs = await db.select().from(subscriptions);
  const matchingSub = allSubs.find(s => {
    const meta = s.metadata as { stripeSubscriptionId?: string } | null;
    return meta?.stripeSubscriptionId === subscription.id;
  });

  if (matchingSub) {
    await db.update(subscriptions)
      .set({
        status: subscription.status === "active" ? "active" : 
                subscription.status === "canceled" ? "cancelled" : "paused",
        renewalDate: new Date(),
        metadata: {
          ...(matchingSub.metadata as object || {}),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })
      .where(eq(subscriptions.id, matchingSub.id));
  }

  console.log(`[Stripe] Subscription updated: ${subscription.id} - ${subscription.status}`);
}

/**
 * Handle subscription deleted/cancelled
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find subscription by stripeSubscriptionId in metadata
  const allSubs = await db.select().from(subscriptions);
  const matchingSub = allSubs.find(s => {
    const meta = s.metadata as { stripeSubscriptionId?: string } | null;
    return meta?.stripeSubscriptionId === subscription.id;
  });

  if (matchingSub) {
    await db.update(subscriptions)
      .set({
        status: "cancelled",
        metadata: {
          ...(matchingSub.metadata as object || {}),
          canceledAt: new Date().toISOString(),
        },
      })
      .where(eq(subscriptions.id, matchingSub.id));
  }

  console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Get customer portal session
 */
export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
