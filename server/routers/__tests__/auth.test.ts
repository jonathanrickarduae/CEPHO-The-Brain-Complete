import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers';
import { createCallerFactory } from '@trpc/server';
import type { Context } from '../context';

describe('Auth Router', () => {
  const createCaller = createCallerFactory(appRouter);

  it('should return current user when authenticated', async () => {
    const mockContext: Context = {
      user: {
        id: 1,
        openId: 'test-open-id',
        name: 'Test User',
        email: 'test@example.com',
        loginMethod: 'simple',
        role: 'user',
        themePreference: 'light',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    const caller = createCaller(mockContext);
    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.email).toBe('test@example.com');
  });

  it('should throw error when not authenticated', async () => {
    const mockContext: Context = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    const caller = createCaller(mockContext);

    await expect(caller.auth.me()).rejects.toThrow();
  });
});
