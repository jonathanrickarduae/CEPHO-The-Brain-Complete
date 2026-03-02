# CEPHO.AI GitHub Package — Commit Instructions

This package contains all files that must be committed to the `cepho-ai/the-brain` GitHub repository to establish the enterprise-grade project infrastructure.

---

## How to Commit This Package

1. Clone the repository:
   ```bash
   git clone git@github.com:cepho-ai/the-brain.git
   cd the-brain
   ```
2. Copy all files from this package into the repository root, preserving the folder structure.
3. Commit everything:
   ```bash
   git add .
   git commit -m "chore: add enterprise project infrastructure (P0-02, P0-09)"
   git push origin develop
   ```

---

## File Index

| File | Location in Repo | Purpose |
| :--- | :--- | :--- |
| `GRADES.md` | `/GRADES.md` | **The single source of truth for quality grades.** Updated on every production deployment. |
| `CHANGELOG.md` | `/CHANGELOG.md` | Records every change in every release. Updated on every PR. |
| `SECURITY.md` | `/SECURITY.md` | Security policy and vulnerability reporting process. |
| `ci.yml` | `/.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline. Runs on every PR and merge to main. |
| `PULL_REQUEST_TEMPLATE.md` | `/.github/PULL_REQUEST_TEMPLATE.md` | Mandatory PR template. Forces every PR to reference a Grand Master Plan item. |
| `validate.py` | `/scripts/validate.py` | Automated validation script. Run after every fix: `python3 scripts/validate.py --check ALL` |
| `seed.ts` | `/scripts/seed.ts` | Database seed script. Populates all tables with mock data for development and testing. |
| `PRD.md` | `/docs/PRD.md` | Product Requirements Document. Defines what every feature must do. |
| `API_DOCS.md` | `/docs/API_DOCS.md` | API documentation for all tRPC procedures. |
| `DATA_DICTIONARY.md` | `/docs/DATA_DICTIONARY.md` | Database schema reference. Defines every table and column. |
| `RUNBOOK.md` | `/docs/RUNBOOK.md` | Operational runbook. Step-by-step guide for every incident scenario. |
| `USER_MANUAL.md` | `/docs/USER_MANUAL.md` | End-user guide for all platform features. |
| `PRIVACY_POLICY.md` | `/docs/PRIVACY_POLICY.md` | Privacy policy (must also be displayed in-app on first login). |
| `TERMS_OF_SERVICE.md` | `/docs/TERMS_OF_SERVICE.md` | Terms of service (must also be displayed in-app on first login). |
| `RELEASE_PROCESS.md` | `/docs/processes/RELEASE_PROCESS.md` | How features go from idea to production. |
| `INCIDENT_RESPONSE.md` | `/docs/processes/INCIDENT_RESPONSE.md` | How to respond to and manage incidents. |
| `DEVELOPER_ONBOARDING.md` | `/docs/processes/DEVELOPER_ONBOARDING.md` | How new developers get set up and make their first contribution. |
| `QUALITY_REVIEW_CADENCE.md` | `/docs/processes/QUALITY_REVIEW_CADENCE.md` | Schedule of all recurring quality reviews (weekly, monthly, quarterly, annual). |

---

## The Most Important Files

If you only commit three things, commit these:

1. **`GRADES.md`** — This is the heartbeat of the project. Every deploy must update it.
2. **`ci.yml`** — This enforces the process automatically. Without it, the process is just a suggestion.
3. **`PULL_REQUEST_TEMPLATE.md`** — This ensures every code change is traceable to a plan item.
