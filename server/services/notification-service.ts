/**
 * Notification Service
 * Handles multi-channel notifications: Email, WhatsApp, Push, SMS
 */

import nodemailer from 'nodemailer';
import { getDb } from '../db';

interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  data?: any;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

interface WhatsAppOptions {
  to: string;
  message: string;
  mediaUrl?: string;
}

interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  data?: any;
}

/**
 * Send email notification
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const db = await getDb();
  
  try {
    // Get email configuration from database
    const config = await db`
      SELECT * FROM integrations 
      WHERE service = 'gmail' AND status = 'connected'
      LIMIT 1
    `;
    
    if (!config || config.length === 0) {
      console.error('[Email] Gmail integration not configured');
      return;
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config[0].credentials?.email || process.env.GMAIL_USER,
        pass: config[0].credentials?.password || process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    // Render template if provided
    let html = options.html;
    let text = options.text;
    
    if (options.template && options.data) {
      const rendered = await renderEmailTemplate(options.template, options.data);
      html = rendered.html;
      text = rendered.text;
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: `"CEPHO.AI" <${config[0].credentials?.email || process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: text,
      html: html,
      attachments: options.attachments,
    });
    
    console.log('[Email] Sent:', info.messageId);
    
    // Log notification
    await db`
      INSERT INTO notifications 
      (type, recipient, subject, status, "sentAt")
      VALUES ('email', ${options.to}, ${options.subject}, 'sent', NOW())
    `;
  } catch (error) {
    console.error('[Email] Error sending:', error);
    
    // Log failure
    await db`
      INSERT INTO notifications 
      (type, recipient, subject, status, error, "sentAt")
      VALUES ('email', ${options.to}, ${options.subject}, 'failed', ${error.message}, NOW())
    `;
    
    throw error;
  }
}

/**
 * Send WhatsApp notification
 */
export async function sendWhatsApp(options: WhatsAppOptions): Promise<void> {
  const db = await getDb();
  
  try {
    // Get WhatsApp configuration from database
    const config = await db`
      SELECT * FROM integrations 
      WHERE service = 'whatsapp' AND status = 'connected'
      LIMIT 1
    `;
    
    if (!config || config.length === 0) {
      console.log('[WhatsApp] Integration not configured - skipping');
      return;
    }
    
    // TODO: Implement WhatsApp Business API integration
    // For now, just log the attempt
    console.log('[WhatsApp] Would send to:', options.to);
    console.log('[WhatsApp] Message:', options.message);
    
    // Log notification
    await db`
      INSERT INTO notifications 
      (type, recipient, subject, status, "sentAt")
      VALUES ('whatsapp', ${options.to}, 'WhatsApp Message', 'sent', NOW())
    `;
  } catch (error) {
    console.error('[WhatsApp] Error sending:', error);
    
    // Log failure
    await db`
      INSERT INTO notifications 
      (type, recipient, subject, status, error, "sentAt")
      VALUES ('whatsapp', ${options.to}, 'WhatsApp Message', 'failed', ${error.message}, NOW())
    `;
  }
}

/**
 * Send push notification
 */
export async function sendPushNotification(options: PushNotificationOptions): Promise<void> {
  const db = await getDb();
  
  try {
    // Store notification in database for user to see
    await db`
      INSERT INTO user_notifications 
      ("userId", title, body, data, "isRead", "createdAt")
      VALUES (${options.userId}, ${options.title}, ${options.body}, ${JSON.stringify(options.data || {})}, false, NOW())
    `;
    
    console.log('[Push] Notification stored for user:', options.userId);
    
    // TODO: Implement web push notifications
    // For now, just store in database
  } catch (error) {
    console.error('[Push] Error sending:', error);
    throw error;
  }
}

/**
 * Render email template
 */
async function renderEmailTemplate(template: string, data: any): Promise<{ html: string; text: string }> {
  // Email templates
  const templates: Record<string, (data: any) => { html: string; text: string }> = {
    daily_signal: (data) => ({
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .signal { background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .signal-action { font-size: 24px; font-weight: bold; color: ${data.signal.signal === 'BUY' ? '#10b981' : data.signal.signal === 'SELL' ? '#ef4444' : '#6b7280'}; }
            .confidence { font-size: 18px; color: #667eea; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧠 CEPHO Daily Signal</h1>
            <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <h2>Good Morning!</h2>
            <p>Victoria has analyzed the markets and generated your daily signal:</p>
            
            <div class="signal">
              <div class="signal-action">${data.signal.signal}</div>
              <div class="confidence">Confidence: ${data.signal.confidence}%</div>
              <p><strong>Reasoning:</strong> ${data.signal.reasoning}</p>
            </div>
            
            <h3>Market Overview</h3>
            <p>${data.briefing.summary}</p>
            
            <h3>Key Points</h3>
            <ul>
              ${data.briefing.keyPoints?.map((point: string) => `<li>${point}</li>`).join('') || '<li>No key points available</li>'}
            </ul>
            
            <p><strong>Recommendation:</strong> ${data.briefing.recommendation}</p>
            
            <p>📄 Full report attached as PDF</p>
          </div>
          <div class="footer">
            <p>This signal was validated by the Chief of Staff AI</p>
            <p>© ${new Date().getFullYear()} CEPHO.AI - All rights reserved</p>
          </div>
        </body>
        </html>
      `,
      text: `
CEPHO Daily Signal
${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Good Morning!

Victoria has analyzed the markets and generated your daily signal:

Signal: ${data.signal.signal}
Confidence: ${data.signal.confidence}%
Reasoning: ${data.signal.reasoning}

Market Overview:
${data.briefing.summary}

Key Points:
${data.briefing.keyPoints?.map((point: string) => `- ${point}`).join('\n') || '- No key points available'}

Recommendation: ${data.briefing.recommendation}

Full report attached as PDF.

This signal was validated by the Chief of Staff AI
© ${new Date().getFullYear()} CEPHO.AI - All rights reserved
      `,
    }),
    
    evening_briefing: (data) => ({
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .performance { background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌙 CEPHO Evening Briefing</h1>
            <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <h2>Today's Performance</h2>
            <div class="performance">
              <p>${data.briefing.summary}</p>
            </div>
            
            <h3>Tomorrow's Plan</h3>
            <p>${data.briefing.tomorrowPlan || 'Continue monitoring markets'}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CEPHO.AI - All rights reserved</p>
          </div>
        </body>
        </html>
      `,
      text: `
CEPHO Evening Briefing
${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Today's Performance:
${data.briefing.summary}

Tomorrow's Plan:
${data.briefing.tomorrowPlan || 'Continue monitoring markets'}

© ${new Date().getFullYear()} CEPHO.AI - All rights reserved
      `,
    }),
  };
  
  const renderer = templates[template];
  if (!renderer) {
    throw new Error(`Email template '${template}' not found`);
  }
  
  return renderer(data);
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  const db = await getDb();
  
  const notifications = await db`
    SELECT * FROM user_notifications
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
  `;
  
  return notifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const db = await getDb();
  
  await db`
    UPDATE user_notifications
    SET "isRead" = true, "readAt" = NOW()
    WHERE id = ${notificationId}
  `;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const db = await getDb();
  
  const result = await db`
    SELECT COUNT(*) as count
    FROM user_notifications
    WHERE "userId" = ${userId} AND "isRead" = false
  `;
  
  return parseInt(result[0]?.count || '0');
}
