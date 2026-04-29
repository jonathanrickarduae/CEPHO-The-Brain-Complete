/**
 * CEPHO Telegram Bot Service
 *
 * The primary interface for the owner. Everything flows through here:
 *   - Text messages → Agent1 chat
 *   - Voice notes → Transcribe → Agent1 chat
 *   - Photos/documents → Store → Agent1 notified
 *   - Morning brief audio → synthesised and sent
 *   - Evening check-in prompt → sent at configured time
 *   - Task allocation list → sent with inline keyboard for quick approval
 *
 * Bot: @Cepho_COS_Bot
 * Token env: TELEGRAM_BOT_TOKEN
 * Owner chat ID env: TELEGRAM_OWNER_CHAT_ID
 */

import TelegramBot from "node-telegram-bot-api";
import { db } from "../db";
import { invokeLLM } from "../_core/llm";
import { logger } from "../utils/logger";
import {
  agent1Messages,
  tasks,
  userSettings,
  users,
  voiceNotes,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

const log = logger.module("TelegramBot");

let botInstance: TelegramBot | null = null;

// ─── Bot Singleton ────────────────────────────────────────────────────────────

export function getTelegramBot(): TelegramBot | null {
  return botInstance;
}

export function initTelegramBot(): TelegramBot | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    log.info("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled");
    return null;
  }

  if (botInstance) return botInstance;

  // Use polling in development, webhook in production
  const useWebhook = process.env.NODE_ENV === "production";

  if (useWebhook) {
    botInstance = new TelegramBot(token, { polling: false });
    log.info("Telegram bot initialised in webhook mode");
  } else {
    botInstance = new TelegramBot(token, { polling: true });
    log.info("Telegram bot initialised in polling mode");
  }

  registerHandlers(botInstance);
  return botInstance;
}

// ─── Get Owner Info ───────────────────────────────────────────────────────────

export async function getOwnerChatId(): Promise<string | null> {
  // First check env var (set after first /start)
  const envChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (envChatId) return envChatId;

  // Fall back to DB — stored when owner first messages the bot
  try {
    const ownerOpenId = process.env.OWNER_OPEN_ID;
    if (!ownerOpenId) return null;
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.openId, ownerOpenId))
      .limit(1);
    if (!user) return null;

    const [settings] = await db
      .select({ metadata: userSettings.metadata })
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    const meta = settings?.metadata as Record<string, unknown> | null;
    return (meta?.telegramChatId as string) ?? null;
  } catch {
    return null;
  }
}

export async function getOwnerUserId(): Promise<number | null> {
  try {
    const ownerOpenId = process.env.OWNER_OPEN_ID;
    if (!ownerOpenId) return null;
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.openId, ownerOpenId))
      .limit(1);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Send Helpers ─────────────────────────────────────────────────────────────

export async function sendToOwner(text: string): Promise<boolean> {
  const bot = getTelegramBot();
  const chatId = await getOwnerChatId();
  if (!bot || !chatId) return false;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    return true;
  } catch (err) {
    log.error("Failed to send Telegram message", err);
    return false;
  }
}

export async function sendAudioToOwner(
  audioUrl: string,
  caption?: string
): Promise<boolean> {
  const bot = getTelegramBot();
  const chatId = await getOwnerChatId();
  if (!bot || !chatId) return false;
  try {
    await bot.sendAudio(chatId, audioUrl, { caption });
    return true;
  } catch (err) {
    log.error("Failed to send Telegram audio", err);
    return false;
  }
}

export async function sendTaskAllocationList(
  items: Array<{ id: number; title: string; recommendation: string }>
): Promise<boolean> {
  const bot = getTelegramBot();
  const chatId = await getOwnerChatId();
  if (!bot || !chatId) return false;

  try {
    const lines = items
      .map(
        (item, i) =>
          `*${i + 1}. ${item.title}*\n_Agent1 suggests: ${item.recommendation}_`
      )
      .join("\n\n");

    const message = `📋 *Morning Task Allocation*\n\nHere are today's items. Reply with your decisions:\n\n${lines}\n\nReply format: "1 me, 2 cos, 3 defer" or just say what you want to do.`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    return true;
  } catch (err) {
    log.error("Failed to send task allocation list", err);
    return false;
  }
}

// ─── Message Handlers ─────────────────────────────────────────────────────────

function registerHandlers(bot: TelegramBot) {
  // /start command — register the chat ID
  bot.onText(/\/start/, async msg => {
    const chatId = msg.chat.id.toString();
    const firstName = msg.from?.first_name ?? "there";

    // Store chat ID in owner's settings metadata
    await storeChatId(chatId);

    await bot.sendMessage(
      chatId,
      `👋 *Welcome, ${firstName}!*\n\nI'm your CEPHO Chief of Staff. I'm here to help you run your day.\n\n*What I can do:*\n• 🎤 Send me a voice note — I'll transcribe it and act on it\n• 💬 Text me anything — I'll route it to Agent1\n• 📋 I'll send you your morning brief every day\n• 🌙 I'll prompt you for an end-of-day check-in\n\nJust start talking. I'm listening.`,
      { parse_mode: "Markdown" }
    );

    log.info(`Telegram owner registered with chat ID: ${chatId}`);
  });

  // /status command — quick system status
  bot.onText(/\/status/, async msg => {
    const chatId = msg.chat.id.toString();
    await handleStatusCommand(bot, chatId);
  });

  // /tasks command — show pending tasks
  bot.onText(/\/tasks/, async msg => {
    const chatId = msg.chat.id.toString();
    await handleTasksCommand(bot, chatId);
  });

  // /brief command — trigger morning brief on demand
  bot.onText(/\/brief/, async msg => {
    const chatId = msg.chat.id.toString();
    await bot.sendMessage(chatId, "⏳ Generating your brief now...");
    await triggerMorningBrief(chatId);
  });

  // Voice note handler
  bot.on("voice", async msg => {
    const chatId = msg.chat.id.toString();
    await handleVoiceNote(bot, msg, chatId);
  });

  // Audio file handler (some clients send as audio instead of voice)
  bot.on("audio", async msg => {
    const chatId = msg.chat.id.toString();
    await handleVoiceNote(bot, msg, chatId);
  });

  // Text message handler — route to Agent1
  bot.on("message", async msg => {
    // Skip commands and non-text messages
    if (!msg.text || msg.text.startsWith("/")) return;
    const chatId = msg.chat.id.toString();
    await handleTextMessage(bot, msg.text, chatId);
  });

  log.info("Telegram bot handlers registered");
}

// ─── Voice Note Handler ───────────────────────────────────────────────────────

async function handleVoiceNote(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  chatId: string
) {
  try {
    await bot.sendMessage(chatId, "🎤 Got your voice note — transcribing...");

    const fileId = msg.voice?.file_id ?? msg.audio?.file_id;
    if (!fileId) {
      await bot.sendMessage(chatId, "❌ Could not read the audio file.");
      return;
    }

    // Download the voice file from Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    const fileInfo = await bot.getFile(fileId);
    const filePath = fileInfo.file_path;
    const audioUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // Transcribe using OpenAI Whisper
    const transcript = await transcribeAudioUrl(audioUrl);
    if (!transcript) {
      await bot.sendMessage(
        chatId,
        "❌ Transcription failed. Please try again."
      );
      return;
    }

    await bot.sendMessage(
      chatId,
      `📝 *Transcribed:*\n"${transcript}"\n\n⏳ Sending to Agent1...`,
      { parse_mode: "Markdown" }
    );

    // Route to Agent1
    const response = await routeToAgent1(transcript);

    // Save as voice note in DB
    const userId = await getOwnerUserId();
    if (userId) {
      await db.insert(voiceNotes).values({
        userId,
        content: transcript,
        category: "telegram",
        isActionItem: true,
        isProcessed: true,
        extractedTasks: response.tasks ?? [],
      });
    }

    await bot.sendMessage(
      chatId,
      `✅ *Agent1 Response:*\n\n${response.reply}`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    log.error("Voice note handling failed", err);
    await bot.sendMessage(
      chatId,
      "❌ Something went wrong processing your voice note. Please try again."
    );
  }
}

// ─── Text Message Handler ─────────────────────────────────────────────────────

async function handleTextMessage(
  bot: TelegramBot,
  text: string,
  chatId: string
) {
  try {
    await bot.sendChatAction(chatId, "typing");
    const response = await routeToAgent1(text);
    await bot.sendMessage(chatId, response.reply, { parse_mode: "Markdown" });
  } catch (err) {
    log.error("Text message handling failed", err);
    await bot.sendMessage(
      chatId,
      "❌ Something went wrong. Please try again."
    );
  }
}

// ─── Agent1 Router ────────────────────────────────────────────────────────────

async function routeToAgent1(
  message: string
): Promise<{ reply: string; tasks?: string[] }> {
  try {
    const userId = await getOwnerUserId();

    // Get Agent1 context
    let contextSummary = "";
    if (userId) {
      const [recentHistory, pendingTasks] = await Promise.all([
        db
          .select({ role: agent1Messages.role, content: agent1Messages.content })
          .from(agent1Messages)
          .where(eq(agent1Messages.userId, userId))
          .orderBy(desc(agent1Messages.createdAt))
          .limit(10),
        db
          .select({ title: tasks.title, priority: tasks.priority })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")))
          .limit(5),
      ]);

      const recentMessages = recentHistory
        .reverse()
        .map(h => `${h.role}: ${h.content}`)
        .join("\n");

      const taskList = pendingTasks
        .map(t => `- ${t.title} (${t.priority})`)
        .join("\n");

      contextSummary = `
Recent conversation:
${recentMessages || "No recent history"}

Pending tasks:
${taskList || "No pending tasks"}
      `.trim();

      // Store the incoming message in chat history
      await db.insert(agent1Messages).values({
        userId,
        role: "user",
        content: `[Via Telegram] ${message}`,
        operatingMode: "Chief of Staff",
        responseLevel: "Practical",
      });
    }

    const systemPrompt = `You are Agent1, the CEPHO Chief of Staff — a highly capable personal AI operating as the owner's right hand. You receive messages via Telegram from the owner who is often on the move. Be concise, action-oriented, and practical. 

When the owner gives you a task or instruction:
1. Acknowledge it clearly
2. State what you will do or have done
3. If you need clarification, ask one specific question
4. Keep responses under 200 words for Telegram readability

Context:
${contextSummary}`;

    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const replyContent = result.choices?.[0]?.message?.content;
    const reply = typeof replyContent === "string"
      ? replyContent
      : "I received your message and will act on it.";

    // Extract any tasks mentioned
    const taskPattern = /(?:create task|add task|remind me to|todo:)\s+(.+)/gi;
    const extractedTasks: string[] = [];
    let match;
    while ((match = taskPattern.exec(message)) !== null) {
      extractedTasks.push(match[1]);
    }

    // Store Agent1 response in chat history
    if (userId) {
      await db.insert(agent1Messages).values({
        userId,
        role: "assistant",
        content: reply,
        operatingMode: "Chief of Staff",
        responseLevel: "Practical",
      });
    }

    return { reply, tasks: extractedTasks };
  } catch (err) {
    log.error("Agent1 routing failed", err);
    return {
      reply:
        "I received your message. I'll process it and follow up shortly.",
    };
  }
}

// ─── Transcription ────────────────────────────────────────────────────────────

async function transcribeAudioUrl(audioUrl: string): Promise<string | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      log.error("OPENAI_API_KEY not set — cannot transcribe");
      return null;
    }

    // Download the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      log.error(`Failed to download audio: ${response.status}`);
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/ogg" });

    // Use OpenAI Whisper via fetch (avoid SDK import issues)
    const formData = new FormData();
    formData.append("file", audioBlob, "voice.ogg");
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      }
    );

    if (!whisperResponse.ok) {
      const err = await whisperResponse.text();
      log.error(`Whisper transcription failed: ${err}`);
      return null;
    }

    const data = (await whisperResponse.json()) as { text: string };
    return data.text ?? null;
  } catch (err) {
    log.error("Transcription error", err);
    return null;
  }
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

async function handleStatusCommand(bot: TelegramBot, chatId: string) {
  try {
    const userId = await getOwnerUserId();
    if (!userId) {
      await bot.sendMessage(chatId, "❌ Owner account not found.");
      return;
    }

    const [pendingCount, activeTasks] = await Promise.all([
      db
        .select({ title: tasks.title })
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")))
        .limit(3),
      db
        .select({ title: tasks.title, status: tasks.status })
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "in_progress")))
        .limit(3),
    ]);

    const pending = pendingCount.map(t => `• ${t.title}`).join("\n");
    const active = activeTasks.map(t => `• ${t.title}`).join("\n");

    await bot.sendMessage(
      chatId,
      `📊 *CEPHO Status*\n\n*Pending tasks (${pendingCount.length}):*\n${pending || "None"}\n\n*In progress (${activeTasks.length}):*\n${active || "None"}\n\nUse /tasks for full list or /brief for today's briefing.`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    log.error("Status command failed", err);
    await bot.sendMessage(chatId, "❌ Could not fetch status.");
  }
}

async function handleTasksCommand(bot: TelegramBot, chatId: string) {
  try {
    const userId = await getOwnerUserId();
    if (!userId) {
      await bot.sendMessage(chatId, "❌ Owner account not found.");
      return;
    }

    const pendingTasks = await db
      .select({ title: tasks.title, priority: tasks.priority, dueDate: tasks.dueDate })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")))
      .orderBy(desc(tasks.createdAt))
      .limit(10);

    if (pendingTasks.length === 0) {
      await bot.sendMessage(chatId, "✅ No pending tasks. You're clear!");
      return;
    }

    const taskList = pendingTasks
      .map((t, i) => {
        const due = t.dueDate
          ? ` — due ${new Date(t.dueDate).toLocaleDateString("en-GB")}`
          : "";
        const priority = t.priority === "high" ? "🔴" : t.priority === "medium" ? "🟡" : "⚪";
        return `${priority} ${i + 1}. ${t.title}${due}`;
      })
      .join("\n");

    await bot.sendMessage(
      chatId,
      `📋 *Your Pending Tasks*\n\n${taskList}\n\nReply with a task number to get details, or tell me what to do with any of them.`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    log.error("Tasks command failed", err);
    await bot.sendMessage(chatId, "❌ Could not fetch tasks.");
  }
}

// ─── Morning Brief Trigger ────────────────────────────────────────────────────

export async function triggerMorningBrief(chatId?: string): Promise<void> {
  const bot = getTelegramBot();
  const targetChatId = chatId ?? (await getOwnerChatId());
  if (!bot || !targetChatId) {
    log.info("Cannot send morning brief — bot or chat ID not available");
    return;
  }

  try {
    const userId = await getOwnerUserId();
    if (!userId) return;

    // Gather context for the brief
    const [pendingTasks, recentHistory] = await Promise.all([
      db
        .select({ title: tasks.title, priority: tasks.priority, dueDate: tasks.dueDate })
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")))
        .orderBy(desc(tasks.createdAt))
        .limit(10),
      db
        .select({ role: agent1Messages.role, content: agent1Messages.content, createdAt: agent1Messages.createdAt })
        .from(agent1Messages)
        .where(eq(agent1Messages.userId, userId))
        .orderBy(desc(agent1Messages.createdAt))
        .limit(5),
    ]);

    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const taskSummary =
      pendingTasks.length > 0
        ? pendingTasks
            .slice(0, 5)
            .map(t => `• ${t.title}`)
            .join("\n")
        : "No pending tasks";

    // Generate brief with LLM
    const briefResult = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are Agent1, CEPHO Chief of Staff. Generate a concise, energising morning brief for the owner. It should be 150-200 words, conversational, and audio-friendly (no bullet points, no markdown). Cover: today's date and energy, top 3 priorities, any important context from recent activity. End with one clear call to action for the morning.`,
        },
        {
          role: "user",
          content: `Today is ${today}. Pending tasks:\n${taskSummary}\n\nRecent activity:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join("\n") || "No recent activity"}\n\nGenerate the morning brief.`,
        },
      ],
    });

    const briefContent = briefResult.choices?.[0]?.message?.content;
    const briefText = typeof briefContent === "string"
      ? briefContent
      : `Good morning! Today is ${today}. You have ${pendingTasks.length} pending tasks. Let's make it a great day.`;

    // Send text brief
    await bot.sendMessage(
      targetChatId,
      `🌅 *Morning Brief — ${today}*\n\n${briefText}`,
      { parse_mode: "Markdown" }
    );

    // Try to synthesise audio if ElevenLabs is configured
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const { synthesizeSpeech } = await import("../_core/text-to-speech");
        const audioResult = await synthesizeSpeech({ text: briefText });
        if ("audioUrl" in audioResult) {
          // Get the full URL for Telegram
          const baseUrl = process.env.APP_BASE_URL ?? "";
          const fullAudioUrl = audioResult.audioUrl.startsWith("http")
            ? audioResult.audioUrl
            : `${baseUrl}${audioResult.audioUrl}`;
          await bot.sendAudio(targetChatId, fullAudioUrl, {
            caption: "🎧 Listen to your morning brief",
          });
        }
      } catch (audioErr) {
        log.info("Audio brief generation skipped", audioErr);
      }
    }

    log.info("Morning brief sent via Telegram");
  } catch (err) {
    log.error("Morning brief failed", err);
    await bot.sendMessage(
      targetChatId,
      "⚠️ Could not generate your morning brief. Check the CEPHO dashboard."
    );
  }
}

// ─── Evening Check-in Prompt ──────────────────────────────────────────────────

export async function triggerEveningCheckin(): Promise<void> {
  const bot = getTelegramBot();
  const chatId = await getOwnerChatId();
  if (!bot || !chatId) return;

  const message = `🌙 *End of Day Check-in*\n\nLeave me a voice note or message — tell me:\n\n• What got done today\n• What's on your mind\n• Anything you want me to look at overnight\n• Any decisions you made\n\nI'll process it and have your morning brief ready. Just speak freely — I'll extract what matters.`;

  await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  log.info("Evening check-in prompt sent");
}

// ─── Store Chat ID ────────────────────────────────────────────────────────────

async function storeChatId(chatId: string): Promise<void> {
  try {
    const ownerOpenId = process.env.OWNER_OPEN_ID;
    if (!ownerOpenId) return;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.openId, ownerOpenId))
      .limit(1);

    if (!user) return;

    // Update metadata in userSettings
    const [existing] = await db
      .select({ id: userSettings.id, metadata: userSettings.metadata })
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    if (existing) {
      const currentMeta = (existing.metadata as Record<string, unknown>) ?? {};
      await db
        .update(userSettings)
        .set({ metadata: { ...currentMeta, telegramChatId: chatId } })
        .where(eq(userSettings.id, existing.id));
    }

    log.info(`Stored Telegram chat ID for owner: ${chatId}`);
  } catch (err) {
    log.error("Failed to store chat ID", err);
  }
}
