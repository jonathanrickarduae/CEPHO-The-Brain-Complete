import { dataAggregationService } from './data-aggregation.service';
import { getLLMService } from './llm-service';
import { logger } from '../utils/logger';
import axios from 'axios';

const log = logger.module('VictoriaBriefingService');
const llmService = getLLMService();

export interface VictoriaBriefing {
  date: Date;
  greeting: string;
  summary: string;
  priorities: string[];
  insights: string[];
  audioUrl?: string;
  videoUrl?: string;
}

export class VictoriaBriefingService {
  
  /**
   * Generate morning briefing with real data
   */
  async generateMorningBriefing(userId: string, userName?: string): Promise<VictoriaBriefing> {
    log.info(`Generating morning briefing for user ${userId}`);
    
    try {
      // Get all aggregated data
      const context = await dataAggregationService.getContext(userId);
      const data = await dataAggregationService.aggregateAll(userId);
      
      // Generate briefing with AI
      const prompt = `You are Victoria Stirling, the AI Executive Assistant for ${userName || 'the user'}. 

Generate a warm, professional morning briefing based on their current work state:

${context}

Your briefing should include:

1. **Personalized Greeting** - Warm, professional, and encouraging
2. **Today's Summary** - Brief overview of what's on their plate
3. **Top 3 Priorities** - The most important things to focus on today, with specific reasons why
4. **Key Insights** - Patterns, opportunities, or concerns you notice
5. **Encouragement** - End with motivational support

Keep it concise (2-3 minutes to read), actionable, and specific. Reference actual emails, tasks, projects, and documents by name. Be warm but professional.

Format as a natural spoken briefing, not bullet points.`;

      const aiResponse = await llmService.chat({
        messages: [{ role: 'user', content: prompt }],
        provider: 'openai',
        model: 'gpt-4.1-mini',
        temperature: 0.7,
      });
      
      // Parse the briefing into sections
      const briefingText = aiResponse.content;
      
      // Extract priorities (look for numbered lists or key phrases)
      const priorities: string[] = [];
      const priorityMatches = briefingText.match(/(?:priority|focus|important)[:\s]+([^\n]+)/gi);
      if (priorityMatches) {
        priorities.push(...priorityMatches.slice(0, 3));
      } else {
        // Fallback: extract from data
        if (data.stats.tasksOverdue > 0) {
          priorities.push(`Address ${data.stats.tasksOverdue} overdue task${data.stats.tasksOverdue > 1 ? 's' : ''}`);
        }
        if (data.stats.tasksDueToday > 0) {
          priorities.push(`Complete ${data.stats.tasksDueToday} task${data.stats.tasksDueToday > 1 ? 's' : ''} due today`);
        }
        if (data.stats.emailsUrgent > 0) {
          priorities.push(`Respond to ${data.stats.emailsUrgent} urgent email${data.stats.emailsUrgent > 1 ? 's' : ''}`);
        }
      }
      
      // Extract insights
      const insights: string[] = [];
      const insightMatches = briefingText.match(/(?:insight|notice|pattern|opportunity)[:\s]+([^\n]+)/gi);
      if (insightMatches) {
        insights.push(...insightMatches.slice(0, 3));
      }
      
      // Generate greeting
      const hour = new Date().getHours();
      let timeOfDay = 'morning';
      if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17) timeOfDay = 'evening';
      
      const greeting = `Good ${timeOfDay}, ${userName || 'there'}! I'm Victoria, your AI Executive Assistant.`;
      
      return {
        date: new Date(),
        greeting,
        summary: briefingText,
        priorities,
        insights,
      };
    } catch (error: any) {
      log.error('Failed to generate briefing:', error);
      throw new Error(`Failed to generate briefing: ${error.message}`);
    }
  }
  
  /**
   * Generate audio version of briefing using ElevenLabs
   */
  async generateAudio(briefingText: string): Promise<string | undefined> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      log.warn('ElevenLabs API key not configured');
      return undefined;
    }
    
    try {
      // Victoria's voice ID (you'll need to set this up in ElevenLabs)
      const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default voice, replace with Victoria's
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: briefingText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );
      
      // Save audio file (you'll need to implement file storage)
      // For now, return a placeholder
      log.info('Audio generated successfully');
      return 'audio-url-placeholder';
    } catch (error: any) {
      log.error('Failed to generate audio:', error);
      return undefined;
    }
  }
  
  /**
   * Generate video version of briefing using Synthesia
   */
  async generateVideo(briefingText: string): Promise<string | undefined> {
    const apiKey = process.env.SYNTHESIA_API_KEY;
    
    if (!apiKey) {
      log.warn('Synthesia API key not configured');
      return undefined;
    }
    
    try {
      // Create Synthesia video
      const response = await axios.post(
        'https://api.synthesia.io/v2/videos',
        {
          test: true, // Set to false for production
          input: [
            {
              scriptText: briefingText,
              avatar: 'anna_costume1_cameraA', // Replace with Victoria's avatar
              background: 'green_screen',
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
      
      log.info('Video generation started:', response.data);
      return response.data.id; // Return video ID for polling
    } catch (error: any) {
      log.error('Failed to generate video:', error);
      return undefined;
    }
  }
  
  /**
   * Get complete briefing with audio and video
   */
  async getCompleteBriefing(userId: string, userName?: string, options?: {
    includeAudio?: boolean;
    includeVideo?: boolean;
  }): Promise<VictoriaBriefing> {
    const briefing = await this.generateMorningBriefing(userId, userName);
    
    if (options?.includeAudio) {
      briefing.audioUrl = await this.generateAudio(briefing.summary);
    }
    
    if (options?.includeVideo) {
      briefing.videoUrl = await this.generateVideo(briefing.summary);
    }
    
    return briefing;
  }
}

export const victoriaBriefingService = new VictoriaBriefingService();
