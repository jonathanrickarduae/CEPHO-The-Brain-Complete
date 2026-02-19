# CEPHO.AI - Architecture Documentation

**Version**: 2.0  
**Last Updated**: February 17, 2026  
**Status**: Production-Ready

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Layer](#database-layer)
- [API Layer](#api-layer)
- [Frontend Architecture](#frontend-architecture)
- [Authentication](#authentication)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

---

## Overview

CEPHO.AI is a sophisticated AI-powered business intelligence platform that provides users with expert AI agents, project management tools, and comprehensive business analytics. The platform is built with modern web technologies and follows industry-standard architectural patterns.

### Key Features

The platform provides a comprehensive suite of business intelligence tools including **AI Expert Agents** that offer specialized knowledge across various domains, **Project Genesis** for strategic business planning, **Daily Signal** for market intelligence, and **Chief of Staff** for executive assistance. The system includes advanced **Document Management** with AI-powered analysis, **Collaborative Review** capabilities, and **Integration Hub** supporting connections to Gmail, Asana, Notion, and Slack.

---

## Technology Stack

### Backend

The backend infrastructure is built on **Node.js 22** with **TypeScript** for type safety, utilizing **tRPC** for end-to-end type-safe APIs. The database layer employs **PostgreSQL** via Supabase with **Drizzle ORM** for type-safe queries. Authentication is handled through a **simple email/password system** (OAuth temporarily disabled), while the server framework uses **Express.js** with **Vite** for development.

### Frontend

The frontend leverages **React 19** with **TypeScript**, styled using **TailwindCSS** and **Shadcn/UI** components. State management is handled by **TanStack Query** (React Query), with routing provided by **React Router v7**. The UI components are built on **Radix UI** primitives for accessibility.

### Infrastructure

The application is deployed on **Render** for hosting, uses **Supabase** for the PostgreSQL database, and integrates **OpenAI GPT-4** for AI capabilities. Environment management is handled through **dotenv**, with **pnpm** serving as the package manager.

---

## Project Structure

```
cepho-the-brain-complete/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components (54 pages)
│   │   ├── data/              # Static data and configurations
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Utility functions and helpers
│   └── index.html             # Entry HTML file
│
├── server/                    # Backend Node.js application
│   ├── _core/                 # Core server utilities
│   │   ├── trpc.ts            # tRPC configuration
│   │   ├── google-oauth.ts    # OAuth implementation
│   │   ├── cookies.ts         # Cookie management
│   │   └── sdk.ts             # Session management
│   ├── db/                    # Database layer (NEW)
│   │   ├── connection.ts      # Database connection management
│   │   ├── repositories/      # Repository pattern implementation
│   │   │   ├── base.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── routers/               # tRPC routers
│   │   ├── domains/           # Domain-specific routers (NEW)
│   │   └── *.router.ts        # Individual router files
│   ├── routes/                # Express routes
│   ├── services/              # Business logic services (19 services)
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts          # Logging utility
│   │   └── errors.ts          # Error handling classes
│   ├── constants/             # Application constants
│   │   ├── time.constants.ts
│   │   ├── http.constants.ts
│   │   ├── pagination.constants.ts
│   │   └── validation.constants.ts
│   ├── __tests__/             # Test files
│   │   ├── unit/              # Unit tests (35 tests)
│   │   └── integration/       # Integration tests
│   ├── routers.ts             # Main tRPC router
│   ├── db.ts                  # Legacy database functions (being migrated)
│   └── index.ts               # Server entry point
│
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts              # Main database schema (166 tables)
│   ├── relations.ts           # Table relationships
│   └── migrations/            # Database migrations
│
├── shared/                    # Shared code between client and server
│
├── patches/                   # Package patches
│
└── Configuration Files
    ├── package.json           # Dependencies and scripts
    ├── tsconfig.json          # TypeScript configuration
    ├── drizzle.config.ts      # Drizzle ORM configuration
    ├── vite.config.ts         # Vite bundler configuration
    └── render.yaml            # Render deployment configuration
```

---

## Database Layer

### Architecture

The database layer follows the **Repository Pattern** for clean separation of concerns and improved testability.

#### Connection Management

Database connections are managed through a centralized connection module located at `server/db/connection.ts`. This module provides several key functions including `initializeDatabase()` for establishing the connection pool, `getDb()` for retrieving the Drizzle ORM instance, `getRawClient()` for accessing the raw PostgreSQL client, `closeDatabase()` for graceful shutdown, and `checkDatabaseHealth()` for monitoring connectivity.

#### Repository Pattern

All database operations are organized into domain-specific repositories. The `BaseRepository` class provides common functionality including database access, error handling, and logging. Domain repositories such as `UserRepository`, `ProjectRepository`, and `ExpertRepository` extend the base class and implement specific business logic.

### Schema Organization

The database schema is organized into 166 tables across multiple domains. The **Core Tables** include users, sessions, and settings. **Expert System** tables cover AI experts, conversations, memories, insights, and prompt evolution. **Project Management** encompasses projects, tasks, dependencies, and milestones. **Document Management** handles documents, libraries, and reviews. **Integration** tables manage API credentials and webhooks. **Analytics** tables track audit logs, feedback, and metrics.

### Example Usage

```typescript
import { userRepository } from "./db/repositories";

// Create a new user
const user = await userRepository.create({
  email: "user@example.com",
  name: "John Doe",
  googleId: "google-id-123"
});

// Find user by email
const existingUser = await userRepository.findByEmail("user@example.com");

// Update user
await userRepository.update(user.id, {
  name: "Jane Doe",
  lastLoginAt: new Date()
});
```

---

## API Layer

### tRPC Architecture

The API uses **tRPC** for end-to-end type-safe communication between client and server.

#### Router Organization

The main router is defined in `server/routers.ts` and includes 55+ domain routers. Key routers include **auth** for authentication, **mood** for mood tracking, **chat** for AI conversations, **projects** for project management, **genesis** for business planning, **expertEvolution** for AI expert learning, **documents** for document management, and **integrations** for third-party services.

#### Procedures

tRPC procedures come in two types. **Queries** are used for data retrieval (GET operations), while **Mutations** handle data modification (POST/PUT/DELETE operations). Both types support **protectedProcedure** which requires authentication and **publicProcedure** which is accessible without authentication.

### Example Router

```typescript
import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const moodRouter = router({
  create: protectedProcedure
    .input(z.object({
      score: z.number().min(0).max(100),
      timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createMoodEntry({
        userId: ctx.user.id,
        ...input,
      });
    }),
    
  history: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      days: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return getMoodHistory(ctx.user.id, input);
    }),
});
```

---

## Frontend Architecture

### Component Organization

Components are organized by feature and reusability. **Pages** (54 total) represent full-page views, **Components** are reusable UI elements, **Hooks** contain custom React hooks, and **Data** includes static configurations and mock data.

### State Management

State management utilizes **TanStack Query** for server state, **React Context** for global UI state, and **Local State** (useState/useReducer) for component-specific state.

### Routing

The application uses React Router v7 with file-based routing. Routes are defined in `client/src/pages/` with automatic route generation.

---

## Authentication

### OAuth Flow

The authentication process is handled by a simple email/password system. Users submit their credentials to `/api/auth/login`, which validates them and returns a JWT session token in an HttpOnly cookie.

### Session Management

Sessions are managed through encrypted HTTP-only cookies with a one-year expiration. Session tokens are stored in cookies and verified on each request. The session secret is configured via the `SESSION_SECRET` environment variable.

### Protected Routes

Both frontend and backend routes are protected. Frontend routes use `ProtectedRoute` components, while backend routes employ `protectedProcedure` in tRPC.

---

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - TypeScript type checking
- `pnpm test` - Run tests
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio

### Code Quality

The project maintains code quality through **TypeScript** for type safety, **ESLint** for code linting, **Prettier** for code formatting, and comprehensive **Unit and Integration Tests**.

---

## Deployment

### Render Configuration

The application is deployed on Render with automatic deployments from the main branch. The build command is `pnpm install && pnpm build`, and the start command is `pnpm start`. Environment variables are configured in the Render dashboard.

### Environment Variables

Required environment variables include `DATABASE_URL` for the PostgreSQL connection string, `SESSION_SECRET` for session encryption, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth, `OPENAI_API_KEY` for AI features, and `NODE_ENV` set to production.

---

## Best Practices

### Code Organization

Follow these organizational principles. Use the **Repository Pattern** for database operations, implement **Service Layer** for business logic, organize **Routers** by domain, and maintain **Type Safety** throughout the codebase.

### Error Handling

Implement comprehensive error handling. Use **Custom Error Classes** from `server/utils/errors.ts`, apply **Try-Catch Blocks** in all async operations, utilize **Structured Logging** via `server/utils/logger.ts`, and provide **User-Friendly Messages** in the frontend.

### Performance

Optimize performance through **Database Indexing** on frequently queried columns, **Query Optimization** using Drizzle's query builder, **Caching** with TanStack Query, and **Code Splitting** in the frontend.

### Security

Maintain security through **Input Validation** using Zod schemas, **SQL Injection Prevention** via Drizzle ORM, **XSS Protection** through React's built-in escaping, and **CSRF Protection** using HTTP-only cookies.

---

## Migration Guide

### From Legacy db.ts to Repositories

When migrating database operations, follow these steps.

**Step 1**: Create a repository for the domain.

```typescript
// server/db/repositories/project.repository.ts
export class ProjectRepository extends BaseRepository {
  async findById(id: number): Promise<Project | null> {
    const db = await this.getDatabase();
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return project || null;
  }
}
```

**Step 2**: Update router to use repository.

```typescript
// Before
import { getProjectById } from "../db";
const project = await getProjectById(input.id);

// After
import { projectRepository } from "../db/repositories";
const project = await projectRepository.findById(input.id);
```

**Step 3**: Remove old function from db.ts after migration is complete.

---

## Contributing

When contributing to this project, follow the established patterns. Use **Repository Pattern** for new database operations, add **JSDoc Comments** to all public APIs, write **Tests** for new features, update **Documentation** when changing architecture, and follow **TypeScript Best Practices** throughout.

---

## Support

For questions or issues, consult the comprehensive documentation in `PHASE1_COMPLETION_AND_NEXT_STEPS.md` and `EXPERT_CODE_REVIEW_DEEP_ANALYSIS.md`. Additional support is available at https://help.manus.im.

---

**Document Version**: 2.0  
**Last Updated**: February 17, 2026  
**Maintained By**: CEPHO.AI Development Team
