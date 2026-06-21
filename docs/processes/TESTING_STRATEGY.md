# Testing Strategy

This document outlines the comprehensive testing strategy for the CEPHO.AI platform to ensure quality, reliability, and a great user experience.

## 1. Guiding Principles

- **Test Pyramid:** We follow the testing pyramid model, emphasizing a large base of fast unit tests, a smaller layer of integration tests, and a minimal set of slow end-to-end (E2E) tests.
- **Automation First:** All tests that can be automated, should be automated. Manual testing is reserved for exploratory testing and usability checks.
- **Shift-Left:** Testing is not a separate phase but an integral part of the development process. Tests are written alongside the code and run continuously.
- **Clarity and Maintainability:** Tests should be clear, concise, and easy to maintain. A failing test should clearly indicate what is broken.

## 2. Testing Layers

| Layer                      | Tool               | Scope                                                                          | When It Runs                                              | Location                                      |
| :------------------------- | :----------------- | :----------------------------------------------------------------------------- | :-------------------------------------------------------- | :-------------------------------------------- |
| **Unit Tests**             | Vitest             | Individual functions, components, and utilities in isolation.                  | On every pre-commit hook and in the CI pipeline.          | `*.test.ts` files alongside the source code.  |
| **Integration Tests**      | Vitest & Supertest | Interactions between multiple components, API endpoints, and database queries. | In the CI pipeline on every push to `develop` and `main`. | `*.spec.ts` files in a `__tests__` directory. |
| **End-to-End (E2E) Tests** | Playwright         | Full user flows through the live application UI in a real browser.             | Nightly on the `staging` environment.                     | `e2e/` directory.                             |

## 3. Tooling

- **Vitest:** For all unit and integration tests. It is fast, modern, and has a Jest-compatible API.
- **Supertest:** For testing our Express API endpoints in integration tests.
- **Playwright:** For E2E tests. It is modern, reliable, and supports all major browsers.
- **Mock Service Worker (MSW):** To mock API requests in frontend tests.
- **Faker.js:** To generate realistic test data.

## 4. Test Coverage

We aim for a minimum of **80% test coverage** for all new code. Coverage reports will be generated and monitored, but the primary goal is to write effective tests, not just to hit a number.

## 5. Process

1.  **Development:** Developers write unit and integration tests alongside their feature code.
2.  **Pre-commit:** Before committing, Husky runs all relevant tests to catch issues early.
3.  **Pull Request:** When a PR is opened, the full CI/CD pipeline runs, including all tests.
4.  **Merge:** Code can only be merged to `develop` or `main` if all tests pass.
5.  **Staging:** E2E tests run nightly against the deployed staging environment to catch regressions.
