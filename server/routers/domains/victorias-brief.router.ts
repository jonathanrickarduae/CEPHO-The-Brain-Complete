import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { generateBriefPDF } from "../../services/pdf-generation.service";
import { generateBriefVideo, checkVideoStatus } from "../../services/video-generation.service";
import { generateBriefAudio } from "../../services/audio-generation.service";
import { readFile } from "fs/promises";

/**
 * Victoria's Brief Router
 * Handles PDF, video, and audio generation for the Morning Signal
 */

// Input schema for brief generation
const BriefDataSchema = z.object({
  date: z.string(),
  overviewSummary: z.object({
    headline: z.string(),
    energyFocus: z.string(),
  }),
  schedule: z.array(z.object({
    time: z.string(),
    title: z.string(),
    type: z.string(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
  })),
  priorities: z.array(z.object({
    title: z.string(),
    description: z.string(),
    urgency: z.string(),
    estimatedTime: z.string(),
  })),
  insights: z.array(z.object({
    category: z.string(),
    message: z.string(),
  })),
  emails: z.object({
    unread: z.number(),
    requireResponse: z.number(),
    highPriority: z.number(),
    urgent: z.array(z.object({
      from: z.string(),
      subject: z.string(),
      preview: z.string(),
      suggestedResponse: z.string(),
    })),
  }).optional(),
});

export const victoriasBriefRouter = router({
  /**
   * Generate PDF from Morning Signal data
   */
  generatePDF: protectedProcedure
    .input(BriefDataSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate PDF from brief data
        const pdfPath = await generateBriefPDF(input);
        
        // Read PDF file as base64
        const pdfBuffer = await readFile(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        // Clean up temp file
        const { unlink } = await import('fs/promises');
        await unlink(pdfPath);
        
        return {
          success: true,
          pdfBase64,
          filename: `victoria-brief-${input.date}.pdf`,
          mimeType: 'application/pdf',
        };
      } catch (error) {
        console.error("PDF generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF",
          cause: error,
        });
      }
    }),

  /**
   * Generate video via Synthesia API
   */
  generateVideo: protectedProcedure
    .input(BriefDataSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await generateBriefVideo(input);
        
        return {
          success: true,
          videoId: result.id,
          status: result.status,
          message: "Video generation started. Use getGenerationStatus to check progress.",
        };
      } catch (error: any) {
        console.error("Video generation error:", error);
        
        if (error.message?.includes('SYNTHESIA_API_KEY')) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Video generation requires SYNTHESIA_API_KEY environment variable.",
          });
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate video",
          cause: error,
        });
      }
    }),

  /**
   * Generate audio via 11Labs API
   */
  generateAudio: protectedProcedure
    .input(BriefDataSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const audioPath = await generateBriefAudio(input);
        
        // Read audio file as base64
        const audioBuffer = await readFile(audioPath);
        const audioBase64 = audioBuffer.toString('base64');
        
        // Clean up temp file
        const { unlink } = await import('fs/promises');
        await unlink(audioPath);
        
        return {
          success: true,
          audioBase64,
          filename: `victoria-brief-${input.date}.mp3`,
          mimeType: 'audio/mpeg',
        };
      } catch (error: any) {
        console.error("Audio generation error:", error);
        
        if (error.message?.includes('ELEVENLABS_API_KEY')) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Audio generation requires ELEVENLABS_API_KEY environment variable.",
          });
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate audio",
          cause: error,
        });
      }
    }),

  /**
   * Get generation status (for async operations)
   */
  getGenerationStatus: protectedProcedure
    .input(z.object({
      generationId: z.string(),
      type: z.enum(["pdf", "video", "audio"]),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // TODO: Implement status checking
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Status checking not yet implemented.",
        });

        // return {
        //   status: "ready" | "processing" | "failed",
        //   progress: 75, // percentage
        //   url: "...", // when ready
        //   error: "...", // if failed
        // };
      } catch (error) {
        console.error("Status check error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check generation status",
          cause: error,
        });
      }
    }),
});
