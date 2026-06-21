import {
  calculateOffset,
  generatePaginationMeta,
  encodeCursor,
  decodeCursor,
  validatePaginationParams,
  MAX_LIMIT,
} from "../utils/pagination";

describe("Pagination Utilities", () => {
  describe("calculateOffset", () => {
    it("should calculate correct offset for page 1", () => {
      expect(calculateOffset(1, 20)).toBe(0);
    });

    it("should calculate correct offset for page 2", () => {
      expect(calculateOffset(2, 20)).toBe(20);
    });

    it("should calculate correct offset for page 5", () => {
      expect(calculateOffset(5, 10)).toBe(40);
    });
  });

  describe("generatePaginationMeta", () => {
    it("should generate correct metadata for first page", () => {
      const meta = generatePaginationMeta(100, 1, 20);

      expect(meta.total).toBe(100);
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(20);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(false);
    });

    it("should generate correct metadata for middle page", () => {
      const meta = generatePaginationMeta(100, 3, 20);

      expect(meta.page).toBe(3);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(true);
    });

    it("should generate correct metadata for last page", () => {
      const meta = generatePaginationMeta(100, 5, 20);

      expect(meta.page).toBe(5);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
    });
  });

  describe("encodeCursor and decodeCursor", () => {
    it("should encode and decode cursor correctly", () => {
      const timestamp = new Date("2026-02-25T12:00:00Z");
      const id = "123";

      const cursor = encodeCursor(timestamp, id);
      const decoded = decodeCursor(cursor);

      expect(decoded).not.toBeNull();
      expect(decoded?.timestamp).toBe(timestamp.getTime());
      expect(decoded?.id).toBe(id);
    });

    it("should return null for invalid cursor", () => {
      const decoded = decodeCursor("invalid-cursor");
      expect(decoded).toBeNull();
    });
  });

  describe("validatePaginationParams", () => {
    it("should validate correct parameters", () => {
      const result = validatePaginationParams({
        page: 1,
        limit: 20,
        order: "desc",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject page less than 1", () => {
      const result = validatePaginationParams({
        page: 0,
        limit: 20,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Page must be greater than 0");
    });

    it("should reject limit exceeding MAX_LIMIT", () => {
      const result = validatePaginationParams({
        page: 1,
        limit: MAX_LIMIT + 1,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject invalid order", () => {
      const result = validatePaginationParams({
        page: 1,
        limit: 20,
        order: "invalid" as "asc" | "desc",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Order must be either "asc" or "desc"');
    });
  });
});
