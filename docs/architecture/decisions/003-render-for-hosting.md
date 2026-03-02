# 3. Render for Hosting and Deployment

*   **Status:** Decided
*   **Date:** 2026-03-02

## Context

We need a reliable, scalable, and easy-to-use platform for hosting our production and staging environments. The platform must support our Node.js backend, have a clear deployment workflow, and provide features like environment variable management and automatic deployments.

## Decision

We will use **Render** as our primary hosting and deployment platform for all backend services and web applications.

## Rationale

*   **Ease of Use:** Render provides a simple, intuitive interface and a clear `render.yaml` configuration file for defining services. This makes it easy to set up and manage our infrastructure as code.
*   **Git-based Deployments:** Render integrates directly with GitHub, allowing for automatic deployments on every push to our `main` (production) and `develop` (staging) branches. This fits perfectly with our CI/CD strategy.
*   **Managed Services:** Render offers managed PostgreSQL databases, Redis instances, and other services, reducing our operational overhead.
*   **Scalability:** Render allows for easy scaling of services (both vertically and horizontally) as our traffic grows.
*   **Environment Groups:** Render's environment groups allow us to securely manage environment variables and secrets for different environments (production, staging) without committing them to the repository.

## Consequences

*   Our deployment pipeline is now dependent on Render's platform and API.
*   We will use Render's built-in health checks and logging to monitor our services.
*   All infrastructure is defined in the `render.yaml` file, which becomes a critical configuration file.
