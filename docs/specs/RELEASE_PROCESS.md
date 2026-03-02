# Release Process

**CEPHO.AI Platform**

*Version: 1.0*
*Status: Draft*
*Last Updated: 2026-03-01*

---

## 1. Overview

This document defines the process for releasing new versions of the CEPHO.AI platform, from idea to production. The goal is to ensure all releases are high-quality, stable, and predictable.

---

## 2. Branching Strategy

We follow a GitFlow-like branching model:

- **`main`:** Represents the production-ready code. Only hotfixes and merges from `develop` are allowed.
- **`develop`:** The primary development branch. All feature branches are merged into `develop`.
- **`feature/<item-id>-<description>`:** For new features or fixes. Branched from `develop`. Example: `feature/FE-01-fix-doc-library-crash`.
- **`hotfix/<item-id>-<description>`:** For urgent production fixes. Branched from `main`.

---

## 3. The Release Lifecycle

### Step 1: Development

1. A developer picks up an item from the Grand Master Plan.
2. They create a feature branch from `develop`.
3. They write the code, including unit and contract tests.
4. They test manually on their local environment.
5. They run `python3 scripts/validate.py --check <ITEM_ID>` to verify the fix.

### Step 2: Code Review

1. The developer opens a Pull Request (PR) against the `develop` branch.
2. The PR description must follow the `PULL_REQUEST_TEMPLATE.md`.
3. At least one other developer must review and approve the PR.
4. The CI pipeline must pass all checks (type check, lint, tests, build).

### Step 3: Staging Deployment

1. Once the PR is merged into `develop`, the CI/CD pipeline automatically deploys the `develop` branch to the staging environment.
2. The staging environment is a mirror of production.
3. The pipeline runs the full validation script against the staging deployment.

### Step 4: QA & User Acceptance Testing (UAT)

1. The QA team (or a designated product owner) tests the new feature on the staging environment.
2. They verify that the feature meets the acceptance criteria in the PRD.
3. They perform regression testing to ensure no existing features were broken.

### Step 5: Production Release

1. To release to production, a PR is opened from `develop` to `main`.
2. This PR is a "release PR" and should bundle multiple features.
3. The PR description must include a summary of all features being released.
4. Before merging, the developer must update `CHANGELOG.md` and `GRADES.md`.
5. Once the release PR is approved and merged into `main`, the CI/CD pipeline automatically deploys to production.

### Step 6: Post-Release Monitoring

1. The on-call engineer monitors Sentry, logs, and metrics for 1 hour after deployment.
2. If any critical issues are found, the deployment is immediately rolled back via the Render dashboard.

---

## 4. Release Cadence

- **Feature Releases:** Deployed to production weekly, every Tuesday at 14:00 GMT.
- **Hotfixes:** Deployed to production immediately as needed.
