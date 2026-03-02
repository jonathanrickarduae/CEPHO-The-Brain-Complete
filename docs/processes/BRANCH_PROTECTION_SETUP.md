# Branch Protection Rules — Setup Guide

**Owner:** David Park (DevOps)  
**Status:** Required — must be configured in GitHub Settings before Phase 2 begins  
**Last Updated:** 2026-03-02

---

## Overview

Branch protection rules enforce the branch strategy defined in the Grand Master Plan v11. They prevent direct pushes to `main` and `develop`, require passing CI checks before merging, and mandate code review approval. These rules **cannot** be stored in code — they must be configured in the GitHub repository settings by a repository administrator.

---

## Required Rules

### 1. `main` Branch (Production)

Navigate to **Settings → Branches → Add rule** and configure the following for the `main` branch:

| Setting | Value |
| :--- | :--- |
| Branch name pattern | `main` |
| Require a pull request before merging | **Enabled** |
| Required approvals | **2** |
| Dismiss stale pull request approvals when new commits are pushed | **Enabled** |
| Require status checks to pass before merging | **Enabled** |
| Required status checks | `quality-checks`, `build`, `snyk-security` |
| Require branches to be up to date before merging | **Enabled** |
| Require conversation resolution before merging | **Enabled** |
| Do not allow bypassing the above settings | **Enabled** |
| Restrict who can push to matching branches | **Enabled** (admins only) |

### 2. `develop` Branch (Staging)

Navigate to **Settings → Branches → Add rule** and configure the following for the `develop` branch:

| Setting | Value |
| :--- | :--- |
| Branch name pattern | `develop` |
| Require a pull request before merging | **Enabled** |
| Required approvals | **1** |
| Dismiss stale pull request approvals when new commits are pushed | **Enabled** |
| Require status checks to pass before merging | **Enabled** |
| Required status checks | `quality-checks`, `build` |
| Require branches to be up to date before merging | **Enabled** |
| Require conversation resolution before merging | **Enabled** |
| Do not allow bypassing the above settings | **Disabled** (admins may bypass in emergencies) |

---

## Verification

After configuring the rules, verify them by:

1. Attempting a direct push to `main` — it should be rejected.
2. Opening a PR from a feature branch to `develop` — it should require at least one approval and passing CI.
3. Opening a PR from `develop` to `main` — it should require two approvals and all required checks.

---

## CI Status Check Names

The following status check names must match exactly what GitHub Actions reports. These are the job names defined in `.github/workflows/ci-cd.yml`:

- `quality-checks` — TypeScript, ESLint, Prettier
- `build` — Vite + esbuild production build
- `snyk-security` — Snyk vulnerability scan (from `.github/workflows/ci.yml`)

---

## Emergency Override Procedure

In a production incident requiring an emergency hotfix:

1. Create a `hotfix/YYYY-MM-DD-description` branch from `main`.
2. Apply the minimal fix with full tests.
3. A repository administrator may bypass branch protection for `develop` only.
4. The `main` branch bypass is **never** permitted — all changes must go through PR review.
5. Document the override in the On-Call Playbook incident log.

---

## References

- [GitHub Docs: Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [On-Call Playbook](./ON_CALL_PLAYBOOK.md)
- [CI/CD Pipeline](../../.github/workflows/ci-cd.yml)
