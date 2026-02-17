/**
 * Subscription Reminder Service
 * Handles checking for upcoming subscription renewals and sending notifications
 */

import { notifyOwner } from "../_core/notification";
import { getSubscriptions } from "../db";

export interface SubscriptionReminder {
  subscriptionId: number;
  subscriptionName: string;
  provider: string;
  renewalDate: Date;
  cost: number;
  billingCycle: string;
  daysUntilRenewal: number;
  reminderType: '7_day' | '3_day' | '1_day' | 'today';
}

/**
 * Calculate days until a date
 */
function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate next renewal date based on billing cycle
 */
export function calculateNextRenewalDate(
  lastRenewalDate: Date | null,
  billingCycle: string
): Date {
  const baseDate = lastRenewalDate || new Date();
  const nextDate = new Date(baseDate);
  
  switch (billingCycle) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'one_time':
    case 'usage_based':
      // No recurring renewal
      return new Date(9999, 11, 31); // Far future date
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
}

/**
 * Get subscriptions with upcoming renewals
 */
export async function getUpcomingRenewals(
  userId: number,
  daysAhead: number = 7
): Promise<SubscriptionReminder[]> {
  const subscriptions = await getSubscriptions(userId);
  const reminders: SubscriptionReminder[] = [];
  
  for (const sub of subscriptions) {
    if (sub.status !== 'active' && sub.status !== 'trial') {
      continue; // Skip cancelled/paused subscriptions
    }
    
    if (sub.billingCycle === 'one_time' || sub.billingCycle === 'usage_based') {
      continue; // No renewal reminders for these
    }
    
    const renewalDate = calculateNextRenewalDate(
      sub.renewalDate ? new Date(sub.renewalDate) : new Date(sub.createdAt),
      sub.billingCycle
    );
    
    const days = daysUntil(renewalDate);
    
    if (days <= daysAhead && days >= 0) {
      let reminderType: SubscriptionReminder['reminderType'];
      if (days === 0) reminderType = 'today';
      else if (days === 1) reminderType = '1_day';
      else if (days <= 3) reminderType = '3_day';
      else reminderType = '7_day';
      
      reminders.push({
        subscriptionId: sub.id,
        subscriptionName: sub.name,
        provider: sub.provider || 'Unknown',
        renewalDate,
        cost: sub.cost,
        billingCycle: sub.billingCycle,
        daysUntilRenewal: days,
        reminderType,
      });
    }
  }
  
  // Sort by days until renewal (soonest first)
  return reminders.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Send renewal reminder notification
 */
export async function sendRenewalReminder(reminder: SubscriptionReminder): Promise<boolean> {
  const urgencyEmoji = reminder.daysUntilRenewal === 0 ? '🔴' : 
                       reminder.daysUntilRenewal <= 1 ? '🟠' : 
                       reminder.daysUntilRenewal <= 3 ? '🟡' : '🔵';
  
  const timeText = reminder.daysUntilRenewal === 0 ? 'today' :
                   reminder.daysUntilRenewal === 1 ? 'tomorrow' :
                   `in ${reminder.daysUntilRenewal} days`;
  
  const title = `${urgencyEmoji} Subscription Renewal: ${reminder.subscriptionName}`;
  
  const content = `
**${reminder.subscriptionName}** (${reminder.provider}) renews ${timeText}.

- **Amount:** ${formatCurrency(reminder.cost)}
- **Billing Cycle:** ${reminder.billingCycle}
- **Renewal Date:** ${reminder.renewalDate.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}

Review your subscription in the Chief of Staff → Subscription Tracker.
  `.trim();
  
  return await notifyOwner({ title, content });
}

/**
 * Check and send all due reminders for a user
 */
export async function checkAndSendReminders(userId: number): Promise<{
  sent: number;
  reminders: SubscriptionReminder[];
}> {
  const reminders = await getUpcomingRenewals(userId, 7);
  let sent = 0;
  
  // Only send reminders for specific day thresholds
  const reminderDays = [0, 1, 3, 7];
  
  for (const reminder of reminders) {
    if (reminderDays.includes(reminder.daysUntilRenewal)) {
      const success = await sendRenewalReminder(reminder);
      if (success) sent++;
    }
  }
  
  return { sent, reminders };
}

/**
 * Get renewal summary for display
 */
export async function getRenewalSummary(userId: number): Promise<{
  upcomingCount: number;
  totalUpcomingCost: number;
  nextRenewal: SubscriptionReminder | null;
  renewals: SubscriptionReminder[];
}> {
  const reminders = await getUpcomingRenewals(userId, 30); // Look 30 days ahead
  
  return {
    upcomingCount: reminders.length,
    totalUpcomingCost: reminders.reduce((sum, r) => sum + r.cost, 0),
    nextRenewal: reminders[0] || null,
    renewals: reminders,
  };
}
