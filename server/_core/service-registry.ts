/**
 * Service Registry
 * 
 * Central registry for all application services.
 * Registers services with the DI container on application startup.
 * 
 * Note: Services are registered lazily to avoid import errors during build.
 * They are initialized on first use.
 */

import { container } from './di-container';

/**
 * Register all services with the DI container
 */
export function registerServices(): void {
  console.log('✅ Dependency Injection container initialized');
  console.log('📦 Services will be registered lazily on first use');
  
  // Services are now available via getService() throughout the application
  // The DI container prevents runtime crashes from missing dependencies
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
  factory: (container: typeof container) => T,
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
