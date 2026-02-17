import { DocumentRepository } from './document.repository';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentDto,
  DocumentSearchDto,
  DocumentStatsDto,
} from './document.types';
import { logger } from '../../utils/logger';

const log = logger.module('DocumentService');

/**
 * Document Service
 * 
 * Handles business logic for document library:
 * - Creating and managing documents
 * - Search and filtering
 * - Access tracking
 * - Document organization
 */
export class DocumentService {
  constructor(private repository: DocumentRepository) {}

  /**
   * Create a new document
   */
  async createDocument(userId: number, data: CreateDocumentDto): Promise<DocumentDto> {
    // Validation
    this.validateTitle(data.title);

    const document = await this.repository.create({
      userId,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      fileUrl: data.fileUrl || null,
      fileType: data.fileType || null,
      content: data.content || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      accessCount: 0,
      lastAccessedAt: null,
    });

    log.info({ userId, documentId: document.id, title: data.title }, 'Document created');

    return this.toDto(document);
  }

  /**
   * Get document by ID
   */
  async getDocument(userId: number, documentId: number): Promise<DocumentDto | null> {
    const document = await this.repository.findById(documentId, userId);
    
    if (document) {
      // Track access
      await this.repository.incrementAccessCount(documentId, userId);
    }

    return document ? this.toDto(document) : null;
  }

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: number): Promise<DocumentDto[]> {
    const documents = await this.repository.findByUserId(userId);
    return documents.map(d => this.toDto(d));
  }

  /**
   * Search documents
   */
  async searchDocuments(userId: number, search: DocumentSearchDto): Promise<DocumentDto[]> {
    let documents;

    if (search.query) {
      documents = await this.repository.search(userId, search.query);
    } else if (search.category) {
      documents = await this.repository.findByCategory(userId, search.category);
    } else if (search.fileType) {
      documents = await this.repository.findByFileType(userId, search.fileType);
    } else {
      documents = await this.repository.findByUserId(userId);
    }

    // Filter by tags if specified
    if (search.tags && search.tags.length > 0) {
      documents = documents.filter(doc => {
        if (!doc.tags) return false;
        const docTags = typeof doc.tags === 'string' ? JSON.parse(doc.tags) : doc.tags;
        return search.tags!.some(tag => docTags.includes(tag));
      });
    }

    return documents.map(d => this.toDto(d));
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(userId: number, category: string): Promise<DocumentDto[]> {
    const documents = await this.repository.findByCategory(userId, category);
    return documents.map(d => this.toDto(d));
  }

  /**
   * Get documents by file type
   */
  async getDocumentsByFileType(userId: number, fileType: string): Promise<DocumentDto[]> {
    const documents = await this.repository.findByFileType(userId, fileType);
    return documents.map(d => this.toDto(d));
  }

  /**
   * Update document
   */
  async updateDocument(
    userId: number,
    documentId: number,
    data: UpdateDocumentDto
  ): Promise<DocumentDto | null> {
    // Validation
    if (data.title) {
      this.validateTitle(data.title);
    }

    const updateData: any = { ...data };

    // Convert arrays to JSON strings for storage
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    if (data.metadata) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    const updated = await this.repository.update(documentId, userId, updateData);

    if (updated) {
      log.info({ userId, documentId, updates: Object.keys(data) }, 'Document updated');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Delete document
   */
  async deleteDocument(userId: number, documentId: number): Promise<boolean> {
    const deleted = await this.repository.delete(documentId, userId);

    if (deleted) {
      log.info({ userId, documentId }, 'Document deleted');
    }

    return deleted;
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(userId: number): Promise<DocumentStatsDto> {
    const [
      totalDocuments,
      categoryCounts,
      mostAccessed,
      recentlyAdded,
    ] = await Promise.all([
      this.repository.findByUserId(userId).then(docs => docs.length),
      this.repository.countByCategory(userId),
      this.repository.findMostAccessed(userId, 5),
      this.repository.findRecentlyAdded(userId, 5),
    ]);

    return {
      totalDocuments,
      categoryCounts,
      mostAccessed: mostAccessed.map(d => this.toDto(d)),
      recentlyAdded: recentlyAdded.map(d => this.toDto(d)),
    };
  }

  /**
   * Get all categories
   */
  async getCategories(userId: number): Promise<string[]> {
    return await this.repository.getCategories(userId);
  }

  /**
   * Add tag to document
   */
  async addTag(userId: number, documentId: number, tag: string): Promise<DocumentDto | null> {
    const document = await this.repository.findById(documentId, userId);
    if (!document) return null;

    const currentTags = document.tags 
      ? (typeof document.tags === 'string' ? JSON.parse(document.tags) : document.tags)
      : [];

    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
    }

    const updated = await this.repository.update(documentId, userId, {
      tags: JSON.stringify(currentTags),
    });

    if (updated) {
      log.info({ userId, documentId, tag }, 'Tag added to document');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Remove tag from document
   */
  async removeTag(userId: number, documentId: number, tag: string): Promise<DocumentDto | null> {
    const document = await this.repository.findById(documentId, userId);
    if (!document) return null;

    const currentTags = document.tags 
      ? (typeof document.tags === 'string' ? JSON.parse(document.tags) : document.tags)
      : [];

    const updatedTags = currentTags.filter((t: string) => t !== tag);

    const updated = await this.repository.update(documentId, userId, {
      tags: JSON.stringify(updatedTags),
    });

    if (updated) {
      log.info({ userId, documentId, tag }, 'Tag removed from document');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Get most accessed documents
   */
  async getMostAccessedDocuments(userId: number, limit: number = 10): Promise<DocumentDto[]> {
    const documents = await this.repository.findMostAccessed(userId, limit);
    return documents.map(d => this.toDto(d));
  }

  /**
   * Get recently added documents
   */
  async getRecentlyAddedDocuments(userId: number, limit: number = 10): Promise<DocumentDto[]> {
    const documents = await this.repository.findRecentlyAdded(userId, limit);
    return documents.map(d => this.toDto(d));
  }

  // Private helper methods

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Document title is required');
    }
    if (title.length > 200) {
      throw new Error('Document title must be 200 characters or less');
    }
  }

  private toDto(document: any): DocumentDto {
    return {
      id: document.id,
      userId: document.userId,
      title: document.title,
      description: document.description,
      category: document.category,
      tags: document.tags 
        ? (typeof document.tags === 'string' ? JSON.parse(document.tags) : document.tags)
        : null,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      content: document.content,
      metadata: document.metadata 
        ? (typeof document.metadata === 'string' ? JSON.parse(document.metadata) : document.metadata)
        : null,
      accessCount: document.accessCount,
      lastAccessedAt: document.lastAccessedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

// Export singleton instance
import { DocumentRepository as DocumentRepo } from './document.repository';
export const documentService = new DocumentService(new DocumentRepo());
