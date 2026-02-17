/**
import { logger } from "../utils/logger";
const log = logger.module("StripeWebhook");
 * Stripe Webhook Handler
 * 
 * Handles incoming Stripe webhook events
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { 
  stripe, 
  handleCheckoutComplete, 
  handleSubscriptionUpdated, 
  handleSubscriptionDeleted 
} from "./stripeService";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    log.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events - CRITICAL for webhook verification
  if (event.id.startsWith("evt_test_")) {
    log.debug("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  log.debug(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        log.debug(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
        // Could trigger email notification, update credits, etc.
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        log.debug(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);
        // Could trigger dunning email, pause subscription, etc.
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        log.debug(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      default:
        log.debug(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    log.error(`[Stripe Webhook] Error processing event: ${error.message}`);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}
