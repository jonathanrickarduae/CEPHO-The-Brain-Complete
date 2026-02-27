/**
 * Service Registry
 *
 * Central registry for all application services.
 * Registers services with the DI container on application startup.
 */
import { container } from "./di-container";

/**
 * Register all services with the DI container
 */
export function registerServices(): void {
  // Services are registered lazily via registerService() / registerServiceInstance()
  // They are initialized on first use via getService()
}

/**
 * Get a service from the container
 *
 * Usage:
 *   const service = getService<MyService>('myService');
 */
export function getService<T>(name: string): T {
  return container.get<T>(name);
}

/**
 * Register a service factory
 *
 * Usage:
 *   registerService('myService', (c) => new MyService(c.get('dependency')));
 */
export function registerService<T>(
  name: string,
  factory: (c: { get: <S>(name: string) => S }) => T,
  singleton = true
): void {
  container.register(name, factory, singleton);
}

/**
 * Register a service instance directly
 *
 * Usage:
 *   registerServiceInstance('myService', myServiceInstance);
 */
export function registerServiceInstance<T>(name: string, instance: T): void {
  container.registerInstance(name, instance);
}
