# 1. tRPC and Drizzle ORM

- **Status:** Decided
- **Date:** 2026-03-01

## Context

We need a robust, type-safe, and efficient way to build our API and interact with the database. The frontend and backend are both written in TypeScript, and maintaining type safety across the full stack is a critical requirement to reduce bugs and improve developer productivity.

## Decision

We will use **tRPC** for our API layer and **Drizzle ORM** for our database layer.

## Rationale

- **tRPC:** Provides end-to-end type safety without code generation. We can define our API routers on the server, and the client will automatically get fully-typed procedures. This eliminates a whole class of potential integration errors.
- **Drizzle ORM:** A lightweight, performant, and type-safe SQL-like query builder for TypeScript. It allows us to write queries that are very close to raw SQL, giving us full control and performance, while still providing excellent type safety and autocompletion.
- **Synergy:** The combination of tRPC and Drizzle creates a highly productive, type-safe development experience from the database all the way to the frontend.

## Consequences

- We will need to ensure all developers are familiar with tRPC and Drizzle.
- We will rely on Drizzle Kit for generating and managing database migrations.
