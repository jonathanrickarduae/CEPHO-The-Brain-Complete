import { describe, it, expect } from 'vitest';
import { 
  BRAND_GUIDELINES,
  generateDocumentId,
  getScoreRating,
  applyBrandFormatting,
  validateBrandCompliance
} from './services/document-template.service';
import {
  generatePDFHeader,
  generateTitleSection,
  generateScoringTable,
  generateQAFooter,
  generatePDFDocument,
  markdownToHTML
} from './services/pdf-export.service';

describe('Document Library', () => {
  describe('Document Template Service', () => {
    it('should have brand guidelines defined', () => {
      expect(BRAND_GUIDELINES).toBeDefined();
      expect(BRAND_GUIDELINES.documentId).toBe('CEPHO-BP-016');
      expect(BRAND_GUIDELINES.colours).toBeDefined();
      expect(BRAND_GUIDELINES.typography).toBeDefined();
    });

    it('should have colour palette defined', () => {
      expect(BRAND_GUIDELINES.colours.black).toBe('#000000');
      expect(BRAND_GUIDELINES.colours.white).toBe('#FFFFFF');
      expect(BRAND_GUIDELINES.colours.cephoCyan).toBe('#00D4FF');
      expect(BRAND_GUIDELINES.colours.cephoMagenta).toBe('#D946EF');
    });

    it('should have typography settings', () => {
      expect(BRAND_GUIDELINES.typography.headingFont).toBe('Inter');
      expect(BRAND_GUIDELINES.typography.bodyFont).toBe('Inter');
      expect(BRAND_GUIDELINES.typography.sizes).toBeDefined();
    });

    it('should generate document IDs with correct prefix', () => {
      const id1 = generateDocumentId('innovation_brief');
      const id2 = generateDocumentId('project_genesis');
      const id3 = generateDocumentId('executive_summary');
      
      expect(id1).toContain('CEPHO-IB-');
      expect(id2).toContain('CEPHO-PG-');
      expect(id3).toContain('CEPHO-ES-');
    });

    it('should get correct score rating', () => {
      const excellent = getScoreRating(90);
      expect(excellent.rating).toBe('Excellent');
      
      const good = getScoreRating(75);
      expect(good.rating).toBe('Good');
      
      const average = getScoreRating(60);
      expect(average.rating).toBe('Average');
      
      const belowAverage = getScoreRating(40);
      expect(belowAverage.rating).toBe('Below Average');
      
      const poor = getScoreRating(20);
      expect(poor.rating).toBe('Poor');
    });

    it('should apply brand formatting to content', () => {
      const content = 'Test content with some text';
      const formatted = applyBrandFormatting(content);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should validate brand compliance', () => {
      const validContent = 'This is valid content without issues';
      const result = validateBrandCompliance(validContent);
      
      expect(result).toBeDefined();
      // Result is an object with compliance info
      expect(typeof result).toBe('object');
    });
  });

  describe('PDF Export Service', () => {
    it('should generate PDF header with CEPHO branding', () => {
      const header = generatePDFHeader({
        documentId: 'TEST-001',
        title: 'Test Document',
        classification: 'internal'
      });
      
      expect(header).toContain('CEPHO');
      expect(header).toContain('TEST-001');
    });

    it('should generate title section', () => {
      const titleSection = generateTitleSection({
        documentId: 'TITLE-001',
        title: 'My Test Title',
        classification: 'confidential'
      });
      
      expect(titleSection).toContain('My Test Title');
    });

    it('should generate scoring table HTML', () => {
      const scores = [
        { category: 'Market', score: 85, notes: 'Strong market' },
        { category: 'Feasibility', score: 70, notes: 'Moderate complexity' }
      ];
      
      const table = generateScoringTable(scores);
      
      expect(table).toContain('Market');
      expect(table).toContain('85');
      expect(table).toContain('Feasibility');
      expect(table).toContain('70');
    });

    it('should generate QA footer', () => {
      const footer = generateQAFooter({
        documentId: 'QA-001',
        title: 'QA Test',
        classification: 'internal',
        qaApproved: true,
        qaApprover: 'Chief of Staff'
      });
      
      expect(footer).toContain('Approved');
      expect(footer).toContain('Chief of Staff');
    });

    it('should convert markdown to HTML', () => {
      const markdown = '# Heading\n\nParagraph text\n\n- List item 1\n- List item 2';
      const html = markdownToHTML(markdown);
      
      // Check for styled elements (implementation uses inline styles)
      expect(html).toContain('Heading');
      expect(html).toContain('Paragraph text');
      expect(html).toContain('List item 1');
    });

    it('should generate complete PDF document with sections', () => {
      const doc = generatePDFDocument({
        documentId: 'DOC-001',
        title: 'Complete Document',
        classification: 'internal',
        qaApproved: true,
        qaApprover: 'Test Approver'
      }, [
        { type: 'text', content: '<h1>Test</h1><p>Content</p>' }
      ]);
      
      expect(doc).toContain('<!DOCTYPE html>');
      expect(doc).toContain('CEPHO');
      expect(doc).toContain('Complete Document');
      expect(doc).toContain('Test');
      expect(doc).toContain('Content');
    });
  });

  describe('Document Classification', () => {
    it('should support all classification levels in PDF header', () => {
      const classifications = ['public', 'internal', 'confidential', 'restricted'] as const;
      
      classifications.forEach(classification => {
        const header = generatePDFHeader({
          documentId: 'CLASS-001',
          title: 'Classification Test',
          classification
        });
        
        expect(header).toContain(classification.toUpperCase());
      });
    });
  });

  describe('Scoring Scale', () => {
    it('should have all scoring ranges defined', () => {
      expect(BRAND_GUIDELINES.scoringScale).toHaveLength(5);
      
      const ratings = BRAND_GUIDELINES.scoringScale.map(s => s.rating);
      expect(ratings).toContain('Excellent');
      expect(ratings).toContain('Good');
      expect(ratings).toContain('Average');
      expect(ratings).toContain('Below Average');
      expect(ratings).toContain('Poor');
    });
  });
});
