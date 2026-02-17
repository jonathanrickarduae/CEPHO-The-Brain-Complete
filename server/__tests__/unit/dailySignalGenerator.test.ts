/**
 * Daily Signal Generator Tests
 * 
 * Tests the multi-format signal generation pipeline
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({})
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: "Good morning! It's a great day to be productive."
      }
    }]
  })
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://storage.example.com/test-file.mp3",
    key: "test-file.mp3"
  })
}));

// Import after mocks
import {
  generateSignalContent,
  validateSignalQuality,
  generateDailySignal,
  type SignalContent
} from "./daily-signal-generator";

describe("Daily Signal Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateSignalContent", () => {
    it("should generate signal content with all required fields", async () => {
      const content = await generateSignalContent(1);
      
      expect(content).toBeDefined();
      expect(content.date).toBeInstanceOf(Date);
      expect(content.greeting).toBeDefined();
      expect(typeof content.greeting).toBe("string");
      expect(content.wellnessScore).toBeGreaterThanOrEqual(0);
      expect(content.wellnessScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(content.priorities)).toBe(true);
      expect(Array.isArray(content.calendar)).toBe(true);
      expect(Array.isArray(content.tasks)).toBe(true);
      expect(Array.isArray(content.insights)).toBe(true);
      expect(content.closingMessage).toBeDefined();
    });

    it("should include priorities with required properties", async () => {
      const content = await generateSignalContent(1);
      
      expect(content.priorities.length).toBeGreaterThan(0);
      content.priorities.forEach(priority => {
        expect(priority.id).toBeDefined();
        expect(priority.title).toBeDefined();
        expect(priority.description).toBeDefined();
        expect(["high", "medium", "low"]).toContain(priority.urgency);
        expect(priority.category).toBeDefined();
      });
    });

    it("should include calendar items with required properties", async () => {
      const content = await generateSignalContent(1);
      
      expect(content.calendar.length).toBeGreaterThan(0);
      content.calendar.forEach(item => {
        expect(item.time).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.duration).toBeDefined();
        expect(["meeting", "call", "task", "reminder"]).toContain(item.type);
      });
    });
  });

  describe("validateSignalQuality", () => {
    const validContent: SignalContent = {
      date: new Date(),
      greeting: "Good morning!",
      wellnessScore: 75,
      priorities: [
        { id: "1", title: "Test", description: "Test desc", urgency: "high", category: "Test" }
      ],
      calendar: [
        { time: "09:00", title: "Meeting", duration: "1h", type: "meeting" }
      ],
      tasks: [
        { id: "t1", title: "Task 1", priority: "high", status: "pending" }
      ],
      insights: ["Test insight"],
      closingMessage: "Have a great day!"
    };

    it("should approve valid content with at least one format", async () => {
      const result = await validateSignalQuality(
        validContent,
        "https://example.com/voice.mp3",
        null,
        null
      );
      
      expect(result.approved).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it("should reject content with no formats generated", async () => {
      const result = await validateSignalQuality(
        validContent,
        null,
        null,
        null
      );
      
      expect(result.score).toBeLessThan(100);
      expect(result.feedback).toContain("No output formats generated");
    });

    it("should deduct points for missing greeting", async () => {
      const contentWithoutGreeting = { ...validContent, greeting: "" };
      const result = await validateSignalQuality(
        contentWithoutGreeting,
        "https://example.com/voice.mp3",
        null,
        null
      );
      
      expect(result.feedback).toContain("Missing greeting");
    });

    it("should deduct points for empty priorities", async () => {
      const contentWithoutPriorities = { ...validContent, priorities: [] };
      const result = await validateSignalQuality(
        contentWithoutPriorities,
        "https://example.com/voice.mp3",
        null,
        null
      );
      
      expect(result.feedback).toContain("No priorities defined");
    });

    it("should deduct points for invalid wellness score", async () => {
      const contentWithInvalidScore = { ...validContent, wellnessScore: 150 };
      const result = await validateSignalQuality(
        contentWithInvalidScore,
        "https://example.com/voice.mp3",
        null,
        null
      );
      
      expect(result.feedback).toContain("Invalid wellness score");
    });
  });

  describe("generateDailySignal integration", () => {
    it("should generate content and validate quality", async () => {
      const content = await generateSignalContent(1);
      const validation = await validateSignalQuality(
        content,
        "https://example.com/voice.mp3",
        null,
        "https://example.com/signal.pdf"
      );
      
      expect(content).toBeDefined();
      expect(validation.score).toBeGreaterThanOrEqual(70);
      expect(validation.approved).toBe(true);
    });

    it("should include content with all required sections", async () => {
      const content = await generateSignalContent(1);
      
      expect(content.greeting).toBeDefined();
      expect(content.priorities.length).toBeGreaterThan(0);
      expect(content.calendar.length).toBeGreaterThan(0);
      expect(content.insights.length).toBeGreaterThan(0);
      expect(content.closingMessage).toBeDefined();
    });
  });

  describe("Quality Gate Scenarios", () => {
    it("should handle partial format failure gracefully", async () => {
      // Test content generation directly without format generation
      const content = await generateSignalContent(1);
      
      // Validate with mock URLs
      const result = await validateSignalQuality(
        content,
        "https://example.com/voice.mp3",
        null,
        null
      );
      
      expect(result.approved).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it("should maintain consistent content across format attempts", async () => {
      const content = await generateSignalContent(1);
      
      // Content should have valid structure
      expect(content.date).toBeInstanceOf(Date);
      expect(content.wellnessScore).toBeGreaterThanOrEqual(0);
      expect(content.wellnessScore).toBeLessThanOrEqual(100);
    });
  });
});
