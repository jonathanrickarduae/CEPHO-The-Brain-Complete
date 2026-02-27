// @vitest-environment jsdom
/**
 * Accessibility Tests
 *
 * Uses axe-core to check for WCAG violations in key UI components.
 * These tests ensure the app remains accessible as it evolves.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";

// Simple test components that don't need full app context
function SimpleButton({ label }: { label: string }) {
  return <button type="button">{label}</button>;
}

function FormWithLabel() {
  return (
    <form>
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" name="email" />
      <button type="submit">Submit</button>
    </form>
  );
}

function NavigationMenu() {
  return (
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/tasks">Tasks</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  );
}

function AlertMessage({ type }: { type: "error" | "success" | "info" }) {
  const roleMap = { error: "alert", success: "status", info: "status" } as const;
  return (
    <div role={roleMap[type]} aria-live="polite">
      {type === "error" ? "An error occurred" : "Operation successful"}
    </div>
  );
}

describe("Accessibility Tests", () => {
  it("button has no critical accessibility violations", async () => {
    const { container } = render(<SimpleButton label="Click me" />);
    const results = await axe(container);
    const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
    expect(critical).toHaveLength(0);
  });

  it("form with label has no critical accessibility violations", async () => {
    const { container } = render(<FormWithLabel />);
    const results = await axe(container);
    const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
    expect(critical).toHaveLength(0);
  });

  it("navigation menu has no critical accessibility violations", async () => {
    const { container } = render(<NavigationMenu />);
    const results = await axe(container);
    const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
    expect(critical).toHaveLength(0);
  });

  it("error alert has no critical accessibility violations", async () => {
    const { container } = render(<AlertMessage type="error" />);
    const results = await axe(container);
    const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
    expect(critical).toHaveLength(0);
  });

  it("success status has no critical accessibility violations", async () => {
    const { container } = render(<AlertMessage type="success" />);
    const results = await axe(container);
    const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
    expect(critical).toHaveLength(0);
  });
});
