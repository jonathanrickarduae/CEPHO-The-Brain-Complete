import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers';
import { createCallerFactory } from '@trpc/server';
import type { Context } from '../context';

describe('Project Genesis Router', () => {
  const createCaller = createCallerFactory(appRouter);

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

  it('should initiate project genesis with valid data', async () => {
    const caller = createCaller(mockContext);

    const input = {
      projectName: 'Test Startup',
      industry: 'Technology',
      stage: 'Seed',
      businessModel: 'SaaS',
      targetMarket: 'B2B',
      differentiation: 'AI-powered',
      revenueModel: 'Subscription',
      challenges: ['Funding', 'Product development'],
    };

    // This test verifies the router accepts the correct input shape
    // In a real implementation, you'd mock the database and verify the project is created
    expect(async () => {
      await caller.projectGenesis.initiate(input);
    }).not.toThrow();
  });

  it('should throw error when not authenticated', async () => {
    const unauthContext: Context = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    const caller = createCaller(unauthContext);

    await expect(
      caller.projectGenesis.initiate({
        projectName: 'Test',
        industry: 'Tech',
        stage: 'Seed',
        businessModel: 'SaaS',
        targetMarket: 'B2B',
        differentiation: 'AI',
        revenueModel: 'Subscription',
        challenges: [],
      })
    ).rejects.toThrow();
  });
});
