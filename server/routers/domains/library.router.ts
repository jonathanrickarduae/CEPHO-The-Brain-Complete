/**
 * Library Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/library
 */

import { router } from "../../_core/trpc";
import { z } from "zod";
import { documentService } from "../../services/document";

export const libraryRouter = router({
    // Create a new library document
    create: protectedProcedure
      .input(z.object({
        projectId: z.string().optional(),
        folder: z.string(),
        subFolder: z.string().optional(),
        name: z.string(),
        type: z.enum(['document', 'image', 'chart', 'presentation', 'data', 'other']),
        status: z.enum(['draft', 'review', 'signed_off']).optional(),
        fileUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createLibraryDocument({
          userId: ctx.user.id,
          projectId: input.projectId || null,
          folder: input.folder,
          subFolder: input.subFolder || null,
          name: input.name,
          type: input.type,
          status: input.status || 'draft',
          fileUrl: input.fileUrl || null,
          thumbnailUrl: input.thumbnailUrl || null,
          metadata: input.metadata || null,
        });
      }),

    // Get library documents
    list: protectedProcedure
      .input(z.object({
        folder: z.string().optional(),
        subFolder: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getLibraryDocuments(ctx.user.id, input);
      }),

    // Get single document by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLibraryDocumentById(input.id);
      }),

    // Update document
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        status: z.enum(['draft', 'review', 'signed_off']).optional(),
        fileUrl: z.string().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateLibraryDocument(id, data);
        return { success: true };
      }),

    // Delete document
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLibraryDocument(input.id);
        return { success: true };
      }),

    // Export expert chat to library
    exportExpertChat: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        expertName: z.string(),
        expertSpecialty: z.string(),
        expertCategory: z.string(),
        expertBio: z.string(),
        compositeOf: z.array(z.string()),
        strengths: z.array(z.string()),
        thinkingStyle: z.string(),
        messages: z.array(z.object({
          role: z.enum(['user', 'expert', 'system']),
          content: z.string(),
        })),
        projectId: z.string().optional(),
        folder: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Generate markdown content
        const expertName = input.expertName;
        const transcript = input.messages.map(msg => {
          if (msg.role === 'user') return `### You:\n${msg.content}\n`;
          if (msg.role === 'expert') return `### ${expertName}:\n${msg.content}\n`;
          return `### System:\n${msg.content}\n`;
        }).join('\n');
        
        const markdown = `# Expert Consultation: ${input.expertName}

**Date:** ${timestamp}
**Expert:** ${input.expertName}
**Specialty:** ${input.expertSpecialty}
**Category:** ${input.expertCategory}

## Expert Profile

${input.expertBio}

**Inspired By:** ${input.compositeOf.join(', ')}

**Strengths:** ${input.strengths.join(', ')}

**Thinking Style:** ${input.thinkingStyle}

---

## Conversation Transcript

${transcript}

---

*Exported from CEPHO AI SME Consultation*
`;

        // Create library document
        const docName = `Consultation - ${input.expertName} - ${timestamp}.md`;
        const doc = await createLibraryDocument({
          userId: ctx.user.id,
          projectId: input.projectId || null,
          folder: input.folder || 'consultations',
          subFolder: 'expert_chats',
          name: docName,
          type: 'document',
          status: 'draft',
          fileUrl: null, // Content stored in metadata
          thumbnailUrl: null,
          metadata: {
            expertId: input.expertId,
            expertName: input.expertName,
            expertSpecialty: input.expertSpecialty,
            messageCount: input.messages.length,
            exportedAt: new Date().toISOString(),
            content: markdown,
          },
        });

        return {
          success: true,
          documentId: doc?.id,
          documentName: docName,
        };
      }),
});
