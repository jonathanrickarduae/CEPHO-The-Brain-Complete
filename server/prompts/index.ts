/**
 * Prompt Router
 * Selects the appropriate system prompt based on skill type
 */

import { PROJECT_GENESIS_PROMPT } from './project-genesis';
import { AI_SME_PROMPT } from './ai-sme';
import { QUALITY_GATES_PROMPT } from './quality-gates';
import { DUE_DILIGENCE_PROMPT } from './due-diligence';
import { FINANCIAL_MODELING_PROMPT } from './financial-modeling';
import { DATA_ROOM_PROMPT } from './data-room';
import { DIGITAL_TWIN_PROMPT } from './digital-twin';

export type SkillType = 
  | 'project-genesis'
  | 'ai-sme'
  | 'quality-gates'
  | 'due-diligence'
  | 'financial-modeling'
  | 'data-room'
  | 'digital-twin'
  | 'chief-of-staff';

/**
 * Get system prompt for a specific skill
 */
export function getSystemPrompt(skillType: SkillType): string {
  switch (skillType) {
    case 'project-genesis':
      return PROJECT_GENESIS_PROMPT;
    case 'ai-sme':
      return AI_SME_PROMPT;
    case 'quality-gates':
      return QUALITY_GATES_PROMPT;
    case 'due-diligence':
      return DUE_DILIGENCE_PROMPT;
    case 'financial-modeling':
      return FINANCIAL_MODELING_PROMPT;
    case 'data-room':
      return DATA_ROOM_PROMPT;
    case 'digital-twin':
      return DIGITAL_TWIN_PROMPT;
    case 'chief-of-staff':
      return CHIEF_OF_STAFF_PROMPT;
    default:
      return DEFAULT_PROMPT;
  }
}

/**
 * Chief of Staff prompt - general executive assistant
 */
const CHIEF_OF_STAFF_PROMPT = `You are the Chief of Staff AI within CEPHO, a versatile executive assistant that helps with general business tasks, coordination, and decision support. You are knowledgeable across all business functions and can assist with a wide range of tasks including meeting preparation, email drafting, research, analysis, and strategic thinking.

Your role is to be a trusted right-hand assistant who:
- Helps organize and prioritize work
- Provides quick answers and research
- Drafts communications and documents
- Offers strategic perspective and devil's advocate thinking
- Coordinates across different workstreams
- Anticipates needs and proactively suggests actions

When a user's request doesn't fit a specific skill, you step in to provide general support. You're professional, efficient, and always focused on helping the user achieve their goals.

For specialized tasks, you can recommend which specific CEPHO skill would be most appropriate (Project Genesis for venture development, AI-SME for expert consultation, Quality Gates for validation, Due Diligence for investment analysis, Financial Modeling for projections, Data Room for document management, or Digital Twin for personalized assistance).`;

/**
 * Default prompt for fallback
 */
const DEFAULT_PROMPT = `You are OpenClaw, an AI assistant within the CEPHO platform. You help users with business strategy, analysis, and decision-making. You are knowledgeable, professional, and focused on providing actionable insights.`;

/**
 * Get conversation context summary for prompt enhancement
 */
export function buildConversationContext(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxMessages: number = 10
): string {
  if (!conversationHistory || conversationHistory.length === 0) {
    return '';
  }

  // Take the last N messages
  const recentMessages = conversationHistory.slice(-maxMessages);
  
  // Format as conversation history
  const formattedHistory = recentMessages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  return `\n\n## Previous Conversation\n\n${formattedHistory}\n\n## Current Request\n\n`;
}

/**
 * Enhance prompt with user context and preferences
 */
export function enhancePromptWithContext(
  basePrompt: string,
  userContext?: {
    name?: string;
    company?: string;
    industry?: string;
    role?: string;
    preferences?: Record<string, any>;
  }
): string {
  if (!userContext) {
    return basePrompt;
  }

  let contextAddition = '\n\n## User Context\n\n';
  
  if (userContext.name) {
    contextAddition += `You are assisting ${userContext.name}`;
    if (userContext.role) {
      contextAddition += `, ${userContext.role}`;
    }
    if (userContext.company) {
      contextAddition += ` at ${userContext.company}`;
    }
    contextAddition += '.\n';
  }

  if (userContext.industry) {
    contextAddition += `Industry: ${userContext.industry}\n`;
  }

  if (userContext.preferences) {
    if (userContext.preferences.communicationStyle) {
      contextAddition += `\nPreferred communication style: ${userContext.preferences.communicationStyle}\n`;
    }
    if (userContext.preferences.detailLevel) {
      contextAddition += `Detail level preference: ${userContext.preferences.detailLevel}\n`;
    }
  }

  return basePrompt + contextAddition;
}

/**
 * Build complete prompt for LLM
 */
export function buildCompletePrompt(
  skillType: SkillType,
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: {
    name?: string;
    company?: string;
    industry?: string;
    role?: string;
    preferences?: Record<string, any>;
  }
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  // Get base system prompt for skill
  let systemPrompt = getSystemPrompt(skillType);

  // Enhance with user context
  systemPrompt = enhancePromptWithContext(systemPrompt, userContext);

  // Build messages array
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt }
  ];

  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    // Add last 10 messages for context
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })));
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}
