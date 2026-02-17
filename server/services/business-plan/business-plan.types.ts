/**
 * Business Plan Service Types and DTOs
 * 
 * Data Transfer Objects for business plan review services.
 */

/**
 * DTO for creating a business plan review
 */
export interface CreateBusinessPlanReviewDto {
  businessPlanContent: string;
  reviewType?: 'initial' | 'revision' | 'final';
  notes?: string;
}

/**
 * DTO for business plan review response
 */
export interface BusinessPlanReviewDto {
  id: number;
  userId: number;
  versionNumber: number;
  businessPlanContent: string;
  reviewNotes: string | null;
  expertFeedback: string | null;
  createdAt: Date;
}

/**
 * DTO for updating a business plan review
 */
export interface UpdateBusinessPlanReviewDto {
  reviewNotes?: string;
  expertFeedback?: string;
}

/**
 * DTO for business plan review summary
 */
export interface BusinessPlanReviewSummaryDto {
  totalReviews: number;
  latestVersion: number;
  lastReviewDate: Date | null;
  hasExpertFeedback: boolean;
}
