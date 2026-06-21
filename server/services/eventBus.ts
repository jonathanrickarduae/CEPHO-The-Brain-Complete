/**
 * CEPHO Event Bus — AUTO-01
 *
 * A lightweight in-process event bus that allows any service or cron job
 * to emit structured domain events. Registered handlers react to those
 * events and can autonomously create tasks, notifications, or activity
 * feed entries without tight coupling between modules.
 *
 * Design: synchronous fan-out with per-handler error isolation.
 * All handlers are async; errors are caught and logged individually.
 */

import { EventEmitter } from "events";
import { db } from "../db";
import { tasks, activityFeed, notifications } from "../../drizzle/schema";
import { logger } from "../utils/logger";
const log = logger.module("eventBus");

// ─── Event Type Registry ──────────────────────────────────────────────────────

export type CephoEventType =
  | "agent.task_completed"
  | "agent.task_failed"
  | "agent.anomaly_detected"
  | "agent.performance_snapshot"
  | "user.mood_logged"
  | "user.evening_review_completed"
  | "project.milestone_reached"
  | "project.deadline_approaching"
  | "kpi.threshold_breached"
  | "okr.progress_updated"
  | "integration.webhook_received"
  | "scheduler.morning_briefing"
  | "scheduler.evening_review";

export interface CephoEvent<T = Record<string, unknown>> {
  type: CephoEventType;
  userId: number;
  payload: T;
  timestamp: Date;
  source: string;
}

// ─── Event Bus Singleton ──────────────────────────────────────────────────────

class CephoEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  async publish<T = Record<string, unknown>>(
    event: CephoEvent<T>
  ): Promise<void> {
    log.info(`[EventBus] Publishing: ${event.type}`, {
      userId: event.userId,
      source: event.source,
    });

    const listeners = this.rawListeners(event.type) as Array<
      (e: CephoEvent<T>) => Promise<void>
    >;

    await Promise.allSettled(
      listeners.map(async handler => {
        try {
          await handler(event);
        } catch (err) {
          log.error(`[EventBus] Handler error for ${event.type}:`, err);
        }
      })
    );
  }

  subscribe<T = Record<string, unknown>>(
    eventType: CephoEventType,
    handler: (event: CephoEvent<T>) => Promise<void>
  ): void {
    this.on(eventType, handler);
    log.info(`[EventBus] Handler registered for: ${eventType}`);
  }
}

export const eventBus = new CephoEventBus();

// ─── AUTO-01: Autonomous Task Creation Handlers ───────────────────────────────

/**
 * When an agent completes a task, create any suggested follow-up tasks.
 */
eventBus.subscribe<{
  agentKey: string;
  taskTitle: string;
  output: string;
  followUpSuggestions?: string[];
}>("agent.task_completed", async event => {
  const { agentKey, taskTitle, followUpSuggestions } = event.payload;
  if (!followUpSuggestions || followUpSuggestions.length === 0) return;

  for (const suggestion of followUpSuggestions) {
    await db.insert(tasks).values({
      userId: event.userId,
      title: suggestion,
      description: `Auto-created follow-up from ${agentKey} completing: "${taskTitle}"`,
      status: "pending",
      priority: "medium",
      assignedTo: "digital_twin",
      metadata: {
        autonomous: true,
        source: "autonomous",
        triggeredBy: "agent.task_completed",
        agentKey,
        parentTaskTitle: taskTitle,
      },
    });
    log.info(
      `[EventBus] AUTO-01: Created follow-up task for user ${event.userId}: ${suggestion}`
    );
  }
});

/**
 * When a project deadline is approaching, auto-create a review task.
 */
eventBus.subscribe<{
  projectId: number;
  projectName: string;
  daysUntilDeadline: number;
}>("project.deadline_approaching", async event => {
  const { projectName, daysUntilDeadline } = event.payload;

  await db.insert(tasks).values({
    userId: event.userId,
    title: `Review progress on "${projectName}"`,
    description: `Deadline is in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"}. Autonomous review task created by CEPHO.`,
    status: "pending",
    priority: daysUntilDeadline <= 2 ? "high" : "medium",
    assignedTo: "digital_twin",
    dueDate: new Date(Date.now() + daysUntilDeadline * 24 * 60 * 60 * 1000),
    metadata: {
      autonomous: true,
      source: "autonomous",
      triggeredBy: "project.deadline_approaching",
      projectName,
      daysUntilDeadline,
    },
  });

  await db.insert(activityFeed).values({
    userId: event.userId,
    actorType: "system",
    actorId: "event-bus",
    actorName: "CEPHO Automation",
    action: "created",
    targetType: "task",
    targetName: `Review: ${projectName}`,
    description: `Auto-created review task — deadline in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"}.`,
    metadata: { automated: true, triggeredBy: "project.deadline_approaching" },
  });
});

/**
 * When a KPI threshold is breached, create an urgent task and notification.
 */
eventBus.subscribe<{
  kpiName: string;
  currentValue: string;
  targetValue: string;
  status: string;
}>("kpi.threshold_breached", async event => {
  const { kpiName, currentValue, targetValue, status } = event.payload;

  await db.insert(tasks).values({
    userId: event.userId,
    title: `Address KPI breach: ${kpiName}`,
    description: `KPI "${kpiName}" is ${status}. Current: ${currentValue}, Target: ${targetValue}. Immediate review required.`,
    status: "pending",
    priority: "high",
    assignedTo: "digital_twin",
    metadata: {
      autonomous: true,
      source: "autonomous",
      triggeredBy: "kpi.threshold_breached",
      kpiName,
      currentValue,
      targetValue,
    },
  });

  await db.insert(notifications).values({
    userId: event.userId,
    title: `KPI Alert: ${kpiName}`,
    message: `Your KPI "${kpiName}" has breached its threshold. Current: ${currentValue}, Target: ${targetValue}.`,
    type: "alert",
    read: false,
    metadata: { automated: true, kpiName },
  });
});

/**
 * When an anomaly is detected, create a notification.
 */
eventBus.subscribe<{
  agentKey: string;
  metricName: string;
  description: string;
  severity: string;
}>("agent.anomaly_detected", async event => {
  const { agentKey, metricName, description, severity } = event.payload;

  await db.insert(notifications).values({
    userId: event.userId,
    title: `Anomaly Detected: ${metricName}`,
    message: description,
    type: "warning",
    read: false,
    metadata: {
      automated: true,
      triggeredBy: "agent.anomaly_detected",
      agentKey,
      severity,
    },
  });
});

log.info("[EventBus] AUTO-01 event handlers registered.");
