/**
 * Quality Management System (QMS) Service
 * Implements 4-layer quality gates and validation workflows
 */

import { db } from '../db';
import { qualityGateCriteria, qualityGateResults } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// 4-Layer QMS Structure
export const QMS_LAYERS = {
  layer1: {
    name: 'Completeness Check',
    description: 'Verify all required information is present',
    automated: true,
  },
  layer2: {
    name: 'Consistency Validation',
    description: 'Check for internal consistency and logical coherence',
    automated: true,
  },
  layer3: {
    name: 'Quality Assessment',
    description: 'Evaluate quality against best practices and standards',
    automated: false, // Requires expert review
  },
  layer4: {
    name: 'Strategic Alignment',
    description: 'Ensure alignment with strategic objectives and market reality',
    automated: false, // Requires expert judgment
  },
};

// Quality Gate Types
export const GATE_TYPES = {
  project_genesis: {
    name: 'Project Genesis Gate',
    description: 'Quality gate for Project Genesis phases',
    criteria: [
      'Business model clarity',
      'Market analysis completeness',
      'Financial projections accuracy',
      'Risk assessment thoroughness',
      'Team capability assessment',
    ],
  },
  due_diligence: {
    name: 'Due Diligence Gate',
    description: 'Quality gate for due diligence processes',
    criteria: [
      'Document completeness',
      'Financial analysis depth',
      'Legal compliance verification',
      'Operational assessment',
      'Risk identification',
    ],
  },
  investment_decision: {
    name: 'Investment Decision Gate',
    description: 'Quality gate for investment decisions',
    criteria: [
      'Investment thesis clarity',
      'Return projections justification',
      'Risk-return balance',
      'Exit strategy viability',
      'Portfolio fit',
    ],
  },
  deliverable_review: {
    name: 'Deliverable Review Gate',
    description: 'Quality gate for deliverables (presentations, reports, etc.)',
    criteria: [
      'Content accuracy',
      'Narrative coherence',
      'Visual quality',
      'Brand consistency',
      'Stakeholder appropriateness',
    ],
  },
};

/**
 * Run a quality gate on a project
 */
export async function runQualityGate(
  projectId: string,
  gateType: keyof typeof GATE_TYPES,
  content: any
) {
  const gate = GATE_TYPES[gateType];
  if (!gate) throw new Error('Invalid gate type');

  // Create gate result record
  const [gateResult] = await db.insert(qualityGateResults).values({
    projectId,
    gateType,
    gateName: gate.name,
    status: 'in_progress',
    startedAt: new Date(),
  }).returning();

  // Run each layer
  const layerResults = [];

  // Layer 1: Completeness Check (automated)
  const layer1Result = await runCompletenessCheck(content, gate.criteria);
  layerResults.push({
    layer: 1,
    name: QMS_LAYERS.layer1.name,
    ...layer1Result,
  });

  // Layer 2: Consistency Validation (automated)
  const layer2Result = await runConsistencyCheck(content);
  layerResults.push({
    layer: 2,
    name: QMS_LAYERS.layer2.name,
    ...layer2Result,
  });

  // Layer 3 & 4 require expert review
  layerResults.push({
    layer: 3,
    name: QMS_LAYERS.layer3.name,
    status: 'pending_review',
    message: 'Requires expert review',
  });

  layerResults.push({
    layer: 4,
    name: QMS_LAYERS.layer4.name,
    status: 'pending_review',
    message: 'Requires strategic review',
  });

  // Calculate overall status
  const allPassed = layerResults.every(r => r.status === 'passed');
  const anyFailed = layerResults.some(r => r.status === 'failed');
  const overallStatus = anyFailed ? 'failed' : allPassed ? 'passed' : 'pending_review';

  // Update gate result
  await db.update(qualityGateResults)
    .set({
      status: overallStatus,
      results: { layers: layerResults },
      completedAt: overallStatus !== 'pending_review' ? new Date() : undefined,
    })
    .where(eq(qualityGateResults.id, gateResult.id));

  return {
    gateId: gateResult.id,
    gateType,
    gateName: gate.name,
    status: overallStatus,
    layers: layerResults,
    requiresAction: overallStatus !== 'passed',
  };
}

/**
 * Layer 1: Completeness Check
 */
async function runCompletenessCheck(content: any, requiredCriteria: string[]) {
  const issues = [];
  const checks = [];

  // Check for required fields based on criteria
  for (const criterion of requiredCriteria) {
    const check = checkCriterion(content, criterion);
    checks.push(check);
    if (!check.passed) {
      issues.push(check.issue);
    }
  }

  const passed = issues.length === 0;

  return {
    status: passed ? 'passed' : 'failed',
    score: (checks.filter(c => c.passed).length / checks.length) * 100,
    checks,
    issues,
    message: passed ? 'All required information is present' : `${issues.length} completeness issues found`,
  };
}

/**
 * Check a specific criterion
 */
function checkCriterion(content: any, criterion: string): { passed: boolean; criterion: string; issue?: string } {
  // Map criteria to content fields
  const criteriaMap: Record<string, string[]> = {
    'Business model clarity': ['businessModel', 'revenueModel', 'valueProposition'],
    'Market analysis completeness': ['marketSize', 'targetMarket', 'competitors'],
    'Financial projections accuracy': ['revenue', 'costs', 'profit', 'assumptions'],
    'Risk assessment thoroughness': ['risks', 'mitigation', 'contingency'],
    'Team capability assessment': ['team', 'roles', 'experience'],
    'Document completeness': ['documents', 'attachments', 'references'],
    'Financial analysis depth': ['financials', 'ratios', 'trends'],
    'Legal compliance verification': ['legal', 'compliance', 'regulations'],
    'Operational assessment': ['operations', 'processes', 'systems'],
    'Risk identification': ['risks', 'threats', 'vulnerabilities'],
  };

  const requiredFields = criteriaMap[criterion] || [criterion.toLowerCase().replace(/\s+/g, '_')];
  
  for (const field of requiredFields) {
    if (!content[field] || (Array.isArray(content[field]) && content[field].length === 0)) {
      return {
        passed: false,
        criterion,
        issue: `Missing or incomplete: ${field}`,
      };
    }
  }

  return {
    passed: true,
    criterion,
  };
}

/**
 * Layer 2: Consistency Validation
 */
async function runConsistencyCheck(content: any) {
  const issues = [];

  // Check for logical consistency
  if (content.revenue && content.costs && content.profit) {
    const calculatedProfit = content.revenue - content.costs;
    if (Math.abs(calculatedProfit - content.profit) > 0.01) {
      issues.push('Financial calculations are inconsistent (revenue - costs ≠ profit)');
    }
  }

  // Check date consistency
  if (content.startDate && content.endDate) {
    if (new Date(content.startDate) > new Date(content.endDate)) {
      issues.push('Start date is after end date');
    }
  }

  // Check narrative consistency
  if (content.description && content.valueProposition) {
    // Simple check: ensure key terms are consistent
    // (In production, this would use NLP)
  }

  const passed = issues.length === 0;

  return {
    status: passed ? 'passed' : 'failed',
    score: passed ? 100 : Math.max(0, 100 - (issues.length * 20)),
    issues,
    message: passed ? 'Content is internally consistent' : `${issues.length} consistency issues found`,
  };
}

/**
 * Get quality gate results
 */
export async function getGateResults(projectId: string, gateId?: string) {
  if (gateId) {
    const [result] = await db.select()
      .from(qualityGateResults)
      .where(eq(qualityGateResults.id, gateId));
    return result;
  }

  const results = await db.select()
    .from(qualityGateResults)
    .where(eq(qualityGateResults.projectId, projectId))
    .orderBy(qualityGateResults.startedAt);

  return results;
}

/**
 * Approve a quality gate
 */
export async function approveGate(gateId: string, approverId: string, comments?: string) {
  await db.update(qualityGateResults)
    .set({
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      reviewComments: comments,
    })
    .where(eq(qualityGateResults.id, gateId));

  return true;
}

/**
 * Request changes for a quality gate
 */
export async function requestChanges(gateId: string, reviewerId: string, changes: string[]) {
  await db.update(qualityGateResults)
    .set({
      status: 'changes_requested',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      requestedChanges: changes,
    })
    .where(eq(qualityGateResults.id, gateId));

  return true;
}

/**
 * Get audit trail for a project
 */
export async function getAuditTrail(projectId: string) {
  const results = await db.select()
    .from(qualityGateResults)
    .where(eq(qualityGateResults.projectId, projectId))
    .orderBy(qualityGateResults.startedAt);

  return results.map(r => ({
    gateId: r.id,
    gateName: r.gateName,
    gateType: r.gateType,
    status: r.status,
    startedAt: r.startedAt,
    completedAt: r.completedAt,
    approvedBy: r.approvedBy,
    approvedAt: r.approvedAt,
    reviewedBy: r.reviewedBy,
    reviewComments: r.reviewComments,
  }));
}

/**
 * Get quality metrics for a project
 */
export async function getQualityMetrics(projectId: string) {
  const results = await getGateResults(projectId);

  const total = results.length;
  const passed = results.filter(r => r.status === 'passed' || r.status === 'approved').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const pending = results.filter(r => r.status === 'pending_review' || r.status === 'in_progress').length;

  return {
    totalGates: total,
    passed,
    failed,
    pending,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    averageScore: results.reduce((sum, r) => {
      const layerResults = (r.results as any)?.layers || [];
      const scores = layerResults.map((l: any) => l.score || 0);
      const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
      return sum + avgScore;
    }, 0) / (total || 1),
  };
}
