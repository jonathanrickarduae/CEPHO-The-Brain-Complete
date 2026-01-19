import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Google OAuth Credentials", () => {
  it("should have GOOGLE_CLIENT_ID configured", () => {
    expect(ENV.googleClientId).toBeTruthy();
    expect(ENV.googleClientId).toContain(".apps.googleusercontent.com");
  });

  it("should have GOOGLE_CLIENT_SECRET configured", () => {
    expect(ENV.googleClientSecret).toBeTruthy();
    expect(ENV.googleClientSecret.length).toBeGreaterThan(10);
  });

  it("should have valid Client ID format", () => {
    // Google Client IDs follow pattern: {project-number}-{random}.apps.googleusercontent.com
    const clientIdPattern = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
    expect(ENV.googleClientId).toMatch(clientIdPattern);
  });
});
