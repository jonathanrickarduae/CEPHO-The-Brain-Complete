/**
 * Voice Briefing Service
 * 
 * Generates voice briefings with CEPHO tone profile:
 * - Emotive and engaging, not monotone
 * - Professional but warm
 * - Varied pace and emphasis
 * - Hook-body-close structure
 */

import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { ENV } from "../_core/env";

// =============================================================================
// CEPHO VOICE TONE PROFILE
// =============================================================================

export const CEPHO_VOICE_PROFILE = {
  tone: "professional-warm",
  characteristics: [
    "Emotive and engaging - not monotone or robotic",
    "Confident but not arrogant",
    "Warm but professional",
    "Varied pace - faster for excitement, slower for emphasis",
    "Natural pauses for impact",
    "Conversational, like speaking to a trusted advisor"
  ],
  avoid: [
    "Monotone delivery",
    "Overly formal or stiff language",
    "Rushed content without breathing room",
    "Sycophantic or overly enthusiastic tone",
    "Dragged out or unnecessarily long content"
  ]
};

// =============================================================================
// VOICE STYLE PRESETS
// =============================================================================

export type VoiceStylePreset = "briefing" | "urgent" | "casual" | "celebration";

export const VOICE_STYLE_PRESETS: Record<VoiceStylePreset, {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  paceMultiplier: number;
  description: string;
}> = {
  briefing: {
    stability: 0.6,
    similarity_boost: 0.75,
    style: 0.4,
    use_speaker_boost: true,
    paceMultiplier: 1.0,
    description: "Professional morning briefing - clear, measured, authoritative"
  },
  urgent: {
    stability: 0.4,
    similarity_boost: 0.8,
    style: 0.6,
    use_speaker_boost: true,
    paceMultiplier: 1.15,
    description: "Urgent communication - slightly faster, more emphatic"
  },
  casual: {
    stability: 0.5,
    similarity_boost: 0.7,
    style: 0.5,
    use_speaker_boost: true,
    paceMultiplier: 0.95,
    description: "Casual update - relaxed, conversational"
  },
  celebration: {
    stability: 0.45,
    similarity_boost: 0.75,
    style: 0.7,
    use_speaker_boost: true,
    paceMultiplier: 1.0,
    description: "Celebration/achievement - warm, enthusiastic"
  }
};

// =============================================================================
// SCRIPT STRUCTURE TEMPLATES
// =============================================================================

export interface ScriptStructure {
  hook: string;       // Attention-grabbing opening (5-10 seconds)
  body: string[];     // Main content sections
  close: string;      // Memorable closing (5-10 seconds)
}

/**
 * Generate a script following hook-body-close structure
 */
export async function generateStructuredScript(
  content: {
    type: "morning_signal" | "project_update" | "urgent_alert" | "achievement";
    title: string;
    keyPoints: string[];
    context?: string;
  }
): Promise<ScriptStructure> {
  const systemPrompt = `You are a professional script writer for CEPHO.Ai voice briefings.

CEPHO Voice Tone Profile:
${CEPHO_VOICE_PROFILE.characteristics.join("\n")}

Avoid:
${CEPHO_VOICE_PROFILE.avoid.join("\n")}

Write scripts that:
1. HOOK: Start with an engaging opening that grabs attention (1-2 sentences)
2. BODY: Deliver key information clearly with natural transitions
3. CLOSE: End with a memorable, actionable statement

Keep total length under 2 minutes when spoken. Use natural language, not bullet points.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a ${content.type.replace("_", " ")} script.

Title: ${content.title}
Key Points:
${content.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}
${content.context ? `\nContext: ${content.context}` : ""}

Return as JSON with format:
{
  "hook": "attention-grabbing opening",
  "body": ["section 1", "section 2", "section 3"],
  "close": "memorable closing"
}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "script_structure",
          strict: true,
          schema: {
            type: "object",
            properties: {
              hook: { type: "string", description: "Attention-grabbing opening" },
              body: { 
                type: "array", 
                items: { type: "string" },
                description: "Main content sections" 
              },
              close: { type: "string", description: "Memorable closing" }
            },
            required: ["hook", "body", "close"],
            additionalProperties: false
          }
        }
      }
    });

    const content_str = response.choices[0]?.message?.content;
    if (content_str && typeof content_str === "string") {
      return JSON.parse(content_str) as ScriptStructure;
    }
  } catch (error) {
    console.error("Error generating structured script:", error);
  }

  // Fallback structure
  return {
    hook: `Here's your ${content.type.replace("_", " ")} for today.`,
    body: content.keyPoints,
    close: "That's all for now. Your Chief of Staff is here when you need support."
  };
}

/**
 * Convert script structure to full text
 */
export function scriptToText(script: ScriptStructure): string {
  const parts: string[] = [];
  
  // Hook
  parts.push(script.hook);
  parts.push(""); // Pause marker
  
  // Body sections
  script.body.forEach(section => {
    parts.push(section);
    parts.push(""); // Pause between sections
  });
  
  // Close
  parts.push(script.close);
  
  return parts.join(" ");
}

// =============================================================================
// VOICE GENERATION
// =============================================================================

export interface VoiceBriefingRequest {
  script: string | ScriptStructure;
  style?: VoiceStylePreset;
  voiceId?: string;
  saveToStorage?: boolean;
  filename?: string;
}

export interface VoiceBriefingResponse {
  audioBuffer: Buffer;
  audioUrl?: string;
  duration?: number;
  voiceId: string;
  style: VoiceStylePreset;
}

// Victoria Stirling voice for Morning Signal
const VICTORIA_VOICE_ID = "ThT5KcBeYPX3keUQqHPh"; // Dorothy - British female voice

/**
 * Generate voice briefing with CEPHO tone
 */
export async function generateVoiceBriefing(
  request: VoiceBriefingRequest
): Promise<VoiceBriefingResponse | null> {
  const apiKey = ENV.elevenLabsApiKey;
  if (!apiKey) {
    console.error("ElevenLabs API key not configured");
    return null;
  }

  const style = request.style || "briefing";
  const styleSettings = VOICE_STYLE_PRESETS[style];
  const voiceId = request.voiceId || VICTORIA_VOICE_ID;

  // Convert script structure to text if needed
  const scriptText = typeof request.script === "string" 
    ? request.script 
    : scriptToText(request.script);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text: scriptText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: styleSettings.stability,
            similarity_boost: styleSettings.similarity_boost,
            style: styleSettings.style,
            use_speaker_boost: styleSettings.use_speaker_boost
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return null;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    let audioUrl: string | undefined;

    // Save to S3 if requested
    if (request.saveToStorage) {
      const timestamp = Date.now();
      const filename = request.filename || `voice-briefing-${timestamp}.mp3`;
      const fileKey = `voice/${filename}`;
      const result = await storagePut(fileKey, audioBuffer, "audio/mpeg");
      audioUrl = result.url;
    }

    return {
      audioBuffer,
      audioUrl,
      voiceId,
      style
    };
  } catch (error) {
    console.error("Error generating voice briefing:", error);
    return null;
  }
}

// =============================================================================
// MORNING SIGNAL VOICE GENERATION
// =============================================================================

export interface MorningSignalContent {
  greeting: string;
  priorities: Array<{ title: string; description: string }>;
  calendar: Array<{ time: string; title: string }>;
  insights: string[];
  closingMessage: string;
}

/**
 * Generate Morning Signal voice briefing
 */
export async function generateMorningSignalVoice(
  content: MorningSignalContent
): Promise<VoiceBriefingResponse | null> {
  // Generate structured script
  const script = await generateStructuredScript({
    type: "morning_signal",
    title: "Morning Signal",
    keyPoints: [
      content.greeting,
      ...content.priorities.slice(0, 3).map(p => `${p.title}: ${p.description}`),
      content.calendar.length > 0 
        ? `Your schedule includes: ${content.calendar.slice(0, 3).map(c => `${c.title} at ${c.time}`).join(", ")}`
        : "",
      content.insights[0] || ""
    ].filter(Boolean),
    context: "This is the daily morning briefing delivered by Victoria, the Chief of Staff presenter."
  });

  // Override close with the provided closing message
  script.close = content.closingMessage;

  // Generate voice
  return generateVoiceBriefing({
    script,
    style: "briefing",
    saveToStorage: true,
    filename: `morning-signal-${new Date().toISOString().split("T")[0]}.mp3`
  });
}

// All functions and constants are already exported inline
