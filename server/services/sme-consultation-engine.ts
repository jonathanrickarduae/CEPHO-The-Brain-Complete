/**
 * AI-SME Consultation Engine
 * Implements intelligent expert matching, consultation workflows, and team collaboration
 */

import { db } from '../db';
import {
  aiSmeExperts,
  aiSmeConsultations,
  aiSmeTeams,
  aiSmeTeamMembers,
  aiSmeCollaborations,
  expertChatSessions,
  expertChatMessages,
} from '../../drizzle/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { allExperts } from '../../client/src/data/aiExperts';

/**
 * Intelligent Expert Matching
 * Uses AI to match the right experts to user needs
 */
export async function matchExperts(requirements: {
  category?: string;
  industry?: string;
  geography?: string;
  expertise?: string[];
  projectType?: string;
  urgency?: 'low' | 'medium' | 'high';
  teamSize?: number;
}): Promise<any[]> {
  // Get all available experts
  const experts = await db.select()
    .from(aiSmeExperts)
    .where(eq(aiSmeExperts.availability, 'available'));
  
  // Score each expert based on requirements
  const scoredExperts = experts.map(expert => {
    let score = 0;
    
    // Category match (40 points)
    if (requirements.category && expert.category === requirements.category) {
      score += 40;
    }
    
    // Industry match (30 points)
    if (requirements.industry && expert.industries?.includes(requirements.industry)) {
      score += 30;
    }
    
    // Geography match (15 points)
    if (requirements.geography && expert.geographies?.includes(requirements.geography)) {
      score += 15;
    }
    
    // Expertise match (15 points)
    if (requirements.expertise) {
      const matchingExpertise = requirements.expertise.filter(e => 
        expert.specializations?.includes(e)
      );
      score += (matchingExpertise.length / requirements.expertise.length) * 15;
    }
    
    // Rating bonus (up to 10 points)
    score += (expert.rating / 5) * 10;
    
    return {
      ...expert,
      matchScore: Math.round(score),
    };
  });
  
  // Sort by score and return top matches
  const topMatches = scoredExperts
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, requirements.teamSize || 5);
  
  return topMatches;
}

/**
 * Create Expert Consultation
 */
export async function createConsultation(data: {
  userId: string;
  expertId: string;
  projectId?: string;
  topic: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  expectedDuration?: number;
}): Promise<any> {
  // Create consultation record
  const [consultation] = await db.insert(aiSmeConsultations).values({
    userId: data.userId,
    expertId: data.expertId,
    projectId: data.projectId,
    topic: data.topic,
    description: data.description,
    status: 'scheduled',
    urgency: data.urgency,
    expectedDuration: data.expectedDuration || 60,
  }).returning();
  
  // Create chat session for consultation
  const [chatSession] = await db.insert(expertChatSessions).values({
    userId: data.userId,
    expertId: data.expertId,
    consultationId: consultation.id,
    status: 'active',
  }).returning();
  
  // Send initial message from expert
  const expert = await db.select()
    .from(aiSmeExperts)
    .where(eq(aiSmeExperts.expertId, data.expertId))
    .limit(1);
  
  if (expert.length > 0) {
    await db.insert(expertChatMessages).values({
      sessionId: chatSession.id,
      senderId: data.expertId,
      senderType: 'expert',
      message: `Hello! I'm ${expert[0].name}. I understand you need help with "${data.topic}". Let's discuss how I can assist you.`,
      messageType: 'text',
    });
  }
  
  return {
    consultation,
    chatSession,
  };
}

/**
 * Assemble Expert Team
 * Creates a multi-disciplinary team for complex projects
 */
export async function assembleTeam(data: {
  userId: string;
  projectId: string;
  teamName: string;
  requirements: {
    categories: string[];
    size: number;
    expertise: string[];
  };
}): Promise<any> {
  // Match experts for each category
  const teamMembers = [];
  
  for (const category of data.requirements.categories) {
    const matches = await matchExperts({
      category,
      expertise: data.requirements.expertise,
      teamSize: 1,
    });
    
    if (matches.length > 0) {
      teamMembers.push(matches[0]);
    }
  }
  
  // Create team
  const [team] = await db.insert(aiSmeTeams).values({
    userId: data.userId,
    projectId: data.projectId,
    teamName: data.teamName,
    status: 'active',
  }).returning();
  
  // Add team members
  for (const expert of teamMembers) {
    await db.insert(aiSmeTeamMembers).values({
      teamId: team.id,
      expertId: expert.expertId,
      role: expert.category,
      status: 'active',
    });
  }
  
  return {
    team,
    members: teamMembers,
  };
}

/**
 * Facilitate Team Collaboration
 * Enables experts to collaborate on complex problems
 */
export async function facilitateCollaboration(data: {
  teamId: string;
  topic: string;
  problem: string;
  context: any;
}): Promise<any> {
  // Get team members
  const teamMembers = await db.select()
    .from(aiSmeTeamMembers)
    .where(eq(aiSmeTeamMembers.teamId, data.teamId));
  
  // Create collaboration session
  const [collaboration] = await db.insert(aiSmeCollaborations).values({
    teamId: data.teamId,
    topic: data.topic,
    status: 'active',
    context: data.context,
  }).returning();
  
  // Simulate expert discussions (in production, would use AI to generate)
  const discussions = await generateExpertDiscussions(
    teamMembers,
    data.problem,
    data.context
  );
  
  // Synthesize recommendations
  const synthesis = await synthesizeExpertOpinions(discussions);
  
  return {
    collaboration,
    discussions,
    synthesis,
  };
}

/**
 * Get Consultation History
 */
export async function getConsultationHistory(userId: string): Promise<any[]> {
  const consultations = await db.select()
    .from(aiSmeConsultations)
    .where(eq(aiSmeConsultations.userId, userId))
    .orderBy(desc(aiSmeConsultations.createdAt));
  
  // Enrich with expert details
  const enriched = [];
  
  for (const consultation of consultations) {
    const expert = await db.select()
      .from(aiSmeExperts)
      .where(eq(aiSmeExperts.expertId, consultation.expertId))
      .limit(1);
    
    enriched.push({
      ...consultation,
      expert: expert[0],
    });
  }
  
  return enriched;
}

/**
 * Rate Consultation
 */
export async function rateConsultation(data: {
  consultationId: string;
  rating: number;
  feedback: string;
}): Promise<void> {
  // Update consultation
  await db.update(aiSmeConsultations)
    .set({
      rating: data.rating,
      feedback: data.feedback,
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(aiSmeConsultations.id, data.consultationId));
  
  // Update expert rating
  const consultation = await db.select()
    .from(aiSmeConsultations)
    .where(eq(aiSmeConsultations.id, data.consultationId))
    .limit(1);
  
  if (consultation.length > 0) {
    const expert = await db.select()
      .from(aiSmeExperts)
      .where(eq(aiSmeExperts.expertId, consultation[0].expertId))
      .limit(1);
    
    if (expert.length > 0) {
      const currentRating = expert[0].rating || 5.0;
      const currentCount = expert[0].consultationCount || 0;
      
      // Calculate new average rating
      const newRating = ((currentRating * currentCount) + data.rating) / (currentCount + 1);
      
      await db.update(aiSmeExperts)
        .set({
          rating: newRating,
          consultationCount: currentCount + 1,
        })
        .where(eq(aiSmeExperts.expertId, consultation[0].expertId));
    }
  }
}

/**
 * Send Message in Consultation
 */
export async function sendConsultationMessage(data: {
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'expert';
  message: string;
}): Promise<any> {
  // Store message
  const [msg] = await db.insert(expertChatMessages).values({
    sessionId: data.sessionId,
    senderId: data.senderId,
    senderType: data.senderType,
    message: data.message,
    messageType: 'text',
  }).returning();
  
  // If user sent message, generate expert response (would use AI in production)
  if (data.senderType === 'user') {
    const response = await generateExpertResponse(data.sessionId, data.message);
    
    const session = await db.select()
      .from(expertChatSessions)
      .where(eq(expertChatSessions.id, data.sessionId))
      .limit(1);
    
    if (session.length > 0) {
      const [expertMsg] = await db.insert(expertChatMessages).values({
        sessionId: data.sessionId,
        senderId: session[0].expertId,
        senderType: 'expert',
        message: response,
        messageType: 'text',
      }).returning();
      
      return {
        userMessage: msg,
        expertResponse: expertMsg,
      };
    }
  }
  
  return { userMessage: msg };
}

/**
 * Get Chat Messages
 */
export async function getChatMessages(sessionId: string): Promise<any[]> {
  const messages = await db.select()
    .from(expertChatMessages)
    .where(eq(expertChatMessages.sessionId, sessionId))
    .orderBy(expertChatMessages.createdAt);
  
  return messages;
}

// Helper functions (simplified - would use AI in production)

async function generateExpertDiscussions(
  teamMembers: any[],
  problem: string,
  context: any
): Promise<any[]> {
  // Simulate expert discussions
  return teamMembers.map(member => ({
    expertId: member.expertId,
    perspective: `From a ${member.role} perspective, I recommend...`,
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    concerns: ['Concern 1'],
  }));
}

async function synthesizeExpertOpinions(discussions: any[]): Promise<any> {
  // Synthesize expert opinions
  return {
    consensus: 'The team agrees that...',
    recommendations: discussions.flatMap(d => d.recommendations),
    nextSteps: ['Step 1', 'Step 2', 'Step 3'],
  };
}

async function generateExpertResponse(sessionId: string, userMessage: string): Promise<string> {
  // Would use AI to generate contextual expert response
  return `Thank you for sharing that. Based on what you've told me, I suggest...`;
}
