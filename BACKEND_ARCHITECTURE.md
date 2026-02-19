# Backend Architecture Documentation

## Overview

The CEPHO.AI backend follows a modular, layered architecture with clear separation of concerns. This document outlines the structure, patterns, and organization principles.

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│           Client Layer                  │
│  (React Frontend, Mobile App)           │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         API Layer (tRPC)                │
│  - Routers                              │
│  - Input validation (Zod)               │
│  - Type safety                          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│        Service Layer                    │
│  - Business logic                       │
│  - Domain services                      │
│  - Orchestration                        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Repository Layer                   │
│  - Data access                          │
│  - Query building                       │
│  - Database operations                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│       Database Layer                    │
│  - PostgreSQL/TiDB                      │
│  - Drizzle ORM                          │
│  - Migrations                           │
└─────────────────────────────────────────┘
```

---

## Directory Structure

```
server/
├── _core/                    # Core infrastructure
│   ├── context.ts           # tRPC context
│   ├── trpc.ts              # tRPC setup
│   ├── index.ts             # Server entry point
│   ├── di-container.ts      # Dependency injection
│   ├── service-registry.ts  # Service registration
│   ├── rateLimit.ts         # Rate limiting
│   └── sentry.ts            # Error tracking
│
├── routers/                  # API endpoints (tRPC routers)
│   ├── auth/                # Authentication routers
│   ├── ai/                  # AI agent routers
│   ├── project/             # Project management routers
│   ├── training/            # Training system routers
│   └── ...
│
├── services/                 # Business logic layer
│   ├── ai-agent/            # AI agent services
│   ├── analytics/           # Analytics services
│   ├── business-plan/       # Business plan services
│   ├── document/            # Document services
│   ├── expert/              # Expert services
│   ├── project/             # Project services
│   └── ...
│
├── middleware/               # Express middleware
│   ├── security-headers.ts  # Security headers
│   ├── auth.ts              # Authentication
│   └── ...
│
├── migrations/               # Database migrations
│   └── run-migrations.ts    # Migration runner
│
├── utils/                    # Utility functions
│   ├── logger.ts            # Logging utility
│   ├── validation.ts        # Validation helpers
│   └── ...
│
└── db.ts                     # Database connection
```

---

## Domain Organization

### Core Domains

The backend is organized into the following core domains:

#### 1. **Authentication & Authorization**
- User registration and login
- Session management
- OAuth integration
- Role-based access control

**Files:**
- `routers/auth.router.ts`
- `services/auth.service.ts`
- `middleware/auth.ts`

#### 2. **AI Agents**
- Digital Twin
- Chief of Staff
- SME Network
- Expert Team

**Files:**
- `routers/digital-twin.router.ts`
- `routers/chief-of-staff.router.ts`
- `routers/sme.router.ts`
- `services/digital-twin-service.ts`
- `services/chief-of-staff-orchestrator.ts`
- `services/sme-service.ts`

#### 3. **Training Systems**
- Digital Twin training
- Chief of Staff training
- Knowledge accumulation
- Learning feedback

**Files:**
- `routers/digital-twin-training.router.ts`
- `routers/chief-of-staff-training.router.ts`
- `services/digital-twin-training.service.ts`
- `services/chief-of-staff-training.service.ts`

#### 4. **Innovation Hub**
- Idea management
- Workflow automation
- Multi-source submissions
- Conversion tracking

**Files:**
- `routers/innovation.router.ts`
- `routers/innovation-hub-workflow.router.ts`
- `services/innovation-hub-workflow.service.ts`

#### 5. **Project Management**
- Project Genesis
- Blueprints
- Quality Gates
- Deep Dives

**Files:**
- `routers/project-genesis.router.ts`
- `routers/blueprint.router.ts`
- `routers/quality-gates.router.ts`
- `routers/deep-dive.router.ts`
- `services/project/`

#### 6. **Business Planning**
- Business plan generation
- Review workflows
- Template management

**Files:**
- `routers/business-plan.router.ts`
- `services/business-plan/`

#### 7. **Document Management**
- Document library
- Templates
- PDF export
- Collaborative review

**Files:**
- `routers/document-library.router.ts`
- `routers/collaborative-review.router.ts`
- `services/document/`

#### 8. **Analytics & Monitoring**
- Feature analytics
- Performance metrics
- User behavior tracking

**Files:**
- `routers/analytics.router.ts`
- `services/analytics/`
- `services/metrics/`

#### 9. **Integrations**
- Asana integration
- External APIs
- Webhooks

**Files:**
- `routers/asana.router.ts`
- `routers/integrations.router.ts`
- `services/asana-integration.ts`
- `services/integration-manager.ts`

---

## Design Patterns

### 1. **Repository Pattern**

Separates data access logic from business logic.

```typescript
// Repository (data access)
export class ProjectRepository {
  async findById(id: number): Promise<Project | null> {
    const db = await getDb();
    const result = await db.execute(sql`
      SELECT * FROM projects WHERE id = ${id}
    `);
    return result.rows[0] as Project;
  }
}

// Service (business logic)
export class ProjectService {
  constructor(private repo: ProjectRepository) {}
  
  async getProject(id: number): Promise<Project> {
    const project = await this.repo.findById(id);
    if (!project) throw new Error('Project not found');
    return project;
  }
}
```

### 2. **Dependency Injection**

Services are registered and injected via DI container.

```typescript
// Register services
DIContainer.register('ProjectRepository', ProjectRepository);
DIContainer.register('ProjectService', ProjectService, ['ProjectRepository']);

// Use services
const projectService = DIContainer.get<ProjectService>('ProjectService');
```

### 3. **Service Layer Pattern**

Business logic is encapsulated in service classes.

```typescript
export class AnalyticsService {
  async trackEvent(userId: number, event: string): Promise<void> {
    // Business logic here
  }
  
  async getStats(userId: number): Promise<Stats> {
    // Business logic here
  }
}
```

### 4. **Router Pattern (tRPC)**

API endpoints are defined as tRPC procedures.

```typescript
export const projectRouter = router({
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      return projectService.create(input);
    }),
    
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return projectService.getById(input.id);
    }),
});
```

---

## Service Organization

### Modular Services

Services are organized by domain with clear boundaries:

```
services/
├── analytics/
│   ├── analytics.service.ts      # Main service
│   ├── analytics.repository.ts   # Data access
│   ├── analytics.types.ts        # Type definitions
│   ├── analytics.service.test.ts # Tests
│   └── index.ts                  # Public exports
│
├── business-plan/
│   ├── business-plan.service.ts
│   ├── business-plan.repository.ts
│   ├── business-plan.types.ts
│   ├── business-plan.service.test.ts
│   └── index.ts
│
└── ...
```

### Service Responsibilities

Each service should:
- ✅ Handle one domain or bounded context
- ✅ Encapsulate business logic
- ✅ Use repositories for data access
- ✅ Be testable in isolation
- ✅ Have clear interfaces
- ❌ Not directly access the database
- ❌ Not depend on HTTP/tRPC details
- ❌ Not contain presentation logic

---

## Router Organization

### Router Structure

```typescript
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { ProjectService } from "../services/project/project.service";

const projectService = new ProjectService();

export const projectRouter = router({
  // Queries (read operations)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return projectService.getById(input.id);
    }),
  
  list: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return projectService.list(input.limit);
    }),
  
  // Mutations (write operations)
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      return projectService.create(input);
    }),
  
  update: publicProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ input }) => {
      return projectService.update(input.id, input);
    }),
  
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return projectService.delete(input.id);
    }),
});
```

### Router Responsibilities

Routers should:
- ✅ Define API endpoints
- ✅ Validate input with Zod
- ✅ Delegate to services
- ✅ Handle HTTP concerns
- ❌ Not contain business logic
- ❌ Not access database directly
- ❌ Not perform complex transformations

---

## Database Layer

### Drizzle ORM

We use Drizzle ORM for type-safe database access.

```typescript
import { sql } from "drizzle-orm";
import { getDb } from "../db";

const db = await getDb();

// Type-safe queries
const users = await db.execute(sql`
  SELECT * FROM users WHERE id = ${userId}
`);
```

### Migration Strategy

Migrations are managed with Drizzle Kit:

```bash
# Generate migration
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema (development)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

---

## Error Handling

### Service Layer Errors

```typescript
export class ProjectService {
  async getProject(id: number): Promise<Project> {
    const project = await this.repo.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project;
  }
}
```

### Router Layer Errors

```typescript
export const projectRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await projectService.getById(input.id);
      } catch (error) {
        // tRPC automatically handles errors
        throw error;
      }
    }),
});
```

### Global Error Tracking

Errors are automatically captured by Sentry:

```typescript
import * as Sentry from '@sentry/node';

// Errors are automatically captured
throw new Error('Something went wrong');
```

---

## Testing Strategy

### Unit Tests

Test services in isolation:

```typescript
describe('ProjectService', () => {
  it('should create a project', async () => {
    const service = new ProjectService();
    const project = await service.create({ name: 'Test' });
    expect(project.name).toBe('Test');
  });
});
```

### Integration Tests

Test routers with database:

```typescript
describe('projectRouter', () => {
  it('should create and retrieve project', async () => {
    const caller = appRouter.createCaller({});
    const created = await caller.project.create({ name: 'Test' });
    const retrieved = await caller.project.getById({ id: created.id });
    expect(retrieved.name).toBe('Test');
  });
});
```

---

## Performance Optimization

### Database Indexes

Critical indexes are defined in migrations:

```sql
CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects" ("user_id");
CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects" ("created_at");
```

### Query Optimization

Use efficient queries:

```typescript
// ✅ Good: Single query with join
const projects = await db.execute(sql`
  SELECT p.*, u.name as user_name
  FROM projects p
  JOIN users u ON p.user_id = u.id
  WHERE p.user_id = ${userId}
`);

// ❌ Bad: N+1 queries
const projects = await db.execute(sql`SELECT * FROM projects`);
for (const project of projects.rows) {
  const user = await db.execute(sql`SELECT * FROM users WHERE id = ${project.user_id}`);
}
```

### Caching

Use Redis for caching:

```typescript
import { RedisCache } from '../services/cache/redis-cache';

const cache = new RedisCache();
const cached = await cache.get('key');
if (cached) return cached;

const data = await fetchData();
await cache.set('key', data, 3600); // 1 hour TTL
return data;
```

---

## Security Best Practices

### Input Validation

All inputs are validated with Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Authentication

Protected routes use authentication middleware:

```typescript
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Unauthorized');
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

### Rate Limiting

API endpoints are rate limited:

```typescript
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
```

---

## Monitoring and Observability

### Prometheus Metrics

Metrics are exposed at `/api/metrics`:

```typescript
import { metricsMiddleware, metricsHandler } from '../services/metrics/prometheus';

app.use(metricsMiddleware);
app.get('/api/metrics', metricsHandler);
```

### Logging

Structured logging with Winston:

```typescript
import { logger } from '../utils/logger';

const log = logger.module('ProjectService');
log.info('Project created', { projectId: project.id });
log.error('Failed to create project', { error });
```

### Error Tracking

Sentry captures all errors:

```typescript
import * as Sentry from '@sentry/node';

Sentry.captureException(error);
```

---

## Future Improvements

### Planned Enhancements

1. **GraphQL Support**: Add GraphQL alongside tRPC
2. **Event Sourcing**: Implement event-driven architecture
3. **CQRS**: Separate read and write models
4. **Microservices**: Split into smaller services
5. **Message Queue**: Add RabbitMQ/Redis for async processing
6. **API Gateway**: Centralized API management
7. **Service Mesh**: Istio for service-to-service communication

---

## Resources

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Zod Documentation](https://zod.dev)
- [Sentry Documentation](https://docs.sentry.io)
- [Express Documentation](https://expressjs.com)

---

## Support

For architecture questions or suggestions:
- GitHub Discussions
- Team Slack channel
- Architecture review meetings
