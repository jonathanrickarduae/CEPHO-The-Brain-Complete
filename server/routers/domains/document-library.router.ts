/**
 * Documentlibrary Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/document-library
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { documentService } from "../../services/document";
import { handleTRPCError } from "../../utils/error-handler";

export const documentLibraryRouter = router({
    // List all generated documents
    list: protectedProcedure
      .input(z.object({
        type: z.enum(['all', 'innovation_brief', 'project_genesis', 'report', 'other']).default('all'),
        qaStatus: z.enum(['all', 'approved', 'pending', 'rejected']).default('all'),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const filters = input || { type: 'all', qaStatus: 'all', limit: 50, offset: 0 };
        const { getDocuments } = await import('../../db');
        return getDocuments(ctx.user.id, filters);
      }),

    // Get a specific document
    get: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getDocumentById } = await import('../../db');
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        return doc;
      }),

    // Generate PDF for a document
    generatePDF: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        type: z.enum(['innovation_brief', 'project_genesis', 'report']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { generateInnovationBriefPDF } = await import('../../services/pdf-export.service');
        const { getDocumentById, updateDocument } = await import('../../db');
        const { storagePut } = await import('../../storage');
        
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        // Parse document content
        const content = JSON.parse(doc.content || '{}');
        
        if (input.type === 'innovation_brief') {
          const { html, markdown } = await generateInnovationBriefPDF(
            {
              title: doc.title,
              description: content.description || '',
              category: content.category,
              confidenceScore: content.confidenceScore,
            },
            content.assessments || [],
            content.scenarios || [],
            content.recommendation || { decision: 'refine', rationale: '', nextSteps: [] },
            {
              documentId: input.documentId,
              classification: doc.classification || 'internal',
              qaApproved: doc.qaStatus === 'approved',
              qaApprover: doc.qaApprover || undefined,
            }
          );
          
          // Save markdown to storage
          const mdKey = `documents/${ctx.user.id}/${input.documentId}.md`;
          const { url: mdUrl } = await storagePut(mdKey, markdown, 'text/markdown');
          
          // Save HTML for PDF conversion
          const htmlKey = `documents/${ctx.user.id}/${input.documentId}.html`;
          const { url: htmlUrl } = await storagePut(htmlKey, html, 'text/html');
          
          // Update document with URLs
          await updateDocument(input.documentId, {
            markdownUrl: mdUrl,
            htmlUrl: htmlUrl,
          });
          
          return { markdownUrl: mdUrl, htmlUrl: htmlUrl, markdown };
        }
        
        throw new Error('Unsupported document type');
      }),

    // Create a new document
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        type: z.enum(['innovation_brief', 'project_genesis', 'report', 'other']),
        content: z.string(),
        classification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
        relatedIdeaId: z.number().optional(),
        relatedProjectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createDocument } = await import('../../db');
        const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const id = await createDocument({
          documentId,
          userId: ctx.user.id,
          title: input.title,
          type: input.type,
          content: input.content,
          classification: input.classification,
          qaStatus: 'pending',
          relatedIdeaId: input.relatedIdeaId,
          relatedProjectId: input.relatedProjectId,
        });
        
        return { id, documentId };
      }),

    // Update QA status
    updateQAStatus: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        status: z.enum(['approved', 'pending', 'rejected']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateDocument, getDocumentById } = await import('../../db');
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        await updateDocument(input.documentId, {
          qaStatus: input.status,
          qaApprover: input.status === 'approved' ? 'Chief of Staff' : undefined,
          qaApprovedAt: input.status === 'approved' ? new Date() : undefined,
          qaNotes: input.notes,
        });
        
        return { success: true };
      }),

    // Delete a document
    delete: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteDocument, getDocumentById } = await import('../../db');
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        await deleteDocument(input.documentId);
        return { success: true };
      }),

    // Send document via email
    sendEmail: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        recipients: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
        })),
        subject: z.string().optional(),
        message: z.string().optional(),
        includeAsLink: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDocumentById } = await import('../../db');
// //         const { generateDocumentEmailHTML, addToDocumentEmailHistory } = await import('../../services/emailService');
//         const { notifyOwner } = await import('./_core/notification');
        
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        const results = [];
        
        for (const recipient of input.recipients) {
          try {
            // Generate email content
            const emailHtml = generateDocumentEmailHTML({
              documentTitle: doc.title,
              documentType: doc.type,
              senderName: ctx.user.name || 'CEPHO User',
              message: input.message,
              documentUrl: doc.pdfUrl || doc.markdownUrl || undefined,
              qaStatus: doc.qaStatus,
            });
            
            // Use notification system to send
            const subject = input.subject || `Document Shared: ${doc.title}`;
            
            // For now, notify owner about the share (in production would use email service)
            await notifyOwner({
              title: `Document shared with ${recipient.email}`,
              content: `${ctx.user.name || 'User'} shared "${doc.title}" with ${recipient.name || recipient.email}.${input.message ? ` Message: ${input.message}` : ''}`,
            });
            
            // Track in history
            addToDocumentEmailHistory({
              documentId: doc.id,
              documentTitle: doc.title,
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              sentAt: new Date(),
              sentBy: ctx.user.id,
              status: 'sent',
            });
            
            results.push({
              success: true,
              recipientEmail: recipient.email,
              messageId: `msg_${Date.now()}`,
            });
          } catch (error) {
            results.push({
              success: false,
              recipientEmail: recipient.email,
              error: error instanceof Error ? error.message : 'Failed to send',
            });
          }
        }
        
        return {
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results,
        };
      }),

    // Get email history for a document
    getEmailHistory: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getDocumentById } = await import('../../db');
//         const { getDocumentEmailHistory } = await import('../../services/emailService');
        
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        return getDocumentEmailHistory(doc.id);
      }),
});
