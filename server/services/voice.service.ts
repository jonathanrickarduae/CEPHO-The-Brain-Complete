/**
 * Voice Service - ElevenLabs Integration
 * 
 * Provides text-to-speech capabilities using ElevenLabs API.
 * Each expert can have a unique voice style.
 */

// ElevenLabs API key from environment
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice IDs for different expert personas
// These would be cloned voices or selected from ElevenLabs library
const EXPERT_VOICE_MAP: Record<string, {
  voiceId: string;
  voiceName: string;
  description: string;
}> = {
  // Celebrity experts with distinct voices
  'jay-z-mogul': {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, confident male voice
    voiceName: 'Jay-Z Style',
    description: 'Deep, measured, confident with Brooklyn undertones'
  },
  'ryan-reynolds-marketing': {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - warm, friendly male voice
    voiceName: 'Ryan Reynolds Style',
    description: 'Quick-witted, warm, self-deprecating with perfect comedic timing'
  },
  'jessica-alba-entrepreneur': {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm female voice
    voiceName: 'Jessica Alba Style',
    description: 'Warm, passionate, authentic with California positivity'
  },
  'victoria-stirling-comms': {
    voiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - British female voice
    voiceName: 'Victoria Stirling',
    description: 'Refined British accent, measured and articulate, warm but professional'
  },
  // Default voice for other experts
  'default-male': {
    voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - neutral male voice
    voiceName: 'Professional Male',
    description: 'Clear, professional male voice'
  },
  'default-female': {
    voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli - neutral female voice
    voiceName: 'Professional Female',
    description: 'Clear, professional female voice'
  }
};

interface TextToSpeechRequest {
  text: string;
  expertId?: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface TextToSpeechResponse {
  audioBuffer: Buffer;
  contentType: string;
  voiceId: string;
  voiceName: string;
}

/**
 * Convert text to speech using ElevenLabs API
 */
export async function text-to-speech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
  const { text, expertId, voiceId: customVoiceId, modelId, voiceSettings } = request;
  
  // Get the API key from environment
  const apiKey = ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment.');
  }
  
  // Determine which voice to use
  let voiceConfig = EXPERT_VOICE_MAP['default-male'];
  
  if (customVoiceId) {
    voiceConfig = {
      voiceId: customVoiceId,
      voiceName: 'Custom Voice',
      description: 'User-specified voice'
    };
  } else if (expertId && EXPERT_VOICE_MAP[expertId]) {
    voiceConfig = EXPERT_VOICE_MAP[expertId];
  }
  
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`;
  
  const body = {
    text,
    model_id: modelId || 'eleven_multilingual_v2',
    voice_settings: voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }
    
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audioBuffer,
      contentType: 'audio/mpeg',
      voiceId: voiceConfig.voiceId,
      voiceName: voiceConfig.voiceName
    };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}

/**
 * Get available voices for experts
 */
export function getExpertVoices(): typeof EXPERT_VOICE_MAP {
  return EXPERT_VOICE_MAP;
}

/**
 * Check if an expert has a custom voice
 */
export function hasCustomVoice(expertId: string): boolean {
  return expertId in EXPERT_VOICE_MAP;
}

/**
 * Get voice info for an expert
 */
export function getExpertVoiceInfo(expertId: string): typeof EXPERT_VOICE_MAP[string] | null {
  return EXPERT_VOICE_MAP[expertId] || null;
}
