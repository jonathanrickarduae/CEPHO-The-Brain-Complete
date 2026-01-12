/**
 * Chief of Staff Orchestration Service
 * 
 * The central intelligence that coordinates:
 * 1. Task delegation to AI experts
 * 2. Daily brief generation
 * 3. Expert coaching and improvement
 * 4. Cross-expert collaboration
 * 5. User preference learning
 */

import { 
  createExpertConversation,
  createExpertMemory,
  createExpertInsight,
  createExpertCoachingSession,
  createExpertCollaboration,
  getExpertMemories,
  getExpertInsights,
  getFeedbackHistory,
  getExpertConversationContext,
  getTasks,
  getProjects,
  getInboxItems,
  getNotifications,
} from '../db';
import { 
  buildExpertPrompt, 
  extractMemoriesFromConversation,
  generatePromptImprovements 
} from './expertPromptBuilder';
import { invokeLLM } from '../_core/llm';

// Types
interface TaskDelegation {
  taskId: string;
  taskDescription: string;
  recommendedExperts: Array<{
    expertId: string;
    expertName: string;
    confidence: number;
    rationale: string;
  }>;
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DailyBriefItem {
  category: 'key_insight' | 'meeting' | 'task' | 'intelligence' | 'recommendation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  relatedExpertId?: string;
  metadata?: Record<string, unknown>;
}

interface EveningReview {
  accomplishments: string[];
  pendingItems: string[];
  expertPerformance: Array<{
    expertId: string;
    expertName: string;
    tasksCompleted: number;
    averageRating: number;
  }>;
  recommendations: string[];
  tomorrowPriorities: string[];
}

interface ExpertRecommendation {
  expertId: string;
  expertName: string;
  specialty: string;
  matchScore: number;
  rationale: string;
}

/**
 * Analyze a task and recommend the best experts to handle it
 */
export async function analyzeTaskForDelegation(
  userId: number,
  taskDescription: string,
  expertRoster: Array<{ id: string; name: string; specialty: string; strengths: string[] }>
): Promise<TaskDelegation> {
  // Use LLM to analyze task and match to experts
  const prompt = `Analyze this task and recommend the best AI experts to handle it.

Task: ${taskDescription}

Available Experts:
${expertRoster.slice(0, 20).map(e => `- ${e.name} (${e.specialty}): ${e.strengths.slice(0, 3).join(', ')}`).join('\n')}

Respond in JSON format:
{
  "recommendedExperts": [
    {
      "expertId": "expert-id",
      "expertName": "Expert Name",
      "confidence": 0.95,
      "rationale": "Why this expert is best suited"
    }
  ],
  "estimatedTime": "2 hours",
  "priority": "high"
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: prompt }],
    });

    const content = typeof response.choices[0]?.message?.content === 'string' 
      ? response.choices[0].message.content 
      : '';
    const parsed = JSON.parse(content);
    
    return {
      taskId: `task-${Date.now()}`,
      taskDescription,
      recommendedExperts: parsed.recommendedExperts || [],
      estimatedTime: parsed.estimatedTime || 'Unknown',
      priority: parsed.priority || 'medium',
    };
  } catch (error) {
    console.error('Task analysis error:', error);
    return {
      taskId: `task-${Date.now()}`,
      taskDescription,
      recommendedExperts: [],
      estimatedTime: 'Unknown',
      priority: 'medium',
    };
  }
}

/**
 * Generate the morning daily brief
 */
export async function generateDailyBrief(userId: number): Promise<DailyBriefItem[]> {
  const briefItems: DailyBriefItem[] = [];

  try {
    // Gather data from various sources
    const [tasks, projects, inboxItems, notifications] = await Promise.all([
      getTasks(userId, { status: 'not_started', limit: 10 }),
      getProjects(userId, { status: 'in_progress', limit: 5 }),
      getInboxItems(userId, { status: 'unread', limit: 10 }),
      getNotifications(userId, { unreadOnly: true, limit: 10 }),
    ]);

    // Priority tasks
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical');
    if (highPriorityTasks.length > 0) {
      briefItems.push({
        category: 'task',
        title: `${highPriorityTasks.length} High Priority Tasks`,
        description: highPriorityTasks.map(t => t.title).join(', '),
        priority: 'high',
        actionRequired: true,
      });
    }

    // Project updates
    const blockedProjects = projects.filter(p => p.status === 'blocked');
    if (blockedProjects.length > 0) {
      briefItems.push({
        category: 'key_insight',
        title: `${blockedProjects.length} Projects Blocked`,
        description: `Projects needing attention: ${blockedProjects.map(p => p.name).join(', ')}`,
        priority: 'critical',
        actionRequired: true,
      });
    }

    // Unread inbox items
    if (inboxItems.length > 0) {
      briefItems.push({
        category: 'intelligence',
        title: `${inboxItems.length} New Inbox Items`,
        description: 'New items awaiting your review in the Universal Inbox',
        priority: 'medium',
        actionRequired: true,
      });
    }

    // Generate AI recommendations
    const recommendation = await generateMorningRecommendation(userId, tasks, projects);
    if (recommendation) {
      briefItems.push({
        category: 'recommendation',
        title: 'Chief of Staff Recommendation',
        description: recommendation,
        priority: 'medium',
        actionRequired: false,
      });
    }

  } catch (error) {
    console.error('Daily brief generation error:', error);
    briefItems.push({
      category: 'key_insight',
      title: 'Good Morning',
      description: 'Ready to help you tackle the day. What would you like to focus on?',
      priority: 'low',
      actionRequired: false,
    });
  }

  return briefItems;
}

/**
 * Generate AI-powered morning recommendation
 */
async function generateMorningRecommendation(
  userId: number,
  tasks: any[],
  projects: any[]
): Promise<string | null> {
  if (tasks.length === 0 && projects.length === 0) {
    return 'Your slate is clear. Consider reviewing your strategic goals or catching up on industry research.';
  }

  const prompt = `Based on these tasks and projects, provide ONE concise morning recommendation (2-3 sentences max):

Tasks: ${tasks.slice(0, 5).map(t => `${t.title} (${t.priority})`).join(', ')}
Projects: ${projects.slice(0, 3).map(p => `${p.name} (${p.status})`).join(', ')}

Focus on what will have the highest impact today.`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 150,
    });

    const content = typeof response.choices[0]?.message?.content === 'string' 
      ? response.choices[0].message.content 
      : '';
    return content;
  } catch {
    return null;
  }
}

/**
 * Generate evening review summary
 */
export async function generateEveningReview(userId: number): Promise<EveningReview> {
  try {
    const [tasks, feedbackHistory] = await Promise.all([
      getTasks(userId, { limit: 50 }),
      getFeedbackHistory(userId, { limit: 20 }),
    ]);

    // Calculate accomplishments
    const completedToday = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completed = new Date(t.completedAt);
      const today = new Date();
      return completed.toDateString() === today.toDateString();
    });

    // Calculate pending items
    const pendingHighPriority = tasks.filter(
      t => t.status !== 'completed' && (t.priority === 'high' || t.priority === 'critical')
    );

    // Expert performance from feedback
    const expertPerformance: Map<string, { ratings: number[]; tasks: number }> = new Map();
    feedbackHistory.forEach(f => {
      if (f.expertId && f.rating) {
        const current = expertPerformance.get(f.expertId) || { ratings: [], tasks: 0 };
        current.ratings.push(f.rating);
        current.tasks++;
        expertPerformance.set(f.expertId, current);
      }
    });

    const performanceSummary = Array.from(expertPerformance.entries()).map(([expertId, data]) => ({
      expertId,
      expertName: expertId, // Would lookup actual name
      tasksCompleted: data.tasks,
      averageRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
    }));

    return {
      accomplishments: completedToday.map(t => t.title),
      pendingItems: pendingHighPriority.map(t => t.title),
      expertPerformance: performanceSummary,
      recommendations: [
        pendingHighPriority.length > 3 
          ? 'Consider delegating some high-priority tasks to AI experts'
          : 'Good progress on priority items',
      ],
      tomorrowPriorities: pendingHighPriority.slice(0, 3).map(t => t.title),
    };
  } catch (error) {
    console.error('Evening review error:', error);
    return {
      accomplishments: [],
      pendingItems: [],
      expertPerformance: [],
      recommendations: ['Review your task list for tomorrow'],
      tomorrowPriorities: [],
    };
  }
}

/**
 * Process expert interaction - store conversation and extract learnings
 */
export async function processExpertInteraction(
  userId: number,
  expertId: string,
  userMessage: string,
  expertResponse: string,
  projectId?: number
): Promise<void> {
  try {
    // Store both sides of the conversation
    await createExpertConversation({
      userId,
      expertId,
      role: 'user',
      content: userMessage,
      projectId,
    });

    await createExpertConversation({
      userId,
      expertId,
      role: 'expert',
      content: expertResponse,
      projectId,
    });

    // Extract memories from the conversation
    const memories = extractMemoriesFromConversation(userMessage, expertResponse);
    
    for (const memory of memories) {
      await createExpertMemory({
        userId,
        expertId,
        memoryType: memory.type as any,
        key: memory.key,
        value: memory.value,
        confidence: memory.confidence,
        source: 'conversation',
      });
    }

    // Check if this conversation generated an insight worth storing
    if (expertResponse.length > 500) {
      // Longer responses might contain valuable insights
      await analyzeForInsights(userId, expertId, expertResponse, projectId);
    }

  } catch (error) {
    console.error('Expert interaction processing error:', error);
  }
}

/**
 * Analyze expert response for shareable insights
 */
async function analyzeForInsights(
  userId: number,
  expertId: string,
  response: string,
  projectId?: number
): Promise<void> {
  const prompt = `Analyze this expert response and determine if it contains a valuable insight worth storing.
If yes, extract the core insight. If no, respond with "NO_INSIGHT".

Response: ${response.slice(0, 1000)}

If there's an insight, respond in JSON:
{
  "hasInsight": true,
  "title": "Brief title",
  "insight": "The core insight in 2-3 sentences",
  "category": "strategy|operations|market|finance|technology|other",
  "confidence": 0.8
}`;

  try {
    const analysis = await invokeLLM({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 300,
    });

    const analysisContent = typeof analysis.choices[0]?.message?.content === 'string' 
      ? analysis.choices[0].message.content 
      : '';
    if (analysisContent.includes('NO_INSIGHT')) return;

    const parsed = JSON.parse(analysisContent);
    if (parsed.hasInsight) {
      await createExpertInsight({
        userId,
        expertId,
        category: parsed.category,
        title: parsed.title,
        insight: parsed.insight,
        confidence: parsed.confidence,
        projectId,
      });
    }
  } catch {
    // Silently fail - insight extraction is optional
  }
}

/**
 * Run overnight expert coaching - Chief of Staff reviews and improves experts
 */
export async function runExpertCoaching(userId: number): Promise<{
  expertsCoached: number;
  improvementsMade: number;
}> {
  let expertsCoached = 0;
  let improvementsMade = 0;

  try {
    // Get recent feedback
    const feedback = await getFeedbackHistory(userId, { limit: 100 });
    
    // Group feedback by expert
    const feedbackByExpert: Map<string, typeof feedback> = new Map();
    feedback.forEach(f => {
      if (f.expertId) {
        const current = feedbackByExpert.get(f.expertId) || [];
        current.push(f);
        feedbackByExpert.set(f.expertId, current);
      }
    });

    // Analyze each expert with sufficient feedback
    const expertIds = Array.from(feedbackByExpert.keys());
    for (const expertId of expertIds) {
      const expertFeedback = feedbackByExpert.get(expertId)!;
      if (expertFeedback.length < 3) continue;

      expertsCoached++;

      // Generate improvement suggestions
      const improvements = generatePromptImprovements(
        expertFeedback.map((f: any) => ({
          rating: f.rating || 3,
          feedbackText: f.feedbackText || '',
          feedbackType: f.feedbackType,
        }))
      );

      if (improvements) {
        improvementsMade++;

        // Record the coaching session
        await createExpertCoachingSession({
          expertId,
          coachType: 'chief_of_staff',
          focusArea: 'communication',
          feedbackGiven: `Based on ${expertFeedback.length} interactions, improvements identified.`,
          improvementPlan: JSON.stringify(improvements),
        });
      }
    }

  } catch (error) {
    console.error('Expert coaching error:', error);
  }

  return { expertsCoached, improvementsMade };
}

/**
 * Coordinate multi-expert collaboration on complex tasks
 */
export async function coordinateExpertCollaboration(
  userId: number,
  taskDescription: string,
  expertIds: string[],
  projectId?: number
): Promise<{
  collaborationId: number | null;
  outcome: string;
}> {
  try {
    // Record the collaboration
    const collaboration = await createExpertCollaboration({
      userId,
      initiatorExpertId: 'chief_of_staff',
      collaboratorExpertIds: expertIds,
      projectId,
      taskDescription,
    });

    // Generate collaboration prompt
    const prompt = `You are coordinating a collaboration between these experts: ${expertIds.join(', ')}

Task: ${taskDescription}

Provide a brief coordination plan (3-4 sentences) on how these experts should work together.`;

    const response = await invokeLLM({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 200,
    });

    const responseContent = typeof response.choices[0]?.message?.content === 'string' 
      ? response.choices[0].message.content 
      : '';
    return {
      collaborationId: collaboration?.id || null,
      outcome: responseContent,
    };
  } catch (error) {
    console.error('Collaboration coordination error:', error);
    return {
      collaborationId: null,
      outcome: 'Unable to coordinate collaboration at this time.',
    };
  }
}

/**
 * Get the best expert for a specific query
 */
export async function recommendExpertForQuery(
  query: string,
  expertRoster: Array<{ id: string; name: string; specialty: string; strengths: string[] }>,
  limit: number = 3
): Promise<ExpertRecommendation[]> {
  const prompt = `Match this query to the best experts from the roster.

Query: "${query}"

Experts (showing first 30):
${expertRoster.slice(0, 30).map(e => `${e.id}: ${e.name} - ${e.specialty}`).join('\n')}

Return JSON array of top ${limit} matches:
[{
  "expertId": "id",
  "expertName": "name",
  "specialty": "their specialty",
  "matchScore": 0.95,
  "rationale": "Why they're a good match"
}]`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 500,
    });

    const responseContent = typeof response.choices[0]?.message?.content === 'string' 
      ? response.choices[0].message.content 
      : '';
    return JSON.parse(responseContent);
  } catch {
    // Fallback to first expert
    const first = expertRoster[0];
    return [{
      expertId: first.id,
      expertName: first.name,
      specialty: first.specialty,
      matchScore: 0.5,
      rationale: 'Default recommendation',
    }];
  }
}

export default {
  analyzeTaskForDelegation,
  generateDailyBrief,
  generateEveningReview,
  processExpertInteraction,
  runExpertCoaching,
  coordinateExpertCollaboration,
  recommendExpertForQuery,
};
