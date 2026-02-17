/**
 * Document Service Module
 * 
 * Exports all document-related services, repositories, and types.
 */

export { DocumentService, documentService } from './document.service';
export { DocumentRepository } from './document.repository';
export type {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentDto,
  DocumentSearchDto,
  DocumentStatsDto,
} from './document.types';
