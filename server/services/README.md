# Service Layer Architecture

This directory contains the service layer for CEPHO.AI, implementing domain-driven design principles.

## Structure

```
services/
├── mood/                   # Mood tracking services
├── expert/                 # AI expert services
├── business-plan/          # Business plan review services
├── document/               # Document management services
├── project/                # Project management services
├── review/                 # Review system services
├── analytics/              # Analytics and reporting services
├── integration/            # Third-party integration services
├── ai-agent/               # AI agent orchestration services
├── communication/          # Chat and notification services
├── settings/               # User settings services
└── shared/                 # Shared utilities and base classes
```

## Service Layer Pattern

Each domain follows this structure:

```
domain/
├── domain.service.ts       # Business logic
├── domain.repository.ts    # Data access
├── domain.types.ts         # TypeScript types and DTOs
└── domain.validator.ts     # Input validation (optional)
```

### Example: Mood Service

```typescript
// mood/mood.service.ts
export class MoodService {
  constructor(private repository: MoodRepository) {}
  
  async createEntry(userId: number, data: CreateMoodDto) {
    // Validation
    this.validateMoodScore(data.score);
    
    // Business logic
    const entry = await this.repository.create({
      userId,
      ...data,
    });
    
    // Side effects
    await this.notifyMoodChange(userId, entry);
    
    return entry;
  }
}

// mood/mood.repository.ts
export class MoodRepository {
  constructor(private db: Database) {}
  
  async create(data: InsertMoodHistory) {
    return await this.db
      .insert(moodHistory)
      .values(data)
      .returning();
  }
  
  async findByUserId(userId: number) {
    return await this.db
      .select()
      .from(moodHistory)
      .where(eq(moodHistory.userId, userId));
  }
}
```

## Principles

### 1. Separation of Concerns
- **Services**: Business logic, validation, orchestration
- **Repositories**: Data access, queries, transactions
- **Routers**: HTTP/tRPC layer, authentication, input/output

### 2. Single Responsibility
- Each service handles ONE domain
- Each method does ONE thing
- Clear, focused interfaces

### 3. Dependency Injection
- Services receive dependencies via constructor
- Easy to test with mocks
- Loose coupling

### 4. Type Safety
- All inputs/outputs use TypeScript types
- DTOs for data transfer
- Compile-time safety

## Migration Guide

### Converting Router Logic to Services

**Before: Logic in Router**
```typescript
// routers/mood.router.ts
mood: router({
  create: protectedProcedure.mutation(async ({ ctx, input }) => {
    const db = await getDb();
    
    // Validation
    if (input.score < 1 || input.score > 10) {
      throw new Error('Invalid score');
    }
    
    // Create entry
    const entry = await db.insert(moodHistory).values({
      userId: ctx.user.id,
      score: input.score,
      timeOfDay: input.timeOfDay,
    }).returning();
    
    // Notify
    await notifyMoodChange(ctx.user.id, entry[0]);
    
    return entry[0];
  }),
});
```

**After: Logic in Service**
```typescript
// services/mood/mood.service.ts
export class MoodService {
  async createEntry(userId: number, data: CreateMoodDto) {
    this.validateMoodScore(data.score);
    const entry = await this.repository.create({ userId, ...data });
    await this.notifyMoodChange(userId, entry);
    return entry;
  }
}

// routers/mood.router.ts
mood: router({
  create: protectedProcedure.mutation(async ({ ctx, input }) => {
    return await moodService.createEntry(ctx.user.id, input);
  }),
});
```

## Benefits

### 1. Testability
```typescript
// Easy to unit test
describe('MoodService', () => {
  it('should create mood entry', async () => {
    const mockRepo = { create: jest.fn() };
    const service = new MoodService(mockRepo);
    
    await service.createEntry(1, { score: 8, timeOfDay: 'morning' });
    
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

### 2. Reusability
```typescript
// Use service from multiple places
await moodService.createEntry(userId, data); // From router
await moodService.createEntry(userId, data); // From cron job
await moodService.createEntry(userId, data); // From webhook
```

### 3. Maintainability
- Business logic in one place
- Easy to find and modify
- Clear dependencies

### 4. Type Safety
- Compile-time checks
- IntelliSense support
- Refactoring safety

## Best Practices

### 1. Keep Services Focused
```typescript
// ✅ GOOD - Focused service
class MoodService {
  createEntry() {}
  updateEntry() {}
  deleteEntry() {}
  getHistory() {}
}

// ❌ BAD - Too many responsibilities
class MoodService {
  createEntry() {}
  sendEmail() {}
  generateReport() {}
  processPayment() {}
}
```

### 2. Use DTOs
```typescript
// ✅ GOOD - Clear input/output types
interface CreateMoodDto {
  score: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  note?: string;
}

async createEntry(userId: number, data: CreateMoodDto): Promise<MoodEntry> {
  // ...
}

// ❌ BAD - Unclear parameters
async createEntry(userId, score, time, note) {
  // ...
}
```

### 3. Handle Errors Consistently
```typescript
// ✅ GOOD - Consistent error handling
class MoodService {
  async createEntry(userId: number, data: CreateMoodDto) {
    if (data.score < 1 || data.score > 10) {
      throw new ValidationError('Score must be between 1 and 10');
    }
    
    try {
      return await this.repository.create({ userId, ...data });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to create mood entry');
      throw new ServiceError('Failed to create mood entry', error);
    }
  }
}
```

### 4. Use Transactions
```typescript
// ✅ GOOD - Atomic operations
async createProjectWithTasks(data: CreateProjectDto) {
  return await this.db.transaction(async (tx) => {
    const project = await tx.insert(projects).values(data).returning();
    await tx.insert(tasks).values(data.tasks.map(t => ({
      ...t,
      projectId: project[0].id,
    })));
    return project[0];
  });
}
```

## Current Status

### Migrated Services
- ✅ `agent-service.ts` - AI agent orchestration
- ✅ `business-plan-review.service.ts` - Business plan reviews
- ✅ `conversation-service.ts` - Conversations
- ✅ `digital-twin-service.ts` - Digital twin
- ✅ `expert-chat.service.ts` - Expert chat

### Pending Migration
- ⏳ Mood tracking
- ⏳ Project management
- ⏳ Document library
- ⏳ Analytics
- ⏳ Integrations

## Next Steps

1. Create service and repository for each domain
2. Extract business logic from routers
3. Add unit tests for services
4. Update routers to use services
5. Document service APIs

---

**Last Updated**: February 17, 2026  
**Maintained By**: CEPHO.AI Engineering Team
