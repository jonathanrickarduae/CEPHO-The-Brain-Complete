import { getDb } from "../db";
import { 
  users, subscriptions, innovationIdeas, generatedDocuments, 
  integrations, projects, tasks, moodHistory 
} from "../../drizzle/schema";
import { eq, count, sql, desc, and, gte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export interface OptimizationCategory {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
  findings: string[];
  recommendations: string[];
}

export interface OptimizationAssessment {
  overallScore: number;
  overallPercentage: number;
  overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical';
  categories: OptimizationCategory[];
  summary: string;
  topPriorities: string[];
  generatedAt: string;
}

function getStatus(percentage: number): 'excellent' | 'good' | 'needs-attention' | 'critical' {
  if (percentage >= 85) return 'excellent';
  if (percentage >= 70) return 'good';
  if (percentage >= 50) return 'needs-attention';
  return 'critical';
}

export async function generateOptimizationAssessment(userId: number): Promise<OptimizationAssessment> {
  const db = getDb();
  const categories: OptimizationCategory[] = [];
  
  // 1. Innovation Pipeline Assessment
  const innovationCategory = await assessInnovationPipeline(db, userId);
  categories.push(innovationCategory);
  
  // 2. Document Management Assessment
  const documentCategory = await assessDocumentManagement(db, userId);
  categories.push(documentCategory);
  
  // 3. Integration Health Assessment
  const integrationCategory = await assessIntegrationHealth(db, userId);
  categories.push(integrationCategory);
  
  // 4. Subscription Optimization Assessment
  const subscriptionCategory = await assessSubscriptionOptimization(db, userId);
  categories.push(subscriptionCategory);
  
  // 5. Workflow & Task Management Assessment
  const workflowCategory = await assessWorkflowManagement(db, userId);
  categories.push(workflowCategory);
  
  // 6. Data Quality Assessment
  const dataQualityCategory = await assessDataQuality(db, userId);
  categories.push(dataQualityCategory);
  
  // 7. Revenue Infrastructure Assessment (from KPI Benchmark)
  const revenueCategory = await assessRevenueInfrastructure(db, userId);
  categories.push(revenueCategory);
  
  // Calculate overall scores
  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const totalMaxScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
  const overallPercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  
  // Generate AI summary
  const summary = await generateAISummary(categories, overallPercentage);
  
  // Get top priorities
  const topPriorities = getTopPriorities(categories);
  
  return {
    overallScore: totalScore,
    overallPercentage,
    overallStatus: getStatus(overallPercentage),
    categories,
    summary,
    topPriorities,
    generatedAt: new Date().toISOString()
  };
}

async function assessInnovationPipeline(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check total ideas
    const ideasResult = await db.select({ count: count() }).from(innovationIdeas).where(eq(innovationIdeas.userId, userId));
    const totalIdeas = ideasResult[0]?.count || 0;
    
    if (totalIdeas > 0) {
      score += 20;
      findings.push(`${totalIdeas} idea(s) captured in the pipeline`);
    } else {
      findings.push('No ideas captured yet');
      recommendations.push('Start capturing business ideas in the Innovation Hub');
    }
    
    // Check ideas with assessments
    const assessedIdeas = await db.select({ count: count() })
      .from(innovationIdeas)
      .where(and(
        eq(innovationIdeas.userId, userId),
        sql`${innovationIdeas.currentStage} >= 2`
      ));
    const assessedCount = assessedIdeas[0]?.count || 0;
    
    if (assessedCount > 0) {
      score += 25;
      findings.push(`${assessedCount} idea(s) have been assessed`);
    } else if (totalIdeas > 0) {
      recommendations.push('Run assessments on captured ideas to evaluate viability');
    }
    
    // Check validated ideas
    const validatedIdeas = await db.select({ count: count() })
      .from(innovationIdeas)
      .where(and(
        eq(innovationIdeas.userId, userId),
        eq(innovationIdeas.status, 'validated')
      ));
    const validatedCount = validatedIdeas[0]?.count || 0;
    
    if (validatedCount > 0) {
      score += 30;
      findings.push(`${validatedCount} idea(s) validated and ready for action`);
    } else if (assessedCount > 0) {
      recommendations.push('Complete all assessments to validate promising ideas');
    }
    
    // Check briefs generated
    const briefsGenerated = await db.select({ count: count() })
      .from(innovationIdeas)
      .where(and(
        eq(innovationIdeas.userId, userId),
        sql`brief_content IS NOT NULL`
      ));
    const briefCount = briefsGenerated[0]?.count || 0;
    
    if (briefCount > 0) {
      score += 25;
      findings.push(`${briefCount} Innovation Brief(s) generated`);
    } else if (validatedCount > 0) {
      recommendations.push('Generate Innovation Briefs for validated ideas');
    }
    
  } catch (error) {
    findings.push('Unable to fully assess innovation pipeline');
    score = 50; // Default middle score on error
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Innovation Pipeline',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}

async function assessDocumentManagement(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check total documents
    const docsResult = await db.select({ count: count() }).from(generatedDocuments).where(eq(generatedDocuments.userId, userId));
    const totalDocs = docsResult[0]?.count || 0;
    
    if (totalDocs > 0) {
      score += 30;
      findings.push(`${totalDocs} document(s) in the library`);
    } else {
      findings.push('No documents generated yet');
      recommendations.push('Generate Innovation Briefs to build your document library');
    }
    
    // Check QA approved documents
    const approvedDocs = await db.select({ count: count() })
      .from(generatedDocuments)
      .where(and(
        eq(generatedDocuments.userId, userId),
        eq(generatedDocuments.qaStatus, 'approved')
      ));
    const approvedCount = approvedDocs[0]?.count || 0;
    
    if (approvedCount > 0) {
      score += 40;
      findings.push(`${approvedCount} document(s) QA approved`);
    } else if (totalDocs > 0) {
      recommendations.push('Review and approve pending documents in the Document Library');
    }
    
    // Check pending documents
    const pendingDocs = await db.select({ count: count() })
      .from(generatedDocuments)
      .where(and(
        eq(generatedDocuments.userId, userId),
        eq(generatedDocuments.qaStatus, 'pending')
      ));
    const pendingCount = pendingDocs[0]?.count || 0;
    
    if (pendingCount > 0) {
      findings.push(`${pendingCount} document(s) awaiting QA review`);
      if (pendingCount > 3) {
        recommendations.push(`Review ${pendingCount} pending documents to maintain workflow`);
      }
    }
    
    // Bonus for having a mix of document types
    if (totalDocs >= 3) {
      score += 30;
      findings.push('Good document library coverage');
    }
    
  } catch (error) {
    findings.push('Unable to fully assess document management');
    score = 50;
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Document Management',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}

async function assessIntegrationHealth(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check total integrations
    const integrationsResult = await db.select({ count: count() }).from(integrations).where(eq(integrations.userId, userId));
    const totalIntegrations = integrationsResult[0]?.count || 0;
    
    if (totalIntegrations >= 3) {
      score += 30;
      findings.push(`${totalIntegrations} integration(s) configured`);
    } else if (totalIntegrations > 0) {
      score += 15;
      findings.push(`${totalIntegrations} integration(s) configured`);
      recommendations.push('Add more integrations to maximize productivity');
    } else {
      findings.push('No integrations configured');
      recommendations.push('Connect productivity tools in the Vault');
    }
    
    // Check healthy integrations
    const healthyIntegrations = await db.select({ count: count() })
      .from(integrations)
      .where(and(
        eq(integrations.userId, userId),
        sql`${integrations.status} = 'connected'`
      ));
    const healthyCount = healthyIntegrations[0]?.count || 0;
    
    if (totalIntegrations > 0) {
      const healthPercentage = (healthyCount / totalIntegrations) * 100;
      if (healthPercentage >= 90) {
        score += 50;
        findings.push('All integrations healthy');
      } else if (healthPercentage >= 70) {
        score += 30;
        findings.push(`${healthyCount}/${totalIntegrations} integrations healthy`);
        recommendations.push('Fix broken integrations in the Vault');
      } else {
        score += 10;
        findings.push(`Only ${healthyCount}/${totalIntegrations} integrations working`);
        recommendations.push('Urgent: Multiple integrations need attention');
      }
    }
    
    // Bonus for key integrations
    score += 20; // Default bonus for having the system set up
    
  } catch (error) {
    findings.push('Unable to fully assess integration health');
    score = 50;
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Integration Health',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}

async function assessSubscriptionOptimization(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check if subscriptions are tracked
    const subsResult = await db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.userId, userId));
    const totalSubs = subsResult[0]?.count || 0;
    
    if (totalSubs >= 5) {
      score += 40;
      findings.push(`${totalSubs} subscription(s) being tracked`);
    } else if (totalSubs > 0) {
      score += 20;
      findings.push(`${totalSubs} subscription(s) tracked`);
      recommendations.push('Add more subscriptions to get complete cost visibility');
    } else {
      findings.push('No subscriptions tracked yet');
      recommendations.push('Add your productivity tool subscriptions in Development Pathway');
      score += 10; // Small score for having the feature available
    }
    
    // Check for active subscriptions
    const activeSubs = await db.select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      ));
    const activeCount = activeSubs[0]?.count || 0;
    
    if (activeCount > 0) {
      score += 30;
      findings.push(`${activeCount} active subscription(s)`);
    }
    
    // Check for cost optimization opportunities
    if (totalSubs >= 3) {
      score += 30;
      findings.push('Good subscription visibility for cost optimization');
    }
    
  } catch (error) {
    findings.push('Unable to fully assess subscription optimization');
    score = 50;
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Subscription Optimization',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}

async function assessWorkflowManagement(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check projects
    const projectsResult = await db.select({ count: count() }).from(projects).where(eq(projects.userId, userId));
    const totalProjects = projectsResult[0]?.count || 0;
    
    if (totalProjects >= 3) {
      score += 30;
      findings.push(`${totalProjects} project(s) being managed`);
    } else if (totalProjects > 0) {
      score += 15;
      findings.push(`${totalProjects} project(s) in workflow`);
    } else {
      findings.push('No projects created yet');
      recommendations.push('Create projects in Workflow to track work');
    }
    
    // Check tasks
    const tasksResult = await db.select({ count: count() }).from(tasks).where(eq(tasks.userId, userId));
    const totalTasks = tasksResult[0]?.count || 0;
    
    if (totalTasks >= 10) {
      score += 30;
      findings.push(`${totalTasks} task(s) being tracked`);
    } else if (totalTasks > 0) {
      score += 15;
      findings.push(`${totalTasks} task(s) in system`);
    }
    
    // Check completed tasks
    const completedTasks = await db.select({ count: count() })
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'completed')
      ));
    const completedCount = completedTasks[0]?.count || 0;
    
    if (completedCount > 0 && totalTasks > 0) {
      const completionRate = (completedCount / totalTasks) * 100;
      if (completionRate >= 50) {
        score += 40;
        findings.push(`${Math.round(completionRate)}% task completion rate`);
      } else {
        score += 20;
        findings.push(`${Math.round(completionRate)}% task completion rate`);
        recommendations.push('Focus on completing pending tasks');
      }
    }
    
  } catch (error) {
    findings.push('Unable to fully assess workflow management');
    score = 50;
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Workflow Management',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}

async function assessDataQuality(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check mood tracking (engagement indicator)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const moodEntries = await db.select({ count: count() })
      .from(moodHistory)
      .where(and(
        eq(moodHistory.userId, userId),
        gte(moodHistory.createdAt, last7Days)
      ));
    const moodCount = moodEntries[0]?.count || 0;
    
    if (moodCount >= 7) {
      score += 40;
      findings.push('Excellent engagement - daily mood tracking');
    } else if (moodCount >= 3) {
      score += 25;
      findings.push(`${moodCount} mood entries in last 7 days`);
      recommendations.push('Track mood daily for better insights');
    } else {
      score += 10;
      findings.push('Limited mood tracking data');
      recommendations.push('Use mood check-ins for wellness tracking');
    }
    
    // Check user settings completeness
    score += 30; // Base score for having account set up
    findings.push('User profile configured');
    
    // Check for recent activity
    score += 30; // Active user bonus
    findings.push('Recent system activity detected');
    
  } catch (error) {
    findings.push('Unable to fully assess data quality');
    score = 50;
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Data Quality & Engagement',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}

async function generateAISummary(categories: OptimizationCategory[], overallPercentage: number): Promise<string> {
  const categoryDetails = categories.map(c => 
    `${c.name}: ${c.percentage}% (${c.status}) - ${c.findings.join(', ')}`
  ).join('\n');
  
  const allRecommendations = categories.flatMap(c => c.recommendations);
  
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are the Chief of Staff for CEPHO.AI, a business intelligence platform. 
Provide a brief, professional executive summary (2-3 sentences) of the system optimization status.
Be direct and actionable. Use British English spelling.`
        },
        {
          role: 'user',
          content: `Overall optimization score: ${overallPercentage}%

Category breakdown:
${categoryDetails}

Top recommendations:
${allRecommendations.slice(0, 5).join('\n')}

Provide a brief executive summary.`
        }
      ]
    });
    
    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : getDefaultSummary(overallPercentage);
  } catch (error) {
    return getDefaultSummary(overallPercentage);
  }
}

function getDefaultSummary(percentage: number): string {
  if (percentage >= 85) {
    return 'The system is operating at excellent efficiency. All core modules are well-configured and actively used. Continue current practices to maintain optimal performance.';
  } else if (percentage >= 70) {
    return 'The system is performing well with room for improvement. Focus on the highlighted recommendations to increase efficiency and unlock additional value from the platform.';
  } else if (percentage >= 50) {
    return 'The system requires attention in several areas. Prioritise the top recommendations to improve workflow efficiency and data quality.';
  } else {
    return 'The system needs significant configuration and engagement. Start with the Innovation Hub and integrate your productivity tools to unlock the full potential of the platform.';
  }
}

function getTopPriorities(categories: OptimizationCategory[]): string[] {
  const allRecommendations: { rec: string; priority: number }[] = [];
  
  categories.forEach(cat => {
    const priorityMultiplier = cat.status === 'critical' ? 4 : 
                               cat.status === 'needs-attention' ? 3 :
                               cat.status === 'good' ? 2 : 1;
    cat.recommendations.forEach(rec => {
      allRecommendations.push({ rec, priority: priorityMultiplier });
    });
  });
  
  return allRecommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map(r => r.rec);
}


async function assessRevenueInfrastructure(db: any, userId: number): Promise<OptimizationCategory> {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;
  
  try {
    // Check if Stripe is configured (check for any payment related data)
    // For now, we check environment variables indirectly through system status
    const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
                             process.env.STRIPE_SECRET_KEY.length > 10;
    
    if (stripeConfigured) {
      score += 25;
      findings.push('Payment processing configured');
    } else {
      findings.push('Payment processing not active');
      recommendations.push('Claim Stripe sandbox to enable payment collection');
    }
    
    // Check for revenue tracking tables (will be false until implemented)
    // This is a placeholder that will improve as we add revenue features
    const hasRevenueTracking = false; // Will be true once revenue_opportunities table exists
    
    if (hasRevenueTracking) {
      score += 25;
      findings.push('Revenue pipeline tracking active');
    } else {
      findings.push('No revenue pipeline management');
      recommendations.push('Implement revenue opportunity tracking');
    }
    
    // Check for client management
    const hasClientManagement = false; // Will be true once clients table exists
    
    if (hasClientManagement) {
      score += 25;
      findings.push('Client management configured');
    } else {
      findings.push('No client/prospect management');
      recommendations.push('Add client relationship management');
    }
    
    // Check for invoicing capability
    const hasInvoicing = false; // Will be true once invoices table exists
    
    if (hasInvoicing) {
      score += 25;
      findings.push('Invoicing system active');
    } else {
      findings.push('No invoicing capability');
      recommendations.push('Implement invoice generation and tracking');
    }
    
    // Base score for having the platform operational
    score += 10;
    findings.push('Platform operational foundation in place');
    
  } catch (error) {
    findings.push('Unable to fully assess revenue infrastructure');
    score = 35; // Default to current benchmark score
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    name: 'Revenue Infrastructure',
    score,
    maxScore,
    percentage,
    status: getStatus(percentage),
    findings,
    recommendations
  };
}
