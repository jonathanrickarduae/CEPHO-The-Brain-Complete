# CEPHO.AI Test Strategy

This document outlines the comprehensive testing strategy for the CEPHO.AI platform to ensure quality, reliability, and security.

## 1. Testing Pyramid

We will follow the testing pyramid model:

- **Unit Tests (70%):** Fast, isolated tests for individual functions, components, and tRPC procedures. Written with Vitest.
- **Integration Tests (20%):** Tests that verify interactions between different parts of the system (e.g., API router to database, UI component to API). Written with Vitest and React Testing Library.
- **End-to-End (E2E) Tests (10%):** Tests that simulate a full user journey through the browser. Written with Playwright.

## 2. Unit Testing

- **Scope:** All business logic in services, utilities, and tRPC routers. All React components with complex logic.
- **Framework:** Vitest (`vitest`)
- **Location:** `*.test.ts` files co-located with the source files.
- **Execution:** Runs on every commit in the CI pipeline.

## 3. Integration Testing

- **Scope:** tRPC procedures calling database repositories. UI components making API calls. Full user flows within the React app.
- **Framework:** Vitest with `supertest` for API testing and React Testing Library for UI.
- **Database:** A separate test database will be spun up in the CI pipeline (see `ci.yml`).
- **Execution:** Runs on every commit in the CI pipeline.

## 4. End-to-End (E2E) Testing

- **Scope:** Critical user journeys, such as:
  - User login and authentication
  - Creating a new project via Project Genesis
  - Submitting an idea to the Innovation Hub
  - Running a full autonomous execution from a one-sentence command
- **Framework:** Playwright
- **Location:** A separate `/e2e` directory.
- **Execution:** Runs nightly against the `staging` environment.

## 5. Security Testing

- **Static Analysis (SAST):** Snyk Code will scan for vulnerabilities on every PR.
- **Dependency Scanning:** Snyk Open Source will scan for vulnerabilities in third-party packages on every PR.
- **Dynamic Analysis (DAST):** A DAST scanner will be run against the `staging` environment quarterly.
- **Penetration Testing:** An external penetration test will be conducted annually (Phase 5).

## 6. Performance Testing

- **Load Testing:** k6 will be used to simulate high traffic against the `staging` environment before major releases.
- **Frontend Performance:** Lighthouse scores will be monitored for key pages.

## 7. Code Coverage

- **Tool:** Vitest Coverage (powered by `v8`).
- **Target:** We will aim for a minimum of 80% code coverage for all new code.
- **Reporting:** Coverage reports will be uploaded to Codecov on every build.

## 8. Branching & CI/CD

- All work is done on feature branches.
- All PRs to `main` or `develop` must pass all CI checks (lint, typecheck, test, security) before being merged.
- The `main` branch is automatically deployed to production on Render.
- The `develop` branch is automatically deployed to a `staging` environment.
