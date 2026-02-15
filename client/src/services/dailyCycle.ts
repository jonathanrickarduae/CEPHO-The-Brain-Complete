// Daily Cycle Service
// Manages the 7am Morning Brief and 8pm End of Day Review triggers

export interface DailyCycleConfig {
  morningBriefTime: string; // "07:00"
  endOfDayTime: string; // "20:00"
  timezone: string;
  whatsappEnabled: boolean;
  whatsappNumber?: string;
}

const DEFAULT_CONFIG: DailyCycleConfig = {
  morningBriefTime: "07:00",
  endOfDayTime: "20:00",
  timezone: "Asia/Dubai", // GMT+4
  whatsappEnabled: true,
};

let config = { ...DEFAULT_CONFIG };
let morningBriefCallback: (() => void) | null = null;
let endOfDayCallback: (() => void) | null = null;
let checkInterval: NodeJS.Timeout | null = null;

export function configureDailyCycle(newConfig: Partial<DailyCycleConfig>) {
  config = { ...config, ...newConfig };
  localStorage.setItem('dailyCycleConfig', JSON.stringify(config));
}

export function loadDailyCycleConfig(): DailyCycleConfig {
  const saved = localStorage.getItem('dailyCycleConfig');
  if (saved) {
    config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  }
  return config;
}

export function onMorningBrief(callback: () => void) {
  morningBriefCallback = callback;
}

export function onEndOfDay(callback: () => void) {
  endOfDayCallback = callback;
}

function getCurrentTime(): { hours: number; minutes: number } {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes()
  };
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function isTimeMatch(current: { hours: number; minutes: number }, target: { hours: number; minutes: number }): boolean {
  return current.hours === target.hours && current.minutes === target.minutes;
}

// Send WhatsApp reminder via API
export async function sendWhatsAppReminder(message: string) {
  if (!config.whatsappEnabled || !config.whatsappNumber) {
    console.log('WhatsApp not configured, skipping reminder');
    return;
  }

  try {
    // This would integrate with WhatsApp Business API
    // For now, we'll use a placeholder that logs and could be connected to Twilio/WhatsApp API
    const response = await fetch('/api/notifications/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: config.whatsappNumber,
        message
      })
    });
    
    if (response.ok) {
      console.log('WhatsApp reminder sent:', message);
    }
  } catch (error) {
    console.error('Failed to send WhatsApp reminder:', error);
  }
}

function checkTime() {
  const current = getCurrentTime();
  const morningTime = parseTime(config.morningBriefTime);
  const endOfDayTime = parseTime(config.endOfDayTime);

  // Check for morning brief (7am)
  if (isTimeMatch(current, morningTime)) {
    if (morningBriefCallback) {
      morningBriefCallback();
    }
  }

  // Check for end of day (8pm)
  if (isTimeMatch(current, endOfDayTime)) {
    // Send WhatsApp reminder
    sendWhatsAppReminder("Time for your end of day review. Log in to wrap up.");
    
    if (endOfDayCallback) {
      endOfDayCallback();
    }
  }
}

export function startDailyCycle() {
  loadDailyCycleConfig();
  
  // DISABLED: Daily cycle modals temporarily disabled per user request
  // Check every minute
  // if (checkInterval) {
  //   clearInterval(checkInterval);
  // }
  
  // checkInterval = setInterval(checkTime, 60000);
  
  // Also check immediately on start
  // checkTime();
  
  console.log('Daily cycle DISABLED (modals turned off)');
}

export function stopDailyCycle() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

// Manual triggers for testing
export function triggerMorningBrief() {
  if (morningBriefCallback) {
    morningBriefCallback();
  }
}

export function triggerEndOfDay() {
  sendWhatsAppReminder("Time for your end of day review. Log in to wrap up.");
  if (endOfDayCallback) {
    endOfDayCallback();
  }
}

// Get next scheduled times
export function getNextScheduledTimes(): { morningBrief: Date; endOfDay: Date } {
  const now = new Date();
  const morningTime = parseTime(config.morningBriefTime);
  const endOfDayTime = parseTime(config.endOfDayTime);
  
  const morningBrief = new Date(now);
  morningBrief.setHours(morningTime.hours, morningTime.minutes, 0, 0);
  if (morningBrief <= now) {
    morningBrief.setDate(morningBrief.getDate() + 1);
  }
  
  const endOfDay = new Date(now);
  endOfDay.setHours(endOfDayTime.hours, endOfDayTime.minutes, 0, 0);
  if (endOfDay <= now) {
    endOfDay.setDate(endOfDay.getDate() + 1);
  }
  
  return { morningBrief, endOfDay };
}

export default {
  configureDailyCycle,
  loadDailyCycleConfig,
  onMorningBrief,
  onEndOfDay,
  startDailyCycle,
  stopDailyCycle,
  triggerMorningBrief,
  triggerEndOfDay,
  sendWhatsAppReminder,
  getNextScheduledTimes
};
