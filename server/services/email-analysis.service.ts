import { getLLMService } from './llm-service';
import { getDb } from '../db';
import { emails, type Email } from '../../drizzle/schema/email.schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logger } from '../utils/logger';

const log = logger.module('EmailAnalysisService');
const llmService = getLLMService();

interface EmailAnalysis {
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: string[];
  summary: string;
}

export class EmailAnalysisService {
  
  /**
   * Analyze a single email using AI
   */
  async analyzeEmail(email: Email): Promise<EmailAnalysis> {
    try {
      const prompt = `Analyze this email and provide structured insights:

From: ${email.fromEmail}${email.fromName ? ` (${email.fromName})` : ''}
To: ${email.toEmails.join(', ')}
Subject: ${email.subject || '(no subject)'}

Body:
${email.bodyText || email.snippet || '(no content)'}

Please analyze and provide:
1. Priority (urgent/high/normal/low) - Consider deadlines, importance, sender
2. Category (project/personal/finance/marketing/support/legal/hr/other)
3. Sentiment (positive/neutral/negative)
4. Action Items - Extract any tasks or actions required (list each separately)
5. Summary - One sentence summary of the email

Respond in JSON format:
{
  "priority": "...",
  "category": "...",
  "sentiment": "...",
  "actionItems": ["...", "..."],
  "summary": "..."
}`;

      const response = await llmService.chat({
        messages: [{ role: 'user', content: prompt }],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.3,
      });

      // Parse JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const analysis: EmailAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize
      if (!['urgent', 'high', 'normal', 'low'].includes(analysis.priority)) {
        analysis.priority = 'normal';
      }
      
      if (!['positive', 'neutral', 'negative'].includes(analysis.sentiment)) {
        analysis.sentiment = 'neutral';
      }
      
      if (!Array.isArray(analysis.actionItems)) {
        analysis.actionItems = [];
      }

      return analysis;
    } catch (error: any) {
      log.error('Failed to analyze email:', error);
      
      // Return default analysis on error
      return {
        priority: 'normal',
        category: 'other',
        sentiment: 'neutral',
        actionItems: [],
        summary: email.snippet || email.subject || 'Email content',
      };
    }
  }

  /**
   * Save analysis results to database
   */
  async saveAnalysis(emailId: string, analysis: EmailAnalysis): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      await db
        .update(emails)
        .set({
          priority: analysis.priority,
          category: analysis.category,
          sentiment: analysis.sentiment,
          actionItems: analysis.actionItems,
          aiSummary: analysis.summary,
          aiAnalyzedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emails.id, emailId));

      log.info(`Saved analysis for email ${emailId}`);
    } catch (error: any) {
      log.error('Failed to save analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze and save in one operation
   */
  async analyzeAndSave(email: Email): Promise<EmailAnalysis> {
    const analysis = await this.analyzeEmail(email);
    await this.saveAnalysis(email.id, analysis);
    return analysis;
  }

  /**
   * Analyze all unanalyzed emails for a user
   */
  async analyzeUnanalyzedEmails(userId: string, limit: number = 50): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      // Get unanalyzed emails
      const unanalyzedEmails = await db
        .select()
        .from(emails)
        .where(and(
          eq(emails.userId, userId),
          isNull(emails.aiAnalyzedAt)
        ))
        .limit(limit);

      log.info(`Found ${unanalyzedEmails.length} unanalyzed emails for user ${userId}`);

      let analyzed = 0;

      for (const email of unanalyzedEmails) {
        try {
          await this.analyzeAndSave(email);
          analyzed++;
        } catch (error) {
          log.error(`Failed to analyze email ${email.id}:`, error);
        }
      }

      log.info(`Analyzed ${analyzed} emails for user ${userId}`);
      return analyzed;
    } catch (error: any) {
      log.error('Failed to analyze unanalyzed emails:', error);
      throw error;
    }
  }

  /**
   * Extract action items from multiple emails
   */
  async extractActionItems(userId: string, emailIds?: string[]): Promise<Array<{
    emailId: string;
    subject: string;
    fromEmail: string;
    actionItems: string[];
  }>> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      let query = db
        .select()
        .from(emails)
        .where(eq(emails.userId, userId));

      if (emailIds && emailIds.length > 0) {
        query = query.where(and(
          eq(emails.userId, userId),
          // @ts-ignore - inArray not typed correctly
          emails.id.in(emailIds)
        ));
      }

      const emailsWithActions = await query;

      return emailsWithActions
        .filter(e => e.actionItems && e.actionItems.length > 0)
        .map(e => ({
          emailId: e.id,
          subject: e.subject || '(no subject)',
          fromEmail: e.fromEmail,
          actionItems: e.actionItems || [],
        }));
    } catch (error: any) {
      log.error('Failed to extract action items:', error);
      throw error;
    }
  }

  /**
   * Get email statistics for a user
   */
  async getEmailStats(userId: string): Promise<{
    total: number;
    unread: number;
    urgent: number;
    high: number;
    withActionItems: number;
    byCategory: Record<string, number>;
    bySentiment: Record<string, number>;
  }> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      const userEmails = await db
        .select()
        .from(emails)
        .where(eq(emails.userId, userId));

      const stats = {
        total: userEmails.length,
        unread: userEmails.filter(e => !e.isRead).length,
        urgent: userEmails.filter(e => e.priority === 'urgent').length,
        high: userEmails.filter(e => e.priority === 'high').length,
        withActionItems: userEmails.filter(e => e.actionItems && e.actionItems.length > 0).length,
        byCategory: {} as Record<string, number>,
        bySentiment: {} as Record<string, number>,
      };

      // Count by category
      for (const email of userEmails) {
        if (email.category) {
          stats.byCategory[email.category] = (stats.byCategory[email.category] || 0) + 1;
        }
      }

      // Count by sentiment
      for (const email of userEmails) {
        if (email.sentiment) {
          stats.bySentiment[email.sentiment] = (stats.bySentiment[email.sentiment] || 0) + 1;
        }
      }

      return stats;
    } catch (error: any) {
      log.error('Failed to get email stats:', error);
      throw error;
    }
  }

  /**
   * Get top senders for a user
   */
  async getTopSenders(userId: string, limit: number = 10): Promise<Array<{
    email: string;
    name?: string;
    count: number;
  }>> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      const userEmails = await db
        .select()
        .from(emails)
        .where(eq(emails.userId, userId));

      const senderCounts = new Map<string, { name?: string; count: number }>();

      for (const email of userEmails) {
        const existing = senderCounts.get(email.fromEmail) || { count: 0 };
        senderCounts.set(email.fromEmail, {
          name: email.fromName || existing.name,
          count: existing.count + 1,
        });
      }

      return Array.from(senderCounts.entries())
        .map(([email, data]) => ({ email, name: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error: any) {
      log.error('Failed to get top senders:', error);
      throw error;
    }
  }
}

export const emailAnalysisService = new EmailAnalysisService();
