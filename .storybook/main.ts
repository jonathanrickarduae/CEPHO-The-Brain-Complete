import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../client/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../client/src/**/*.story.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async config => {
    // Ensure path aliases work in Storybook
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": "/home/ubuntu/the-brain-main/client/src",
      };
    }
    return config;
  },
};

export default config;
