/**
 * 24-Hour Automation Scheduler
 * Manages all scheduled tasks for CEPHO platform
 * 
 * Key Workflows:
 * - 6:00 AM: Victoria generates daily signal
 * - 6:30 AM: Chief of Staff validates signal
 * - 7:00 AM: Multi-channel distribution (email, PDF, video, WhatsApp)
 * - Hourly: Market monitoring and updates
 * - 5:00 PM: Evening briefing
 * - 8:00 PM: Daily digest
 */

import cron from 'node-cron';
import { getDb } from '../db';
import { generateSignal } from './trading/trading-signal-service';
import { generateBriefing } from './trading/victoria-briefing-service';
import { executeWorkflow } from './trading/trading-workflow-service';
import { sendEmail, sendWhatsApp } from './notification-service';
import { generatePDF } from './document-generation-service';

interface ScheduledTask {
  id: string;
  name: string;
  schedule: string; // Cron expression
  handler: () => Promise<void>;
  enabled: boolean;
}

class AutomationScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private taskDefinitions: ScheduledTask[] = [];

  constructor() {
    this.initializeTasks();
  }

  /**
   * Initialize all scheduled tasks
   */
  private initializeTasks() {
    this.taskDefinitions = [
      // 6:00 AM - Victoria generates daily signal
      {
        id: 'daily_signal_generation',
        name: 'Daily Signal Generation',
        schedule: '0 6 * * *', // 6:00 AM every day
        handler: this.generateDailySignal.bind(this),
        enabled: true,
      },
      
      // 6:30 AM - Chief of Staff validates signal
      {
        id: 'signal_validation',
        name: 'Signal Validation',
        schedule: '30 6 * * *', // 6:30 AM every day
        handler: this.validateSignal.bind(this),
        enabled: true,
      },
      
      // 7:00 AM - Multi-channel distribution
      {
        id: 'morning_distribution',
        name: 'Morning Distribution',
        schedule: '0 7 * * *', // 7:00 AM every day
        handler: this.distributeSignal.bind(this),
        enabled: true,
      },
      
      // Hourly market monitoring (9 AM - 5 PM)
      {
        id: 'hourly_market_check',
        name: 'Hourly Market Check',
        schedule: '0 9-17 * * *', // Every hour from 9 AM to 5 PM
        handler: this.checkMarket.bind(this),
        enabled: true,
      },
      
      // 12:00 PM - Midday performance check
      {
        id: 'midday_check',
        name: 'Midday Performance Check',
        schedule: '0 12 * * *', // 12:00 PM every day
        handler: this.middayCheck.bind(this),
        enabled: true,
      },
      
      // 5:00 PM - Evening briefing
      {
        id: 'evening_briefing',
        name: 'Evening Briefing',
        schedule: '0 17 * * *', // 5:00 PM every day
        handler: this.eveningBriefing.bind(this),
        enabled: true,
      },
      
      // 8:00 PM - Daily digest
      {
        id: 'daily_digest',
        name: 'Daily Digest',
        schedule: '0 20 * * *', // 8:00 PM every day
        handler: this.dailyDigest.bind(this),
        enabled: true,
      },
      
      // AI SME research (every 3 hours)
      {
        id: 'sme_research',
        name: 'AI SME Research',
        schedule: '0 */3 * * *', // Every 3 hours
        handler: this.smeResearch.bind(this),
        enabled: true,
      },
      
      // Chief of Staff: Review daily reports (9 AM)
      {
        id: 'chief_review_reports',
        name: 'Chief of Staff: Review Daily Reports',
        schedule: '0 9 * * *', // 9:00 AM every day
        handler: this.chiefReviewReports.bind(this),
        enabled: true,
      },
      
      // Chief of Staff: Review approval requests (10 AM)
      {
        id: 'chief_review_approvals',
        name: 'Chief of Staff: Review Approval Requests',
        schedule: '0 10 * * *', // 10:00 AM every day
        handler: this.chiefReviewApprovals.bind(this),
        enabled: true,
      },
      
      // Chief of Staff: Monitor agent performance (11 AM)
      {
        id: 'chief_monitor_performance',
        name: 'Chief of Staff: Monitor Agent Performance',
        schedule: '0 11 * * *', // 11:00 AM every day
        handler: this.chiefMonitorPerformance.bind(this),
        enabled: true,
      },
      
      // Chief of Staff: Generate daily summary (6 PM)
      {
        id: 'chief_daily_summary',
        name: 'Chief of Staff: Generate Daily Summary',
        schedule: '0 18 * * *', // 6:00 PM every day
        handler: this.chiefDailySummary.bind(this),
        enabled: true,
      },
    ];
  }

  /**
   * Start all scheduled tasks
   */
  public start() {
    console.log('[AutomationScheduler] Starting 24-hour automation system...');
    
    for (const taskDef of this.taskDefinitions) {
      if (taskDef.enabled) {
        const task = cron.schedule(taskDef.schedule, async () => {
          console.log(`[AutomationScheduler] Executing: ${taskDef.name}`);
          try {
            await taskDef.handler();
            await this.logTaskExecution(taskDef.id, 'success');
          } catch (error) {
            console.error(`[AutomationScheduler] Error in ${taskDef.name}:`, error);
            await this.logTaskExecution(taskDef.id, 'error', error.message);
          }
        });
        
        this.tasks.set(taskDef.id, task);
        console.log(`[AutomationScheduler] Scheduled: ${taskDef.name} (${taskDef.schedule})`);
      }
    }
    
    console.log(`[AutomationScheduler] Started ${this.tasks.size} scheduled tasks`);
  }

  /**
   * Stop all scheduled tasks
   */
  public stop() {
    console.log('[AutomationScheduler] Stopping all scheduled tasks...');
    for (const [id, task] of this.tasks) {
      task.stop();
    }
    this.tasks.clear();
  }

  /**
   * Get status of all tasks
   */
  public getStatus() {
    return this.taskDefinitions.map(def => ({
      id: def.id,
      name: def.name,
      schedule: def.schedule,
      enabled: def.enabled,
      running: this.tasks.has(def.id),
    }));
  }

  // ===== Task Handlers =====

  /**
   * 6:00 AM - Generate daily signal
   */
  private async generateDailySignal() {
    const db = await getDb();
    
    // Get all active Project Genesis projects
    const projects = await db`
      SELECT * FROM project_genesis 
      WHERE status = 'active' AND type = 'investment'
    `;
    
    for (const project of projects) {
      try {
        // Generate signal for each project
        const signal = await generateSignal('AAPL'); // TODO: Get symbol from project
        
        console.log(`[DailySignal] Generated for project ${project.name}:`, signal);
      } catch (error) {
        console.error(`[DailySignal] Error for project ${project.name}:`, error);
      }
    }
  }

  /**
   * 6:30 AM - Chief of Staff validates signal
   */
  private async validateSignal() {
    const db = await getDb();
    
    // Get today's signals that need validation
    const signals = await db`
      SELECT * FROM trading_signals 
      WHERE DATE("generatedAt") = CURRENT_DATE 
      AND status = 'pending'
    `;
    
    for (const signal of signals) {
      // Chief of Staff validation logic
      // Check signal quality, data sources, reasoning
      const isValid = await this.validateSignalQuality(signal);
      
      await db`
        UPDATE trading_signals 
        SET status = ${isValid ? 'validated' : 'rejected'},
            "validatedAt" = NOW(),
            "validatedBy" = 'chief_of_staff'
        WHERE id = ${signal.id}
      `;
    }
  }

  /**
   * 7:00 AM - Distribute signal via all channels
   */
  private async distributeSignal() {
    const db = await getDb();
    
    // Get today's validated signals
    const signals = await db`
      SELECT s.*, p.name as "projectName", u.email, u.name as "userName"
      FROM trading_signals s
      JOIN project_genesis p ON s."projectId" = p.id
      JOIN users u ON p."userId" = u.id
      WHERE DATE(s."generatedAt") = CURRENT_DATE 
      AND s.status = 'validated'
    `;
    
    for (const signal of signals) {
      try {
        // Generate Victoria briefing
        const briefing = await generateBriefing('AAPL', 'morning');
        
        // Generate PDF report
        const pdfPath = await generatePDF({
          template: 'daily_signal',
          data: { signal, briefing },
          filename: `daily-signal-${signal.projectId}-${new Date().toISOString().split('T')[0]}.pdf`,
        });
        
        // Send email
        await sendEmail({
          to: signal.email,
          subject: `Daily Signal: ${signal.projectName}`,
          template: 'daily_signal',
          data: { signal, briefing, pdfPath },
        });
        
        // Send WhatsApp (if configured)
        await sendWhatsApp({
          to: signal.email, // Assuming email maps to WhatsApp
          message: `🧠 CEPHO Daily Signal\n\n${briefing.summary}\n\nSignal: ${signal.signal}\nConfidence: ${signal.confidence}%`,
        });
        
        // Log distribution
        await db`
          INSERT INTO trading_briefings 
          ("projectId", "briefingType", content, "deliveryChannels", "deliveredAt")
          VALUES (${signal.projectId}, 'morning', ${JSON.stringify(briefing)}, ARRAY['email', 'whatsapp', 'pdf'], NOW())
        `;
        
        console.log(`[Distribution] Sent daily signal for ${signal.projectName}`);
      } catch (error) {
        console.error(`[Distribution] Error for ${signal.projectName}:`, error);
      }
    }
  }

  /**
   * Hourly market check (9 AM - 5 PM)
   */
  private async checkMarket() {
    const db = await getDb();
    
    // Get all active trading projects
    const projects = await db`
      SELECT * FROM project_genesis 
      WHERE status = 'active' AND type = 'investment'
    `;
    
    for (const project of projects) {
      // Update market data and check for significant changes
      // This would trigger alerts if needed
      console.log(`[MarketCheck] Monitoring ${project.name}`);
    }
  }

  /**
   * 12:00 PM - Midday performance check
   */
  private async middayCheck() {
    console.log('[MiddayCheck] Performing midday performance analysis');
    // Analyze morning performance
    // Send update if significant changes
  }

  /**
   * 5:00 PM - Evening briefing
   */
  private async eveningBriefing() {
    const db = await getDb();
    
    // Get all active projects
    const projects = await db`
      SELECT * FROM project_genesis 
      WHERE status = 'active' AND type = 'investment'
    `;
    
    for (const project of projects) {
      try {
        // Generate evening briefing
        const briefing = await generateBriefing('AAPL', 'evening');
        
        // Distribute via channels
        console.log(`[EveningBriefing] Generated for ${project.name}`);
      } catch (error) {
        console.error(`[EveningBriefing] Error for ${project.name}:`, error);
      }
    }
  }

  /**
   * 8:00 PM - Daily digest
   */
  private async dailyDigest() {
    console.log('[DailyDigest] Generating daily performance digest');
    // Compile full day summary
    // Performance metrics
    // Lessons learned
    // Tomorrow's plan
  }

  /**
   * AI SME research (every 3 hours)
   */
  private async smeResearch() {
    console.log('[SMEResearch] AI SMEs conducting research');
    // Medium.com scanning
    // Market intelligence gathering
    // CEPHO enhancement ideas
    // Technology trends
  }
  
  /**
   * Chief of Staff: Review daily reports
   */
  private async chiefReviewReports() {
    console.log('[ChiefOfStaff] Reviewing daily reports...');
    
    try {
      const { chiefOfStaffOrchestrator } = await import('./chief-of-staff-orchestrator');
      const result = await chiefOfStaffOrchestrator.reviewDailyReports();
      
      console.log(`[ChiefOfStaff] Reviewed ${result.reviewed} reports:`);
      console.log(`  - Auto-approved: ${result.autoApproved}`);
      console.log(`  - Escalated: ${result.escalated}`);
    } catch (error) {
      console.error('[ChiefOfStaff] Error reviewing reports:', error);
    }
  }
  
  /**
   * Chief of Staff: Review approval requests
   */
  private async chiefReviewApprovals() {
    console.log('[ChiefOfStaff] Reviewing approval requests...');
    
    try {
      const { chiefOfStaffOrchestrator } = await import('./chief-of-staff-orchestrator');
      const result = await chiefOfStaffOrchestrator.reviewApprovalRequests();
      
      console.log(`[ChiefOfStaff] Reviewed ${result.reviewed} approval requests:`);
      console.log(`  - Auto-approved: ${result.autoApproved}`);
      console.log(`  - Auto-rejected: ${result.autoRejected}`);
      console.log(`  - Escalated: ${result.escalated}`);
    } catch (error) {
      console.error('[ChiefOfStaff] Error reviewing approvals:', error);
    }
  }
  
  /**
   * Chief of Staff: Monitor agent performance
   */
  private async chiefMonitorPerformance() {
    console.log('[ChiefOfStaff] Monitoring agent performance...');
    
    try {
      const { chiefOfStaffOrchestrator } = await import('./chief-of-staff-orchestrator');
      const result = await chiefOfStaffOrchestrator.monitorAgentPerformance();
      
      console.log(`[ChiefOfStaff] Agent Performance:`);
      console.log(`  - Healthy: ${result.healthy.length}`);
      console.log(`  - Needs Attention: ${result.needsAttention.length}`);
      console.log(`  - Underperforming: ${result.underperforming.length}`);
      
      // Alert if there are underperforming agents
      if (result.underperforming.length > 0) {
        console.warn(`[ChiefOfStaff] WARNING: ${result.underperforming.length} agents underperforming!`);
      }
    } catch (error) {
      console.error('[ChiefOfStaff] Error monitoring performance:', error);
    }
  }
  
  /**
   * Chief of Staff: Generate daily summary
   */
  private async chiefDailySummary() {
    console.log('[ChiefOfStaff] Generating daily summary...');
    
    try {
      const { chiefOfStaffOrchestrator } = await import('./chief-of-staff-orchestrator');
      const summary = await chiefOfStaffOrchestrator.generateDailySummary();
      
      console.log(`[ChiefOfStaff] Daily Summary:`);
      console.log(`  - Total Agents: ${summary.totalAgents}`);
      console.log(`  - Active Agents: ${summary.activeAgents}`);
      console.log(`  - Tasks Completed: ${summary.tasksCompleted}`);
      console.log(`  - Avg Performance: ${summary.avgPerformance}`);
      console.log(`  - Pending Reports: ${summary.pendingReports}`);
      console.log(`  - Pending Approvals: ${summary.pendingApprovals}`);
      
      if (summary.highlights.length > 0) {
        console.log(`  Highlights:`);
        summary.highlights.forEach(h => console.log(`    - ${h}`));
      }
      
      if (summary.concerns.length > 0) {
        console.warn(`  Concerns:`);
        summary.concerns.forEach(c => console.warn(`    - ${c}`));
      }
      
      // TODO: Send summary email to user
    } catch (error) {
      console.error('[ChiefOfStaff] Error generating summary:', error);
    }
  }

  // ===== Helper Methods =====

  /**
   * Validate signal quality
   */
  private async validateSignalQuality(signal: any): Promise<boolean> {
    // Check confidence threshold
    if (signal.confidence < 60) return false;
    
    // Check data freshness
    // Check reasoning quality
    // Cross-validate with historical performance
    
    return true;
  }

  /**
   * Log task execution
   */
  private async logTaskExecution(taskId: string, status: 'success' | 'error', errorMessage?: string) {
    const db = await getDb();
    
    try {
      await db`
        INSERT INTO automation_logs 
        ("taskId", status, "errorMessage", "executedAt")
        VALUES (${taskId}, ${status}, ${errorMessage || null}, NOW())
      `;
    } catch (error) {
      console.error('[AutomationScheduler] Failed to log task execution:', error);
    }
  }
}

// Singleton instance
let schedulerInstance: AutomationScheduler | null = null;

/**
 * Get or create scheduler instance
 */
export function getScheduler(): AutomationScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new AutomationScheduler();
  }
  return schedulerInstance;
}

/**
 * Start the 24-hour automation system
 */
export function startAutomation() {
  const scheduler = getScheduler();
  scheduler.start();
  return scheduler;
}

/**
 * Stop the 24-hour automation system
 */
export function stopAutomation() {
  if (schedulerInstance) {
    schedulerInstance.stop();
  }
}

/**
 * Get automation system status
 */
export function getAutomationStatus() {
  if (schedulerInstance) {
    return schedulerInstance.getStatus();
  }
  return [];
}
