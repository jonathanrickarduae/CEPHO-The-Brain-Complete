import { getDb } from '../db';
import { integrationCredentials, integrationLogs } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Encryption key (should be from env var in production)
const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || 'cepho-integration-key-2026-secure';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Derive a proper 32-byte key from the encryption key
function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

// Secure encryption with IV
function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('[IntegrationManager] Encryption error:', error);
    throw error;
  }
}

function decrypt(encrypted: string): string {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('[IntegrationManager] Decryption error:', error);
    throw error;
  }
}

export interface IntegrationCredential {
  service: string;
  email?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  metadata?: any;
}

export class IntegrationManager {
  
  // Store credentials for a service
  async storeCredentials(userId: string, credential: IntegrationCredential) {
    const id = `${userId}-${credential.service}`;
    
    const data: any = {
      id,
      userId,
      service: credential.service,
      email: credential.email,
      updatedAt: new Date(),
    };

    // Encrypt sensitive data
    if (credential.password) data.password = encrypt(credential.password);
    if (credential.apiKey) data.apiKey = encrypt(credential.apiKey);
    if (credential.apiSecret) data.apiSecret = encrypt(credential.apiSecret);
    if (credential.accessToken) data.accessToken = encrypt(credential.accessToken);
    if (credential.refreshToken) data.refreshToken = encrypt(credential.refreshToken);
    if (credential.metadata) data.metadata = credential.metadata;

    // Upsert
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    await db.insert(integrationCredentials)
      .values(data)
      .onConflictDoUpdate({
        target: integrationCredentials.id,
        set: data,
      });

    return { success: true };
  }

  // Get credentials for a service
  async getCredentials(userId: string, service: string): Promise<IntegrationCredential | null> {
    const db = await getDb();
    if (!db) return null;
    const id = `${userId}-${service}`;
    const result = await db.select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const cred = result[0];
    
    // Decrypt sensitive data
    return {
      service: cred.service,
      email: cred.email || undefined,
      password: cred.password ? decrypt(cred.password) : undefined,
      apiKey: cred.apiKey ? decrypt(cred.apiKey) : undefined,
      apiSecret: cred.apiSecret ? decrypt(cred.apiSecret) : undefined,
      accessToken: cred.accessToken ? decrypt(cred.accessToken) : undefined,
      refreshToken: cred.refreshToken ? decrypt(cred.refreshToken) : undefined,
      metadata: cred.metadata as any,
    };
  }

  // Test connection to a service
  async testConnection(userId: string, service: string): Promise<{ success: boolean; error?: string }> {
    const cred = await this.getCredentials(userId, service);
    if (!cred) {
      return { success: false, error: 'No credentials found' };
    }

    try {
      // Service-specific connection tests
      switch (service) {
        case 'github':
          return await this.testGitHub(cred);
        case 'notion':
          return await this.testNotion(cred);
        case 'openai':
          return await this.testOpenAI(cred);
        case 'claude':
          return await this.testClaude(cred);
        // Add more services...
        default:
          // For services without API testing, assume connected if credentials exist
          return { success: true };
      }
    } catch (error: any) {
      await this.logConnection(userId, service, 'test', false, error.message);
      return { success: false, error: error.message };
    }
  }

  // GitHub connection test
  private async testGitHub(cred: IntegrationCredential): Promise<{ success: boolean; error?: string }> {
    if (!cred.apiKey) return { success: false, error: 'No API key' };
    
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${cred.apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `GitHub API error: ${response.status}` };
    }
  }

  // Notion connection test
  private async testNotion(cred: IntegrationCredential): Promise<{ success: boolean; error?: string }> {
    // Notion requires OAuth, so we'll just check if accessToken exists
    if (cred.accessToken) {
      return { success: true };
    }
    return { success: false, error: 'No access token' };
  }

  // OpenAI connection test
  private async testOpenAI(cred: IntegrationCredential): Promise<{ success: boolean; error?: string }> {
    if (!cred.apiKey) return { success: false, error: 'No API key' };
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${cred.apiKey}`,
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `OpenAI API error: ${response.status}` };
    }
  }

  // Claude connection test
  private async testClaude(cred: IntegrationCredential): Promise<{ success: boolean; error?: string }> {
    if (!cred.apiKey) return { success: false, error: 'No API key' };
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': cred.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    if (response.ok || response.status === 400) { // 400 is ok, means API key is valid
      return { success: true };
    } else {
      return { success: false, error: `Claude API error: ${response.status}` };
    }
  }

  // Update connection status
  async updateStatus(userId: string, service: string, status: 'connected' | 'disconnected' | 'error' | 'pending', error?: string) {
    const db = await getDb();
    if (!db) return;
    const id = `${userId}-${service}`;
    await db.update(integrationCredentials)
      .set({
        status,
        lastChecked: new Date(),
        lastError: error,
        updatedAt: new Date(),
      })
      .where(eq(integrationCredentials.id, id));
  }

  // Log connection activity
  async logConnection(userId: string, service: string, action: string, success: boolean, errorMessage?: string, metadata?: any) {
    const db = await getDb();
    if (!db) return;
    const id = `${userId}-${service}-${Date.now()}`;
    await db.insert(integrationLogs).values({
      id,
      userId,
      service,
      action,
      success,
      errorMessage,
      metadata,
    });
  }

  // Get all integrations for a user
  async getAllIntegrations(userId: string) {
    console.log('[IntegrationManager] getAllIntegrations called with userId:', userId);
    const db = await getDb();
    if (!db) {
      console.log('[IntegrationManager] Database not available');
      return [];
    }
    const results = await db.select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.userId, userId));
    console.log('[IntegrationManager] Query returned', results.length, 'results');

    return results.map(r => ({
      service: r.service,
      email: r.email,
      status: r.status,
      lastChecked: r.lastChecked,
      lastError: r.lastError,
      hasPassword: !!r.password,
      hasApiKey: !!r.apiKey,
    }));
  }
}

export const integrationManager = new IntegrationManager();
