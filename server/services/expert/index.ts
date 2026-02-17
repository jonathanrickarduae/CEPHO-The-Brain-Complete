/**
 * Expert Service Module
 * 
 * Exports all expert-related services, repositories, and types.
 */

export { ExpertService, expertService } from './expert.service';
export { ExpertRepository } from './expert.repository';
export type {
  CreateExpertChatSessionDto,
  CreateExpertChatMessageDto,
  CreateExpertConsultationDto,
  CreateExpertMemoryDto,
  UpdateExpertPerformanceDto,
  ExpertChatSessionDto,
  ExpertChatMessageDto,
  ExpertConsultationDto,
  ExpertPerformanceDto,
  ExpertMemoryDto,
} from './expert.types';
