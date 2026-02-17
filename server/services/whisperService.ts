/**
 * Whisper Transcription Service
 * Uses OpenAI Whisper API for speech-to-text
 */

import { ENV } from '../_core/env';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  duration?: number;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface TranscriptionOptions {
  language?: string; // ISO-639-1 code, e.g., 'en'
  prompt?: string; // Optional context to guide transcription
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number; // 0-1, lower = more deterministic
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioData: Buffer | Blob,
  filename: string,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY || ENV.forgeApiKey;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create form data
  const formData = new FormData();
  
  // Convert Buffer to Blob if needed
  const audioBlob = audioData instanceof Blob 
    ? audioData 
    : new Blob([new Uint8Array(audioData)], { type: 'audio/webm' });
  
  formData.append('file', audioBlob, filename);
  formData.append('model', 'whisper-1');
  
  if (options?.language) {
    formData.append('language', options.language);
  }
  
  if (options?.prompt) {
    formData.append('prompt', options.prompt);
  }
  
  formData.append('response_format', options?.responseFormat || 'verbose_json');
  
  if (options?.temperature !== undefined) {
    formData.append('temperature', options.temperature.toString());
  }

  const response = await fetch(WHISPER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    text: data.text,
    duration: data.duration,
    language: data.language,
    segments: data.segments?.map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })),
  };
}

/**
 * Transcribe audio from URL
 */
export async function transcribeFromUrl(
  audioUrl: string,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  // Fetch the audio file
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status}`);
  }
  
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const filename = audioUrl.split('/').pop() || 'audio.webm';
  
  return transcribeAudio(audioBuffer, filename, options);
}

/**
 * Transcribe audio with automatic language detection
 */
export async function transcribeWithLanguageDetection(
  audioData: Buffer | Blob,
  filename: string
): Promise<TranscriptionResult & { detectedLanguage: string }> {
  const result = await transcribeAudio(audioData, filename, {
    responseFormat: 'verbose_json',
  });

  return {
    ...result,
    detectedLanguage: result.language || 'unknown',
  };
}

/**
 * Get supported audio formats
 */
export function getSupportedFormats(): string[] {
  return ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
}

/**
 * Validate audio file
 */
export function validateAudioFile(filename: string, sizeBytes: number): { valid: boolean; error?: string } {
  const ext = filename.split('.').pop()?.toLowerCase();
  const supportedFormats = getSupportedFormats();
  
  if (!ext || !supportedFormats.includes(ext)) {
    return { 
      valid: false, 
      error: `Unsupported format. Supported: ${supportedFormats.join(', ')}` 
    };
  }
  
  // Whisper has a 25MB limit
  const maxSize = 25 * 1024 * 1024;
  if (sizeBytes > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: 25MB` 
    };
  }
  
  return { valid: true };
}
