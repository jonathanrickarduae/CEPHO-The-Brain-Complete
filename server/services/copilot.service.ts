import axios from 'axios';
import { checkIntegrationAllowed, logIntegrationUsage } from './governance.service';

/**
 * Microsoft Copilot Integration Service
 * Provides AI-powered coding assistance and suggestions
 */

interface CopilotRequest {
  prompt: string;
  context?: string;
  language?: string;
}

interface CopilotResponse {
  suggestions: string[];
  explanation?: string;
}

/**
 * Get code suggestions from Microsoft Copilot
 */
export async function getCopilotSuggestions(
  userId: string,
  request: CopilotRequest
): Promise<CopilotResponse> {
  // Check if Copilot is allowed in current governance mode
  const allowed = await checkIntegrationAllowed(userId, 'Microsoft Copilot');
  
  if (!allowed.allowed) {
    await logIntegrationUsage(
      userId,
      'copilot',
      'Microsoft Copilot',
      'get_suggestions',
      false,
      allowed.reason
    );
    throw new Error(allowed.reason);
  }

  const apiKey = process.env.MICROSOFT_COPILOT_API_KEY;
  
  if (!apiKey) {
    throw new Error('Microsoft Copilot API key not configured');
  }

  try {
    // Note: This is a placeholder for the actual Copilot API
    // Microsoft Copilot for Business uses Azure OpenAI Service
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding assistant. Provide clear, concise code suggestions.',
          },
          {
            role: 'user',
            content: `${request.context ? `Context: ${request.context}\n\n` : ''}${request.prompt}`,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const suggestion = response.data.choices[0].message.content;

    await logIntegrationUsage(
      userId,
      'copilot',
      'Microsoft Copilot',
      'get_suggestions',
      true,
      undefined,
      { prompt: request.prompt, language: request.language }
    );

    return {
      suggestions: [suggestion],
      explanation: 'Generated using Microsoft Copilot',
    };
  } catch (error: any) {
    await logIntegrationUsage(
      userId,
      'copilot',
      'Microsoft Copilot',
      'get_suggestions',
      false,
      error.message
    );
    throw new Error(`Copilot API error: ${error.message}`);
  }
}

/**
 * Check if Copilot is available for the user
 */
export async function isCopilotAvailable(userId: string): Promise<boolean> {
  const allowed = await checkIntegrationAllowed(userId, 'Microsoft Copilot');
  return allowed.allowed && !!process.env.MICROSOFT_COPILOT_API_KEY;
}
