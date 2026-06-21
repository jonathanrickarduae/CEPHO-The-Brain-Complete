# Storybook Component Library Plan

This document outlines the plan for creating and maintaining a live, interactive component library for the "Calm Cockpit" design system using Storybook.

## 1. Objectives

- Provide a single source of truth for all UI components.
- Allow developers to build and test components in isolation.
- Ensure visual consistency across the entire application.
- Accelerate frontend development by making it easy to discover and reuse existing components.

## 2. Setup

- **Installation:** Storybook will be installed as a dev dependency in our `client` package.
- **Configuration:** It will be configured to automatically find all files ending in `.stories.tsx`.
- **Deployment:** A new GitHub Actions workflow will be created to automatically build and deploy Storybook to GitHub Pages on every push to the `develop` branch. It will be available at a sub-path, e.g., `https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/storybook/`.

## 3. Story Structure

Every React component in `client/components/` will have a corresponding `*.stories.tsx` file. Each story file will contain:

- A default export with component metadata (title, component, tags).
- Named exports for each state of the component (e.g., `Default`, `Hover`, `Disabled`, `WithIcon`).
- Controls to allow for interactive manipulation of the component's props in the Storybook UI.

## 4. Process

- **New Components:** When a new UI component is created, a corresponding story file must be created with it.
- **Code Review:** PRs for new components will not be approved unless they include a complete set of stories.
- **Maintenance:** When a component is updated, its stories must be updated as well.
