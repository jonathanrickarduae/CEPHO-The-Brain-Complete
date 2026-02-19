/**
import { logger } from "../utils/logger";
const log = logger.module("DailySignal");
 * Daily Signal Generator Service
 * 
 * Generates the Morning Signal in multiple formats:
 * - Voice Note (ElevenLabs TTS)
 * - Video (AI Avatar)
 * - PDF (Branded CEPHO document)
 * 
 * All outputs pass through Chief of Staff quality gate before delivery.
 */

import { getDb } from "./db/index";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

// =============================================================================
// TYPES
// =============================================================================

export interface SignalContent {
  date: Date;
  greeting: string;
  wellnessScore: number;
  priorities: Priority[];
  calendar: CalendarItem[];
  tasks: TaskItem[];
  insights: string[];
  marketUpdates?: string[];
  projectUpdates?: ProjectUpdate[];
  closingMessage: string;
}

export interface Priority {
  id: string;
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  category: string;
}

export interface CalendarItem {
  time: string;
  title: string;
  duration: string;
  type: "meeting" | "call" | "task" | "reminder";
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "blocked";
}

export interface ProjectUpdate {
  projectName: string;
  status: string;
  nextAction: string;
}

export interface GeneratedSignal {
  content: SignalContent;
  voiceUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  generatedAt: Date;
  qualityScore: number;
  cosApproved: boolean;
}

// =============================================================================
// CONTENT GENERATION
// =============================================================================

/**
 * Generate the signal content for a user
 */
export async function generateSignalContent(userId: number): Promise<SignalContent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Get user's recent mood/wellness data
  // For now, using placeholder - will connect to actual data
  const wellnessScore = 72; // Will pull from actual wellness tracking
  
  // Generate personalized greeting
  const greeting = await generatePersonalizedGreeting(dayOfWeek, dateStr, wellnessScore);
  
  // Get priorities (placeholder - will connect to actual task system)
  const priorities: Priority[] = [
    {
      id: "1",
      title: "Complete Phase 1 Development",
      description: "Finish all outstanding Phase 1 items for CEPHO.Ai",
      urgency: "high",
      category: "Development"
    },
    {
      id: "2", 
      title: "Review Technology Synthesis Framework",
      description: "Validate the framework with SME panel",
      urgency: "medium",
      category: "Strategy"
    },
    {
      id: "3",
      title: "Test Daily Signal Pipeline",
      description: "Ensure voice, video, and PDF generation work seamlessly",
      urgency: "high",
      category: "Testing"
    }
  ];
  
  // Get calendar items (placeholder - will connect to calendar integration)
  const calendar: CalendarItem[] = [
    { time: "09:00", title: "Morning Review", duration: "30 min", type: "task" },
    { time: "10:00", title: "Development Sprint", duration: "2 hours", type: "task" },
    { time: "14:00", title: "SME Panel Review", duration: "1 hour", type: "meeting" }
  ];
  
  // Get tasks (placeholder - will connect to task system)
  const tasks: TaskItem[] = [
    { id: "t1", title: "Daily Signal multi-format output", priority: "high", status: "in_progress" },
    { id: "t2", title: "Go-live protocol setup", priority: "high", status: "pending" },
    { id: "t3", title: "Integration value audit", priority: "medium", status: "pending" }
  ];
  
  // Generate insights
  const insights = [
    "Your productivity has been 15% higher this week compared to last week",
    "Consider scheduling a break - you've had 4 consecutive high-intensity days",
    "The Technology Synthesis Framework shows strong potential for the dementia glasses concept"
  ];
  
  // Project updates
  const projectUpdates: ProjectUpdate[] = [
    { projectName: "CEPHO.Ai", status: "Phase 1 - 59% complete", nextAction: "Complete Daily Signal pipeline" },
    { projectName: "Boundless", status: "Research phase", nextAction: "Await investor feedback" }
  ];
  
  // Closing message
  const closingMessage = `Let's make today count. Focus on your top 3 priorities and remember - we're getting you to 100. Your Chief of Staff is here to support you throughout the day.`;
  
  return {
    date: today,
    greeting,
    wellnessScore,
    priorities,
    calendar,
    tasks,
    insights,
    projectUpdates,
    closingMessage
  };
}

/**
 * Generate personalized greeting using LLM
 */
async function generatePersonalizedGreeting(
  dayOfWeek: string,
  dateStr: string,
  wellnessScore: number
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional Chief of Staff generating a brief, warm morning greeting. Keep it to 2-3 sentences. Be encouraging but professional. Reference the wellness score subtly."
        },
        {
          role: "user",
          content: `Generate a morning greeting for ${dayOfWeek}, ${dateStr}. The user's current wellness score is ${wellnessScore}/100.`
        }
      ]
    });
    
    const content = response.choices[0]?.message?.content;
    if (content && typeof content === 'string') {
      return content;
    }
  } catch (error) {
    log.error("Error generating greeting:", error);
  }
  
  // Fallback greeting
  return `Good morning! It's ${dayOfWeek}, ${dateStr}. Your wellness score is ${wellnessScore}/100. Let's make today productive.`;
}

// =============================================================================
// VOICE GENERATION (ElevenLabs)
// =============================================================================

/**
 * Generate voice note from signal content
 */
export async function generateVoiceNote(content: SignalContent): Promise<string | null> {
  const script = generateVoiceScript(content);
  
  try {
    const apiKey = ENV.elevenLabsApiKey;
    if (!apiKey) {
      log.error("ElevenLabs API key not configured");
      return null;
    }
    
    // Default voice ID - can be customized per user
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
    
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
          text: script,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );
    
    if (!response.ok) {
      log.error("ElevenLabs API error:", response.status);
      return null;
    }
    
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);
    
    // Upload to S3
    const timestamp = Date.now();
    const fileKey = `signals/voice/morning-signal-${timestamp}.mp3`;
    const { url } = await storagePut(fileKey, audioData, "audio/mpeg");
    
    return url;
  } catch (error) {
    log.error("Error generating voice note:", error);
    return null;
  }
}

/**
 * Generate voice script from content
 */
function generateVoiceScript(content: SignalContent): string {
  const parts: string[] = [];
  
  // Greeting
  parts.push(content.greeting);
  parts.push("");
  
  // Priorities
  parts.push("Here are your top priorities for today:");
  content.priorities.slice(0, 3).forEach((p, i) => {
    parts.push(`Priority ${i + 1}: ${p.title}. ${p.description}`);
  });
  parts.push("");
  
  // Calendar highlights
  if (content.calendar.length > 0) {
    parts.push("Your schedule today includes:");
    content.calendar.slice(0, 3).forEach(c => {
      parts.push(`At ${c.time}, ${c.title} for ${c.duration}.`);
    });
    parts.push("");
  }
  
  // Insights
  if (content.insights.length > 0) {
    parts.push("A quick insight for you:");
    parts.push(content.insights[0]);
    parts.push("");
  }
  
  // Closing
  parts.push(content.closingMessage);
  
  return parts.join(" ");
}

// =============================================================================
// VIDEO GENERATION (AI Avatar)
// =============================================================================

/**
 * Generate video from signal content
 * Note: This is a placeholder - actual implementation depends on video service
 */
export async function generateVideo(content: SignalContent): Promise<string | null> {
  const script = generateVideoScript(content);
  
  // TODO: Integrate with AI avatar video service (e.g., HeyGen, Synthesia, D-ID)
  // For now, return null - will implement when video service is configured
  
  log.debug("Video generation script prepared:", script.substring(0, 100) + "...");
  
  // Placeholder - log that video generation is not yet configured
  log.debug("Video generation service not yet configured - skipping");
  return null;
}

/**
 * Generate video script from content
 */
function generateVideoScript(content: SignalContent): string {
  // Similar to voice script but formatted for video presentation
  return generateVoiceScript(content);
}

// =============================================================================
// PDF GENERATION
// =============================================================================

/**
 * Generate branded PDF from signal content
 */
export async function generatePDF(content: SignalContent): Promise<string | null> {
  try {
    // Generate HTML content following CEPHO design guidelines
    const html = generatePDFHTML(content);
    
    // For now, store the HTML - PDF conversion will use the existing CEPHO document generator
    const timestamp = Date.now();
    const fileKey = `signals/pdf/morning-signal-${timestamp}.html`;
    const { url } = await storagePut(fileKey, Buffer.from(html), "text/html");
    
    // For now, return the HTML URL
    return url;
  } catch (error) {
    log.error("Error generating PDF:", error);
    return null;
  }
}

/**
 * Generate HTML content for PDF following CEPHO design guidelines
 */
function generatePDFHTML(content: SignalContent): string {
  const dateStr = content.date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CEPHO Morning Signal - ${dateStr}</title>
  <style>
    /* CEPHO Design Guidelines - Updated 18 Jan 2026 */
    :root {
      --cepho-primary: #E91E8C;
      --cepho-secondary: #0D0D0D;
      --cepho-accent: #E91E8C;
      --cepho-text: #000000;
      --cepho-light: #FFFFFF;
      --cepho-card: #F5F5F5;
    }
    
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      color: var(--cepho-text);
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      background: var(--cepho-light);
    }
    
    .header {
      background: linear-gradient(135deg, var(--cepho-primary), var(--cepho-secondary));
      color: white;
      padding: 30px;
      margin: -40px -40px 30px -40px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    
    .header .date {
      opacity: 0.9;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .wellness-badge {
      display: inline-block;
      background: var(--cepho-gold);
      color: var(--cepho-primary);
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin-top: 15px;
    }
    
    .section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .section h2 {
      color: var(--cepho-primary);
      font-size: 18px;
      margin: 0 0 16px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--cepho-accent);
    }
    
    .priority-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    
    .priority-item:last-child {
      border-bottom: none;
    }
    
    .priority-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      text-transform: uppercase;
    }
    
    .priority-high { background: #FEE2E2; color: #DC2626; }
    .priority-medium { background: #FEF3C7; color: #D97706; }
    .priority-low { background: #D1FAE5; color: #059669; }
    
    .calendar-item {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .calendar-time {
      font-weight: 600;
      color: var(--cepho-accent);
      width: 80px;
    }
    
    .insight-item {
      padding: 12px;
      background: var(--cepho-light);
      border-left: 4px solid var(--cepho-gold);
      margin-bottom: 10px;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    
    .closing {
      background: linear-gradient(135deg, var(--cepho-primary), var(--cepho-secondary));
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CEPHO Morning Signal</h1>
    <div class="date">${dateStr}</div>
    <div class="wellness-badge">Wellness Score: ${content.wellnessScore}/100</div>
  </div>
  
  <div class="section">
    <p style="font-size: 16px; color: var(--cepho-secondary);">${content.greeting}</p>
  </div>
  
  <div class="section">
    <h2>Today's Priorities</h2>
    ${content.priorities.map(p => `
      <div class="priority-item">
        <span class="priority-badge priority-${p.urgency}">${p.urgency}</span>
        <div>
          <strong>${p.title}</strong>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${p.description}</p>
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="section">
    <h2>Today's Schedule</h2>
    ${content.calendar.map(c => `
      <div class="calendar-item">
        <span class="calendar-time">${c.time}</span>
        <span>${c.title} (${c.duration})</span>
      </div>
    `).join('')}
  </div>
  
  <div class="section">
    <h2>Insights</h2>
    ${content.insights.map(i => `
      <div class="insight-item">${i}</div>
    `).join('')}
  </div>
  
  ${content.projectUpdates ? `
  <div class="section">
    <h2>Project Updates</h2>
    ${content.projectUpdates.map(p => `
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <strong>${p.projectName}</strong>
        <span style="color: var(--cepho-accent); margin-left: 10px;">${p.status}</span>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Next: ${p.nextAction}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="closing">
    ${content.closingMessage}
  </div>
  
  <div class="footer">
    Generated by CEPHO.Ai Chief of Staff | ${new Date().toISOString()}
  </div>
</body>
</html>`;
}

// =============================================================================
// QUALITY GATE (Chief of Staff Validation)
// =============================================================================

/**
 * Validate signal through Chief of Staff quality gate
 */
export async function validateSignalQuality(
  content: SignalContent,
  voiceUrl: string | null,
  videoUrl: string | null,
  pdfUrl: string | null
): Promise<{ approved: boolean; score: number; feedback: string[] }> {
  const feedback: string[] = [];
  let score = 100;
  
  // Check content completeness
  if (!content.greeting) {
    feedback.push("Missing greeting");
    score -= 10;
  }
  
  if (content.priorities.length === 0) {
    feedback.push("No priorities defined");
    score -= 15;
  }
  
  if (content.calendar.length === 0) {
    feedback.push("No calendar items");
    score -= 5;
  }
  
  if (content.insights.length === 0) {
    feedback.push("No insights provided");
    score -= 10;
  }
  
  // Check format availability
  if (!voiceUrl && !videoUrl && !pdfUrl) {
    feedback.push("No output formats generated");
    score -= 30;
  }
  
  // Check wellness score validity
  if (content.wellnessScore < 0 || content.wellnessScore > 100) {
    feedback.push("Invalid wellness score");
    score -= 10;
  }
  
  // Approval threshold is 70
  const approved = score >= 70;
  
  if (!approved) {
    feedback.push(`Quality score ${score}/100 below threshold (70)`);
  }
  
  return { approved, score, feedback };
}

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

/**
 * Generate complete Daily Signal with all formats
 * Single trigger generates all three formats
 */
export async function generateDailySignal(userId: number): Promise<GeneratedSignal> {
  log.debug(`[DailySignal] Starting generation for user ${userId}`);
  
  // Step 1: Generate content
  log.debug("[DailySignal] Generating content...");
  const content = await generateSignalContent(userId);
  
  // Step 2: Generate all formats in parallel
  log.debug("[DailySignal] Generating formats (voice, video, PDF)...");
  const [voiceUrl, videoUrl, pdfUrl] = await Promise.all([
    generateVoiceNote(content).catch(err => {
      log.error("[DailySignal] Voice generation failed:", err);
      return null;
    }),
    generateVideo(content).catch(err => {
      log.error("[DailySignal] Video generation failed:", err);
      return null;
    }),
    generatePDF(content).catch(err => {
      log.error("[DailySignal] PDF generation failed:", err);
      return null;
    })
  ]);
  
  // Step 3: Quality gate validation
  log.debug("[DailySignal] Running quality gate...");
  const validation = await validateSignalQuality(content, voiceUrl, videoUrl, pdfUrl);
  
  // Step 4: Log results
  log.debug(`[DailySignal] Generation complete. Quality: ${validation.score}/100, Approved: ${validation.approved}`);
  if (validation.feedback.length > 0) {
    log.debug("[DailySignal] Feedback:", validation.feedback);
  }
  
  return {
    content,
    voiceUrl: voiceUrl || undefined,
    videoUrl: videoUrl || undefined,
    pdfUrl: pdfUrl || undefined,
    generatedAt: new Date(),
    qualityScore: validation.score,
    cosApproved: validation.approved
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const dailySignalService = {
  generateSignalContent,
  generateVoiceNote,
  generateVideo,
  generatePDF,
  validateSignalQuality,
  generateDailySignal
};
