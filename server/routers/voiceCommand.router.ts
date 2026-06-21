/**
 * Voice Command Router — "Talk to CEPHO"
 *
 * Provides the voice-first interface for the platform:
 * - Speech-to-text using OpenAI Whisper
 * - Natural language command processing using Claude
 * - Text-to-speech response using ElevenLabs
 *
 * This is the bidirectional voice interface that makes CEPHO feel
 * like a genuine personal executive assistant.
 */
import { z } from "zod";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { protectedProcedure, router } from "../_core/trpc";
import { synthesizeSpeech, VICTORIA_VOICE_ID } from "../_core/text-to-speech";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey });
}

const CEPHO_VOICE_SYSTEM_PROMPT = `You are CEPHO, an elite AI Chief of Staff. You are responding to a voice command from your executive. 
Your response will be converted to speech, so:
- Keep responses concise and conversational (2-4 sentences max)
- Do not use markdown, bullet points, or special characters
- Speak naturally as a trusted senior advisor
- Be direct, confident, and action-oriented
- If the command requires creating tasks, projects, or other actions, confirm what you are doing`;

export const voiceCommandRouter = router({
  /**
   * Process a text command and return a spoken response.
   * The client sends the transcribed text (from browser Web Speech API or uploaded audio).
   */
  processCommand: protectedProcedure
    .input(
      z.object({
        command: z.string().min(1).max(1000),
        context: z.string().optional(), // e.g. "user is on the dashboard"
      })
    )
    .mutation(async ({ input }) => {
      const anthropic = getAnthropic();

      const systemPrompt = input.context
        ? `${CEPHO_VOICE_SYSTEM_PROMPT}\n\nCurrent context: ${input.context}`
        : CEPHO_VOICE_SYSTEM_PROMPT;

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: input.command,
          },
        ],
        system: systemPrompt,
      });

      const responseText =
        message.content[0].type === "text"
          ? message.content[0].text
          : "I could not process that command.";

      // Convert the response to speech using ElevenLabs
      const audioResult = await synthesizeSpeech({
        text: responseText,
        voiceId: VICTORIA_VOICE_ID,
      });
      const isSuccess = !("error" in audioResult);

      return {
        responseText,
        audioUrl: isSuccess
          ? (audioResult as { audioUrl: string }).audioUrl
          : null,
        audioMimeType: "audio/mpeg",
        processedAt: new Date().toISOString(),
      };
    }),

  /**
   * Transcribe audio to text using OpenAI Whisper.
   * Accepts base64-encoded audio data.
   */
  transcribeAudio: protectedProcedure
    .input(
      z.object({
        audioBase64: z.string(),
        mimeType: z.string().default("audio/webm"),
      })
    )
    .mutation(async ({ input }) => {
      const openai = getOpenAI();

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(input.audioBase64, "base64");
      const audioBlob = new Blob([audioBuffer], { type: input.mimeType });
      const audioFile = new File([audioBlob], "recording.webm", {
        type: input.mimeType,
      });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
      });

      return {
        text: transcription.text,
        transcribedAt: new Date().toISOString(),
      };
    }),

  /**
   * Convert text to speech for the morning briefing push.
   * Used by the scheduler to generate the daily audio briefing.
   */
  textToSpeech: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        voiceId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await synthesizeSpeech({
        text: input.text,
        voiceId: input.voiceId ?? VICTORIA_VOICE_ID,
      });

      if ("error" in result) {
        throw new Error(result.error ?? "Text-to-speech conversion failed");
      }

      return {
        audioUrl: result.audioUrl,
        audioMimeType: "audio/mpeg",
        characterCount: result.characterCount,
        generatedAt: new Date().toISOString(),
      };
    }),
});
