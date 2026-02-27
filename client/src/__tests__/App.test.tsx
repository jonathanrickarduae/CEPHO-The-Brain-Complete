// @ts-nocheck
// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import App from "../App";

vi.mock("../lib/trpc", () => ({
  trpc: { useContext: vi.fn(() => ({ invalidate: vi.fn() })) },
  trpcClient: {},
}));

describe("App", () => {
  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
