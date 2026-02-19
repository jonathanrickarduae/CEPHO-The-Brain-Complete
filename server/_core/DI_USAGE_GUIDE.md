# Dependency Injection Usage Guide

## Overview

The CEPHO.AI backend now uses a Dependency Injection (DI) container to manage service lifecycle and dependencies. This prevents runtime crashes from missing or uninitialized services.

## Benefits

1. **Prevents Runtime Crashes**: Services are guaranteed to be initialized before use
2. **Manages Dependencies**: Automatically resolves service dependencies
3. **Detects Circular Dependencies**: Throws clear errors if circular dependencies exist
4. **Singleton Management**: Services are created once and reused
5. **Better Testing**: Easy to mock services for unit tests

## How to Use in Routers

### Before (Direct Import - Can Cause Crashes)

```typescript
import { someService } from '../services/some.service';

export const myRouter = router({
  myProcedure: publicProcedure
    .query(async () => {
      // If someService isn't initialized, this crashes
      return someService.doSomething();
    }),
});
```

### After (Using DI Container - Safe)

```typescript
import { getService } from '../_core/service-registry';
import type { SomeService } from '../services/some.service';

export const myRouter = router({
  myProcedure: publicProcedure
    .query(async () => {
      // Service is guaranteed to be initialized
      const someService = getService<SomeService>('someService');
      return someService.doSomething();
    }),
});
```

## Registering New Services

To add a new service to the DI container:

1. **Create your service class**:

```typescript
// server/services/my-new.service.ts
export class MyNewService {
  constructor(private dependency: SomeDependency) {}
  
  doSomething() {
    return this.dependency.process();
  }
}
```

2. **Register in service-registry.ts**:

```typescript
// server/_core/service-registry.ts
import { MyNewService } from '../services/my-new.service';

export function registerServices(): void {
  // ... existing registrations ...
  
  container.register('myNewService', (c) => {
    const dependency = c.get<SomeDependency>('someDependency');
    return new MyNewService(dependency);
  });
}
```

3. **Use in your router**:

```typescript
import { getService } from '../_core/service-registry';
import type { MyNewService } from '../services/my-new.service';

const service = getService<MyNewService>('myNewService');
```

## Error Messages

If you see these errors, here's what they mean:

### "Service 'xyz' not found"
- The service hasn't been registered in `service-registry.ts`
- Check the available services list in the error message
- Add the service to the registry

### "Circular dependency detected"
- Service A depends on Service B, which depends on Service A
- Refactor your services to remove the circular dependency
- Consider using an event bus or mediator pattern

## Testing with DI

```typescript
import { container } from '../_core/di-container';

describe('MyRouter', () => {
  beforeEach(() => {
    // Register mock services for testing
    container.registerInstance('myService', mockService);
  });
  
  afterEach(() => {
    // Clean up after tests
    container.clear();
  });
  
  it('should work with mocked service', () => {
    // Test your router with the mocked service
  });
});
```

## Best Practices

1. **Always use `getService()` in routers** instead of direct imports
2. **Register all services at startup** in `service-registry.ts`
3. **Use TypeScript types** for type safety: `getService<MyService>('myService')`
4. **Keep services focused** - each service should have a single responsibility
5. **Avoid circular dependencies** - refactor if you encounter them

## Migration Strategy

We're gradually migrating existing services to use the DI container. Priority order:

1. ✅ Core services (analytics, business plan, document, expert, mood, project)
2. 🔄 Domain-specific services (next phase)
3. 🔄 Utility services (final phase)

For now, both patterns (direct import and DI) will coexist. New code should use DI.
