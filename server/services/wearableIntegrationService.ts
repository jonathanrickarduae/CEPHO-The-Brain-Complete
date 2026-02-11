/**
 * Wearable Device Integration Service
 * 
 * Provides integration architecture for health/fitness wearables:
 * - Whoop
 * - Oura Ring
 * - Apple Health
 * - Fitbit
 * 
 * Biometric data is incorporated into Morning Signal insights
 */

import { getDb } from '../db';
import { integrations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Supported wearable providers
export type WearableProvider = 'whoop' | 'oura' | 'apple_health' | 'fitbit';

// Biometric data structure
export interface BiometricData {
  provider: WearableProvider;
  timestamp: Date;
  metrics: {
    // Sleep metrics
    sleepScore?: number;
    sleepDuration?: number; // minutes
    sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
    remSleep?: number; // minutes
    deepSleep?: number; // minutes
    
    // Recovery metrics
    recoveryScore?: number;
    hrvScore?: number; // Heart Rate Variability
    restingHeartRate?: number;
    
    // Activity metrics
    activityScore?: number;
    steps?: number;
    caloriesBurned?: number;
    activeMinutes?: number;
    
    // Readiness metrics
    readinessScore?: number;
    bodyTemperature?: number;
    respiratoryRate?: number;
    
    // Stress metrics
    stressLevel?: number;
    strainScore?: number;
  };
}

// OAuth configuration for each provider
const providerConfigs: Record<WearableProvider, {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  apiBaseUrl: string;
}> = {
  whoop: {
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    scopes: ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout', 'read:profile'],
    apiBaseUrl: 'https://api.prod.whoop.com/developer/v1',
  },
  oura: {
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    scopes: ['daily', 'heartrate', 'personal', 'session', 'workout'],
    apiBaseUrl: 'https://api.ouraring.com/v2',
  },
  apple_health: {
    // Apple Health uses HealthKit on device - requires mobile app
    authUrl: 'healthkit://authorize',
    tokenUrl: 'healthkit://token',
    scopes: ['sleep', 'activity', 'heart', 'respiratory'],
    apiBaseUrl: 'healthkit://data',
  },
  fitbit: {
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    scopes: ['activity', 'heartrate', 'sleep', 'profile'],
    apiBaseUrl: 'https://api.fitbit.com/1/user/-',
  },
};

/**
 * Generate OAuth authorization URL for wearable provider
 */
export function getWearableOAuthUrl(provider: WearableProvider, userId: number): string {
  const config = providerConfigs[provider];
  const state = Buffer.from(JSON.stringify({ userId, provider, timestamp: Date.now() })).toString('base64');
  
  if (provider === 'apple_health') {
    // Apple Health requires native app integration
    return `cepho://connect-health?provider=apple_health&userId=${userId}`;
  }
  
  const params = new URLSearchParams({
    client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || `${provider.toUpperCase()}_CLIENT_ID_REQUIRED`,
    redirect_uri: `${process.env.APP_URL || ''}/api/wearables/callback/${provider}`,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  });
  
  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens (placeholder)
 */
export async function exchangeWearableCode(
  provider: WearableProvider,
  code: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const config = providerConfigs[provider];
  
  // Placeholder - actual implementation requires provider-specific OAuth flow
  console.log(`[Wearable] Exchanging code for ${provider} tokens`);
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
      client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.APP_URL || ''}/api/wearables/callback/${provider}`,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to exchange ${provider} authorization code`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Save wearable integration to database
 */
export async function saveWearableIntegration(
  userId: number,
  provider: WearableProvider,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const existing = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)))
    .limit(1);
  
  if (existing.length > 0) {
    await db
      .update(integrations)
      .set({
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, existing[0].id));
    return existing[0].id;
  }
  
  const result = await db.insert(integrations).values({
    userId,
    provider,
    accessToken,
    refreshToken,
    tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    status: 'active',
  });
  
  return Number((result as any)[0]?.insertId || 0);
}

/**
 * Fetch biometric data from Whoop (placeholder)
 */
async function fetchWhoopData(accessToken: string): Promise<BiometricData['metrics']> {
  // Placeholder - actual implementation calls Whoop API
  console.log('[Wearable] Fetching Whoop data');
  
  // Example API calls:
  // GET /developer/v1/recovery - Recovery scores
  // GET /developer/v1/cycle - Strain/activity data
  // GET /developer/v1/sleep - Sleep data
  
  return {
    recoveryScore: undefined,
    strainScore: undefined,
    sleepScore: undefined,
    hrvScore: undefined,
  };
}

/**
 * Fetch biometric data from Oura Ring (placeholder)
 */
async function fetchOuraData(accessToken: string): Promise<BiometricData['metrics']> {
  // Placeholder - actual implementation calls Oura API
  console.log('[Wearable] Fetching Oura data');
  
  // Example API calls:
  // GET /v2/usercollection/daily_readiness - Readiness scores
  // GET /v2/usercollection/daily_sleep - Sleep data
  // GET /v2/usercollection/daily_activity - Activity data
  
  return {
    readinessScore: undefined,
    sleepScore: undefined,
    sleepDuration: undefined,
    activityScore: undefined,
  };
}

/**
 * Fetch biometric data from Fitbit (placeholder)
 */
async function fetchFitbitData(accessToken: string): Promise<BiometricData['metrics']> {
  // Placeholder - actual implementation calls Fitbit API
  console.log('[Wearable] Fetching Fitbit data');
  
  // Example API calls:
  // GET /1/user/-/sleep/date/{date}.json - Sleep data
  // GET /1/user/-/activities/date/{date}.json - Activity data
  // GET /1/user/-/activities/heart/date/{date}/1d.json - Heart rate
  
  return {
    sleepDuration: undefined,
    steps: undefined,
    caloriesBurned: undefined,
    restingHeartRate: undefined,
  };
}

/**
 * Fetch latest biometric data for user
 */
export async function fetchBiometricData(
  userId: number,
  provider: WearableProvider
): Promise<BiometricData | null> {
  const db = await getDb();
  if (!db) return null;
  
  const integration = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)))
    .limit(1);
  
  if (integration.length === 0 || integration[0].status !== 'active') {
    return null;
  }
  
  const accessToken = integration[0].accessToken;
  if (!accessToken) return null;
  
  let metrics: BiometricData['metrics'] = {};
  
  switch (provider) {
    case 'whoop':
      metrics = await fetchWhoopData(accessToken);
      break;
    case 'oura':
      metrics = await fetchOuraData(accessToken);
      break;
    case 'fitbit':
      metrics = await fetchFitbitData(accessToken);
      break;
    case 'apple_health':
      // Apple Health data comes from mobile app sync
      metrics = {};
      break;
  }
  
  return {
    provider,
    timestamp: new Date(),
    metrics,
  };
}

/**
 * Get all connected wearables for user
 */
export async function getConnectedWearables(userId: number): Promise<WearableProvider[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ provider: integrations.provider })
    .from(integrations)
    .where(and(
      eq(integrations.userId, userId),
      eq(integrations.status, 'active')
    ));
  
  const wearableProviders: WearableProvider[] = ['whoop', 'oura', 'apple_health', 'fitbit'];
  return result
    .map(r => r.provider as WearableProvider)
    .filter(p => wearableProviders.includes(p));
}

/**
 * Generate Morning Signal health insights from biometric data
 */
export function generateHealthInsights(data: BiometricData): string[] {
  const insights: string[] = [];
  const { metrics } = data;
  
  // Sleep insights
  if (metrics.sleepScore !== undefined) {
    if (metrics.sleepScore >= 85) {
      insights.push(`Excellent sleep quality (${metrics.sleepScore}%) - You're well-rested for peak performance today.`);
    } else if (metrics.sleepScore >= 70) {
      insights.push(`Good sleep quality (${metrics.sleepScore}%) - Consider a short break mid-afternoon if energy dips.`);
    } else {
      insights.push(`Below-average sleep (${metrics.sleepScore}%) - Prioritize high-focus tasks in the morning while energy is highest.`);
    }
  }
  
  // Recovery insights
  if (metrics.recoveryScore !== undefined) {
    if (metrics.recoveryScore >= 67) {
      insights.push(`High recovery (${metrics.recoveryScore}%) - Great day for challenging work and important meetings.`);
    } else if (metrics.recoveryScore >= 34) {
      insights.push(`Moderate recovery (${metrics.recoveryScore}%) - Balance demanding tasks with lighter work.`);
    } else {
      insights.push(`Low recovery (${metrics.recoveryScore}%) - Consider rescheduling non-essential meetings. Focus on recovery.`);
    }
  }
  
  // HRV insights
  if (metrics.hrvScore !== undefined) {
    if (metrics.hrvScore > 50) {
      insights.push(`Strong HRV indicates good stress resilience today.`);
    } else if (metrics.hrvScore < 30) {
      insights.push(`Lower HRV suggests elevated stress - schedule breaks between intense work sessions.`);
    }
  }
  
  // Readiness insights (Oura)
  if (metrics.readinessScore !== undefined) {
    if (metrics.readinessScore >= 85) {
      insights.push(`Optimal readiness (${metrics.readinessScore}) - Your body is primed for peak performance.`);
    } else if (metrics.readinessScore < 70) {
      insights.push(`Lower readiness score - Consider lighter workload or earlier end to the day.`);
    }
  }
  
  return insights;
}

/**
 * Aggregate biometric data from all connected wearables
 */
export async function aggregateBiometricData(userId: number): Promise<{
  insights: string[];
  overallReadiness: number;
  recommendations: string[];
}> {
  const connectedWearables = await getConnectedWearables(userId);
  const allInsights: string[] = [];
  let totalReadiness = 0;
  let readinessCount = 0;
  
  for (const provider of connectedWearables) {
    const data = await fetchBiometricData(userId, provider);
    if (data) {
      const insights = generateHealthInsights(data);
      allInsights.push(...insights);
      
      // Calculate overall readiness
      const { metrics } = data;
      if (metrics.recoveryScore) {
        totalReadiness += metrics.recoveryScore;
        readinessCount++;
      }
      if (metrics.readinessScore) {
        totalReadiness += metrics.readinessScore;
        readinessCount++;
      }
      if (metrics.sleepScore) {
        totalReadiness += metrics.sleepScore;
        readinessCount++;
      }
    }
  }
  
  const overallReadiness = readinessCount > 0 ? Math.round(totalReadiness / readinessCount) : 75;
  
  // Generate recommendations based on overall readiness
  const recommendations: string[] = [];
  if (overallReadiness >= 80) {
    recommendations.push('Schedule your most challenging meetings and decisions today');
    recommendations.push('Great day for creative brainstorming sessions');
  } else if (overallReadiness >= 60) {
    recommendations.push('Maintain steady pace - avoid back-to-back intense meetings');
    recommendations.push('Take a 10-minute walk after lunch to boost afternoon energy');
  } else {
    recommendations.push('Consider rescheduling non-critical meetings');
    recommendations.push('Focus on routine tasks that don\'t require peak cognitive load');
    recommendations.push('Prioritize an earlier end to the workday if possible');
  }
  
  return {
    insights: allInsights,
    overallReadiness,
    recommendations,
  };
}
