/**
 * Text-to-Speech helper using ElevenLabs API
 * 
 * This module provides voice synthesis capabilities for Victoria Stirling,
 * the Virtual Chief of Staff, using ElevenLabs' high-quality voice synthesis.
 * 
 * Example usage:
 * ```ts
 * import { synthesizeSpeech, VICTORIA_VOICE_ID } from "./_core/text-to-speech";
 * 
 * const result = await synthesizeSpeech({
 *   text: "Good morning. Here is your daily briefing.",
 *   voiceId: VICTORIA_VOICE_ID,
 * });
 * 
 * if ('audioUrl' in result) {
 *   // Play or return the audio URL
 * }
 * ```
 */
import { storagePut } from "../storage";

// Victoria Stirling's voice configuration
// Using a professional British female voice from ElevenLabs
export const VICTORIA_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // "Sarah" - professional British female

// Alternative voice options for different contexts
export const VOICE_OPTIONS = {
  victoria: "EXAVITQu4vr4xnSDxMaL", // Sarah - professional British female (default)
  professional: "21m00Tcm4TlvDq8ikWAM", // Rachel - American professional
  warm: "AZnzlk1XvdvUeBnXmlld", // Domi - warm and friendly
  authoritative: "VR6AewLTigWG4xSOukaG", // Arnold - authoritative male
};

export type SynthesisOptions = {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number; // 0-1, higher = more stable/consistent
  similarityBoost?: number; // 0-1, higher = more similar to original voice
  style?: number; // 0-1, style exaggeration
  useSpeakerBoost?: boolean;
};

export type SynthesisResponse = {
  audioUrl: string;
  audioKey: string;
  duration?: number;
  characterCount: number;
};

export type SynthesisError = {
  error: string;
  code: "API_ERROR" | "INVALID_INPUT" | "QUOTA_EXCEEDED" | "SERVICE_ERROR";
  details?: string;
};

/**
 * Synthesize speech from text using ElevenLabs API
 * 
 * @param options - Text and voice configuration
 * @returns Audio URL or error
 */
export async function synthesizeSpeech(
  options: SynthesisOptions
): Promise<SynthesisResponse | SynthesisError> {
  try {
    // Validate API key
    if (!(process.env.ELEVENLABS_API_KEY ?? "")) {
      return {
        error: "ElevenLabs API key is not configured",
        code: "SERVICE_ERROR",
        details: "ELEVENLABS_API_KEY environment variable is not set"
      };
    }

    // Validate input
    if (!options.text || options.text.trim().length === 0) {
      return {
        error: "Text is required for speech synthesis",
        code: "INVALID_INPUT",
        details: "The text parameter cannot be empty"
      };
    }

    // Limit text length (ElevenLabs has a 5000 character limit per request)
    const text = options.text.slice(0, 5000);
    const characterCount = text.length;

    // Use Victoria's voice by default
    const voiceId = options.voiceId || VICTORIA_VOICE_ID;
    
    // Model selection - using eleven_multilingual_v2 for best quality
    const modelId = options.modelId || "eleven_multilingual_v2";

    // Voice settings for Victoria - professional, clear, and warm
    const voiceSettings = {
      stability: options.stability ?? 0.5,
      similarity_boost: options.similarityBoost ?? 0.75,
      style: options.style ?? 0.3,
      use_speaker_boost: options.useSpeakerBoost ?? true,
    };

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      
      // Check for quota exceeded
      if (response.status === 401) {
        return {
          error: "Invalid ElevenLabs API key",
          code: "API_ERROR",
          details: "Please check your ELEVENLABS_API_KEY configuration"
        };
      }
      
      if (response.status === 429) {
        return {
          error: "ElevenLabs quota exceeded",
          code: "QUOTA_EXCEEDED",
          details: "You have exceeded your character quota. Please upgrade your plan or wait for quota reset."
        };
      }

      return {
        error: "Speech synthesis failed",
        code: "API_ERROR",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      };
    }

    // Get audio data
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const audioKey = `voice/victoria-${timestamp}-${randomSuffix}.mp3`;

    // Upload to S3
    const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");

    // Estimate duration (rough estimate: ~150 words per minute, ~5 characters per word)
    const estimatedWords = characterCount / 5;
    const estimatedDuration = (estimatedWords / 150) * 60; // seconds

    return {
      audioUrl,
      audioKey,
      duration: Math.round(estimatedDuration),
      characterCount,
    };

  } catch (error) {
    return {
      error: "Speech synthesis failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

/**
 * Get available voices from ElevenLabs
 * 
 * @returns List of available voices or error
 */
export async function getAvailableVoices(): Promise<
  { voices: Array<{ voice_id: string; name: string; category: string }> } | SynthesisError
> {
  try {
    if (!(process.env.ELEVENLABS_API_KEY ?? "")) {
      return {
        error: "ElevenLabs API key is not configured",
        code: "SERVICE_ERROR",
        details: "ELEVENLABS_API_KEY environment variable is not set"
      };
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch voices",
        code: "API_ERROR",
        details: `${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      voices: data.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category,
      })),
    };

  } catch (error) {
    return {
      error: "Failed to fetch voices",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

/**
 * Check ElevenLabs subscription status and remaining characters
 * 
 * @returns Subscription info or error
 */
export async function getSubscriptionInfo(): Promise<
  { character_count: number; character_limit: number; tier: string } | SynthesisError
> {
  try {
    if (!(process.env.ELEVENLABS_API_KEY ?? "")) {
      return {
        error: "ElevenLabs API key is not configured",
        code: "SERVICE_ERROR",
        details: "ELEVENLABS_API_KEY environment variable is not set"
      };
    }

    const response = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch subscription info",
        code: "API_ERROR",
        details: `${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      character_count: data.character_count,
      character_limit: data.character_limit,
      tier: data.tier,
    };

  } catch (error) {
    return {
      error: "Failed to fetch subscription info",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}
