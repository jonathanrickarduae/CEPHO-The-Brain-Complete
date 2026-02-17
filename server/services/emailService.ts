/**
 * Email Service - OAuth integration for Outlook and Gmail
 * Handles fetching, sending, and syncing emails
 */

import { getDb } from '../db';

// Email types
export interface Email {
  id: string;
  provider: 'outlook' | 'gmail';
  threadId?: string;
  from: {
    name: string;
    email: string;
  };
  to: Array<{ name: string; email: string }>;
  cc?: Array<{ name: string; email: string }>;
  subject: string;
  body: string;
  bodyPreview: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    contentType: string;
    size: number;
  }>;
  labels?: string[];
  receivedAt: Date;
  importance: 'low' | 'normal' | 'high';
}

export interface EmailSyncResult {
  emails: Email[];
  nextPageToken?: string;
  totalCount: number;
}

// Microsoft Graph API endpoints
const MS_GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

// Gmail API endpoints  
const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * Fetch emails from Microsoft Outlook via Graph API
 */
export async function fetchOutlookEmails(
  accessToken: string,
  options?: {
    folder?: string;
    top?: number;
    skip?: number;
    filter?: string;
  }
): Promise<EmailSyncResult> {
  const folder = options?.folder || 'inbox';
  const top = options?.top || 50;
  const skip = options?.skip || 0;

  const url = new URL(`${MS_GRAPH_BASE}/me/mailFolders/${folder}/messages`);
  url.searchParams.set('$top', top.toString());
  url.searchParams.set('$skip', skip.toString());
  url.searchParams.set('$orderby', 'receivedDateTime desc');
  url.searchParams.set('$select', 'id,subject,bodyPreview,body,from,toRecipients,ccRecipients,receivedDateTime,isRead,importance,hasAttachments,flag');

  if (options?.filter) {
    url.searchParams.set('$filter', options.filter);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Outlook API error: ${response.status}`);
  }

  const data = await response.json();

  const emails: Email[] = data.value.map((msg: any) => ({
    id: msg.id,
    provider: 'outlook' as const,
    from: {
      name: msg.from?.emailAddress?.name || '',
      email: msg.from?.emailAddress?.address || '',
    },
    to: (msg.toRecipients || []).map((r: any) => ({
      name: r.emailAddress?.name || '',
      email: r.emailAddress?.address || '',
    })),
    cc: (msg.ccRecipients || []).map((r: any) => ({
      name: r.emailAddress?.name || '',
      email: r.emailAddress?.address || '',
    })),
    subject: msg.subject || '(No Subject)',
    body: msg.body?.content || '',
    bodyPreview: msg.bodyPreview || '',
    isRead: msg.isRead || false,
    isStarred: msg.flag?.flagStatus === 'flagged',
    hasAttachments: msg.hasAttachments || false,
    receivedAt: new Date(msg.receivedDateTime),
    importance: msg.importance || 'normal',
  }));

  return {
    emails,
    nextPageToken: data['@odata.nextLink'] ? skip + top + '' : undefined,
    totalCount: data['@odata.count'] || emails.length,
  };
}

/**
 * Fetch emails from Gmail via Gmail API
 */
export async function fetchGmailEmails(
  accessToken: string,
  options?: {
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
    query?: string;
  }
): Promise<EmailSyncResult> {
  const maxResults = options?.maxResults || 50;
  const labelIds = options?.labelIds || ['INBOX'];

  // First, get message IDs
  const listUrl = new URL(`${GMAIL_BASE}/users/me/messages`);
  listUrl.searchParams.set('maxResults', maxResults.toString());
  labelIds.forEach(id => listUrl.searchParams.append('labelIds', id));
  
  if (options?.pageToken) {
    listUrl.searchParams.set('pageToken', options.pageToken);
  }
  if (options?.query) {
    listUrl.searchParams.set('q', options.query);
  }

  const listResponse = await fetch(listUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!listResponse.ok) {
    throw new Error(`Gmail API error: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  const messageIds = listData.messages || [];

  // Fetch full message details for each
  const emails: Email[] = await Promise.all(
    messageIds.slice(0, 20).map(async (msg: { id: string }) => {
      const msgUrl = `${GMAIL_BASE}/users/me/messages/${msg.id}?format=full`;
      const msgResponse = await fetch(msgUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!msgResponse.ok) return null;
      
      const msgData = await msgResponse.json();
      return parseGmailMessage(msgData);
    })
  ).then(results => results.filter((e): e is Email => e !== null));

  return {
    emails,
    nextPageToken: listData.nextPageToken,
    totalCount: listData.resultSizeEstimate || emails.length,
  };
}

/**
 * Parse Gmail message format to Email interface
 */
function parseGmailMessage(msg: any): Email {
  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const fromHeader = getHeader('From');
  const fromMatch = fromHeader.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);

  // Get body content
  let body = '';
  let bodyPreview = msg.snippet || '';
  
  if (msg.payload?.body?.data) {
    body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
  } else if (msg.payload?.parts) {
    const textPart = msg.payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }

  return {
    id: msg.id,
    provider: 'gmail',
    threadId: msg.threadId,
    from: {
      name: fromMatch?.[1] || '',
      email: fromMatch?.[2] || fromHeader,
    },
    to: parseEmailAddresses(getHeader('To')),
    cc: parseEmailAddresses(getHeader('Cc')),
    subject: getHeader('Subject') || '(No Subject)',
    body,
    bodyPreview,
    isRead: !msg.labelIds?.includes('UNREAD'),
    isStarred: msg.labelIds?.includes('STARRED') || false,
    hasAttachments: msg.payload?.parts?.some((p: any) => p.filename) || false,
    labels: msg.labelIds || [],
    receivedAt: new Date(parseInt(msg.internalDate)),
    importance: msg.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
  };
}

/**
 * Parse email address string to array
 */
function parseEmailAddresses(str: string): Array<{ name: string; email: string }> {
  if (!str) return [];
  
  return str.split(',').map(addr => {
    const match = addr.trim().match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
    return {
      name: match?.[1]?.trim() || '',
      email: match?.[2]?.trim() || addr.trim(),
    };
  });
}

/**
 * Send email via Outlook
 */
export async function sendOutlookEmail(
  accessToken: string,
  email: {
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  }
): Promise<{ success: boolean; messageId?: string }> {
  const response = await fetch(`${MS_GRAPH_BASE}/me/sendMail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject: email.subject,
        body: {
          contentType: email.isHtml ? 'HTML' : 'Text',
          content: email.body,
        },
        toRecipients: email.to.map(addr => ({
          emailAddress: { address: addr },
        })),
        ccRecipients: email.cc?.map(addr => ({
          emailAddress: { address: addr },
        })),
      },
    }),
  });

  return { success: response.ok };
}

/**
 * Send email via Gmail
 */
export async function sendGmailEmail(
  accessToken: string,
  email: {
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
  }
): Promise<{ success: boolean; messageId?: string }> {
  // Build raw email
  const toHeader = email.to.join(', ');
  const ccHeader = email.cc?.join(', ') || '';
  
  const rawEmail = [
    `To: ${toHeader}`,
    ccHeader ? `Cc: ${ccHeader}` : '',
    `Subject: ${email.subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    email.body,
  ].filter(Boolean).join('\r\n');

  const encodedEmail = Buffer.from(rawEmail).toString('base64url');

  const response = await fetch(`${GMAIL_BASE}/users/me/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedEmail }),
  });

  if (!response.ok) {
    return { success: false };
  }

  const data = await response.json();
  return { success: true, messageId: data.id };
}

/**
 * Mark email as read
 */
export async function markEmailAsRead(
  provider: 'outlook' | 'gmail',
  accessToken: string,
  emailId: string
): Promise<boolean> {
  if (provider === 'outlook') {
    const response = await fetch(`${MS_GRAPH_BASE}/me/messages/${emailId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead: true }),
    });
    return response.ok;
  } else {
    const response = await fetch(`${GMAIL_BASE}/users/me/messages/${emailId}/modify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
    });
    return response.ok;
  }
}

/**
 * AI-powered email categorization
 */
export async function categorizeEmail(email: Email): Promise<{
  category: 'action_required' | 'fyi' | 'meeting' | 'project' | 'personal' | 'marketing' | 'other';
  priority: 'high' | 'medium' | 'low';
  suggestedActions: string[];
  relatedProject?: string;
}> {
  // This would call the LLM to categorize
  // For now, return basic categorization based on keywords
  
  const subject = email.subject.toLowerCase();
  const body = email.bodyPreview.toLowerCase();
  const combined = subject + ' ' + body;

  let category: 'action_required' | 'fyi' | 'meeting' | 'project' | 'personal' | 'marketing' | 'other' = 'other';
  let priority: 'high' | 'medium' | 'low' = 'medium';
  const suggestedActions: string[] = [];

  // Categorization logic
  if (combined.includes('urgent') || combined.includes('asap') || combined.includes('immediately')) {
    category = 'action_required';
    priority = 'high';
    suggestedActions.push('Review immediately');
  } else if (combined.includes('meeting') || combined.includes('calendar') || combined.includes('invite')) {
    category = 'meeting';
    suggestedActions.push('Check calendar availability');
  } else if (combined.includes('fyi') || combined.includes('for your information') || combined.includes('update')) {
    category = 'fyi';
    priority = 'low';
  } else if (combined.includes('project') || combined.includes('deliverable') || combined.includes('deadline')) {
    category = 'project';
    suggestedActions.push('Link to project');
  } else if (combined.includes('unsubscribe') || combined.includes('newsletter') || combined.includes('promotion')) {
    category = 'marketing';
    priority = 'low';
  }

  // Check importance flag
  if (email.importance === 'high') {
    priority = 'high';
  }

  return { category, priority, suggestedActions };
}

/**
 * Sync emails to Universal Inbox
 */
export async function syncEmailsToInbox(
  userId: number,
  provider: 'outlook' | 'gmail',
  accessToken: string
): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  try {
    const result = provider === 'outlook' 
      ? await fetchOutlookEmails(accessToken, { top: 50 })
      : await fetchGmailEmails(accessToken, { maxResults: 50 });

    const db = await getDb();
    if (!db) return { synced: 0, errors: 1 };

    for (const email of result.emails) {
      try {
        const categorization = await categorizeEmail(email);
        
        // Import to universal inbox (would use createInboxItem)
        // For now, just count
        synced++;
      } catch (err) {
        errors++;
      }
    }
  } catch (err) {
    errors++;
  }

  return { synced, errors };
}


// ============================================
// Document Email Delivery Functions
// ============================================

export interface DocumentEmailOptions {
  documentId: number;
  recipients: Array<{ email: string; name?: string }>;
  subject?: string;
  message?: string;
  includeAsAttachment: boolean;
  includeAsLink: boolean;
  senderId: number;
  senderName: string;
  senderEmail: string;
}

export interface DocumentEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipientEmail: string;
}

// Email templates for document sharing
export function generateDocumentEmailHTML(options: {
  documentTitle: string;
  documentType: string;
  senderName: string;
  message?: string;
  documentUrl?: string;
  qaStatus: string;
}): string {
  const { documentTitle, documentType, senderName, message, documentUrl, qaStatus } = options;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #00D4FF;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #000000;
    }
    .logo span {
      color: #00D4FF;
    }
    .document-badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #f0f0f0;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #666666;
      margin-bottom: 8px;
    }
    .qa-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    .qa-approved {
      background-color: #d4edda;
      color: #155724;
    }
    .qa-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      margin: 0 0 16px 0;
    }
    .message {
      background-color: #f8f9fa;
      border-left: 4px solid #00D4FF;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
    .sender {
      font-style: italic;
      color: #666666;
      margin-bottom: 8px;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #00D4FF;
      color: #000000;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 16px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CEPHO<span>.AI</span></div>
    </div>
    
    <div class="document-badge">${documentType}</div>
    <span class="qa-badge ${qaStatus === 'approved' ? 'qa-approved' : 'qa-pending'}">
      ${qaStatus === 'approved' ? '✓ QA Approved' : '⏳ Pending Review'}
    </span>
    
    <h1>${documentTitle}</h1>
    
    ${message ? `
    <div class="message">
      <div class="sender">Message from ${senderName}:</div>
      <p>${message}</p>
    </div>
    ` : ''}
    
    ${documentUrl ? `
    <a href="${documentUrl}" class="cta-button">View Document</a>
    ` : ''}
    
    <div class="footer">
      <p>This document was shared via CEPHO.AI</p>
      <p>Chief of Staff Quality Assured</p>
    </div>
  </div>
</body>
</html>
`;
}

// In-memory email history for document sharing
interface DocumentEmailHistoryEntry {
  id: string;
  documentId: number;
  documentTitle: string;
  recipientEmail: string;
  recipientName?: string;
  sentAt: Date;
  sentBy: number;
  status: 'sent' | 'delivered' | 'failed';
}

const documentEmailHistory: DocumentEmailHistoryEntry[] = [];

export function addToDocumentEmailHistory(entry: Omit<DocumentEmailHistoryEntry, 'id'>): DocumentEmailHistoryEntry {
  const newEntry: DocumentEmailHistoryEntry = {
    ...entry,
    id: `doc_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  documentEmailHistory.push(newEntry);
  return newEntry;
}

export function getDocumentEmailHistory(documentId: number): DocumentEmailHistoryEntry[] {
  return documentEmailHistory.filter(e => e.documentId === documentId).sort((a, b) => 
    b.sentAt.getTime() - a.sentAt.getTime()
  );
}

export function getUserDocumentEmailHistory(userId: number): DocumentEmailHistoryEntry[] {
  return documentEmailHistory.filter(e => e.sentBy === userId).sort((a, b) => 
    b.sentAt.getTime() - a.sentAt.getTime()
  );
}
