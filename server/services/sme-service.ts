/**
 * SME (Subject Matter Expert) Service
 * Manages 323 AI experts across 16 categories with panel assembly
 */

import { getDb } from '../db';
import { aiSmeExperts, aiSmeConsultations } from '../../drizzle/schema';
import { eq, and, inArray, like, or } from 'drizzle-orm';
import { allExperts, type AIExpert } from '../../client/src/data/aiExperts';
import { panelTypes, type PanelType } from '../../client/src/data/smePanels';

/**
 * Load all 323 experts from frontend data into database
 * This should be run once during initial setup
 */
export async function loadExperts() {
  const loadedExperts = [];

  for (const expert of allExperts) {
    // Check if expert already exists
    const existing = await (await getDb()).select()
      .from(aiSmeExperts)
      .where(eq(aiSmeExperts.expertId, expert.id))
      .limit(1);

    if (existing.length === 0) {
      // Insert new expert
      const [inserted] = await (await getDb()).insert(aiSmeExperts).values({
        expertId: expert.id,
        name: expert.name,
        title: expert.title,
        category: expert.category,
        avatar: expert.avatar,
        expertise: expert.expertise,
        bio: expert.bio,
        yearsExperience: expert.yearsExperience,
        notableWork: expert.notableWork,
        approach: expert.approach,
        whenToConsult: expert.whenToConsult,
        specializations: expert.specializations || [],
        industries: expert.industries || [],
        geographies: expert.geographies || [],
        languages: expert.languages || ['English'],
        availability: 'available',
        rating: 5.0,
        consultationCount: 0,
      }).returning();

      loadedExperts.push(inserted);
    }
  }

  return {
    totalExperts: allExperts.length,
    loadedExperts: loadedExperts.length,
    message: `Loaded ${loadedExperts.length} new experts (${allExperts.length} total in system)`
  };
}

/**
 * Get all experts
 */
export async function getAllExperts() {
  const experts = await (await getDb()).select()
    .from(aiSmeExperts)
    .where(eq(aiSmeExperts.availability, 'available'))
    .orderBy(aiSmeExperts.rating);

  return experts;
}

/**
 * Get expert by ID
 */
export async function getExpert(expertId: string) {
  const [expert] = await (await getDb()).select()
    .from(aiSmeExperts)
    .where(eq(aiSmeExperts.expertId, expertId));

  return expert;
}

/**
 * Get experts by category
 */
export async function getExpertsByCategory(category: string) {
  const experts = await (await getDb()).select()
    .from(aiSmeExperts)
    .where(
      and(
        eq(aiSmeExperts.category, category),
        eq(aiSmeExperts.availability, 'available')
      )
    )
    .orderBy(aiSmeExperts.rating);

  return experts;
}

/**
 * Search experts by name, expertise, or specialization
 */
export async function searchExperts(query: string) {
  const searchTerm = `%${query}%`;
  
  const experts = await (await getDb()).select()
    .from(aiSmeExperts)
    .where(
      and(
        or(
          like(aiSmeExperts.name, searchTerm),
          like(aiSmeExperts.title, searchTerm),
          like(aiSmeExperts.expertise, searchTerm),
          like(aiSmeExperts.bio, searchTerm)
        ),
        eq(aiSmeExperts.availability, 'available')
      )
    )
    .orderBy(aiSmeExperts.rating);

  return experts;
}

/**
 * Assemble an expert panel for a project
 * 
 * @param projectType - Type of project (e.g., 'investment', 'startup', 'market_entry')
 * @param panelType - 'blue_team' (core), 'left_field' (diverse), or 'red_team' (challenge)
 * @param size - Number of experts (default 5)
 */
export async function assemblePanel(
  projectType: string,
  panelType: PanelType,
  size: number = 5
) {
  // Define category priorities based on project type
  const categoryPriorities: Record<string, string[]> = {
    investment: [
      'Investment & Finance',
      'Entrepreneurship & Strategy',
      'Legal & Compliance',
      'Tax & Accounting'
    ],
    startup: [
      'Entrepreneurship & Strategy',
      'Investment & Finance',
      'Marketing & Brand',
      'Technology & AI'
    ],
    market_entry: [
      'Entrepreneurship & Strategy',
      'Regional Specialists',
      'Marketing & Brand',
      'Operations & Supply Chain'
    ],
    technology: [
      'Technology & AI',
      'Entrepreneurship & Strategy',
      'Investment & Finance',
      'Operations & Supply Chain'
    ],
    healthcare: [
      'Healthcare & Biotech',
      'Legal & Compliance',
      'Investment & Finance',
      'Government & Policy'
    ],
  };

  const priorities = categoryPriorities[projectType] || [
    'Entrepreneurship & Strategy',
    'Investment & Finance',
    'Marketing & Brand'
  ];

  // Get experts from priority categories
  const panel = [];
  
  for (const category of priorities) {
    const categoryExperts = await getExpertsByCategory(category);
    
    // Filter by panel type suitability
    const suitableExperts = categoryExperts.filter(expert => {
      if (panelType === 'blue_team') {
        // Blue team: highest rated, most experienced
        return expert.rating >= 4.5;
      } else if (panelType === 'left_field') {
        // Left-field: diverse backgrounds, creative thinkers
        return expert.category === 'Left Field' || 
               expert.category === 'Celebrity Crossover' ||
               expert.category === 'Media & Entertainment';
      } else if (panelType === 'red_team') {
        // Red team: critical thinkers, risk experts
        return expert.expertise.toLowerCase().includes('risk') ||
               expert.expertise.toLowerCase().includes('compliance') ||
               expert.expertise.toLowerCase().includes('due diligence') ||
               expert.category === 'Legal & Compliance' ||
               expert.category === 'Government & Policy';
      }
      return true;
    });

    // Add top experts from this category
    const toAdd = Math.min(suitableExperts.length, Math.ceil(size / priorities.length));
    panel.push(...suitableExperts.slice(0, toAdd));

    if (panel.length >= size) break;
  }

  // Ensure we have exactly the requested size
  return panel.slice(0, size);
}

/**
 * Request a consultation with an expert
 */
export async function requestConsultation(
  userId: string,
  expertId: string,
  question: string,
  context?: any
) {
  // Create consultation record
  const [consultation] = await (await getDb()).insert(aiSmeConsultations).values({
    userId,
    expertId,
    question,
    context,
    status: 'pending',
  }).returning();

  // Get expert details
  const expert = await getExpert(expertId);
  if (!expert) throw new Error('Expert not found');

  // Generate response (this would integrate with LLM service)
  const response = await generateExpertResponse(expert, question, context);

  // Update consultation with response
  await (await getDb()).update(aiSmeConsultations)
    .set({
      response,
      status: 'completed',
      respondedAt: new Date(),
    })
    .where(eq(aiSmeConsultations.id, consultation.id));

  // Increment consultation count
  await (await getDb()).update(aiSmeExperts)
    .set({
      consultationCount: expert.consultationCount + 1,
    })
    .where(eq(aiSmeExperts.expertId, expertId));

  return {
    consultationId: consultation.id,
    expert,
    question,
    response,
  };
}

/**
 * Generate expert response (placeholder for LLM integration)
 */
async function generateExpertResponse(
  expert: any,
  question: string,
  context?: any
): Promise<string> {
  // This would integrate with the LLM service to generate a response
  // in the expert's voice based on their expertise and approach
  
  return `As ${expert.name}, ${expert.title}, with ${expert.yearsExperience} years of experience in ${expert.expertise}, here's my perspective on your question:

"${question}"

${expert.approach}

Based on my experience with ${expert.notableWork}, I recommend:

1. [Key recommendation 1]
2. [Key recommendation 2]
3. [Key recommendation 3]

${expert.whenToConsult}

Would you like me to elaborate on any of these points?`;
}

/**
 * Get consultation history for a user
 */
export async function getConsultationHistory(userId: string, limit: number = 20) {
  const consultations = await (await getDb()).select()
    .from(aiSmeConsultations)
    .where(eq(aiSmeConsultations.userId, userId))
    .orderBy(aiSmeConsultations.createdAt)
    .limit(limit);

  return consultations;
}

/**
 * Submit feedback for a consultation
 */
export async function submitFeedback(
  consultationId: string,
  rating: number,
  comment?: string
) {
  // Update consultation with feedback
  await (await getDb()).update(aiSmeConsultations)
    .set({
      rating,
      feedback: comment,
    })
    .where(eq(aiSmeConsultations.id, consultationId));

  // Update expert's average rating
  const [consultation] = await (await getDb()).select()
    .from(aiSmeConsultations)
    .where(eq(aiSmeConsultations.id, consultationId));

  if (consultation) {
    const expert = await getExpert(consultation.expertId);
    if (expert) {
      // Calculate new average rating
      const totalRating = expert.rating * expert.consultationCount;
      const newRating = (totalRating + rating) / (expert.consultationCount + 1);

      await (await getDb()).update(aiSmeExperts)
        .set({ rating: newRating })
        .where(eq(aiSmeExperts.expertId, consultation.expertId));
    }
  }

  return true;
}

/**
 * Get expert statistics
 */
export async function getExpertStats() {
  const allExperts = await getAllExperts();

  const stats = {
    totalExperts: allExperts.length,
    byCategory: {} as Record<string, number>,
    averageRating: 0,
    totalConsultations: 0,
  };

  allExperts.forEach(expert => {
    stats.byCategory[expert.category] = (stats.byCategory[expert.category] || 0) + 1;
    stats.averageRating += expert.rating;
    stats.totalConsultations += expert.consultationCount;
  });

  stats.averageRating = stats.averageRating / allExperts.length;

  return stats;
}
