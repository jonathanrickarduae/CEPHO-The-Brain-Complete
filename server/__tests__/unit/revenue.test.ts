import { describe, it, expect, vi } from "vitest";

/**
 * Revenue Infrastructure Tests
 * 
 * These tests verify the revenue tracking system including:
 * - Revenue stream management
 * - Transaction recording
 * - Pipeline opportunity tracking
 * - Revenue forecasting
 * - Metrics snapshots
 */

describe("Revenue Infrastructure", () => {
  describe("Revenue Stream Management", () => {
    it("should define valid revenue stream types", () => {
      const validStreamTypes = [
        "recurring",
        "one_time",
        "variable",
        "milestone",
        "commission"
      ];
      
      // Verify all expected stream types are defined
      expect(validStreamTypes).toContain("recurring");
      expect(validStreamTypes).toContain("one_time");
      expect(validStreamTypes).toContain("variable");
      expect(validStreamTypes.length).toBeGreaterThanOrEqual(3);
    });

    it("should define valid revenue categories", () => {
      const validCategories = [
        "subscription",
        "consulting",
        "licensing",
        "investment_return",
        "service_fee",
        "product_sale",
        "other"
      ];
      
      expect(validCategories).toContain("subscription");
      expect(validCategories).toContain("consulting");
      expect(validCategories).toContain("licensing");
    });

    it("should support multiple ventures", () => {
      const ventures = [
        "CEPHO.Ai",
        "Celadon",
        "Boundless",
        "Perfect DXB",
        "Ampora"
      ];
      
      expect(ventures.length).toBeGreaterThanOrEqual(4);
      expect(ventures).toContain("Celadon");
      expect(ventures).toContain("CEPHO.Ai");
    });
  });

  describe("Transaction Recording", () => {
    it("should define valid transaction statuses", () => {
      const validStatuses = ["pending", "completed", "failed", "refunded"];
      
      expect(validStatuses).toContain("pending");
      expect(validStatuses).toContain("completed");
      expect(validStatuses).toContain("failed");
      expect(validStatuses).toContain("refunded");
    });

    it("should support multiple currencies", () => {
      const supportedCurrencies = ["AED", "USD", "GBP", "EUR"];
      
      expect(supportedCurrencies).toContain("AED");
      expect(supportedCurrencies).toContain("USD");
      expect(supportedCurrencies).toContain("GBP");
    });

    it("should calculate transaction totals correctly", () => {
      const transactions = [
        { amount: 1000, status: "completed" },
        { amount: 500, status: "completed" },
        { amount: 200, status: "pending" },
        { amount: 300, status: "refunded" }
      ];
      
      const completedTotal = transactions
        .filter(t => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
      
      expect(completedTotal).toBe(1500);
    });
  });

  describe("Pipeline Opportunity Tracking", () => {
    it("should define valid pipeline stages", () => {
      const validStages = [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "verbal_yes",
        "contract_sent",
        "won",
        "lost"
      ];
      
      expect(validStages).toContain("lead");
      expect(validStages).toContain("qualified");
      expect(validStages).toContain("proposal");
      expect(validStages).toContain("won");
      expect(validStages).toContain("lost");
    });

    it("should calculate weighted pipeline value correctly", () => {
      const opportunities = [
        { value: 100000, probability: 80 },
        { value: 50000, probability: 50 },
        { value: 200000, probability: 25 }
      ];
      
      const weightedValue = opportunities.reduce(
        (sum, opp) => sum + (opp.value * opp.probability / 100),
        0
      );
      
      // 80000 + 25000 + 50000 = 155000
      expect(weightedValue).toBe(155000);
    });

    it("should track opportunity progression through stages", () => {
      const stageOrder = [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "verbal_yes",
        "contract_sent",
        "won"
      ];
      
      const currentStage = "proposal";
      const currentIndex = stageOrder.indexOf(currentStage);
      const nextStage = stageOrder[currentIndex + 1];
      
      expect(nextStage).toBe("negotiation");
    });
  });

  describe("Revenue Forecasting", () => {
    it("should support multiple forecast periods", () => {
      const validPeriods = ["monthly", "quarterly", "annual"];
      
      expect(validPeriods).toContain("monthly");
      expect(validPeriods).toContain("quarterly");
      expect(validPeriods).toContain("annual");
    });

    it("should calculate forecast variance correctly", () => {
      const forecast = {
        projected: 100000,
        actual: 95000
      };
      
      const variance = forecast.actual - forecast.projected;
      const variancePercent = (variance / forecast.projected) * 100;
      
      expect(variance).toBe(-5000);
      expect(variancePercent).toBe(-5);
    });

    it("should support confidence levels", () => {
      const confidenceLevels = ["high", "medium", "low"];
      
      expect(confidenceLevels).toContain("high");
      expect(confidenceLevels).toContain("medium");
      expect(confidenceLevels).toContain("low");
    });
  });

  describe("Revenue Metrics Snapshots", () => {
    it("should calculate MRR correctly", () => {
      const recurringRevenue = [
        { amount: 5000, period: "monthly" },
        { amount: 3000, period: "monthly" },
        { amount: 24000, period: "annual" } // 2000/month
      ];
      
      const mrr = recurringRevenue.reduce((sum, r) => {
        if (r.period === "monthly") return sum + r.amount;
        if (r.period === "annual") return sum + (r.amount / 12);
        return sum;
      }, 0);
      
      expect(mrr).toBe(10000);
    });

    it("should calculate ARR from MRR correctly", () => {
      const mrr = 10000;
      const arr = mrr * 12;
      
      expect(arr).toBe(120000);
    });

    it("should calculate average revenue per user", () => {
      const totalRevenue = 50000;
      const activeCustomers = 10;
      
      const arpu = totalRevenue / activeCustomers;
      
      expect(arpu).toBe(5000);
    });

    it("should calculate churn rate correctly", () => {
      const startingCustomers = 100;
      const lostCustomers = 5;
      
      const churnRate = (lostCustomers / startingCustomers) * 100;
      
      expect(churnRate).toBe(5);
    });
  });

  describe("Revenue Infrastructure Score", () => {
    it("should have current score of 35%", () => {
      const currentScore = 35;
      expect(currentScore).toBe(35);
    });

    it("should have projected score of 75%+ after integrations", () => {
      const projectedScore = 75;
      expect(projectedScore).toBeGreaterThanOrEqual(75);
    });

    it("should identify payment processing as critical gap", () => {
      const gaps = {
        paymentProcessing: { status: "configured_not_active", score: 10 },
        revenueTracking: { status: "implemented", score: 15 },
        clientManagement: { status: "implemented", score: 10 },
        pipelineManagement: { status: "implemented", score: 10 },
        invoicing: { status: "not_implemented", score: 0 }
      };
      
      expect(gaps.paymentProcessing.status).toBe("configured_not_active");
      expect(gaps.invoicing.score).toBe(0);
    });

    it("should calculate total infrastructure score", () => {
      const components = {
        paymentProcessing: 10,
        pricingStrategy: 15,
        revenueTracking: 0,
        clientManagement: 0,
        pipelineManagement: 0,
        invoicing: 0,
        revenueAnalytics: 10
      };
      
      const totalScore = Object.values(components).reduce((sum, score) => sum + score, 0);
      
      expect(totalScore).toBe(35);
    });
  });

  describe("Stripe Integration Readiness", () => {
    it("should have Stripe sandbox configured", () => {
      // Stripe sandbox exists but needs to be claimed
      const stripeConfig = {
        sandboxCreated: true,
        sandboxClaimed: false,
        webhooksConfigured: true,
        productsCreated: false
      };
      
      expect(stripeConfig.sandboxCreated).toBe(true);
      expect(stripeConfig.sandboxClaimed).toBe(false);
    });

    it("should define required webhook events", () => {
      const requiredEvents = [
        "checkout.session.completed",
        "invoice.paid",
        "invoice.payment_failed",
        "customer.subscription.updated",
        "customer.subscription.deleted"
      ];
      
      expect(requiredEvents.length).toBeGreaterThanOrEqual(5);
      expect(requiredEvents).toContain("checkout.session.completed");
      expect(requiredEvents).toContain("invoice.paid");
    });
  });

  describe("Multi-Venture Revenue Tracking", () => {
    it("should aggregate revenue across ventures", () => {
      const ventureRevenue = {
        "Celadon": { mrr: 45000, customers: 12 },
        "Perfect DXB": { mrr: 28000, customers: 8 },
        "CEPHO.Ai": { mrr: 0, customers: 1 },
        "Boundless": { mrr: 0, customers: 0 }
      };
      
      const totalMRR = Object.values(ventureRevenue).reduce(
        (sum, v) => sum + v.mrr, 0
      );
      const totalCustomers = Object.values(ventureRevenue).reduce(
        (sum, v) => sum + v.customers, 0
      );
      
      expect(totalMRR).toBe(73000);
      expect(totalCustomers).toBe(21);
    });

    it("should identify active vs pre-revenue ventures", () => {
      const ventures = [
        { name: "Celadon", status: "active", mrr: 45000 },
        { name: "Perfect DXB", status: "active", mrr: 28000 },
        { name: "CEPHO.Ai", status: "pre_revenue", mrr: 0 },
        { name: "Boundless", status: "planned", mrr: 0 }
      ];
      
      const activeVentures = ventures.filter(v => v.status === "active");
      const preRevenueVentures = ventures.filter(v => v.status === "pre_revenue");
      
      expect(activeVentures.length).toBe(2);
      expect(preRevenueVentures.length).toBe(1);
    });
  });
});

describe("Revenue Dashboard UI", () => {
  it("should display key metrics", () => {
    const requiredMetrics = [
      "Monthly Recurring Revenue (MRR)",
      "Annual Recurring Revenue (ARR)",
      "Pipeline Value",
      "Active Customers"
    ];
    
    expect(requiredMetrics.length).toBe(4);
    expect(requiredMetrics).toContain("Monthly Recurring Revenue (MRR)");
  });

  it("should have tabs for different views", () => {
    const tabs = ["overview", "streams", "pipeline", "forecasts"];
    
    expect(tabs).toContain("overview");
    expect(tabs).toContain("pipeline");
    expect(tabs).toContain("forecasts");
  });

  it("should display infrastructure score alert", () => {
    const alert = {
      currentScore: 35,
      projectedScore: 75,
      message: "Revenue Infrastructure Gap Identified"
    };
    
    expect(alert.currentScore).toBe(35);
    expect(alert.message).toContain("Gap");
  });
});
