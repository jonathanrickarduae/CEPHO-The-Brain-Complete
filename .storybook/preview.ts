import type { Preview } from "@storybook/react";
import "../client/src/styles/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f1117" },
        { name: "light", value: "#ffffff" },
        { name: "cepho-surface", value: "#1a1f2e" },
      ],
    },
    a11y: {
      // Accessibility checks enabled by default
      element: "#storybook-root",
      config: {},
      options: {},
      manual: false,
    },
  },
};

export default preview;
