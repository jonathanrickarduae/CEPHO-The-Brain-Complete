/**
 * Expert Service Types and DTOs
 * 
 * Data Transfer Objects for AI expert services.
 */

/**
 * DTO for creating an expert chat session
 */
export interface CreateExpertChatSessionDto {
  expertId: string;
  topic?: string;
}

/**
 * DTO for creating an expert chat message
 */
export interface CreateExpertChatMessageDto {
  sessionId: number;
  role: 'user' | 'expert';
  content: string;
  metadata?: Record<string, any>;
}

/**
 * DTO for expert chat session response
 */
export interface ExpertChatSessionDto {
  id: number;
  userId: number;
  expertId: string;
  topic: string | null;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for expert chat message response
 */
export interface ExpertChatMessageDto {
  id: number;
  sessionId: number;
  role: 'user' | 'expert';
  content: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * DTO for creating expert consultation
 */
export interface CreateExpertConsultationDto {
  expertId: string;
  topic: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * DTO for expert consultation response
 */
export interface ExpertConsultationDto {
  id: number;
  userId: number;
  expertId: string;
  topic: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

/**
 * DTO for expert performance metrics
 */
export interface ExpertPerformanceDto {
  id: number;
  userId: number;
  expertId: string;
  score: number;
  projectsCompleted: number;
  positiveFeedback: number;
  negativeFeedback: number;
  lastUsed: Date | null;
  status: 'active' | 'training' | 'fired';
  notes: string | null;
}

/**
 * DTO for updating expert performance
 */
export interface UpdateExpertPerformanceDto {
  score?: number;
  projectsCompleted?: number;
  positiveFeedback?: number;
  negativeFeedback?: number;
  status?: 'active' | 'training' | 'fired';
  notes?: string;
}

/**
 * DTO for expert conversation
 */
export interface ExpertConversationDto {
  id: number;
  userId: number;
  expertId: string;
  conversationType: 'chat' | 'consultation' | 'coaching' | 'research';
  content: string;
  response: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * DTO for creating expert memory
 */
export interface CreateExpertMemoryDto {
  expertId: string;
  memoryType: 'fact' | 'preference' | 'pattern' | 'insight';
  content: string;
  context?: string;
  importance?: number;
}

/**
 * DTO for expert memory response
 */
export interface ExpertMemoryDto {
  id: number;
  userId: number;
  expertId: string;
  memoryType: 'fact' | 'preference' | 'pattern' | 'insight';
  content: string;
  context: string | null;
  importance: number;
  lastAccessed: Date | null;
  createdAt: Date;
}
