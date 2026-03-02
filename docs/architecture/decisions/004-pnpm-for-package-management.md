# 4. pnpm for Package Management

*   **Status:** Decided
*   **Date:** 2026-03-02

## Context

We need a fast, efficient, and reliable package manager for our monorepo. The package manager should handle dependencies effectively, ensure reproducible builds, and offer good performance for both local development and CI/CD pipelines.

## Decision

We will use **pnpm** as the exclusive package manager for this project.

## Rationale

*   **Performance:** pnpm is significantly faster than npm and Yarn, especially on fresh installs, because it uses a content-addressable store on disk and links files instead of copying them. This speeds up both local development and CI/CD runs.
*   **Disk Space Efficiency:** By using a single on-disk store and linking files, pnpm avoids duplicating packages across projects, saving a significant amount of disk space.
*   **Strictness:** pnpm creates a non-flat `node_modules` directory. This means packages can only access dependencies that are explicitly declared in their `package.json` file, preventing phantom dependency issues and ensuring our dependency graph is clean and reliable.
*   **Monorepo Support:** pnpm has excellent built-in support for monorepos (workspaces), which is essential for managing our `client`, `server`, and `shared` packages.

## Consequences

*   All developers must use pnpm for all package management operations (`pnpm install`, `pnpm add`, etc.).
*   Our CI/CD pipeline is configured to use `pnpm/action-setup` to ensure pnpm is used correctly.
*   We will use a `pnpm-lock.yaml` file to lock our dependencies and ensure reproducible builds.
