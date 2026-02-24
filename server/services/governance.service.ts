import { db } from '../db';
import { governanceSettings, approvedIntegrations, integrationUsageLogs } from '../../drizzle/governance-schema';
import { eq, and } from 'drizzle-orm';

/**
 * Governance Service
 * Enforces API key restrictions based on governance mode
 */

export interface GovernanceMode {
  mode: 'everything' | 'governed';
  userId: string;
}

export interface IntegrationCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Get user's current governance mode
 */
export async function getGovernanceMode(userId: string): Promise<GovernanceMode> {
  const settings = await db
    .select()
    .from(governanceSettings)
    .where(eq(governanceSettings.userId, userId))
    .limit(1);

  if (settings.length === 0) {
    // Default to 'everything' mode
    return { mode: 'everything', userId };
  }

  return {
    mode: settings[0].mode as 'everything' | 'governed',
    userId,
  };
}

/**
 * Set user's governance mode
 */
export async function setGovernanceMode(userId: string, mode: 'everything' | 'governed'): Promise<void> {
  const existing = await db
    .select()
    .from(governanceSettings)
    .where(eq(governanceSettings.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(governanceSettings).values({
      userId,
      mode,
    });
  } else {
    await db
      .update(governanceSettings)
      .set({ mode, updatedAt: new Date() })
      .where(eq(governanceSettings.userId, userId));
  }
}

/**
 * Check if a service/API is allowed to be used
 */
export async function checkIntegrationAllowed(
  userId: string,
  serviceName: string
): Promise<IntegrationCheck> {
  const mode = await getGovernanceMode(userId);

  // In 'everything' mode, all services are allowed
  if (mode.mode === 'everything') {
    return { allowed: true };
  }

  // In 'governed' mode, only approved services are allowed
  const approved = await db
    .select()
    .from(approvedIntegrations)
    .where(
      and(
        eq(approvedIntegrations.userId, userId),
        eq(approvedIntegrations.serviceName, serviceName),
        eq(approvedIntegrations.isApproved, true)
      )
    )
    .limit(1);

  if (approved.length === 0) {
    return {
      allowed: false,
      reason: `${serviceName} is not approved for use in Governed Mode. Please contact your Chief of Staff to approve this integration.`,
    };
  }

  return { allowed: true };
}

/**
 * Log integration usage for audit purposes
 */
export async function logIntegrationUsage(
  userId: string,
  integrationId: string,
  serviceName: string,
  action: string,
  success: boolean,
  errorMessage?: string,
  metadata?: any
): Promise<void> {
  await db.insert(integrationUsageLogs).values({
    userId,
    integrationId,
    serviceName,
    action,
    success,
    errorMessage,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Get all approved integrations for a user
 */
export async function getApprovedIntegrations(userId: string) {
  return await db
    .select()
    .from(approvedIntegrations)
    .where(
      and(
        eq(approvedIntegrations.userId, userId),
        eq(approvedIntegrations.isApproved, true)
      )
    );
}

/**
 * Add a new integration (pending approval)
 */
export async function addIntegration(
  userId: string,
  serviceName: string,
  serviceType: string,
  apiKey: string,
  description: string
) {
  return await db.insert(approvedIntegrations).values({
    userId,
    serviceName,
    serviceType,
    apiKey, // TODO: Encrypt this before storing
    description,
    isApproved: false,
  });
}

/**
 * Approve an integration
 */
export async function approveIntegration(
  integrationId: string,
  approvedBy: string
) {
  return await db
    .update(approvedIntegrations)
    .set({
      isApproved: true,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(approvedIntegrations.id, integrationId));
}

/**
 * Revoke integration approval
 */
export async function revokeIntegration(integrationId: string) {
  return await db
    .update(approvedIntegrations)
    .set({
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(approvedIntegrations.id, integrationId));
}

/**
 * Delete an integration
 */
export async function deleteIntegration(integrationId: string) {
  return await db
    .delete(approvedIntegrations)
    .where(eq(approvedIntegrations.id, integrationId));
}
