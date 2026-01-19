import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('UX Phase 7 - AI Router, Project Genesis, Secure Storage', () => {
  const clientSrcPath = path.join(__dirname, '../client/src');
  
  describe('AI Router Component', () => {
    const aiRouterPath = path.join(clientSrcPath, 'components/AIRouter.tsx');
    
    it('should have AIRouter component file', () => {
      expect(fs.existsSync(aiRouterPath)).toBe(true);
    });
    
    it('should export AIRouterProvider', () => {
      const content = fs.readFileSync(aiRouterPath, 'utf-8');
      expect(content).toContain('export function AIRouterProvider');
    });
    
    it('should export useAIRouter hook', () => {
      const content = fs.readFileSync(aiRouterPath, 'utf-8');
      expect(content).toContain('export function useAIRouter');
    });
    
    it('should export AIProviderSettings component', () => {
      const content = fs.readFileSync(aiRouterPath, 'utf-8');
      expect(content).toContain('export function AIProviderSettings');
    });
    
    it('should support multiple AI providers', () => {
      const content = fs.readFileSync(aiRouterPath, 'utf-8');
      expect(content).toContain('forge');
      expect(content).toContain('openai');
      expect(content).toContain('claude');
      expect(content).toContain('perplexity');
      expect(content).toContain('gemini');
      expect(content).toContain('azure');
    });
    
    it('should have task analysis for smart routing', () => {
      const content = fs.readFileSync(aiRouterPath, 'utf-8');
      expect(content).toContain('analyseTask');
      expect(content).toContain('medical');
      expect(content).toContain('legal');
      expect(content).toContain('financial');
      expect(content).toContain('research');
    });
    
    it('should have provider selection logic', () => {
      const content = fs.readFileSync(aiRouterPath, 'utf-8');
      expect(content).toContain('selectProvider');
      expect(content).toContain('routeQuery');
    });
  });
  
  describe('Project Genesis Component', () => {
    const genesisPath = path.join(clientSrcPath, 'components/ProjectGenesis.tsx');
    
    it('should have ProjectGenesis component file', () => {
      expect(fs.existsSync(genesisPath)).toBe(true);
    });
    
    it('should export ProjectGenesis component', () => {
      const content = fs.readFileSync(genesisPath, 'utf-8');
      expect(content).toContain('export function ProjectGenesis');
    });
    
    it('should have multi-phase questionnaire', () => {
      const content = fs.readFileSync(genesisPath, 'utf-8');
      expect(content).toContain('Basic Info');
      expect(content).toContain('People');
      expect(content).toContain('Business');
      expect(content).toContain('Legal');
      expect(content).toContain('Due Diligence');
    });
    
    it('should have founder management', () => {
      const content = fs.readFileSync(genesisPath, 'utf-8');
      // Check for founders array in the data structure
      expect(content).toContain('founders');
      expect(content).toContain('name');
      expect(content).toContain('role');
    });
    
    it('should have document generation', () => {
      const content = fs.readFileSync(genesisPath, 'utf-8');
      // Check for deliverables and document types
      expect(content).toContain('Deliverable');
      expect(content).toContain('document');
      expect(content).toContain('generating');
    });
    
    it('should have action items generation', () => {
      const content = fs.readFileSync(genesisPath, 'utf-8');
      // Check for best practices and checklist items
      expect(content).toContain('BestPracticeItem');
      expect(content).toContain('checklist');
      expect(content).toContain('priority');
    });
    
    it('should support multiple jurisdictions', () => {
      const content = fs.readFileSync(genesisPath, 'utf-8');
      expect(content).toContain('United Kingdom');
      expect(content).toContain('Cayman Islands');
      expect(content).toContain('Delaware');
    });
  });
  
  describe('Secure Storage Dashboard Component', () => {
    const storagePath = path.join(clientSrcPath, 'components/SecureStorageDashboard.tsx');
    
    it('should have SecureStorageDashboard component file', () => {
      expect(fs.existsSync(storagePath)).toBe(true);
    });
    
    it('should export SecureStorageDashboard component', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('export function SecureStorageDashboard');
    });
    
    it('should have storage tiers', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('Hot Storage');
      expect(content).toContain('Warm Storage');
      expect(content).toContain('Cold Storage');
    });
    
    it('should have backup management', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('BackupInfo');
      expect(content).toContain('daily');
      expect(content).toContain('weekly');
      expect(content).toContain('monthly');
    });
    
    it('should have security checks', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('SecurityCheck');
      expect(content).toContain('Encryption at Rest');
      expect(content).toContain('Multi-Factor Authentication');
      expect(content).toContain('Intrusion Detection');
    });
    
    it('should have audit logging', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('AuditLogEntry');
      expect(content).toContain('auditLog');
    });
    
    it('should have emergency actions', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('Remote Wipe');
      expect(content).toContain('Lock Account');
      expect(content).toContain('Revoke All Sessions');
    });
    
    it('should show UK/EU data residency', () => {
      const content = fs.readFileSync(storagePath, 'utf-8');
      expect(content).toContain('UK/EU');
      expect(content).toContain('Data stored in UK/EU regions');
    });
  });
  
  describe('Universal Inbox Component', () => {
    const inboxPath = path.join(clientSrcPath, 'components/UniversalInbox.tsx');
    
    it('should have UniversalInbox component file', () => {
      expect(fs.existsSync(inboxPath)).toBe(true);
    });
    
    it('should export UniversalInbox component', () => {
      const content = fs.readFileSync(inboxPath, 'utf-8');
      expect(content).toContain('export function UniversalInbox');
    });
    
    it('should support multiple item types', () => {
      const content = fs.readFileSync(inboxPath, 'utf-8');
      expect(content).toContain('document');
      expect(content).toContain('voice');
      expect(content).toContain('image');
      expect(content).toContain('email');
    });
  });
  
  describe('Brand Kit Component', () => {
    const brandKitPath = path.join(clientSrcPath, 'components/BrandKit.tsx');
    
    it('should have BrandKit component file', () => {
      expect(fs.existsSync(brandKitPath)).toBe(true);
    });
    
    it('should export BrandKit component', () => {
      const content = fs.readFileSync(brandKitPath, 'utf-8');
      expect(content).toContain('export function BrandKit');
    });
    
    it('should support company-specific branding', () => {
      const content = fs.readFileSync(brandKitPath, 'utf-8');
      expect(content).toContain('primary');
      expect(content).toContain('logo');
      expect(content).toContain('fonts');
    });
  });
  
  describe('Communication Style - Direct, Professional', () => {
    const nudgesPath = path.join(clientSrcPath, 'components/IntelligentNudges.tsx');
    
    it('should have direct communication style', () => {
      const content = fs.readFileSync(nudgesPath, 'utf-8');
      // Should NOT contain friendly greetings
      expect(content).not.toContain('Hey!');
      expect(content).not.toContain('Hope you');
      // Should contain direct language
      expect(content).toContain('Action required');
      expect(content).toContain('Review recommended');
    });
  });
});
