/**
 * Document Service Types and DTOs
 * 
 * Data Transfer Objects for document library services.
 */

/**
 * DTO for creating a library document
 */
export interface CreateDocumentDto {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  fileUrl?: string;
  fileType?: string;
  content?: string;
  metadata?: Record<string, any>;
}

/**
 * DTO for updating a document
 */
export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  fileUrl?: string;
  fileType?: string;
  content?: string;
  metadata?: Record<string, any>;
}

/**
 * DTO for document response
 */
export interface DocumentDto {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  fileUrl: string | null;
  fileType: string | null;
  content: string | null;
  metadata: Record<string, any> | null;
  accessCount: number;
  lastAccessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for document search filters
 */
export interface DocumentSearchDto {
  query?: string;
  category?: string;
  tags?: string[];
  fileType?: string;
}

/**
 * DTO for document statistics
 */
export interface DocumentStatsDto {
  totalDocuments: number;
  categoryCounts: Record<string, number>;
  mostAccessed: DocumentDto[];
  recentlyAdded: DocumentDto[];
}
