/**
 * Dependency Injection Container
 *
 * Minimal DI container supporting factory registration and direct instance registration.
 */

type Factory<T> = (c: { get: <S>(name: string) => S }) => T;

interface Entry<T> {
  factory?: Factory<T>;
  instance?: T;
  singleton: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, Entry<any>>();

const resolver = {
  get<S>(name: string): S {
    return container.get<S>(name) as S;
  },
};

export const container = {
  /** Register a factory function (optionally as singleton) */
  register<T>(name: string, factory: Factory<T>, singleton = true): void {
    registry.set(name, { factory, singleton });
  },

  /** Register a pre-built instance directly */
  registerInstance<T>(name: string, instance: T): void {
    registry.set(name, { instance, singleton: true });
  },

  /** Retrieve a service by name, instantiating it if needed */
  get<T>(name: string): T {
    const entry = registry.get(name) as Entry<T> | undefined;
    if (!entry) {
      return undefined as unknown as T;
    }
    if (entry.instance !== undefined) {
      return entry.instance;
    }
    if (entry.factory) {
      const instance = entry.factory(resolver);
      if (entry.singleton) {
        entry.instance = instance;
      }
      return instance;
    }
    return undefined as unknown as T;
  },

  has(name: string): boolean {
    return registry.has(name);
  },
};
