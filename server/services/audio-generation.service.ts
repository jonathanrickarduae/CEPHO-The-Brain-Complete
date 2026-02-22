import axios from 'axios';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface BriefData {
  date: string;
  overviewSummary: {
    headline: string;
    energyFocus: string;
  };
  schedule: Array<{
    time: string;
    title: string;
    type: string;
    location?: string;
    attendees?: string[];
  }>;
  priorities: Array<{
    title: string;
    description: string;
    urgency: string;
    estimatedTime: string;
  }>;
  insights: Array<{
    category: string;
    message: string;
  }>;
  emails?: {
    unread: number;
    requireResponse: number;
    highPriority: number;
    urgent: Array<{
      from: string;
      subject: string;
      preview: string;
      suggestedResponse: string;
    }>;
  };
}

/**
 * Generate audio using 11Labs API
 */
export async function generateBriefAudio(briefData: BriefData): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured. Please add to environment variables.');
  }
  
  try {
    // Generate script from brief data (same as video)
    const script = generateAudioScript(briefData);
    
    // Victoria voice ID - professional female voice
    // Default to Rachel (professional, clear voice) if not configured
    const voiceId = process.env.ELEVENLABS_VICTORIA_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    
    // Call 11Labs API
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );
    
    // Save audio to temporary file
    const tempAudioPath = join(tmpdir(), `victoria-brief-${Date.now()}.mp3`);
    await writeFile(tempAudioPath, Buffer.from(response.data));
    
    return tempAudioPath;
  } catch (error: any) {
    console.error('11Labs API error:', error.response?.data || error.message);
    throw new Error(`Failed to generate audio: ${error.response?.data?.detail?.message || error.message}`);
  }
}

/**
 * Generate audio script from brief data
 */
function generateAudioScript(data: BriefData): string {
  const lines: string[] = [];
  
  // Opening
  lines.push(`Good morning! I'm Victoria, and this is your morning brief for ${data.date}.`);
  lines.push('');
  
  // Overview
  lines.push(data.overviewSummary.headline);
  lines.push(data.overviewSummary.energyFocus);
  lines.push('');
  
  // Schedule highlights
  if (data.schedule && data.schedule.length > 0) {
    lines.push("Here's what's on your calendar today:");
    const topEvents = data.schedule.slice(0, 3); // Top 3 events
    for (const event of topEvents) {
      lines.push(`At ${event.time}, you have ${event.title}.`);
    }
    if (data.schedule.length > 3) {
      lines.push(`Plus ${data.schedule.length - 3} more events throughout the day.`);
    }
    lines.push('');
  }
  
  // Top priorities
  if (data.priorities && data.priorities.length > 0) {
    lines.push('Your top priorities today are:');
    const topPriorities = data.priorities.slice(0, 3); // Top 3 priorities
    for (let i = 0; i < topPriorities.length; i++) {
      const priority = topPriorities[i];
      lines.push(`Number ${i + 1}: ${priority.title}. ${priority.description}`);
    }
    lines.push('');
  }
  
  // Key insights
  if (data.insights && data.insights.length > 0) {
    lines.push('Here are some key insights for today:');
    for (const insight of data.insights) {
      lines.push(`${insight.category}: ${insight.message}`);
    }
    lines.push('');
  }
  
  // Urgent emails
  if (data.emails && data.emails.urgent && data.emails.urgent.length > 0) {
    lines.push(`You have ${data.emails.urgent.length} urgent emails requiring your attention.`);
    const topEmail = data.emails.urgent[0];
    lines.push(`The most urgent is from ${topEmail.from} about ${topEmail.subject}.`);
    lines.push('');
  }
  
  // Closing
  lines.push("That's your morning brief. Have a productive day!");
  
  return lines.join(' ');
}
