import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ insertId: 1 })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(() => Promise.resolve({
    choices: [{
      message: {
        content: JSON.stringify({
          score: 75,
          analysis: "Good market opportunity",
          recommendations: ["Focus on niche market", "Build MVP first"],
        }),
      },
    }],
  })),
}));

describe("Innovation Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Strategic Framework", () => {
    it("should have all required assessment types", async () => {
      const { STRATEGIC_FRAMEWORK } = await import("./services/innovationEngineService");
      
      expect(STRATEGIC_FRAMEWORK).toHaveProperty("market_analysis");
      expect(STRATEGIC_FRAMEWORK).toHaveProperty("feasibility");
      expect(STRATEGIC_FRAMEWORK).toHaveProperty("competitive_landscape");
      expect(STRATEGIC_FRAMEWORK).toHaveProperty("financial_viability");
      expect(STRATEGIC_FRAMEWORK).toHaveProperty("risk_assessment");
    });

    it("should have questions for each assessment type", async () => {
      const { STRATEGIC_FRAMEWORK } = await import("./services/innovationEngineService");
      
      expect(STRATEGIC_FRAMEWORK.market_analysis.length).toBeGreaterThan(0);
      expect(STRATEGIC_FRAMEWORK.feasibility.length).toBeGreaterThan(0);
      expect(STRATEGIC_FRAMEWORK.competitive_landscape.length).toBeGreaterThan(0);
      expect(STRATEGIC_FRAMEWORK.financial_viability.length).toBeGreaterThan(0);
      expect(STRATEGIC_FRAMEWORK.risk_assessment.length).toBeGreaterThan(0);
    });

    it("should have valid question structure", async () => {
      const { STRATEGIC_FRAMEWORK } = await import("./services/innovationEngineService");
      
      const firstQuestion = STRATEGIC_FRAMEWORK.market_analysis[0];
      expect(firstQuestion).toHaveProperty("id");
      expect(firstQuestion).toHaveProperty("question");
      expect(firstQuestion).toHaveProperty("weight");
    });
  });

  describe("Investment Scenarios", () => {
    it("should export generateInvestmentScenarios function", async () => {
      const service = await import("./services/innovationEngineService");
      
      expect(typeof service.generateInvestmentScenarios).toBe("function");
    });
  });

  describe("Flywheel Stages", () => {
    it("should have 5 flywheel stages", async () => {
      const { FLYWHEEL_STAGES } = await import("./services/innovationEngineService");
      
      expect(Object.keys(FLYWHEEL_STAGES).length).toBe(5);
    });

    it("should have correct stage values", async () => {
      const { FLYWHEEL_STAGES } = await import("./services/innovationEngineService");
      
      expect(FLYWHEEL_STAGES.CAPTURE).toBe(1);
      expect(FLYWHEEL_STAGES.ASSESS).toBe(2);
      expect(FLYWHEEL_STAGES.CONSULT).toBe(3);
      expect(FLYWHEEL_STAGES.REFINE).toBe(4);
      expect(FLYWHEEL_STAGES.BRIEF).toBe(5);
    });
  });
});

describe("Stripe Integration", () => {
  describe("Products Configuration", () => {
    it("should have subscription products defined", async () => {
      const products = await import("./stripe/products");
      
      expect(products.PRODUCTS).toBeDefined();
      expect(typeof products.PRODUCTS).toBe("object");
    });

    it("should have FREE, PRO, and ENTERPRISE tiers", async () => {
      const { PRODUCTS } = await import("./stripe/products");
      
      expect(PRODUCTS).toHaveProperty("FREE");
      expect(PRODUCTS).toHaveProperty("PRO");
      expect(PRODUCTS).toHaveProperty("ENTERPRISE");
    });

    it("should have valid product structure", async () => {
      const { PRODUCTS } = await import("./stripe/products");
      
      expect(PRODUCTS.PRO).toHaveProperty("id");
      expect(PRODUCTS.PRO).toHaveProperty("name");
      expect(PRODUCTS.PRO).toHaveProperty("price");
      expect(PRODUCTS.PRO).toHaveProperty("features");
    });

    it("should have one-time products defined", async () => {
      const { ONE_TIME_PRODUCTS } = await import("./stripe/products");
      
      expect(ONE_TIME_PRODUCTS).toBeDefined();
      expect(ONE_TIME_PRODUCTS).toHaveProperty("INNOVATION_CREDITS");
      expect(ONE_TIME_PRODUCTS).toHaveProperty("PROJECT_GENESIS_BOOST");
    });
  });

  describe("Stripe Service", () => {
    it("should export stripe instance", async () => {
      const { stripe } = await import("./stripe/stripeService");
      
      expect(stripe).toBeDefined();
    });

    it("should export createCheckoutSession function", async () => {
      const { createCheckoutSession } = await import("./stripe/stripeService");
      
      expect(typeof createCheckoutSession).toBe("function");
    });

    it("should export getUserSubscription function", async () => {
      const { getUserSubscription } = await import("./stripe/stripeService");
      
      expect(typeof getUserSubscription).toBe("function");
    });

    it("should export cancelSubscription function", async () => {
      const { cancelSubscription } = await import("./stripe/stripeService");
      
      expect(typeof cancelSubscription).toBe("function");
    });
  });
});
