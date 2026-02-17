/**
 * Expert Prompt Builder Service
 * 
 * Builds enhanced prompts for AI experts by combining:
 * 1. Base persona (bio, thinking style, strengths, weaknesses)
 * 2. Learned memories about the user
 * 3. Past conversation context
 * 4. Prompt evolutions from feedback
 * 5. Relevant insights from the knowledge base
 */

import { 
  getExpertMemoryContext, 
  getExpertConversationContext,
  getLatestExpertPromptEvolution,
  getExpertInsights,
  getExpertDomainKnowledge
} from '../db';

// Type for expert persona from aiExperts.ts
interface ExpertPersona {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  category: string;
  compositeOf: string[];
  bio: string;
  strengths: string[];
  weaknesses: string[];
  thinkingStyle: string;
  performanceScore: number;
  preferredBackend?: string;
  backendRationale?: string;
  researchApproach?: string;
  keyPrinciples?: string[];
  signatureTools?: string[];
}

interface PromptContext {
  userId: number;
  expertId: string;
  persona: ExpertPersona;
  projectId?: number;
  taskDescription?: string;
  conversationLimit?: number;
}

interface EnhancedPrompt {
  systemPrompt: string;
  contextInjection: string;
  communicationGuidelines: string;
  expertPersonality: string;
}

/**
 * Build the base personality prompt from expert persona
 */
function buildPersonalityPrompt(persona: ExpertPersona): string {
  let prompt = `You are ${persona.name}, a world-class expert in ${persona.specialty}.

## Your Identity
${persona.bio}

## Your Composite Expertise
You embody the combined wisdom of: ${persona.compositeOf.join(', ')}.

## Your Thinking Style
${persona.thinkingStyle}

## Your Strengths
${persona.strengths.map(s => `- ${s}`).join('\n')}

## Areas to Be Mindful Of
${persona.weaknesses.map(w => `- ${w}`).join('\n')}
`;

  if (persona.keyPrinciples && persona.keyPrinciples.length > 0) {
    prompt += `\n## Your Core Principles\n${persona.keyPrinciples.map(p => `- ${p}`).join('\n')}\n`;
  }

  if (persona.signatureTools && persona.signatureTools.length > 0) {
    prompt += `\n## Your Signature Frameworks & Tools\n${persona.signatureTools.map(t => `- ${t}`).join('\n')}\n`;
  }

  if (persona.researchApproach) {
    prompt += `\n## Your Research Approach\n${persona.researchApproach}\n`;
  }

  return prompt;
}

/**
 * Build communication guidelines based on learned preferences
 */
function buildCommunicationGuidelines(promptEvolution: any | null): string {
  let guidelines = `## Communication Guidelines

### Default Style
- Be direct and succinct - respect the user's time
- Lead with the key insight or recommendation
- Use structured formats (bullets, numbered lists) for complex information
- Provide evidence and reasoning, but don't over-explain
- Ask clarifying questions when genuinely needed, not as filler
`;

  if (promptEvolution?.communicationStyle) {
    guidelines += `\n### Learned Preferences\n${promptEvolution.communicationStyle}\n`;
  }

  if (promptEvolution?.promptAdditions) {
    guidelines += `\n### Additional Instructions\n${promptEvolution.promptAdditions}\n`;
  }

  return guidelines;
}

/**
 * Build context injection from memories and past conversations
 */
async function buildContextInjection(
  userId: number, 
  expertId: string, 
  conversationLimit: number = 10
): Promise<string> {
  const [memoryContext, conversationContext] = await Promise.all([
    getExpertMemoryContext(userId, expertId),
    getExpertConversationContext(userId, expertId, conversationLimit)
  ]);

  let context = '';

  if (memoryContext) {
    context += `\n${memoryContext}\n`;
  }

  if (conversationContext) {
    context += `\n## Recent Conversation History\n${conversationContext}\n`;
  }

  return context;
}

/**
 * Build relevant insights from knowledge base
 */
async function buildKnowledgeContext(
  userId: number, 
  expertId: string, 
  projectId?: number
): Promise<string> {
  const insights = await getExpertInsights(userId, {
    expertId,
    projectId,
    limit: 10
  });

  if (insights.length === 0) return '';

  let context = `\n## Relevant Insights from Your Knowledge Base\n`;
  
  insights.forEach(insight => {
    context += `\n### ${insight.title} (${insight.category})\n`;
    context += `${insight.insight}\n`;
    if (insight.confidence) {
      context += `Confidence: ${Math.round(insight.confidence * 100)}%\n`;
    }
  });

  return context;
}

/**
 * Build domain knowledge context
 */
async function buildDomainContext(expertId: string): Promise<string> {
  const domains = await getExpertDomainKnowledge(expertId);

  if (domains.length === 0) return '';

  let context = `\n## Your Current Domain Knowledge\n`;
  
  domains.forEach(domain => {
    context += `\n### ${domain.domain}${domain.subDomain ? ` > ${domain.subDomain}` : ''}\n`;
    context += `Level: ${domain.knowledgeLevel}\n`;
    if (domain.recentDevelopments) {
      context += `Recent Developments: ${domain.recentDevelopments}\n`;
    }
    if (domain.keyFrameworks) {
      const frameworks = domain.keyFrameworks as string[];
      if (frameworks.length > 0) {
        context += `Key Frameworks: ${frameworks.join(', ')}\n`;
      }
    }
  });

  return context;
}

/**
 * Main function: Build complete enhanced prompt for an expert
 */
export async function buildExpertPrompt(context: PromptContext): Promise<EnhancedPrompt> {
  const { userId, expertId, persona, projectId, taskDescription, conversationLimit = 10 } = context;

  // Get prompt evolution (learned improvements)
  const promptEvolution = await getLatestExpertPromptEvolution(expertId);

  // Build all components in parallel
  const [contextInjection, knowledgeContext, domainContext] = await Promise.all([
    buildContextInjection(userId, expertId, conversationLimit),
    buildKnowledgeContext(userId, expertId, projectId),
    buildDomainContext(expertId)
  ]);

  // Build personality prompt
  const expertPersonality = buildPersonalityPrompt(persona);

  // Build communication guidelines
  const communicationGuidelines = buildCommunicationGuidelines(promptEvolution);

  // Combine into system prompt
  let systemPrompt = expertPersonality;
  systemPrompt += '\n' + communicationGuidelines;
  
  if (domainContext) {
    systemPrompt += domainContext;
  }

  // Build full context injection
  let fullContextInjection = contextInjection;
  if (knowledgeContext) {
    fullContextInjection += knowledgeContext;
  }

  if (taskDescription) {
    fullContextInjection += `\n## Current Task\n${taskDescription}\n`;
  }

  return {
    systemPrompt,
    contextInjection: fullContextInjection,
    communicationGuidelines,
    expertPersonality
  };
}

/**
 * Build a simple prompt for quick interactions (less context)
 */
export async function buildQuickExpertPrompt(
  persona: ExpertPersona, 
  promptEvolution: any | null = null
): Promise<string> {
  let prompt = buildPersonalityPrompt(persona);
  prompt += '\n' + buildCommunicationGuidelines(promptEvolution);
  return prompt;
}

/**
 * Extract memories from a conversation
 * Called by Chief of Staff after each expert interaction
 */
export function extractMemoriesFromConversation(
  conversation: string,
  expertResponse: string
): Array<{ type: string; key: string; value: string; confidence: number }> {
  const memories: Array<{ type: string; key: string; value: string; confidence: number }> = [];

  // Pattern: User explicitly states a preference
  const preferencePatterns = [
    /I prefer (\w+)/gi,
    /I like (\w+)/gi,
    /I don't like (\w+)/gi,
    /I always (\w+)/gi,
    /I never (\w+)/gi,
    /please (?:always |don't |never )(\w+)/gi,
  ];

  preferencePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(conversation)) !== null) {
      memories.push({
        type: 'preference',
        key: `User preference: ${match[0]}`,
        value: match[0],
        confidence: 0.8
      });
    }
  });

  // Pattern: User corrects the expert
  if (conversation.toLowerCase().includes('no,') || 
      conversation.toLowerCase().includes('that\'s not') ||
      conversation.toLowerCase().includes('actually,')) {
    memories.push({
      type: 'correction',
      key: 'User correction in conversation',
      value: conversation.slice(0, 200),
      confidence: 0.9
    });
  }

  // Pattern: User provides context about themselves
  const contextPatterns = [
    /I work (?:at|for|in) (\w+)/gi,
    /my (?:company|team|role) is (\w+)/gi,
    /I'm (?:a|an) (\w+)/gi,
  ];

  contextPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(conversation)) !== null) {
      memories.push({
        type: 'fact',
        key: `User context: ${match[0]}`,
        value: match[0],
        confidence: 0.85
      });
    }
  });

  return memories;
}

/**
 * Generate prompt improvement suggestions based on feedback
 */
export function generatePromptImprovements(
  feedbackHistory: Array<{ rating: number; feedbackText: string; feedbackType: string }>
): { promptAdditions: string; communicationStyle: string } | null {
  if (feedbackHistory.length < 3) return null;

  const negatives = feedbackHistory.filter(f => f.feedbackType === 'negative' || (f.rating && f.rating <= 2));
  const positives = feedbackHistory.filter(f => f.feedbackType === 'positive' || (f.rating && f.rating >= 4));

  if (negatives.length === 0 && positives.length === 0) return null;

  let promptAdditions = '';
  let communicationStyle = '';

  // Analyze negative feedback for patterns
  if (negatives.length > 0) {
    const negativeTexts = negatives.map(n => n.feedbackText).filter(Boolean).join(' ').toLowerCase();
    
    if (negativeTexts.includes('long') || negativeTexts.includes('verbose')) {
      communicationStyle += '- Be more concise. User prefers shorter responses.\n';
    }
    if (negativeTexts.includes('technical') || negativeTexts.includes('jargon')) {
      communicationStyle += '- Use simpler language. Avoid unnecessary jargon.\n';
    }
    if (negativeTexts.includes('slow') || negativeTexts.includes('faster')) {
      communicationStyle += '- Get to the point quickly. Lead with the answer.\n';
    }
    if (negativeTexts.includes('wrong') || negativeTexts.includes('incorrect')) {
      promptAdditions += '- Double-check facts before presenting. Acknowledge uncertainty.\n';
    }
  }

  // Analyze positive feedback for patterns to reinforce
  if (positives.length > 0) {
    const positiveTexts = positives.map(p => p.feedbackText).filter(Boolean).join(' ').toLowerCase();
    
    if (positiveTexts.includes('clear') || positiveTexts.includes('concise')) {
      communicationStyle += '- Continue being clear and concise - this is valued.\n';
    }
    if (positiveTexts.includes('thorough') || positiveTexts.includes('detailed')) {
      communicationStyle += '- Thoroughness is appreciated when relevant.\n';
    }
    if (positiveTexts.includes('practical') || positiveTexts.includes('actionable')) {
      communicationStyle += '- Focus on practical, actionable recommendations.\n';
    }
  }

  if (!promptAdditions && !communicationStyle) return null;

  return { promptAdditions, communicationStyle };
}

export default {
  buildExpertPrompt,
  buildQuickExpertPrompt,
  extractMemoriesFromConversation,
  generatePromptImprovements
};
