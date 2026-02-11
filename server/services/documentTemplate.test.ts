/**
 * Tests for Document Template and Chief of Staff QA Services
 */
import { describe, it, expect } from "vitest";
import {
  BRAND_GUIDELINES,
  getScoreRating,
  generateDocumentId,
  applyBrandFormatting,
  validateBrandCompliance,
} from "./documentTemplateService";

describe("Document Template Service", () => {
  describe("BRAND_GUIDELINES", () => {
    it("should have correct document ID", () => {
      expect(BRAND_GUIDELINES.documentId).toBe("CEPHO-BP-016");
    });

    it("should have all required colour definitions", () => {
      expect(BRAND_GUIDELINES.colours).toHaveProperty("black");
      expect(BRAND_GUIDELINES.colours).toHaveProperty("white");
      expect(BRAND_GUIDELINES.colours).toHaveProperty("darkGrey");
      expect(BRAND_GUIDELINES.colours).toHaveProperty("cephoCyan");
      expect(BRAND_GUIDELINES.colours).toHaveProperty("cephoMagenta");
    });

    it("should have typography standards", () => {
      expect(BRAND_GUIDELINES.typography.headingFont).toBe("Inter");
      expect(BRAND_GUIDELINES.typography.bodyFont).toBe("Inter");
      expect(BRAND_GUIDELINES.typography.pageNumberFont).toBe("Calibri");
    });

    it("should have complete scoring scale", () => {
      expect(BRAND_GUIDELINES.scoringScale).toHaveLength(5);
      expect(BRAND_GUIDELINES.scoringScale[0].rating).toBe("Excellent");
      expect(BRAND_GUIDELINES.scoringScale[4].rating).toBe("Poor");
    });
  });

  describe("getScoreRating", () => {
    it("should return Excellent for scores 86-100", () => {
      expect(getScoreRating(100).rating).toBe("Excellent");
      expect(getScoreRating(86).rating).toBe("Excellent");
      expect(getScoreRating(90).rating).toBe("Excellent");
    });

    it("should return Good for scores 71-85", () => {
      expect(getScoreRating(85).rating).toBe("Good");
      expect(getScoreRating(71).rating).toBe("Good");
      expect(getScoreRating(78).rating).toBe("Good");
    });

    it("should return Average for scores 51-70", () => {
      expect(getScoreRating(70).rating).toBe("Average");
      expect(getScoreRating(51).rating).toBe("Average");
      expect(getScoreRating(60).rating).toBe("Average");
    });

    it("should return Below Average for scores 31-50", () => {
      expect(getScoreRating(50).rating).toBe("Below Average");
      expect(getScoreRating(31).rating).toBe("Below Average");
      expect(getScoreRating(40).rating).toBe("Below Average");
    });

    it("should return Poor for scores 0-30", () => {
      expect(getScoreRating(30).rating).toBe("Poor");
      expect(getScoreRating(0).rating).toBe("Poor");
      expect(getScoreRating(15).rating).toBe("Poor");
    });
  });

  describe("generateDocumentId", () => {
    it("should generate correct prefix for executive summary", () => {
      const id = generateDocumentId("executive_summary");
      expect(id).toMatch(/^CEPHO-ES-[A-Z0-9]+$/);
    });

    it("should generate correct prefix for innovation brief", () => {
      const id = generateDocumentId("innovation_brief");
      expect(id).toMatch(/^CEPHO-IB-[A-Z0-9]+$/);
    });

    it("should generate correct prefix for full report", () => {
      const id = generateDocumentId("full_report");
      expect(id).toMatch(/^CEPHO-FR-[A-Z0-9]+$/);
    });

    it("should generate unique IDs with delay", async () => {
      const id1 = generateDocumentId("executive_summary");
      await new Promise(resolve => setTimeout(resolve, 2)); // Small delay to ensure different timestamp
      const id2 = generateDocumentId("executive_summary");
      // IDs should be different (based on timestamp)
      expect(id1).not.toBe(id2);
    });
  });

  describe("applyBrandFormatting", () => {
    it("should remove hyphens from compound words", () => {
      const input = "This is a well-known high-quality product";
      const output = applyBrandFormatting(input);
      expect(output).toBe("This is a well known high quality product");
    });

    it("should keep essential hyphens", () => {
      const input = "The e-commerce self-service platform";
      const output = applyBrandFormatting(input);
      expect(output).toContain("e-commerce");
      expect(output).toContain("self-service");
    });

    it("should replace dramatic vocabulary", () => {
      const input = "This revolutionary game-changing synergy creates a paradox";
      const output = applyBrandFormatting(input);
      expect(output).not.toContain("revolutionary");
      expect(output).not.toContain("game-changing");
      expect(output).not.toContain("synergy");
      expect(output).not.toContain("paradox");
    });

    it("should replace dramatic words with measured alternatives", () => {
      const input = "This is a revolutionary approach";
      const output = applyBrandFormatting(input);
      expect(output).toContain("significant");
    });
  });

  describe("validateBrandCompliance", () => {
    it("should pass for compliant content", () => {
      const content = "This is a professional document with clear language.";
      const result = validateBrandCompliance(content);
      expect(result.compliant).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should fail for content with dramatic vocabulary", () => {
      const content = "This creates a paradox in the market.";
      const result = validateBrandCompliance(content);
      expect(result.compliant).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should detect multiple issues", () => {
      const content = "This revolutionary synergy creates a crisis.";
      const result = validateBrandCompliance(content);
      expect(result.compliant).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(3);
    });
  });
});
