import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { transcribeAudio } from "../_core/voiceTranscription";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

export const voiceRouter = router({
  transcribe: protectedProcedure
    .input(z.object({
      audioBase64: z.string().min(1),
      mimeType: z.string().default("audio/webm"),
      ext: z.string().default("webm"),
      language: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Convert base64 to buffer
      const buffer = Buffer.from(input.audioBase64, "base64");

      // Check size (16MB limit)
      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Audio file too large (${sizeMB.toFixed(1)}MB). Maximum is 16MB.`,
        });
      }

      // Upload to storage temporarily for transcription
      const key = `voice-temp/${Date.now()}.${input.ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);

      // Transcribe
      const result = await transcribeAudio({
        audioUrl: url,
        language: input.language ?? "en",
        prompt: "Transcribe this voice note from a business executive. The speaker may mention company names: Celadon, Celanova, Perfect, Olmack, Boundless.",
      });

      if ("error" in result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return {
        text: result.text,
        language: result.language,
        duration: result.duration,
      };
    }),
});
