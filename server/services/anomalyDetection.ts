/**
 * CEPHO Anomaly Detection Service — AUTO-02
 *
 * Runs as part of the daily agent performance snapshot job.
 * Compares current agent metrics against rolling 7-day baselines
 * and flags significant deviations as anomalies.
 *
 * Anomalies are:
 *   1. Persisted to the anomaly_alerts table
 *   2. Published to the event bus (triggering notifications)
 *   3. Surfaced in the next morning briefing
 */

import { db } from "../db";
import { anomalyAlerts, activityFeed } from "../../drizzle/schema";
import { eventBus } from "./eventBus";
import { logger } from "../utils/logger";
const log = logger.module("anomalyDetection");
import { eq, and, gte, desc } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentMetricSnapshot {
  agentKey: string;
  metrics: {
    name: string;
    value: number;
    unit?: string;
  }[];
}

export interface AnomalyDetectionResult {
  anomaliesFound: number;
  anomalies: {
    agentKey: string;
    metricName: string;
    currentValue: number;
    baselineValue: number;
    deviationPct: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }[];
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const DEVIATION_THRESHOLDS = {
  low: 15, // 15% deviation
  medium: 30, // 30% deviation
  high: 50, // 50% deviation
  critical: 80, // 80% deviation
};

function getSeverity(
  deviationPct: number
): "low" | "medium" | "high" | "critical" {
  if (deviationPct >= DEVIATION_THRESHOLDS.critical) return "critical";
  if (deviationPct >= DEVIATION_THRESHOLDS.high) return "high";
  if (deviationPct >= DEVIATION_THRESHOLDS.medium) return "medium";
  return "low";
}

function buildDescription(
  agentKey: string,
  metricName: string,
  currentValue: number,
  baselineValue: number,
  deviationPct: number,
  severity: string
): string {
  const direction = currentValue > baselineValue ? "above" : "below";
  return (
    `[${severity.toUpperCase()}] Agent "${agentKey}" — metric "${metricName}" is ` +
    `${Math.abs(deviationPct).toFixed(1)}% ${direction} the 7-day baseline ` +
    `(current: ${currentValue.toFixed(2)}, baseline: ${baselineValue.toFixed(2)}).`
  );
}

// ─── Main Detection Function ──────────────────────────────────────────────────

/**
 * Analyse a set of agent metric snapshots for a given user.
 * Baselines are computed from the anomaly_alerts table (previous snapshots).
 * In a full implementation, baselines would come from a dedicated metrics store.
 * For now we use a simple heuristic: compare against a hardcoded "healthy" range.
 */
export async function detectAnomalies(
  userId: number,
  snapshots: AgentMetricSnapshot[]
): Promise<AnomalyDetectionResult> {
  const result: AnomalyDetectionResult = {
    anomaliesFound: 0,
    anomalies: [],
  };

  for (const snapshot of snapshots) {
    for (const metric of snapshot.metrics) {
      // Retrieve recent baseline from existing alerts (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentAlerts = await db
        .select()
        .from(anomalyAlerts)
        .where(
          and(
            eq(anomalyAlerts.userId, userId),
            eq(anomalyAlerts.agentKey, snapshot.agentKey),
            eq(anomalyAlerts.metricName, metric.name),
            gte(anomalyAlerts.createdAt, sevenDaysAgo)
          )
        )
        .orderBy(desc(anomalyAlerts.createdAt))
        .limit(7);

      // Compute baseline from recent alerts or use metric value as self-baseline
      let baselineValue: number;
      if (recentAlerts.length >= 3) {
        const values = recentAlerts
          .map(a => parseFloat(a.currentValue ?? "0"))
          .filter(v => !isNaN(v));
        baselineValue = values.reduce((s, v) => s + v, 0) / values.length;
      } else {
        // Not enough history — skip anomaly detection for this metric
        continue;
      }

      if (baselineValue === 0) continue;

      const deviationPct =
        Math.abs((metric.value - baselineValue) / baselineValue) * 100;

      if (deviationPct < DEVIATION_THRESHOLDS.low) continue;

      const severity = getSeverity(deviationPct);
      const description = buildDescription(
        snapshot.agentKey,
        metric.name,
        metric.value,
        baselineValue,
        deviationPct,
        severity
      );

      // Persist to DB
      await db.insert(anomalyAlerts).values({
        userId,
        agentKey: snapshot.agentKey,
        metricName: metric.name,
        currentValue: metric.value.toString(),
        baselineValue: baselineValue.toString(),
        deviationPct: deviationPct.toFixed(2),
        severity,
        description,
        isAcknowledged: false,
        surfacedInBriefing: false,
      });

      // Publish event for notification creation
      await eventBus.publish({
        type: "agent.anomaly_detected",
        userId,
        payload: {
          agentKey: snapshot.agentKey,
          metricName: metric.name,
          description,
          severity,
        },
        timestamp: new Date(),
        source: "anomaly-detection",
      });

      result.anomalies.push({
        agentKey: snapshot.agentKey,
        metricName: metric.name,
        currentValue: metric.value,
        baselineValue,
        deviationPct,
        severity,
        description,
      });

      result.anomaliesFound++;
    }
  }

  if (result.anomaliesFound > 0) {
    log.info(
      `[AnomalyDetection] Found ${result.anomaliesFound} anomalies for user ${userId}`
    );
  }

  return result;
}

/**
 * Record a metric snapshot for baseline tracking.
 * Call this from the agent performance snapshot cron job.
 */
export async function recordMetricSnapshot(
  userId: number,
  agentKey: string,
  metricName: string,
  value: number
): Promise<void> {
  // We store snapshots in anomaly_alerts with deviationPct = 0 (baseline entries)
  // This lets us compute rolling baselines without a separate table.
  await db.insert(anomalyAlerts).values({
    userId,
    agentKey,
    metricName,
    currentValue: value.toString(),
    baselineValue: value.toString(),
    deviationPct: "0",
    severity: "low",
    description: `Baseline snapshot for ${agentKey}/${metricName}`,
    isAcknowledged: true, // Mark as acknowledged so it doesn't appear in alerts
    surfacedInBriefing: true,
  });
}

/**
 * Get all unacknowledged anomalies for a user that haven't been surfaced yet.
 * Called by the morning briefing job.
 */
export async function getPendingAnomaliesForBriefing(
  userId: number
): Promise<(typeof anomalyAlerts.$inferSelect)[]> {
  return db
    .select()
    .from(anomalyAlerts)
    .where(
      and(
        eq(anomalyAlerts.userId, userId),
        eq(anomalyAlerts.isAcknowledged, false),
        eq(anomalyAlerts.surfacedInBriefing, false)
      )
    )
    .orderBy(desc(anomalyAlerts.createdAt))
    .limit(5);
}

/**
 * Mark anomalies as surfaced in the morning briefing.
 */
export async function markAnomaliesSurfaced(userId: number): Promise<void> {
  // Use raw SQL update since drizzle update with where clause needs the right import
  await db
    .update(anomalyAlerts)
    .set({ surfacedInBriefing: true })
    .where(
      and(
        eq(anomalyAlerts.userId, userId),
        eq(anomalyAlerts.surfacedInBriefing, false)
      )
    );
}
