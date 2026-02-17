/**
 * Digital Twin Training Service
 * Handles document processing, interview storage, and training metrics
 */

import { createTrainingDocument, getTrainingDocuments, createMemory, recordFeedback } from '../db';

export interface TrainingDocumentInput {
  userId: number;
  type: 'document' | 'conversation' | 'preference' | 'memory';
  name: string;
  content: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface InterviewResponse {
  questionId: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  timestamp: Date;
}

export interface TrainingMetrics {
  totalHours: number;
  documentCount: number;
  interviewCount: number;
  feedbackCount: number;
  voiceNoteCount: number;
  accuracyScore: number;
  confidenceLevel: number;
  lastTrainingDate: Date;
  trainingByCategory: Record<string, number>;
}

/**
 * Process uploaded document for training
 */
export async function processDocumentForTraining(
  userId: string,
  document: {
    filename: string;
    content: string;
    mimeType: string;
  }
): Promise<{ success: boolean; documentId?: string; extractedTopics?: string[] }> {
  try {
    // Extract key information from document
    const extractedTopics = extractTopicsFromContent(document.content);
    
    // Store in training database
    const trainingDoc = await createTrainingDocument({
      userId: parseInt(userId),
      type: 'document',
      name: document.filename,
      content: document.content,
    });

    return {
      success: true,
      documentId: trainingDoc?.id?.toString(),
      extractedTopics,
    };
  } catch (error) {
    console.error('Document processing error:', error);
    return { success: false };
  }
}

/**
 * Store interview response for training
 */
export async function storeInterviewResponse(
  userId: string,
  response: InterviewResponse
): Promise<{ success: boolean }> {
  try {
    await createTrainingDocument({
      userId: parseInt(userId),
      type: 'conversation',
      name: `Interview: ${response.category}`,
      content: JSON.stringify({
        question: response.question,
        answer: response.answer,
        questionId: response.questionId,
        category: response.category,
        confidence: response.confidence,
      }),
    });

    // Also store as memory for quick retrieval
    await createMemory({
      userId: parseInt(userId),
      category: 'preference',
      key: response.questionId,
      value: response.answer,
    });

    return { success: true };
  } catch (error) {
    console.error('Interview storage error:', error);
    return { success: false };
  }
}

/**
 * Calculate training metrics for a user
 */
export async function calculateTrainingMetrics(userId: string): Promise<TrainingMetrics> {
  try {
    const documents = await getTrainingDocuments(parseInt(userId));
    
    // Calculate metrics
    const documentCount = documents.filter(d => d.type === 'document').length;
    const interviewCount = documents.filter(d => d.type === 'conversation').length;
    const feedbackCount = documents.filter(d => d.type === 'memory').length;
    const voiceNoteCount = documents.filter(d => d.type === 'preference').length;
    
    // Estimate training hours (rough calculation)
    // Documents: 0.5h per 1000 words
    // Interviews: 0.1h per response
    // Feedback: 0.05h per item
    const totalWords = documents.reduce((sum, d) => {
      const wordCount = (d.content || '').split(/\s+/).length;
      return sum + wordCount;
    }, 0);
    
    const totalHours = (totalWords / 1000 * 0.5) + (interviewCount * 0.1) + (feedbackCount * 0.05);
    
    // Calculate accuracy based on feedback
    const feedbackDocs = documents.filter(d => d.type === 'memory');
    const positiveCount = feedbackDocs.filter(d => {
      try {
        const data = JSON.parse(d.content || '{}');
        return data.rating === 'positive';
      } catch { return false; }
    }).length;
    const accuracyScore = feedbackDocs.length > 0 ? positiveCount / feedbackDocs.length : 0.5;
    
    // Confidence level based on training volume
    const confidenceLevel = Math.min(1, totalHours / 20); // Max confidence at 20 hours
    
    // Training by category
    const trainingByCategory: Record<string, number> = {};
    documents.forEach(d => {
      const category = d.type;
      trainingByCategory[category] = (trainingByCategory[category] || 0) + 1;
    });
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      documentCount,
      interviewCount,
      feedbackCount,
      voiceNoteCount,
      accuracyScore: Math.round(accuracyScore * 100) / 100,
      confidenceLevel: Math.round(confidenceLevel * 100) / 100,
      lastTrainingDate: documents.length > 0 
        ? new Date(Math.max(...documents.map(d => new Date(d.createdAt).getTime())))
        : new Date(),
      trainingByCategory,
    };
  } catch (error) {
    console.error('Metrics calculation error:', error);
    return {
      totalHours: 0,
      documentCount: 0,
      interviewCount: 0,
      feedbackCount: 0,
      voiceNoteCount: 0,
      accuracyScore: 0.5,
      confidenceLevel: 0,
      lastTrainingDate: new Date(),
      trainingByCategory: {},
    };
  }
}

/**
 * Record feedback for Digital Twin learning
 */
export async function recordDigitalTwinFeedback(
  userId: string,
  feedback: {
    responseId: string;
    rating: 'positive' | 'negative' | 'neutral';
    correction?: string;
    context: string;
  }
): Promise<{ success: boolean }> {
  try {
    await recordFeedback({
      userId: parseInt(userId),
      feedbackType: feedback.rating,
      expertId: feedback.responseId,
      feedbackText: feedback.context,
      correctedOutput: feedback.correction || null,
    });

    // Store as training document for future learning
    await createTrainingDocument({
      userId: parseInt(userId),
      type: 'memory',
      name: `Feedback: ${feedback.responseId}`,
      content: JSON.stringify({
        correction: feedback.correction || '',
        responseId: feedback.responseId,
        rating: feedback.rating,
        context: feedback.context,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Feedback recording error:', error);
    return { success: false };
  }
}

/**
 * Extract topics from document content
 */
function extractTopicsFromContent(content: string): string[] {
  // Simple keyword extraction (would use NLP in production)
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those']);
  
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    const cleaned = word.replace(/[^a-z]/g, '');
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });
  
  // Return top 10 most frequent words as topics
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Get training recommendations
 */
export function getTrainingRecommendations(metrics: TrainingMetrics): string[] {
  const recommendations: string[] = [];
  
  if (metrics.totalHours < 5) {
    recommendations.push('Upload more documents to improve your Digital Twin\'s knowledge base');
  }
  
  if (metrics.interviewCount < 10) {
    recommendations.push('Complete more quick-fire interviews to capture your decision-making style');
  }
  
  if (metrics.feedbackCount < 20) {
    recommendations.push('Provide more feedback on Digital Twin responses to improve accuracy');
  }
  
  if (metrics.accuracyScore < 0.8) {
    recommendations.push('Review and correct more responses to help your Digital Twin learn your preferences');
  }
  
  if (metrics.voiceNoteCount < 5) {
    recommendations.push('Record voice notes throughout the day to capture your thought patterns');
  }
  
  // Category-specific recommendations
  const categories = Object.keys(metrics.trainingByCategory);
  if (!categories.includes('financial')) {
    recommendations.push('Add financial documents to train your Digital Twin on financial analysis');
  }
  if (!categories.includes('legal')) {
    recommendations.push('Upload legal documents to improve contract review capabilities');
  }
  
  return recommendations;
}
