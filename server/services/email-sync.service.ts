import { gmailService } from './gmail.service';
import { emailAnalysisService } from './email-analysis.service';
import { getDb } from '../db';
import { emailAccounts } from '../../drizzle/schema/email.schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { and } from 'drizzle-orm';

const log = logger.module('EmailSyncService');

export class EmailSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  /**
   * Start background email sync
   */
  start(intervalMinutes: number = 15) {
    if (this.syncInterval) {
      log.warn('Email sync already running');
      return;
    }
    
    log.info(`Starting email sync service (every ${intervalMinutes} minutes)`);
    
    // Run immediately on start
    this.syncAll();
    
    // Then run on interval
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, intervalMinutes * 60 * 1000);
  }
  
  /**
   * Stop background email sync
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      log.info('Email sync service stopped');
    }
  }
  
  /**
   * Sync all active email accounts
   */
  private async syncAll() {
    if (this.isRunning) {
      log.warn('Sync already in progress, skipping this run');
      return;
    }
    
    this.isRunning = true;
    
    try {
      const db = await getDb();
      if (!db) {
        log.error('Database not available');
        return;
      }
      
      // Get all active accounts with sync enabled
      const accounts = await db
        .select()
        .from(emailAccounts)
        .where(and, 
          eq(emailAccounts.isActive, true),
          eq(emailAccounts.syncEnabled, true)
        ));
      
      log.info(`Found ${accounts.length} accounts to sync`);
      
      let successCount = 0;
      let failCount = 0;
      let totalEmailsSynced = 0;
      
      for (const account of accounts) {
        try {
          log.info(`Syncing account: ${account.emailAddress}`);
          
          // Sync emails
          const emailCount = await gmailService.syncAccount(account);
          totalEmailsSynced += emailCount;
          
          // Analyze new emails
          if (emailCount > 0) {
            log.info(`Analyzing ${emailCount} new emails for ${account.emailAddress}`);
            await emailAnalysisService.analyzeUnanalyzedEmails(account.userId, 50);
          }
          
          successCount++;
          log.info(`Successfully synced ${emailCount} emails for ${account.emailAddress}`);
        } catch (error: any) {
          failCount++;
          log.error(`Failed to sync ${account.emailAddress}:`, error);
        }
      }
      
      log.info(`Sync completed: ${successCount} success, ${failCount} failed, ${totalEmailsSynced} total emails synced`);
    } catch (error: any) {
      log.error('Sync all failed:', error);
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Manually trigger sync for all accounts
   */
  async triggerSync() {
    log.info('Manual sync triggered');
    await this.syncAll();
  }
  
  /**
   * Get sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isEnabled: this.syncInterval !== null,
    };
  }
}

// Export singleton instance
export const emailSyncService = new EmailSyncService();

// Auto-start if in production
if (process.env.NODE_ENV === 'production') {
  emailSyncService.start(15); // Sync every 15 minutes
}
