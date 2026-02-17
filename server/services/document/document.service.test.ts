/**
 * Document Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { documentService } from './document.service';
import * as documentRepository from './document.repository';

vi.mock('./document.repository');

describe('DocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const mockDocument = {
        id: 1,
        userId: 1,
        title: 'Test Doc',
        content: 'Content',
        category: 'general',
        isPublic: false,
        createdAt: new Date(),
      };

      vi.spyOn(documentRepository, 'createDocument').mockResolvedValue(mockDocument);

      const result = await documentService.createDocument(1, {
        title: 'Test Doc',
        content: 'Content',
      });

      expect(result).toEqual(mockDocument);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by query', async () => {
      const mockResults = [
        { id: 1, title: 'Result 1' },
        { id: 2, title: 'Result 2' },
      ];

      vi.spyOn(documentRepository, 'searchDocuments').mockResolvedValue(mockResults as any);

      const result = await documentService.searchDocuments(1, {
        query: 'test',
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('getDocumentsByCategory', () => {
    it('should return documents filtered by category', async () => {
      const mockDocs = [
        { id: 1, category: 'tech' },
        { id: 2, category: 'tech' },
      ];

      vi.spyOn(documentRepository, 'getDocumentsByCategory').mockResolvedValue(mockDocs as any);

      const result = await documentService.getDocumentsByCategory(1, 'tech');

      expect(result).toHaveLength(2);
    });
  });

  describe('trackAccess', () => {
    it('should track document access', async () => {
      vi.spyOn(documentRepository, 'trackAccess').mockResolvedValue(undefined);

      await documentService.trackAccess(1, 1);

      expect(documentRepository.trackAccess).toHaveBeenCalledWith(1, 1);
    });
  });
});
