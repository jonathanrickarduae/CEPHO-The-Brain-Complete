/**
 * Email Integration Service
 * 
 * Provides OAuth flows for Gmail and Outlook integration
 * Enables unified email management through CEPHO Chief of Staff
 */

import { getDb } from '../db';
import { integrations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// OAuth Configuration (to be provided via environment variables)
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

// Email provider types
export type EmailProvider = 'gmail' | 'outlook';

// OAuth state for CSRF protection
interface OAuthState {
  userId: number;
  provider: EmailProvider;
  timestamp: number;
  nonce: string;
}

// Token response from OAuth providers
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

// Email message structure
interface EmailMessage {
  id: string;
  threadId?: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body?: string;
  date: Date;
  isRead: boolean;
  labels?: string[];
}

/**
 * Generate OAuth authorization URL for email provider
 */
export function getOAuthUrl(provider: EmailProvider, userId: number): string {
  const state = encodeState({ userId, provider, timestamp: Date.now(), nonce: generateNonce() });
  
  if (provider === 'gmail') {
    const params = new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID || 'GMAIL_CLIENT_ID_REQUIRED',
      redirect_uri: `${process.env.APP_URL || ''}/api/email/callback/gmail`,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
  
  if (provider === 'outlook') {
    const params = new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || 'OUTLOOK_CLIENT_ID_REQUIRED',
      redirect_uri: `${process.env.APP_URL || ''}/api/email/callback/outlook`,
      response_type: 'code',
      scope: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.ReadWrite',
        'offline_access',
      ].join(' '),
      state,
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }
  
  throw new Error(`Unsupported email provider: ${provider}`);
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  provider: EmailProvider,
  code: string
): Promise<TokenResponse> {
  if (provider === 'gmail') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID || '',
        client_secret: process.env.GMAIL_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.APP_URL || ''}/api/email/callback/gmail`,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange Gmail authorization code');
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }
  
  if (provider === 'outlook') {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.APP_URL || ''}/api/email/callback/outlook`,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange Outlook authorization code');
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }
  
  throw new Error(`Unsupported email provider: ${provider}`);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  provider: EmailProvider,
  refreshToken: string
): Promise<TokenResponse> {
  if (provider === 'gmail') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID || '',
        client_secret: process.env.GMAIL_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh Gmail token');
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: refreshToken, // Gmail doesn't return new refresh token
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }
  
  if (provider === 'outlook') {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh Outlook token');
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }
  
  throw new Error(`Unsupported email provider: ${provider}`);
}

/**
 * Save email integration to database
 */
export async function saveEmailIntegration(
  userId: number,
  provider: EmailProvider,
  tokens: TokenResponse,
  email: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if integration already exists
  const existing = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)))
    .limit(1);
  
  const metadata = {
    email,
    scope: tokens.scope,
  };
  
  if (existing.length > 0) {
    // Update existing integration
    await db
      .update(integrations)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        status: 'active',
        metadata,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, existing[0].id));
    return existing[0].id;
  }
  
  // Create new integration
  const result = await db.insert(integrations).values({
    userId,
    provider,
    providerAccountId: email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    scopes: tokens.scope.split(' '),
    status: 'active',
    metadata,
  });
  
  return Number((result as any)[0]?.insertId || 0);
}

/**
 * Get email integration for user
 */
export async function getEmailIntegration(
  userId: number,
  provider: EmailProvider
): Promise<{ id: number; accessToken: string; refreshToken: string | null; status: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, provider)))
    .limit(1);
  
  if (result.length === 0) return null;
  
  return {
    id: result[0].id,
    accessToken: result[0].accessToken || '',
    refreshToken: result[0].refreshToken,
    status: result[0].status,
  };
}

/**
 * Fetch recent emails from provider
 */
export async function fetchRecentEmails(
  provider: EmailProvider,
  accessToken: string,
  limit: number = 20
): Promise<EmailMessage[]> {
  if (provider === 'gmail') {
    // List messages
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (!listResponse.ok) {
      throw new Error('Failed to fetch Gmail messages');
    }
    
    const listData = await listResponse.json();
    const messages: EmailMessage[] = [];
    
    // Fetch each message details
    for (const msg of listData.messages || []) {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        const headers = msgData.payload?.headers || [];
        
        messages.push({
          id: msgData.id,
          threadId: msgData.threadId,
          from: headers.find((h: any) => h.name === 'From')?.value || '',
          to: [headers.find((h: any) => h.name === 'To')?.value || ''],
          subject: headers.find((h: any) => h.name === 'Subject')?.value || '',
          snippet: msgData.snippet || '',
          date: new Date(parseInt(msgData.internalDate)),
          isRead: !msgData.labelIds?.includes('UNREAD'),
          labels: msgData.labelIds,
        });
      }
    }
    
    return messages;
  }
  
  if (provider === 'outlook') {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages?$top=${limit}&$orderby=receivedDateTime desc`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Outlook messages');
    }
    
    const data = await response.json();
    
    return (data.value || []).map((msg: any) => ({
      id: msg.id,
      from: msg.from?.emailAddress?.address || '',
      to: (msg.toRecipients || []).map((r: any) => r.emailAddress?.address),
      cc: (msg.ccRecipients || []).map((r: any) => r.emailAddress?.address),
      subject: msg.subject || '',
      snippet: msg.bodyPreview || '',
      date: new Date(msg.receivedDateTime),
      isRead: msg.isRead,
    }));
  }
  
  throw new Error(`Unsupported email provider: ${provider}`);
}

/**
 * Send email via provider
 */
export async function sendEmail(
  provider: EmailProvider,
  accessToken: string,
  to: string[],
  subject: string,
  body: string,
  isHtml: boolean = false
): Promise<{ success: boolean; messageId?: string }> {
  if (provider === 'gmail') {
    // Create RFC 2822 formatted email
    const email = [
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
      '',
      body,
    ].join('\r\n');
    
    const encodedEmail = Buffer.from(email).toString('base64url');
    
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedEmail }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to send Gmail message');
    }
    
    const data = await response.json();
    return { success: true, messageId: data.id };
  }
  
  if (provider === 'outlook') {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: {
              contentType: isHtml ? 'HTML' : 'Text',
              content: body,
            },
            toRecipients: to.map(email => ({
              emailAddress: { address: email },
            })),
          },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to send Outlook message');
    }
    
    return { success: true };
  }
  
  throw new Error(`Unsupported email provider: ${provider}`);
}

// Helper functions
function encodeState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString('base64url');
}

export function decodeState(encoded: string): OAuthState {
  return JSON.parse(Buffer.from(encoded, 'base64url').toString());
}

function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

export type { EmailMessage, TokenResponse, OAuthState };
