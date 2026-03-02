# 2. Supabase as the Backend-as-a-Service (BaaS)

*   **Status:** Decided
*   **Date:** 2026-03-02

## Context

We need a comprehensive backend solution that provides a database, authentication, and a secure API layer without requiring extensive backend development and maintenance. The solution must be scalable, secure, and integrate well with our TypeScript-first tech stack.

## Decision

We will use **Supabase** as our primary Backend-as-a-Service (BaaS) provider. This includes using:

1.  **Supabase Postgres** for our database.
2.  **Supabase Auth** for user authentication (email/password, OAuth).
3.  **Supabase Row-Level Security (RLS)** for data access control.
4.  **Supabase Storage** for file uploads (e.g., user avatars, documents).

## Rationale

*   **Postgres Foundation:** Supabase is built on top of a standard PostgreSQL database, giving us the full power and flexibility of SQL. This avoids vendor lock-in and allows us to use powerful Postgres features.
*   **Integrated Auth:** Supabase provides a complete, secure authentication solution out of the box, including JWT management, OAuth providers (Google, GitHub), and email-based magic links. This saves significant development time.
*   **Row-Level Security (RLS):** RLS is a powerful security paradigm that allows us to define data access policies directly in the database. This ensures that users can only ever access their own data, providing a strong security guarantee at the lowest level.
*   **Developer Experience:** Supabase has excellent TypeScript support, a well-documented client library (`@supabase/supabase-js`), and integrates seamlessly with our frontend and backend.
*   **Scalability & Cost:** Supabase offers a generous free tier and a clear, scalable pricing model that grows with the platform.

## Consequences

*   All data access must be designed with RLS policies in mind.
*   We will rely on the Supabase client libraries for interacting with the backend from our frontend and server.
*   We will need to manage database migrations using a tool compatible with Supabase (Drizzle Kit is already chosen for this).
*   We will need to configure custom SMTP for auth emails in production.
