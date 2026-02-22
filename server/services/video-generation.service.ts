import axios from 'axios';

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

interface SynthesiaVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  videoUrl?: string;
  error?: string;
}

/**
 * Generate video using Synthesia API
 */
export async function generateBriefVideo(briefData: BriefData): Promise<SynthesiaVideoResponse> {
  const apiKey = process.env.SYNTHESIA_API_KEY;
  
  if (!apiKey) {
    throw new Error('SYNTHESIA_API_KEY not configured. Please add to environment variables.');
  }
  
  try {
    // Generate script from brief data
    const script = generateVideoScript(briefData);
    
    // Call Synthesia API
    const response = await axios.post(
      'https://api.synthesia.io/v2/videos',
      {
        test: false, // Set to true for testing without using credits
        visibility: 'private',
        title: `Victoria's Morning Brief - ${briefData.date}`,
        input: [
          {
            avatarSettings: {
              // Victoria avatar - needs to be configured in Synthesia account
              avatar: process.env.SYNTHESIA_VICTORIA_AVATAR_ID || 'anna_costume1_cameraA',
              style: 'rectangular',
              seamless: false,
            },
            backgroundSettings: {
              videoSettings: {
                shortBackgroundContentMatchMode: 'freeze',
                longBackgroundContentMatchMode: 'trim',
              },
            },
            scriptText: script,
            voice: 'en-US-JennyNeural', // Professional female voice
          },
        ],
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      id: response.data.id,
      status: 'processing',
    };
  } catch (error: any) {
    console.error('Synthesia API error:', error.response?.data || error.message);
    throw new Error(`Failed to generate video: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Check status of Synthesia video generation
 */
export async function checkVideoStatus(videoId: string): Promise<SynthesiaVideoResponse> {
  const apiKey = process.env.SYNTHESIA_API_KEY;
  
  if (!apiKey) {
    throw new Error('SYNTHESIA_API_KEY not configured');
  }
  
  try {
    const response = await axios.get(
      `https://api.synthesia.io/v2/videos/${videoId}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );
    
    const data = response.data;
    
    return {
      id: videoId,
      status: data.status,
      videoUrl: data.status === 'complete' ? data.download : undefined,
      error: data.status === 'failed' ? data.error : undefined,
    };
  } catch (error: any) {
    console.error('Synthesia status check error:', error.response?.data || error.message);
    throw new Error(`Failed to check video status: ${error.message}`);
  }
}

/**
 * Generate video script from brief data
 */
function generateVideoScript(data: BriefData): string {
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
