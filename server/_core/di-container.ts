/**
 * Dependency Injection Container
 * 
 * Manages service lifecycle and dependencies to prevent runtime crashes
 * from missing or uninitialized services.
 */

type ServiceFactory<T> = (container: DIContainer) => T;
type ServiceInstance = any;

export class DIContainer {
  private services = new Map<string, ServiceInstance>();
  private factories = new Map<string, ServiceFactory<any>>();
  private singletons = new Set<string>();
  private initializing = new Set<string>();

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: ServiceFactory<T>, singleton = true): void {
    this.factories.set(name, factory);
    if (singleton) {
      this.singletons.add(name);
    }
  }

  /**
   * Register a service instance directly
   */
  registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, instance);
    this.singletons.add(name);
  }

  /**
   * Get a service instance
   */
  get<T>(name: string): T {
    // Return cached instance if it exists
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    // Check for circular dependencies
    if (this.initializing.has(name)) {
      throw new Error(
        `Circular dependency detected: ${name} is already being initialized`
      );
    }

    // Get factory
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(
        `Service '${name}' not found. Available services: ${Array.from(
          this.factories.keys()
        ).join(', ')}`
      );
    }

    // Create instance
    this.initializing.add(name);
    try {
      const instance = factory(this);

      // Cache if singleton
      if (this.singletons.has(name)) {
        this.services.set(name, instance);
      }

      return instance as T;
    } finally {
      this.initializing.delete(name);
    }
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.factories.has(name) || this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(
      new Set([...this.factories.keys(), ...this.services.keys()])
    );
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
    this.initializing.clear();
  }
}

// Global container instance
export const container = new DIContainer();
