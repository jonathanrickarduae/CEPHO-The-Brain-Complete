/**
 * Zod Validation Schemas
 * 
 * Centralized validation schemas for all services
 */

import { z } from 'zod';

// ============================================================================
// Mood Service Schemas
// ============================================================================

export const MoodEntrySchema = z.object({
  score: z.number().min(0).max(100),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  note: z.string().optional(),
});

export const MoodHistoryQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  days: z.number().min(1).max(365).optional(),
});

// ============================================================================
// Expert Service Schemas
// ============================================================================

export const ExpertChatSessionSchema = z.object({
  expertId: z.string().min(1),
  expertName: z.string().min(1),
  systemPrompt: z.string().min(1),
  projectId: z.number().optional(),
});

export const ExpertMessageSchema = z.object({
  sessionId: z.number(),
  message: z.string().min(1).max(10000),
  expertId: z.string(),
  expertData: z.any(),
});

export const ExpertConsultationSchema = z.object({
  expertId: z.string(),
  topic: z.string().min(1),
  context: z.string().optional(),
  projectId: z.number().optional(),
});

// ============================================================================
// Project Service Schemas
// ============================================================================

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.date().optional(),
  expertId: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  progress: z.number().min(0).max(100).optional(),
  dueDate: z.date().optional(),
  blockers: z.string().optional(),
});

// ============================================================================
// Business Plan Service Schemas
// ============================================================================

export const CreateBusinessPlanReviewSchema = z.object({
  planId: z.number(),
  version: z.number(),
  content: z.string().min(1),
  expertFeedback: z.string().optional(),
});

export const UpdateBusinessPlanReviewSchema = z.object({
  content: z.string().min(1).optional(),
  expertFeedback: z.string().optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'rejected']).optional(),
});

// ============================================================================
// Document Service Schemas
// ============================================================================

export const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const SearchDocumentsSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// ============================================================================
// Analytics Service Schemas
// ============================================================================

export const AnalyticsDateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const AnalyticsMetricsSchema = z.object({
  metricType: z.enum(['revenue', 'quality', 'learning', 'engagement']),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// ============================================================================
// Integration Service Schemas
// ============================================================================

export const CreateIntegrationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['api', 'webhook', 'oauth']),
  config: z.record(z.any()),
  isActive: z.boolean().optional(),
});

export const UpdateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// AI Agent Service Schemas
// ============================================================================

export const AgentReportSchema = z.object({
  agentId: z.string(),
  date: z.date(),
  activities: z.array(z.string()),
  improvements: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const AgentApprovalRequestSchema = z.object({
  agentId: z.string(),
  type: z.enum(['feature', 'integration', 'learning', 'other']),
  description: z.string().min(1),
  expectedImpact: z.string().optional(),
});

// ============================================================================
// Communication Service Schemas
// ============================================================================

export const SendMessageSchema = z.object({
  to: z.number(),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string()).optional(),
});

// ============================================================================
// Settings Service Schemas
// ============================================================================

export const UpdateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  emailDigest: z.enum(['none', 'daily', 'weekly']).optional(),
});

// ============================================================================
// Review Service Schemas
// ============================================================================

export const CreateReviewSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(['project', 'document', 'expert', 'plan']),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// ============================================================================
// Team Service Schemas
// ============================================================================

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const AddTeamMemberSchema = z.object({
  userId: z.number(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
});

// ============================================================================
// Common Schemas
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const IdSchema = z.object({
  id: z.number().positive(),
});

export const IdsSchema = z.object({
  ids: z.array(z.number().positive()),
});
