import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Temporary bypass for testing
  if (process.env.VITE_AUTH_BYPASS === 'true') {
    return {
      req: opts.req,
      res: opts.res,
      user: {
        id: 1,
        email: 'jonathanrickarduae@gmail.com',
        name: 'Jonathan Rickard',
        password: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    };
  }

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
