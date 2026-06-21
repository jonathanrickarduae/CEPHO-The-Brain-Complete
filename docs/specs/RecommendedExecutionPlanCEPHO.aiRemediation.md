# Recommended Execution Plan: CEPHO.ai Remediation

**Date:** February 28, 2026
**Author:** Manus AI

## 1. Executive Summary

This document outlines the recommended execution plan for the complete remediation of the CEPHO.ai platform. The plan is based on the findings of the _Code Cleanup Report_ and the _Full Functional Status Report_, which collectively revealed a non-functional, pre-alpha system blocked by two systemic issues: a lack of database connectivity and missing API keys.

The proposed plan prioritizes **stability and incremental progress** over a monolithic, high-risk refactor. The core philosophy is to **clean up first, then build**. We will begin by removing all dead and duplicated code to establish a clean, predictable foundation. Only then will we proceed to systematically wire up the database and API keys, and implement the core features one by one.

Crucially, this plan is designed around a **rapid, iterative deployment cycle**. Each step will be a small, self-contained change that is deployed to the live environment, tested, and verified. This 15-20 minute deploy-test-rollback cycle will allow us to quickly identify and isolate any issues, ensuring that the platform remains stable and that we can confidently measure progress.

This document presents a phased approach, starting with foundational infrastructure fixes, moving through code cleanup, and culminating in the implementation of the two most critical user-facing workflows. This plan is designed to be a clear, actionable roadmap to a stable and functional CEPHO.ai platform.

## 2. Guiding Principles

1.  **Clean First, Build Second:** We will not attempt to build on an unstable foundation. The first phase of work will be dedicated to removing all dead code, orphaned routes, and duplicate implementations identified in the _Code Cleanup Report_. This will create a clean, lean, and predictable codebase.

2.  **Short, Iterative Cycles:** All work will be broken down into small, atomic steps. Each step will be deployed to the live environment, tested, and verified within a 15-20 minute window. This minimizes risk and allows for rapid course correction.

3.  **Infrastructure as Code:** All environment variables, including database connection strings and API keys, will be managed as code via the Render API. This ensures that the environment is reproducible and that there is a single source of truth for all configuration.

4.  **Test-Driven Development (TDD):** For all new feature implementations, we will adopt a TDD approach. We will write failing tests that define the expected behavior _before_ we write the implementation code. This will ensure that our code is correct, robust, and maintainable.

5.  **One Feature at a Time:** We will focus on implementing one core feature at a time, starting with the most critical workflows. This will allow us to deliver value incrementally and avoid the risks of a "big bang" release.

## 3. Phased Execution Plan

This plan is divided into three distinct phases, each with a clear set of objectives and deliverables. Each step within a phase will represent a single deployment cycle.

### Phase 1: Infrastructure & Configuration (Estimated Time: 2-3 hours)

**Goal:** Restore basic connectivity by wiring up the database and all required API keys.

| Step | Action                                                                                                                                     | Verification                                                                                                                           | Rollback Plan                                                      |
| :--- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| 1.1  | **Create Supabase Project:** Provision a new PostgreSQL database on Supabase to serve as the primary data store.                           | A new Supabase project is created and the connection details are available.                                                            | N/A                                                                |
| 1.2  | **Set `DATABASE_URL`:** Add the Supabase connection string as the `DATABASE_URL` environment variable on the Render service.               | The application successfully connects to the database on startup. The `Database not initialized` error is no longer present.           | Remove the `DATABASE_URL` environment variable.                    |
| 1.3  | **Set API Keys:** Add all required API keys (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `SYNTHESIA_API_KEY`, etc.) to the Render environment. | All endpoints that previously failed due to missing API keys now return a different error (e.g., `404 Not Found` or a database error). | Remove the API key environment variables.                          |
| 1.4  | **Fix `initializeDatabase()` Call:** Ensure that the `initializeDatabase()` function is called on server startup.                          | The server logs explicitly show "Database connection initialized successfully".                                                        | Revert the code change that added the `initializeDatabase()` call. |

### Phase 2: Code Cleanup & Consolidation (Estimated Time: 3-4 hours)

**Goal:** Remove all dead, orphaned, and duplicated code identified in the _Code Cleanup Report_.

| Step | Action                                                                                                                                                    | Verification                                                                                                                     | Rollback Plan                                       |
| :--- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| 2.1  | **Delete Orphaned Routes:** Remove all 30 orphaned routes and their associated components from the `client/src/App.tsx` file.                             | The application builds successfully and the deleted routes are no longer accessible.                                             | Revert the code changes that removed the routes.    |
| 2.2  | **Delete Stub/404 Endpoints:** Remove all ~45 stubbed or non-functional tRPC endpoints from their respective router files.                                | The application builds successfully and the deleted endpoints return a `404 Not Found` error when called.                        | Revert the code changes that removed the endpoints. |
| 2.3  | **Consolidate Duplicate Routers:** Merge the logic from the duplicate routers (`genesis`, `victoriasBrief`, `library`) into their canonical counterparts. | The application builds successfully and the consolidated endpoints function as expected. The duplicate router files are deleted. | Revert the code changes that merged the routers.    |

### Phase 3: Core Feature Implementation (Estimated Time: 4-6 hours)

**Goal:** Implement the two most critical end-to-end user workflows: Innovation Hub and Project Genesis.

| Step | Action                                                                                                                                           | Verification                                                                                                          | Rollback Plan                                                        |
| :--- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| 3.1  | **Implement Innovation Hub:** Implement the `innovation.captureIdea` endpoint, including database persistence and AI-powered assessment.         | A user can successfully submit a new idea, it is saved to the database, and an AI assessment is generated and stored. | Revert the code changes that implemented the `captureIdea` endpoint. |
| 3.2  | **Implement Project Genesis:** Implement the `projectGenesis.initiate` endpoint, including the project creation wizard and database persistence. | A user can successfully complete the project creation wizard, and a new project is created and saved to the database. | Revert the code changes that implemented the `initiate` endpoint.    |

## 4. Next Steps

This execution plan provides a clear and actionable path to remediating the CEPHO.ai platform. The next step is to seek approval for this plan. Once approved, we will begin with Phase 1, Step 1: creating the Supabase project and wiring up the database.
