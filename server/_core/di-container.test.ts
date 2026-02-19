import { describe, it, expect, beforeEach } from 'vitest';
import { DIContainer } from './di-container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  it('should register and resolve a service', () => {
    class TestService {
      getName() {
        return 'test-service';
      }
    }

    container.register('testService', () => new TestService());
    const service = container.resolve<TestService>('testService');

    expect(service).toBeInstanceOf(TestService);
    expect(service.getName()).toBe('test-service');
  });

  it('should return the same instance for singleton services', () => {
    class SingletonService {
      id = Math.random();
    }

    container.register('singleton', () => new SingletonService());
    const instance1 = container.resolve<SingletonService>('singleton');
    const instance2 = container.resolve<SingletonService>('singleton');

    expect(instance1.id).toBe(instance2.id);
  });

  it('should throw error when resolving unregistered service', () => {
    expect(() => container.resolve('nonexistent')).toThrow('Service nonexistent not found');
  });

  it('should detect circular dependencies', () => {
    container.register('serviceA', () => {
      container.resolve('serviceB');
      return {};
    });

    container.register('serviceB', () => {
      container.resolve('serviceA');
      return {};
    });

    expect(() => container.resolve('serviceA')).toThrow('Circular dependency detected');
  });

  it('should handle dependencies between services', () => {
    class DatabaseService {
      connect() {
        return 'connected';
      }
    }

    class UserService {
      constructor(private db: DatabaseService) {}
      
      getUsers() {
        return `users from ${this.db.connect()}`;
      }
    }

    container.register('database', () => new DatabaseService());
    container.register('userService', () => {
      const db = container.resolve<DatabaseService>('database');
      return new UserService(db);
    });

    const userService = container.resolve<UserService>('userService');
    expect(userService.getUsers()).toBe('users from connected');
  });
});
