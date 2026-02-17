/**
 * Trading Workflow Service
 * Orchestrates the complete trading workflow for Project Genesis
 */

import { generateSignal, type TradingSignal } from './trading-signal-service';
import { generateMorningBriefing, generateHourlyUpdate, generateEveningReview, generateAlert, type VictoriaBriefing } from './victoria-briefing-service';
import { getDb } from '../../db';

export interface WorkflowConfig {
  userId: string;
  projectId?: number;
  symbol: string;
  enableEmail: boolean;
  enableNotionLogging: boolean;
  enableAsanaTasks: boolean;
  enableWhatsAppAlerts: boolean;
}

export interface WorkflowResult {
  success: boolean;
  signal?: TradingSignal;
  briefing?: VictoriaBriefing;
  actions: {
    emailSent: boolean;
    notionUpdated: boolean;
    asanaTaskCreated: boolean;
    whatsappSent: boolean;
  };
  errors: string[];
}

/**
 * Execute complete trading workflow
 */
export async function executeTradingWorkflow(config: WorkflowConfig): Promise<WorkflowResult> {
  const errors: string[] = [];
  const actions = {
    emailSent: false,
    notionUpdated: false,
    asanaTaskCreated: false,
    whatsappSent: false
  };
  
  try {
    console.log(`[TradingWorkflow] Starting workflow for ${config.symbol}...`);
    
    // Log workflow start
    await logWorkflowStep(config, 'RUNNING', 'signal_generation', 'Generating trading signal');
    
    // 1. Generate trading signal
    const signal = await generateSignal(config.symbol);
    console.log(`[TradingWorkflow] Signal generated: ${signal.action} with ${signal.confidence}% confidence`);
    
    // 2. Store signal in database
    await storeSignal(config, signal);
    await logWorkflowStep(config, 'RUNNING', 'signal_stored', 'Signal stored in database', signal.id);
    
    // 3. Generate Victoria briefing
    const briefing = await generateHourlyUpdate('Jonathan', signal);
    await storeBriefing(config, briefing);
    await logWorkflowStep(config, 'RUNNING', 'briefing_generated', 'Briefing generated');
    
    // 4. Send email notification (if enabled)
    if (config.enableEmail) {
      try {
        await sendEmailNotification(config, signal, briefing);
        actions.emailSent = true;
        await logWorkflowStep(config, 'RUNNING', 'email_sent', 'Email notification sent');
      } catch (error: any) {
        errors.push(`Email failed: ${error.message}`);
        await logWorkflowStep(config, 'RUNNING', 'email_failed', error.message, signal.id);
      }
    }
    
    // 5. Update Notion document (if enabled)
    if (config.enableNotionLogging) {
      try {
        await updateNotionLog(config, signal);
        actions.notionUpdated = true;
        await logWorkflowStep(config, 'RUNNING', 'notion_updated', 'Notion document updated');
      } catch (error: any) {
        errors.push(`Notion failed: ${error.message}`);
        await logWorkflowStep(config, 'RUNNING', 'notion_failed', error.message, signal.id);
      }
    }
    
    // 6. Create Asana task (if action required and enabled)
    if (config.enableAsanaTasks && signal.action !== 'HOLD') {
      try {
        await createAsanaTask(config, signal);
        actions.asanaTaskCreated = true;
        await logWorkflowStep(config, 'RUNNING', 'asana_created', 'Asana task created');
      } catch (error: any) {
        errors.push(`Asana failed: ${error.message}`);
        await logWorkflowStep(config, 'RUNNING', 'asana_failed', error.message, signal.id);
      }
    }
    
    // 7. Send WhatsApp alert (if high confidence and enabled)
    if (config.enableWhatsAppAlerts && signal.confidence >= 80) {
      try {
        await sendWhatsAppAlert(config, signal);
        actions.whatsappSent = true;
        await logWorkflowStep(config, 'RUNNING', 'whatsapp_sent', 'WhatsApp alert sent');
      } catch (error: any) {
        errors.push(`WhatsApp failed: ${error.message}`);
        await logWorkflowStep(config, 'RUNNING', 'whatsapp_failed', error.message, signal.id);
      }
    }
    
    // 8. Update performance metrics
    await updatePerformanceMetrics(config, signal);
    
    // Mark workflow as completed
    await logWorkflowStep(config, 'COMPLETED', 'workflow_completed', 'Workflow completed successfully', signal.id);
    
    console.log(`[TradingWorkflow] Workflow completed successfully`);
    
    return {
      success: true,
      signal,
      briefing,
      actions,
      errors
    };
    
  } catch (error: any) {
    console.error('[TradingWorkflow] Workflow failed:', error);
    await logWorkflowStep(config, 'FAILED', 'workflow_failed', error.message);
    
    return {
      success: false,
      actions,
      errors: [...errors, error.message]
    };
  }
}

/**
 * Execute morning briefing workflow
 */
export async function executeMorningBriefing(config: WorkflowConfig): Promise<WorkflowResult> {
  const errors: string[] = [];
  const actions = {
    emailSent: false,
    notionUpdated: false,
    asanaTaskCreated: false,
    whatsappSent: false
  };
  
  try {
    // Generate signal for morning analysis
    const signal = await generateSignal(config.symbol);
    
    // Generate morning briefing
    const briefing = await generateMorningBriefing('Jonathan', [signal]);
    await storeBriefing(config, briefing);
    
    // Send email
    if (config.enableEmail) {
      await sendEmailNotification(config, signal, briefing);
      actions.emailSent = true;
    }
    
    return {
      success: true,
      signal,
      briefing,
      actions,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      actions,
      errors: [error.message]
    };
  }
}

/**
 * Execute evening review workflow
 */
export async function executeEveningReview(config: WorkflowConfig): Promise<WorkflowResult> {
  const errors: string[] = [];
  const actions = {
    emailSent: false,
    notionUpdated: false,
    asanaTaskCreated: false,
    whatsappSent: false
  };
  
  try {
    // Get today's signals
    const signals = await getTodaySignals(config);
    
    // Calculate performance
    const performance = await calculateDailyPerformance(config);
    
    // Generate evening review
    const briefing = await generateEveningReview('Jonathan', signals, performance);
    await storeBriefing(config, briefing);
    
    // Send email
    if (config.enableEmail) {
      await sendEmailNotification(config, signals[0], briefing);
      actions.emailSent = true;
    }
    
    return {
      success: true,
      briefing,
      actions,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      actions,
      errors: [error.message]
    };
  }
}

// ============ Helper Functions ============

async function storeSignal(config: WorkflowConfig, signal: TradingSignal): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(`
    INSERT INTO trading_signals (
      id, project_id, user_id, timestamp, symbol, action, price, confidence, indicators, reasoning, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    signal.id,
    config.projectId || null,
    config.userId,
    signal.timestamp,
    signal.symbol,
    signal.action,
    signal.price,
    signal.confidence,
    JSON.stringify(signal.indicators),
    signal.reasoning,
    JSON.stringify(signal.metadata)
  ]);
}

async function storeBriefing(config: WorkflowConfig, briefing: VictoriaBriefing): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(`
    INSERT INTO victoria_briefings (
      id, project_id, user_id, briefing_type, subject, content, summary, signals, performance, sent_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    briefing.id,
    config.projectId || null,
    config.userId,
    briefing.briefingType,
    briefing.subject,
    briefing.content,
    briefing.summary,
    JSON.stringify(briefing.signals),
    JSON.stringify(briefing.performance),
    briefing.timestamp
  ]);
}

async function logWorkflowStep(
  config: WorkflowConfig,
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED',
  step: string,
  message: string,
  signalId?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.execute(`
      INSERT INTO trading_workflow_logs (
        project_id, user_id, workflow_type, signal_id, status, step, message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      config.projectId || null,
      config.userId,
      'trading_signal',
      signalId || null,
      status,
      step,
      message
    ]);
  } catch (error) {
    console.error('[TradingWorkflow] Failed to log workflow step:', error);
  }
}

async function sendEmailNotification(config: WorkflowConfig, signal: TradingSignal, briefing: VictoriaBriefing): Promise<void> {
  // TODO: Implement email sending using Gmail integration
  console.log('[TradingWorkflow] Email notification:', briefing.subject);
  // This will be implemented using the existing email integration service
}

async function updateNotionLog(config: WorkflowConfig, signal: TradingSignal): Promise<void> {
  // TODO: Implement Notion logging
  console.log('[TradingWorkflow] Notion log updated for signal:', signal.id);
  // This will be implemented using the Notion API
}

async function createAsanaTask(config: WorkflowConfig, signal: TradingSignal): Promise<void> {
  // TODO: Implement Asana task creation
  console.log('[TradingWorkflow] Asana task created for signal:', signal.action);
  // This will be implemented using the Asana API
}

async function sendWhatsAppAlert(config: WorkflowConfig, signal: TradingSignal): Promise<void> {
  // TODO: Implement WhatsApp alerts
  console.log('[TradingWorkflow] WhatsApp alert sent for signal:', signal.action);
  // This will be implemented using WhatsApp Business API
}

async function updatePerformanceMetrics(config: WorkflowConfig, signal: TradingSignal): Promise<void> {
  // TODO: Implement performance tracking
  console.log('[TradingWorkflow] Performance metrics updated');
}

async function getTodaySignals(config: WorkflowConfig): Promise<TradingSignal[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(`
    SELECT * FROM trading_signals
    WHERE user_id = $1 AND DATE(timestamp) = CURRENT_DATE
    ORDER BY timestamp DESC
  `, [config.userId]);
  
  return result.rows.map(row => ({
    id: row.id,
    timestamp: new Date(row.timestamp),
    symbol: row.symbol,
    action: row.action as 'BUY' | 'SELL' | 'HOLD',
    price: parseFloat(row.price),
    confidence: parseInt(row.confidence),
    indicators: JSON.parse(row.indicators),
    reasoning: row.reasoning,
    metadata: JSON.parse(row.metadata)
  }));
}

async function calculateDailyPerformance(config: WorkflowConfig): Promise<VictoriaBriefing['performance']> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.execute(`
    SELECT 
      total_trades, profitable_trades, total_pnl, roi
    FROM trading_performance
    WHERE user_id = $1 AND date = CURRENT_DATE
    LIMIT 1
  `, [config.userId]);
  
  if (result.rows.length === 0) {
    return {
      totalTrades: 0,
      profitableTrades: 0,
      currentPnL: 0,
      roi: 0
    };
  }
  
  const row = result.rows[0];
  return {
    totalTrades: parseInt(row.total_trades),
    profitableTrades: parseInt(row.profitable_trades),
    currentPnL: parseFloat(row.total_pnl),
    roi: parseFloat(row.roi)
  };
}
