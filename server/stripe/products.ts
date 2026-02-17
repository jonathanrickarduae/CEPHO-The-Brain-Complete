/**
 * Stripe Products Configuration
 * 
 * Define products and prices for CEPHO subscription tiers
 */

export const PRODUCTS = {
  // Free tier - basic access
  FREE: {
    id: "free",
    name: "CEPHO Free",
    description: "Basic access to CEPHO features",
    features: [
      "Access to The Nexus dashboard",
      "Basic workflow management",
      "Limited AI-SME consultations (5/month)",
      "Morning Signal briefings",
    ],
    price: 0,
    currency: "GBP",
    interval: null,
  },

  // Pro tier - full access
  PRO: {
    id: "pro",
    name: "CEPHO Pro",
    description: "Full access to all CEPHO features",
    features: [
      "Everything in Free",
      "Unlimited AI-SME consultations",
      "Project Genesis full access",
      "Innovation Hub with strategic assessments",
      "Evening Review automation",
      "Chief of Staff delegation",
      "Priority support",
    ],
    price: 49,
    currency: "GBP",
    interval: "month" as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },

  // Enterprise tier - custom solutions
  ENTERPRISE: {
    id: "enterprise",
    name: "CEPHO Enterprise",
    description: "Custom enterprise solutions",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
      "Custom AI training",
      "White-label options",
    ],
    price: null, // Custom pricing
    currency: "GBP",
    interval: null,
    contactSales: true,
  },
} as const;

// One-time purchase products
export const ONE_TIME_PRODUCTS = {
  INNOVATION_CREDITS: {
    id: "innovation_credits_10",
    name: "Innovation Credits (10 Pack)",
    description: "10 additional innovation assessments",
    price: 19,
    currency: "GBP",
    credits: 10,
  },
  PROJECT_GENESIS_BOOST: {
    id: "project_genesis_boost",
    name: "Project Genesis Boost",
    description: "Priority processing for Project Genesis",
    price: 29,
    currency: "GBP",
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type OneTimeProductId = keyof typeof ONE_TIME_PRODUCTS;
