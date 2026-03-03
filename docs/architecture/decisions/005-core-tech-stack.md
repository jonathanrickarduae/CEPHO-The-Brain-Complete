# 5. Core Technology Stack

- **Status:** Decided
- **Date:** 2026-03-02

## Context

We need to formally define the core technologies that will be used to build the CEPHO.AI platform. These choices have a significant impact on development speed, performance, scalability, and maintainability.

## Decision

The core technology stack is defined as follows:

| Layer            | Technology        | Rationale                                                                                                                       |
| :--------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **Language**     | TypeScript        | Provides strong type safety, reducing bugs and improving developer experience across the full stack.                            |
| **Frontend**     | React & Vite      | React is the industry standard for building interactive UIs. Vite provides an extremely fast and modern development experience. |
| **Backend**      | Node.js & Express | A mature, reliable, and high-performance environment for building our server and API layer.                                     |
| **Styling**      | TailwindCSS       | A utility-first CSS framework that allows for rapid UI development without writing custom CSS.                                  |
| **API Layer**    | tRPC              | Enables end-to-end type safety between the server and client without code generation.                                           |
| **Database ORM** | Drizzle ORM       | A lightweight, performant, and type-safe SQL-like query builder for TypeScript.                                                 |

## Rationale

This stack was chosen for its strong emphasis on **type safety, developer experience, and performance.**

- **TypeScript** is the foundation, ensuring that data structures are consistent from the database all the way to the UI.
- **React, Vite, and TailwindCSS** create a highly productive and modern frontend development environment.
- **Node.js and Express** provide a robust and familiar backend foundation.
- **tRPC and Drizzle** are the key enablers of our full-stack type safety strategy, eliminating a major source of bugs and integration issues.

## Consequences

- All new code must be written in TypeScript.
- All UI components must be built in React and styled with TailwindCSS.
- All API endpoints must be implemented using tRPC.
- All database interactions must go through Drizzle ORM.
- This creates a consistent and unified codebase that is easier to maintain and scale.
