/**
 * Integration Service Module
 * 
 * Handles external API integrations and webhooks.
 */

import { getDb } from '../../db';
import { integrations, toolIntegrations, InsertIntegration, Integration } from '../../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const log = logger.module('IntegrationService');

// Types
export interface CreateIntegrationDto {
  name: string;
  provider: string;
  config?: Record<string, any>;
  enabled?: boolean;
}

export interface IntegrationDto {
  id: number;
  userId: number;
  name: string;
  provider: string;
  config: Record<string, any> | null;
  enabled: boolean;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Repository
export class IntegrationRepository {
  async create(data: InsertIntegration): Promise<Integration> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const [integration] = await db.insert(integrations).values(data).returning();
    return integration;
  }

  async findById(id: number, userId: number): Promise<Integration | null> {
    const db = await getDb();
    if (!db) return null;
    const [integration] = await db.select().from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId))).limit(1);
    return integration || null;
  }

  async findByUserId(userId: number): Promise<Integration[]> {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(integrations)
      .where(eq(integrations.userId, userId)).orderBy(desc(integrations.updatedAt));
  }

  async update(id: number, userId: number, data: Partial<InsertIntegration>): Promise<Integration | null> {
    const db = await getDb();
    if (!db) return null;
    const [updated] = await db.update(integrations).set({ ...data, updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId))).returning();
    return updated || null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    const result = await db.delete(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId))).returning();
    return result.length > 0;
  }
}

// Service
export class IntegrationService {
  constructor(private repository: IntegrationRepository) {}

  async createIntegration(userId: number, data: CreateIntegrationDto): Promise<IntegrationDto> {
    const integration = await this.repository.create({
      userId,
      name: data.name,
      provider: data.provider,
      config: data.config ? JSON.stringify(data.config) : null,
      enabled: data.enabled !== undefined ? data.enabled : true,
      lastSyncedAt: null,
    });
    log.info({ userId, provider: data.provider }, 'Integration created');
    return this.toDto(integration);
  }

  async getIntegration(userId: number, integrationId: number): Promise<IntegrationDto | null> {
    const integration = await this.repository.findById(integrationId, userId);
    return integration ? this.toDto(integration) : null;
  }

  async getUserIntegrations(userId: number): Promise<IntegrationDto[]> {
    const integrations = await this.repository.findByUserId(userId);
    return integrations.map(i => this.toDto(i));
  }

  async enableIntegration(userId: number, integrationId: number): Promise<IntegrationDto | null> {
    const updated = await this.repository.update(integrationId, userId, { enabled: true });
    if (updated) log.info({ userId, integrationId }, 'Integration enabled');
    return updated ? this.toDto(updated) : null;
  }

  async disableIntegration(userId: number, integrationId: number): Promise<IntegrationDto | null> {
    const updated = await this.repository.update(integrationId, userId, { enabled: false });
    if (updated) log.info({ userId, integrationId }, 'Integration disabled');
    return updated ? this.toDto(updated) : null;
  }

  async deleteIntegration(userId: number, integrationId: number): Promise<boolean> {
    const deleted = await this.repository.delete(integrationId, userId);
    if (deleted) log.info({ userId, integrationId }, 'Integration deleted');
    return deleted;
  }

  private toDto(integration: any): IntegrationDto {
    return {
      id: integration.id,
      userId: integration.userId,
      name: integration.name,
      provider: integration.provider,
      config: integration.config ? (typeof integration.config === 'string' ? JSON.parse(integration.config) : integration.config) : null,
      enabled: integration.enabled,
      lastSyncedAt: integration.lastSyncedAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}

export const integrationService = new IntegrationService(new IntegrationRepository());
