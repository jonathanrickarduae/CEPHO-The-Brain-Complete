import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../db';
import { emailAccounts, emails, type EmailAccount, type NewEmail } from '../../drizzle/schema/email.schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';

const log = logger.module('GmailService');

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: any;
  internalDate?: string;
}

export class GmailService {
  private oauth2Client: OAuth2Client;
  
  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://cepho.ai/auth/google/callback';
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }
  
  /**
   * Generate OAuth URL for user to authorize Gmail access
   */
  getAuthUrl(userId: string, emailAddress?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    
    const state = Buffer.from(JSON.stringify({ userId, emailAddress })).toString('base64');
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'consent', // Force consent to get refresh token
    });
  }
  
  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
    scope: string;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get tokens from authorization code');
      }
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date || Date.now() + 3600 * 1000,
        scope: tokens.scope || '',
      };
    } catch (error: any) {
      log.error('Failed to exchange code for tokens:', error);
      throw new Error(`OAuth token exchange failed: ${error.message}`);
    }
  }
  
  /**
   * Get user's email address from access token
   */
  async getUserEmail(accessToken: string): Promise<string> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      
      if (!data.email) {
        throw new Error('Failed to get user email from Google');
      }
      
      return data.email;
    } catch (error: any) {
      log.error('Failed to get user email:', error);
      throw new Error(`Failed to get user email: ${error.message}`);
    }
  }
  
  /**
   * Save email account with OAuth tokens
   */
  async saveEmailAccount(
    userId: string,
    emailAddress: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiryDate: number;
      scope: string;
    },
    options?: {
      company?: string;
      isPrimary?: boolean;
    }
  ): Promise<EmailAccount> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    try {
      // Check if account already exists
      const existing = await db
        .select()
        .from(emailAccounts)
        .where(and(
          eq(emailAccounts.userId, userId),
          eq(emailAccounts.emailAddress, emailAddress)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing account
        const updated = await db
          .update(emailAccounts)
          .set({
            oauthAccessToken: tokens.accessToken,
            oauthRefreshToken: tokens.refreshToken,
            oauthTokenExpiresAt: new Date(tokens.expiryDate),
            oauthScope: tokens.scope,
            isActive: true,
            company: options?.company,
            isPrimary: options?.isPrimary,
            updatedAt: new Date(),
          })
          .where(eq(emailAccounts.id, existing[0].id))
          .returning();
        
        log.info(`Updated email account: ${emailAddress}`);
        return updated[0];
      } else {
        // Create new account
        const newAccount = await db
          .insert(emailAccounts)
          .values({
            userId,
            emailAddress,
            provider: 'gmail',
            oauthAccessToken: tokens.accessToken,
            oauthRefreshToken: tokens.refreshToken,
            oauthTokenExpiresAt: new Date(tokens.expiryDate),
            oauthScope: tokens.scope,
            isActive: true,
            syncEnabled: true,
            company: options?.company,
            isPrimary: options?.isPrimary || false,
          })
          .returning();
        
        log.info(`Created new email account: ${emailAddress}`);
        return newAccount[0];
      }
    } catch (error: any) {
      log.error('Failed to save email account:', error);
      throw new Error(`Failed to save email account: ${error.message}`);
    }
  }
  
  /**
   * Get all email accounts for a user
   */
  async getEmailAccounts(userId: string): Promise<EmailAccount[]> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    return await db
      .select()
      .from(emailAccounts)
      .where(and(
        eq(emailAccounts.userId, userId),
        eq(emailAccounts.isActive, true)
      ))
      .orderBy(desc(emailAccounts.isPrimary), desc(emailAccounts.createdAt));
  }
  
  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(account: EmailAccount): Promise<string> {
    if (!account.oauthRefreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      this.oauth2Client.setCredentials({
        refresh_token: account.oauthRefreshToken,
      });
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }
      
      // Update token in database
      const db = await getDb();
      if (db) {
        await db
          .update(emailAccounts)
          .set({
            oauthAccessToken: credentials.access_token,
            oauthTokenExpiresAt: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
            updatedAt: new Date(),
          })
          .where(eq(emailAccounts.id, account.id));
      }
      
      return credentials.access_token;
    } catch (error: any) {
      log.error(`Failed to refresh token for ${account.emailAddress}:`, error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
  
  /**
   * Get valid access token (refresh if expired)
   */
  private async getValidAccessToken(account: EmailAccount): Promise<string> {
    const now = new Date();
    const expiresAt = account.oauthTokenExpiresAt ? new Date(account.oauthTokenExpiresAt) : new Date(0);
    
    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      return await this.refreshAccessToken(account);
    }
    
    return account.oauthAccessToken || '';
  }
  
  /**
   * Fetch emails from Gmail API
   */
  async fetchEmails(
    account: EmailAccount,
    options?: {
      maxResults?: number;
      query?: string;
      pageToken?: string;
    }
  ): Promise<{ emails: NewEmail[]; nextPageToken?: string }> {
    try {
      const accessToken = await this.getValidAccessToken(account);
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // List messages
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults: options?.maxResults || 50,
        q: options?.query || 'in:inbox',
        pageToken: options?.pageToken,
      });
      
      if (!listResponse.data.messages || listResponse.data.messages.length === 0) {
        return { emails: [], nextPageToken: listResponse.data.nextPageToken };
      }
      
      // Fetch full message details
      const emailPromises = listResponse.data.messages.map(async (msg) => {
        if (!msg.id) return null;
        
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });
        
        return this.parseGmailMessage(msgResponse.data as GmailMessage, account);
      });
      
      const emailsData = await Promise.all(emailPromises);
      const validEmails = emailsData.filter((e): e is NewEmail => e !== null);
      
      log.info(`Fetched ${validEmails.length} emails for ${account.emailAddress}`);
      
      return {
        emails: validEmails,
        nextPageToken: listResponse.data.nextPageToken,
      };
    } catch (error: any) {
      log.error(`Failed to fetch emails for ${account.emailAddress}:`, error);
      
      // Update sync status
      const db = await getDb();
      if (db) {
        await db
          .update(emailAccounts)
          .set({
            lastSyncStatus: 'failed',
            lastSyncError: error.message,
            lastSyncAt: new Date(),
          })
          .where(eq(emailAccounts.id, account.id));
      }
      
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }
  
  /**
   * Parse Gmail message to our email format
   */
  private parseGmailMessage(message: GmailMessage, account: EmailAccount): NewEmail | null {
    try {
      const headers = message.payload?.headers || [];
      
      const getHeader = (name: string): string => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header?.value || '';
      };
      
      const getHeaderArray = (name: string): string[] => {
        const value = getHeader(name);
        return value ? value.split(',').map(e => e.trim()) : [];
      };
      
      const fromHeader = getHeader('from');
      const fromMatch = fromHeader.match(/<(.+?)>/);
      const fromEmail = fromMatch ? fromMatch[1] : fromHeader;
      const fromName = fromMatch ? fromHeader.replace(/<.+?>/, '').trim() : '';
      
      // Get email body
      let bodyText = '';
      let bodyHtml = '';
      
      if (message.payload?.body?.data) {
        bodyText = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (message.payload?.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }
      
      const isUnread = message.labelIds?.includes('UNREAD') || false;
      const isStarred = message.labelIds?.includes('STARRED') || false;
      
      return {
        userId: account.userId,
        accountId: account.id,
        messageId: message.id,
        threadId: message.threadId,
        fromEmail,
        fromName: fromName || undefined,
        toEmails: getHeaderArray('to'),
        ccEmails: getHeaderArray('cc'),
        bccEmails: getHeaderArray('bcc'),
        replyTo: getHeader('reply-to') || undefined,
        subject: getHeader('subject') || undefined,
        bodyText: bodyText || undefined,
        bodyHtml: bodyHtml || undefined,
        snippet: message.snippet || undefined,
        receivedAt: new Date(parseInt(message.internalDate || '0')),
        sentAt: new Date(getHeader('date') || message.internalDate || Date.now()),
        isRead: !isUnread,
        isStarred,
        labels: message.labelIds || [],
        hasAttachments: message.payload?.parts?.some((p: any) => p.filename) || false,
        attachmentCount: message.payload?.parts?.filter((p: any) => p.filename).length || 0,
        attachmentNames: message.payload?.parts?.filter((p: any) => p.filename).map((p: any) => p.filename) || [],
      };
    } catch (error: any) {
      log.error('Failed to parse Gmail message:', error);
      return null;
    }
  }
  
  /**
   * Save emails to database
   */
  async saveEmails(emailsData: NewEmail[]): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    let savedCount = 0;
    
    for (const emailData of emailsData) {
      try {
        // Check if email already exists
        const existing = await db
          .select()
          .from(emails)
          .where(and(
            eq(emails.accountId, emailData.accountId),
            eq(emails.messageId, emailData.messageId)
          ))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(emails).values(emailData);
          savedCount++;
        }
      } catch (error: any) {
        log.error('Failed to save email:', error);
      }
    }
    
    log.info(`Saved ${savedCount} new emails to database`);
    return savedCount;
  }
  
  /**
   * Sync emails for an account
   */
  async syncAccount(account: EmailAccount): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    try {
      // Update sync status
      await db
        .update(emailAccounts)
        .set({
          lastSyncStatus: 'in_progress',
          lastSyncAt: new Date(),
        })
        .where(eq(emailAccounts.id, account.id));
      
      // Fetch emails
      const { emails: emailsData } = await this.fetchEmails(account, {
        maxResults: 100,
        query: 'in:inbox OR in:sent',
      });
      
      // Save to database
      const savedCount = await this.saveEmails(emailsData);
      
      // Update sync status
      await db
        .update(emailAccounts)
        .set({
          lastSyncStatus: 'success',
          lastSyncAt: new Date(),
          lastSyncError: null,
        })
        .where(eq(emailAccounts.id, account.id));
      
      return savedCount;
    } catch (error: any) {
      log.error(`Sync failed for ${account.emailAddress}:`, error);
      
      await db
        .update(emailAccounts)
        .set({
          lastSyncStatus: 'failed',
          lastSyncError: error.message,
          lastSyncAt: new Date(),
        })
        .where(eq(emailAccounts.id, account.id));
      
      throw error;
    }
  }
  
  /**
   * Sync all accounts for a user
   */
  async syncAllAccounts(userId: string): Promise<{ total: number; synced: number; failed: number }> {
    const accounts = await this.getEmailAccounts(userId);
    
    let synced = 0;
    let failed = 0;
    
    for (const account of accounts) {
      if (!account.syncEnabled) continue;
      
      try {
        await this.syncAccount(account);
        synced++;
      } catch (error) {
        failed++;
      }
    }
    
    return { total: accounts.length, synced, failed };
  }
}

export const gmailService = new GmailService();
