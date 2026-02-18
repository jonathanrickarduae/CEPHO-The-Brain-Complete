# Service Integration Status

## Overview
This document tracks the integration of service layer into tRPC routers.

**Goal**: All routers should use service layer instead of direct database calls.

## Integration Status

### ✅ Fully Integrated (Using Services)

| Router | Service | Status |
|--------|---------|--------|
| `mood.router.ts` | `moodService` | ✅ Complete |
| `business-plan-review.router.ts` | `businessPlanService` | ✅ Complete |
| `document-library.router.ts` | `documentService` | ✅ Complete |
| `library.router.ts` | `documentService` | ✅ Complete |
| `genesis.router.ts` | `projectService` | ✅ Complete |
| `innovation.router.ts` | `projectService` | ✅ Complete |
| `qa.router.ts` | `analyticsService` | ✅ Complete |

### ⚠️ Partially Integrated (Mixed Usage)

| Router | Service | Issue |
|--------|---------|-------|
| `expert-chat.router.ts` | `expertService` | Imports service but still uses direct db calls |
| `expert-consultation.router.ts` | `expertService` | Imports service but still uses direct db calls |
| `expert-evolution.router.ts` | `expertService` | Imports service but still uses direct db calls |
| `expert-recommendation.router.ts` | `expertService` | Imports service but still uses direct db calls |

### ❌ Not Integrated (Direct DB Calls)

| Router | Missing Service | Priority |
|--------|----------------|----------|
| `calendar.router.ts` | Need to create `calendarService` | Medium |
| `chat.router.ts` | `communicationService` exists but not used | High |
| `collaborative-review.router.ts` | `reviewService` exists but not used | Medium |
| `evening-review.router.ts` | Uses `moodService` partially | Low |
| `subscription-tracker.router.ts` | `integrationService` exists but not used | Low |

## Action Items

### Priority 1: Fix Expert Routers (4 routers)
These routers import `expertService` but don't use it.

**Files to fix**:
- `server/routers/domains/expert-chat.router.ts`
- `server/routers/domains/expert-consultation.router.ts`
- `server/routers/domains/expert-evolution.router.ts`
- `server/routers/domains/expert-recommendation.router.ts`

**Changes needed**:
1. Replace direct db calls with expertService methods
2. Add error handling using new error-handler utility
3. Remove unused db imports
4. Add tests

### Priority 2: Integrate Existing Services (3 routers)
These routers have services available but aren't using them.

**Files to fix**:
- `server/routers/domains/chat.router.ts` → use `communicationService`
- `server/routers/domains/collaborative-review.router.ts` → use `reviewService`
- `server/routers/domains/subscription-tracker.router.ts` → use `integrationService`

### Priority 3: Create Missing Services (1 router)
- `server/routers/domains/calendar.router.ts` → create `calendarService`

## Benefits of Service Layer

✅ **Separation of Concerns**: Business logic separated from API layer  
✅ **Reusability**: Services can be used by multiple routers  
✅ **Testability**: Services can be tested independently  
✅ **Error Handling**: Centralized error handling and logging  
✅ **Maintainability**: Easier to understand and modify  

## Migration Pattern

### Before (Direct DB Calls)
```typescript
export const expertChatRouter = router({
  startSession: protectedProcedure
    .mutation(async ({ ctx, input }) => {
      const existing = await getActiveExpertChatSession(ctx.user.id, input.expertId);
      if (existing) return existing;
      
      return createExpertChatSession({
        userId: ctx.user.id,
        expertId: input.expertId,
        // ...
      });
    }),
});
```

### After (Using Service)
```typescript
import { expertService } from "../../services/expert";
import { handleTRPCError } from "../../utils/error-handler";

export const expertChatRouter = router({
  startSession: protectedProcedure
    .mutation(async ({ ctx, input }) => {
      try {
        return await expertService.createOrGetActiveSession(
          ctx.user.id,
          input.expertId
        );
      } catch (error) {
        handleTRPCError(error, 'ExpertChat');
      }
    }),
});
```

## Progress Tracking

- **Total Routers**: 16
- **Fully Integrated**: 7 (44%)
- **Partially Integrated**: 4 (25%)
- **Not Integrated**: 5 (31%)

**Target**: 100% integration by end of Phase 4
