import type { Express } from "express";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { tasks, decisions, documents, projects, learningEntries, innovations } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─── Telegram API helpers ─────────────────────────────────────────────────────
async function sendMessage(chatId: number | string, text: string, parseMode: "Markdown" | "HTML" = "Markdown") {
  if (!BOT_TOKEN) return;
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

async function getFileUrl(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;
  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const data = await res.json() as { ok: boolean; result?: { file_path?: string } };
  if (!data.ok || !data.result?.file_path) return null;
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
}

// ─── Victoria classification ──────────────────────────────────────────────────
interface ClassificationResult {
  type: "task" | "decision" | "document" | "note" | "query";
  project: string;
  title: string;
  detail: string;
  priority?: "low" | "medium" | "high" | "critical";
  response?: string;
}

async function classifyMessage(text: string, hasFile: boolean): Promise<ClassificationResult> {
  const prompt = `You are Victoria, AI Chief of Staff for Jonathan Rickard at CEPHO. He has sent a message via Telegram.

Classify this message and extract structured data. Respond ONLY with valid JSON.

Message: "${text}"
Has attachment: ${hasFile}

Companies: Celadon (property), Celanova (property), Perfect (cleaning), Olmack (tech), Boundless (wellness), Personal

Classify as one of:
- "task" — something to do, an action item
- "decision" — a choice made or to be made
- "document" — a file, note, or reference to save
- "note" — a general observation or update
- "query" — a question for Victoria to answer

Return JSON:
{
  "type": "task" | "decision" | "document" | "note" | "query",
  "project": "Celadon" | "Celanova" | "Perfect" | "Olmack" | "Boundless" | "Personal" | "General",
  "title": "concise title (max 80 chars)",
  "detail": "full detail or context",
  "priority": "low" | "medium" | "high" | "critical",
  "response": "if type is query, answer here; otherwise a brief confirmation"
}`;

  try {
    const result = await invokeLLM({
      messages: [{ role: "user" as const, content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    const content = result.choices[0]?.message?.content;
    if (typeof content === "string") {
      return JSON.parse(content) as ClassificationResult;
    }
  } catch (e) {
    console.error("[Telegram] Classification error:", e);
  }

  // Fallback
  return {
    type: "note",
    project: "General",
    title: text.slice(0, 80),
    detail: text,
    priority: "medium",
    response: "Saved as a note.",
  };
}

// ─── Save to DB ───────────────────────────────────────────────────────────────
async function saveToDb(classification: ClassificationResult, fileUrl?: string): Promise<string> {
  const db = await getDb();
  if (!db) return "DB unavailable — not saved.";

  // Find project ID by name
  let projectId: number | null = null;
  if (classification.project && classification.project !== "General") {
    const projRows = await db.select().from(projects)
      .where(eq(projects.name, classification.project))
      .limit(1);
    projectId = projRows[0]?.id ?? null;
  }

  switch (classification.type) {
    case "task":
      await db.insert(tasks).values({
        title: classification.title,
        description: classification.detail,
        projectId,
        priority: classification.priority ?? "medium",
        status: "todo",
        assignee: "Jonathan",
      });
      // Capture to Vault
      await db.insert(learningEntries).values({
        source: "user",
        category: "task",
        insight: `Telegram task: "${classification.title}" for ${classification.project}`,
        context: JSON.stringify({ projectId, detail: classification.detail }),
        confidence: 90,
      });
      return `Task created in ${classification.project}: *${classification.title}*`;

    case "decision":
      await db.insert(decisions).values({
        title: classification.title,
        context: classification.detail,
        projectId,
        impact: classification.priority === "critical" ? "critical" : classification.priority === "high" ? "high" : "medium",
        status: "active",
        madeBy: "Jonathan",
      });
      await db.insert(learningEntries).values({
        source: "user",
        category: "decision",
        insight: `Telegram decision: "${classification.title}" for ${classification.project}`,
        context: JSON.stringify({ projectId, detail: classification.detail }),
        confidence: 90,
      });
      return `Decision logged in ${classification.project}: *${classification.title}*`;

    case "document":
      if (fileUrl) {
        try {
          const fileRes = await fetch(fileUrl);
          const buffer = Buffer.from(await fileRes.arrayBuffer());
          const ext = fileUrl.split(".").pop()?.split("?")[0] ?? "bin";
          const key = `telegram/${Date.now()}-${classification.title.replace(/[^a-zA-Z0-9._-]/g, "_")}.${ext}`;
          const { url } = await storagePut(key, buffer, "application/octet-stream");
          await db.insert(documents).values({
            name: classification.title,
            fileType: ext,
            fileSize: buffer.length,
            storageKey: key,
            storageUrl: url,
            projectId,
            isConfidential: 0,
            uploadedBy: "Jonathan (Telegram)",
            tags: "[]",
          });
          return `Document saved in ${classification.project}: *${classification.title}*`;
        } catch (e) {
          console.error("[Telegram] Document save error:", e);
        }
      }
      // Save as note if no file
      await db.insert(learningEntries).values({
        source: "user",
        category: "document",
        insight: classification.title,
        context: classification.detail,
        confidence: 85,
      });
      return `Note saved in ${classification.project}: *${classification.title}*`;

    case "note":
    default:
      await db.insert(learningEntries).values({
        source: "user",
        category: "note",
        insight: classification.title,
        context: classification.detail,
        confidence: 80,
      });
      return `Note captured: *${classification.title}*`;
  }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────
async function handleUpdate(update: any) {
  const message = update.message || update.channel_post;
  if (!message) return;

  const chatId = message.chat.id;
  const text = message.text || message.caption || "";
  console.log(`[Telegram] INCOMING chatId=${chatId} user=${message.from?.first_name || ''} @${message.from?.username || ''} text="${text.slice(0, 60)}"`);

  // Handle /chatid command - returns the user's chat ID
  if (text.startsWith("/chatid")) {
    await sendMessage(chatId, `Your Telegram Chat ID is:\n\`${chatId}\`\n\nShare this with the system to enable direct notifications.`);
    return;
  }

  // Handle /start and /help commands
  if (text.startsWith("/start") || text.startsWith("/help")) {
    await sendMessage(chatId, `*CEPHO Brain Bot* — @Cepho_chiefofstaff_bot

Send me anything and Victoria will classify and route it:

*Examples:*
• "Call the Celadon solicitor about the lease" → Task
• "Decided to pause Olmack hiring until Q3" → Decision
• "Note: Perfect revenue up 12% this month" → Note
• "What's the runway for Celanova?" → Query

*Attach files* to save documents to a project portal.

*Projects:* Celadon · Celanova · Perfect · Olmack · Boundless · Personal`);
    return;
  }

  // Handle /idea command — capture idea directly into Innovation Hub flywheel
  if (text.startsWith("/idea")) {
    const ideaText = text.replace(/^\/idea\s*/i, "").trim();
    if (!ideaText) {
      await sendMessage(chatId, "*Innovation Hub \u2014 Idea Capture*\n\nSend your idea like this:\n/idea [your idea or story here]\n\nOr just send any text and I will classify it. Voice notes also work.");
      return;
    }
    await sendMessage(chatId, "💡 Capturing idea and running assessment...");
    try {
      // Structure the raw text into an idea
      const structurePrompt = `A user sent this message via Telegram as a business idea or story: "${ideaText}"
Extract and structure it. Return JSON only:
{
  "title": "Concise idea name (max 8 words)",
  "description": "2-3 sentence structured description of the opportunity",
  "category": "product|process|market|technology|partnership|other"
}`;
      const response = await invokeLLM({
        messages: [{ role: "user" as const, content: structurePrompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0].message.content;
      const structured = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const db = await getDb();
      if (db) {
        const [result] = await db.insert(innovations).values({
          title: structured.title ?? ideaText.slice(0, 100),
          description: structured.description ?? ideaText,
          category: structured.category ?? "other",
          status: "exploring",
          votes: 0,
          tags: "[]",
          sourceName: "Telegram",
          flywheelStage: "captured",
          autoGenerated: false,
        });
        const id = (result as { insertId: number }).insertId;
        await sendMessage(chatId, `💡 *Idea captured* — ID #${id}

*${structured.title}*
${structured.description}

Assessment running in background. Check Innovation Hub for results.`);
      }
    } catch (e) {
      console.error("[Telegram] /idea error:", e);
      await sendMessage(chatId, "Could not capture idea. Please try again.");
    }
    return;
  }

  // Handle /projects command
  if (text.startsWith("/projects")) {
    const db = await getDb();
    if (db) {
      const allProjects = await db.select().from(projects).orderBy(projects.name);
      const list = allProjects.map(p => `• *${p.name}* — ${p.status === "green" ? "🟢" : p.status === "amber" ? "🟡" : "🔴"}`).join("\n");
      await sendMessage(chatId, `*Active Projects:*\n\n${list}`);
    }
    return;
  }

  if (!text && !message.voice && !message.document && !message.photo) {
    await sendMessage(chatId, "Send me a text message, voice note, or file to capture it.");
    return;
  }

  // Handle voice notes — transcribe first
  let processText = text;
  if (message.voice) {
    const fileUrl = await getFileUrl(message.voice.file_id);
    if (fileUrl) {
      try {
        const { transcribeAudio } = await import("./_core/voiceTranscription");
        const transcription = await transcribeAudio({ audioUrl: fileUrl, language: "en" });
        if ("error" in transcription) {
          await sendMessage(chatId, `Could not transcribe voice note: ${transcription.error}`);
          return;
        }
        processText = transcription.text;
        await sendMessage(chatId, `🎙 _Transcribed:_ "${processText}"`);
      } catch (e) {
        console.error("[Telegram] Voice transcription error:", e);
        await sendMessage(chatId, "Could not transcribe voice note. Please send as text.");
        return;
      }
    }
  }

  // Handle documents/photos
  let fileUrl: string | undefined;
  if (message.document) {
    fileUrl = (await getFileUrl(message.document.file_id)) ?? undefined;
    if (!processText) processText = message.document.file_name ?? "Document";
  } else if (message.photo) {
    const largest = message.photo[message.photo.length - 1];
    fileUrl = (await getFileUrl(largest.file_id)) ?? undefined;
    if (!processText) processText = "Photo";
  }

  if (!processText) {
    await sendMessage(chatId, "Could not extract content from this message.");
    return;
  }

  // Classify and save
  await sendMessage(chatId, "⏳ Processing...");
  const classification = await classifyMessage(processText, !!fileUrl);

  let savedMsg: string;
  if (classification.type === "query") {
    savedMsg = classification.response ?? "No answer available.";
  } else {
    savedMsg = await saveToDb(classification, fileUrl);
  }

  const typeEmoji: Record<string, string> = {
    task: "✅",
    decision: "🎯",
    document: "📄",
    note: "📝",
    query: "💬",
  };

  const emoji = typeEmoji[classification.type] ?? "📝";
  const replyLines = [
    `${emoji} *${classification.type.charAt(0).toUpperCase() + classification.type.slice(1)}* → ${classification.project}`,
    savedMsg,
  ];

  if (classification.type === "query" && classification.response) {
    replyLines.push(`\n${classification.response}`);
  }

  await sendMessage(chatId, replyLines.join("\n"));
}

// ─── Register webhook route ───────────────────────────────────────────────────
export function registerTelegramWebhook(app: Express) {
  if (!BOT_TOKEN) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN not set — bot disabled");
    return;
  }

  app.post("/api/telegram/webhook", async (req, res) => {
    res.sendStatus(200); // Respond immediately to Telegram
    try {
      await handleUpdate(req.body);
    } catch (e) {
      console.error("[Telegram] Webhook error:", e);
    }
  });

  console.log("[Telegram] Webhook route registered at /api/telegram/webhook");
}

// ─── Set webhook URL ──────────────────────────────────────────────────────────
export async function setTelegramWebhook(publicUrl: string) {
  if (!BOT_TOKEN) return;
  const webhookUrl = `${publicUrl}/api/telegram/webhook`;
  const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message", "channel_post"] }),
  });
  const data = await res.json() as { ok: boolean; description?: string };
  if (data.ok) {
    console.log(`[Telegram] Webhook set to ${webhookUrl}`);
  } else {
    console.error("[Telegram] Failed to set webhook:", data.description);
  }
}
