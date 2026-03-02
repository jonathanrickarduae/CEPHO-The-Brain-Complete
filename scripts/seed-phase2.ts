/**
 * CEPHO.AI — Phase 2 Comprehensive Seed Script
 * =============================================
 * Fills every page with realistic demo data so no page shows an empty state.
 *
 * Tables seeded:
 *   - projects (5 active projects)
 *   - tasks (25 tasks across projects)
 *   - generatedDocuments (20 documents for Document Library)
 *   - innovationIdeas (30 ideas for Innovation Hub)
 *   - subscriptions (8 SaaS subscriptions for Subscription Tracker)
 *   - notifications (15 notifications)
 *   - projectGenesis (5 deal/opportunity records for Workflows page)
 *   - eveningReviewSessions (5 historical sessions)
 *   - memoryBank (10 agent memory entries)
 *   - activityFeed (20 activity entries)
 *
 * Run with: pnpm tsx scripts/seed-phase2.ts
 * Idempotent: checks for existing records before inserting.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// ─── Get Admin User ────────────────────────────────────────────────────────────
async function getAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cepho.ai';
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);
  if (rows.length === 0) {
    console.error(`❌ Admin user not found (${adminEmail}). Run scripts/seed.ts first.`);
    process.exit(1);
  }
  return rows[0];
}

// ─── Projects ─────────────────────────────────────────────────────────────────
async function seedProjects(userId: number) {
  console.log('📁 Seeding projects...');
  const existing = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Projects already exist');
    return;
  }
  const projectData = [
    {
      userId,
      name: 'Celadon Capital Fund II',
      description: 'Series B fundraising round targeting $50M from GCC institutional investors. Focus on PropTech and FinTech verticals.',
      status: 'active',
      priority: 'critical',
      progress: 65,
      dueDate: daysFromNow(45),
      assignedExperts: JSON.stringify(['pe_partner', 'cfo_expert', 'ma_lawyer']),
      metadata: JSON.stringify({ dealValue: 50000000, currency: 'USD', stage: 'term_sheet' }),
    },
    {
      userId,
      name: 'Boundless Platform v3.0',
      description: 'Major product overhaul: AI-native UX, pgvector semantic search, and mobile-first redesign. Target: 10x user engagement.',
      status: 'active',
      priority: 'high',
      progress: 40,
      dueDate: daysFromNow(90),
      assignedExperts: JSON.stringify(['tech_cto', 'product_manager', 'marketing_cmo']),
      metadata: JSON.stringify({ budget: 850000, currency: 'AED', sprintCount: 6 }),
    },
    {
      userId,
      name: 'UAE Market Expansion',
      description: 'Regulatory compliance, local partnerships, and go-to-market strategy for ADGM and DIFC licencing.',
      status: 'active',
      priority: 'high',
      progress: 25,
      dueDate: daysFromNow(120),
      assignedExperts: JSON.stringify(['strategy_consultant', 'ma_lawyer', 'operations_coo']),
      metadata: JSON.stringify({ targetMarket: 'UAE', licenceType: 'ADGM', estimatedCost: 200000 }),
    },
    {
      userId,
      name: 'AI Talent Acquisition Pipeline',
      description: 'Build a world-class AI engineering team: 8 senior hires across ML, backend, and product. Target Q2 completion.',
      status: 'active',
      priority: 'medium',
      progress: 55,
      dueDate: daysFromNow(60),
      assignedExperts: JSON.stringify(['hr_chro', 'tech_cto']),
      metadata: JSON.stringify({ headcount: 8, budget: 3200000, currency: 'AED' }),
    },
    {
      userId,
      name: 'Strategic Partnership: ADNOC Ventures',
      description: 'Joint venture exploration with ADNOC Ventures for energy-tech applications. MOU signed, due diligence in progress.',
      status: 'active',
      priority: 'high',
      progress: 30,
      dueDate: daysFromNow(75),
      assignedExperts: JSON.stringify(['strategy_consultant', 'pe_partner', 'operations_coo']),
      metadata: JSON.stringify({ partnerType: 'strategic', dealStage: 'due_diligence', estimatedValue: 15000000 }),
    },
  ];
  await db.insert(schema.projects).values(projectData);
  console.log(`   ✓ Created ${projectData.length} projects`);
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
async function seedTasks(userId: number) {
  console.log('✅ Seeding tasks...');
  const existing = await db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Tasks already exist');
    return;
  }
  const taskData = [
    // Celadon Capital tasks
    { userId, title: 'Finalise term sheet with lead investor', status: 'in_progress', priority: 'critical', progress: 70, dueDate: daysFromNow(5), assignedTo: 'pe_partner', cosScore: 9, qaStatus: 'approved' },
    { userId, title: 'Prepare investor data room (financial models, cap table)', status: 'in_progress', priority: 'critical', progress: 85, dueDate: daysFromNow(3), assignedTo: 'cfo_expert', cosScore: 8, qaStatus: 'approved' },
    { userId, title: 'Legal review of SHA and subscription agreement', status: 'not_started', priority: 'high', progress: 0, dueDate: daysFromNow(10), assignedTo: 'ma_lawyer', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Schedule LP roadshow (Dubai, Abu Dhabi, Riyadh)', status: 'in_progress', priority: 'high', progress: 50, dueDate: daysFromNow(14), assignedTo: 'digital_twin', cosScore: 7, qaStatus: 'approved' },
    { userId, title: 'Update pitch deck with Q1 portfolio performance', status: 'completed', priority: 'high', progress: 100, dueDate: daysAgo(2), assignedTo: 'digital_twin', cosScore: 9, qaStatus: 'approved', completedAt: daysAgo(1) },
    // Boundless Platform tasks
    { userId, title: 'Complete pgvector semantic search integration', status: 'in_progress', priority: 'high', progress: 60, dueDate: daysFromNow(7), assignedTo: 'tech_cto', cosScore: 8, qaStatus: 'approved' },
    { userId, title: 'Design system audit — Calm Cockpit v2 components', status: 'not_started', priority: 'medium', progress: 0, dueDate: daysFromNow(21), assignedTo: 'product_manager', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Mobile responsive overhaul (6 pages)', status: 'not_started', priority: 'high', progress: 0, dueDate: daysFromNow(28), assignedTo: 'tech_cto', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'A/B test new onboarding flow', status: 'in_progress', priority: 'medium', progress: 30, dueDate: daysFromNow(35), assignedTo: 'product_manager', cosScore: 7, qaStatus: 'in_review' },
    { userId, title: 'Performance audit — reduce LCP to < 2.5s', status: 'completed', priority: 'high', progress: 100, dueDate: daysAgo(5), assignedTo: 'tech_cto', cosScore: 10, qaStatus: 'approved', completedAt: daysAgo(3) },
    // UAE Expansion tasks
    { userId, title: 'Submit ADGM Category 3C licence application', status: 'in_progress', priority: 'critical', progress: 45, dueDate: daysFromNow(30), assignedTo: 'ma_lawyer', cosScore: 8, qaStatus: 'in_review' },
    { userId, title: 'Identify and shortlist UAE distribution partners', status: 'not_started', priority: 'high', progress: 0, dueDate: daysFromNow(45), assignedTo: 'strategy_consultant', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Localise marketing materials (Arabic + English)', status: 'in_progress', priority: 'medium', progress: 20, dueDate: daysFromNow(60), assignedTo: 'marketing_cmo', cosScore: 6, qaStatus: 'in_review' },
    // Talent tasks
    { userId, title: 'Interview 3 senior ML engineers (shortlisted)', status: 'in_progress', priority: 'high', progress: 67, dueDate: daysFromNow(7), assignedTo: 'hr_chro', cosScore: 8, qaStatus: 'approved' },
    { userId, title: 'Extend offer to Head of Product candidate', status: 'not_started', priority: 'critical', progress: 0, dueDate: daysFromNow(3), assignedTo: 'hr_chro', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Set up engineering onboarding programme', status: 'not_started', priority: 'medium', progress: 0, dueDate: daysFromNow(30), assignedTo: 'hr_chro', cosScore: null, qaStatus: 'pending' },
    // ADNOC tasks
    { userId, title: 'Complete technical due diligence questionnaire', status: 'in_progress', priority: 'high', progress: 40, dueDate: daysFromNow(14), assignedTo: 'tech_cto', cosScore: 7, qaStatus: 'in_review' },
    { userId, title: 'Prepare JV financial model (3 scenarios)', status: 'not_started', priority: 'high', progress: 0, dueDate: daysFromNow(21), assignedTo: 'cfo_expert', cosScore: null, qaStatus: 'pending' },
    // General CoS tasks
    { userId, title: 'Weekly board update — prepare executive summary', status: 'not_started', priority: 'high', progress: 0, dueDate: daysFromNow(2), assignedTo: 'digital_twin', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Review Q1 KPI dashboard and prepare commentary', status: 'completed', priority: 'medium', progress: 100, dueDate: daysAgo(1), assignedTo: 'digital_twin', cosScore: 9, qaStatus: 'approved', completedAt: daysAgo(1) },
    { userId, title: 'Prepare agenda for Monday leadership sync', status: 'not_started', priority: 'medium', progress: 0, dueDate: daysFromNow(1), assignedTo: 'digital_twin', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Review and approve Q2 marketing budget', status: 'in_progress', priority: 'high', progress: 50, dueDate: daysFromNow(4), assignedTo: 'cfo_expert', cosScore: 8, qaStatus: 'in_review' },
    { userId, title: 'Competitor analysis — new entrants in GCC AI market', status: 'not_started', priority: 'medium', progress: 0, dueDate: daysFromNow(14), assignedTo: 'strategy_consultant', cosScore: null, qaStatus: 'pending' },
    { userId, title: 'Update investor CRM with latest LP interactions', status: 'completed', priority: 'low', progress: 100, dueDate: daysAgo(3), assignedTo: 'digital_twin', cosScore: 7, qaStatus: 'approved', completedAt: daysAgo(2) },
    { userId, title: 'Prepare monthly P&L for CFO review', status: 'not_started', priority: 'high', progress: 0, dueDate: daysFromNow(6), assignedTo: 'cfo_expert', cosScore: null, qaStatus: 'pending' },
  ];
  await db.insert(schema.tasks).values(taskData);
  console.log(`   ✓ Created ${taskData.length} tasks`);
}

// ─── Generated Documents (Document Library) ───────────────────────────────────
async function seedDocuments(userId: number) {
  console.log('📄 Seeding documents...');
  const existing = await db
    .select()
    .from(schema.generatedDocuments)
    .where(eq(schema.generatedDocuments.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Documents already exist');
    return;
  }
  const now = Date.now();
  const docs = [
    { documentId: `DOC-${now}-001`, userId, title: 'Celadon Capital Fund II — Investment Memorandum', type: 'investment_brief', classification: 'confidential', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(2), content: JSON.stringify({ summary: 'Comprehensive investment memorandum for the $50M Series B fundraising round.' }) },
    { documentId: `DOC-${now}-002`, userId, title: 'Boundless Platform — Product Roadmap Q2 2026', type: 'strategy_document', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(5), content: JSON.stringify({ summary: 'Q2 2026 product roadmap covering AI-native UX, pgvector, and mobile.' }) },
    { documentId: `DOC-${now}-003`, userId, title: 'UAE Market Entry Strategy — ADGM Regulatory Framework', type: 'strategy_document', classification: 'confidential', qaStatus: 'in_review', content: JSON.stringify({ summary: 'Regulatory analysis and market entry strategy for UAE operations.' }) },
    { documentId: `DOC-${now}-004`, userId, title: 'ADNOC Ventures JV Proposal — Executive Summary', type: 'executive_summary', classification: 'confidential', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(1), content: JSON.stringify({ summary: 'Joint venture proposal for energy-tech applications with ADNOC Ventures.' }) },
    { documentId: `DOC-${now}-005`, userId, title: 'Q1 2026 Board Report — Financial Performance & KPIs', type: 'board_report', classification: 'board_only', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(7), content: JSON.stringify({ summary: 'Quarterly board report covering financial performance, KPIs, and strategic initiatives.' }) },
    { documentId: `DOC-${now}-006`, userId, title: 'AI Talent Acquisition — Job Descriptions & Compensation Benchmarks', type: 'hr_document', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(3), content: JSON.stringify({ summary: 'Job descriptions and compensation benchmarks for 8 senior AI engineering hires.' }) },
    { documentId: `DOC-${now}-007`, userId, title: 'Investor Update — March 2026 LP Newsletter', type: 'investor_update', classification: 'confidential', qaStatus: 'draft', content: JSON.stringify({ summary: 'Monthly LP newsletter covering portfolio performance and market insights.' }) },
    { documentId: `DOC-${now}-008`, userId, title: 'Competitive Landscape Analysis — GCC AI Market 2026', type: 'market_analysis', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(10), content: JSON.stringify({ summary: 'Comprehensive competitive analysis of the GCC AI market with 15 competitor profiles.' }) },
    { documentId: `DOC-${now}-009`, userId, title: 'Celadon Capital — Term Sheet v3 (DRAFT)', type: 'legal_document', classification: 'confidential', qaStatus: 'in_review', content: JSON.stringify({ summary: 'Draft term sheet for Celadon Capital Fund II Series B round.' }) },
    { documentId: `DOC-${now}-010`, userId, title: 'Boundless Platform — Technical Architecture Overview', type: 'technical_document', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(14), content: JSON.stringify({ summary: 'Technical architecture overview covering infrastructure, AI stack, and security.' }) },
    { documentId: `DOC-${now}-011`, userId, title: 'Innovation Hub — AI-Driven Due Diligence Framework', type: 'framework_document', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(6), content: JSON.stringify({ summary: 'Framework for AI-driven due diligence across investment opportunities.' }) },
    { documentId: `DOC-${now}-012`, userId, title: 'Q2 2026 Marketing Strategy — GCC Growth Plan', type: 'strategy_document', classification: 'internal', qaStatus: 'draft', content: JSON.stringify({ summary: 'Marketing strategy for GCC expansion targeting HNWI and institutional segments.' }) },
    { documentId: `DOC-${now}-013`, userId, title: 'ADGM Category 3C Licence Application — Supporting Documents', type: 'regulatory_document', classification: 'confidential', qaStatus: 'in_review', content: JSON.stringify({ summary: 'Supporting documentation package for ADGM Category 3C licence application.' }) },
    { documentId: `DOC-${now}-014`, userId, title: 'Stakeholder Communications Plan — Fund II Launch', type: 'communications_plan', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(4), content: JSON.stringify({ summary: 'Stakeholder communications plan for the Fund II public launch.' }) },
    { documentId: `DOC-${now}-015`, userId, title: 'Financial Model — Boundless Platform 3-Year Forecast', type: 'financial_model', classification: 'confidential', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(8), content: JSON.stringify({ summary: '3-year financial model with base, bull, and bear scenarios.' }) },
    { documentId: `DOC-${now}-016`, userId, title: 'ESG Policy — Celadon Capital Investment Framework', type: 'policy_document', classification: 'public', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(20), content: JSON.stringify({ summary: 'ESG investment policy and screening criteria for Celadon Capital.' }) },
    { documentId: `DOC-${now}-017`, userId, title: 'Partnership Agreement Template — Strategic Alliances', type: 'legal_document', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(15), content: JSON.stringify({ summary: 'Standard partnership agreement template for strategic alliance negotiations.' }) },
    { documentId: `DOC-${now}-018`, userId, title: 'Data Room Index — Celadon Capital Fund II', type: 'index_document', classification: 'confidential', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(3), content: JSON.stringify({ summary: 'Complete index of all documents in the Fund II investor data room.' }) },
    { documentId: `DOC-${now}-019`, userId, title: 'AI Agent Performance Report — February 2026', type: 'performance_report', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(28), content: JSON.stringify({ summary: 'Monthly performance report for all 51 CEPHO AI agents.' }) },
    { documentId: `DOC-${now}-020`, userId, title: 'Victoria Briefing — Weekly Executive Summary (W10 2026)', type: 'executive_summary', classification: 'internal', qaStatus: 'approved', qaApprovedBy: 'Victoria AI', qaApprovedAt: daysAgo(1), content: JSON.stringify({ summary: 'Weekly executive summary covering priorities, risks, and opportunities.' }) },
  ];
  await db.insert(schema.generatedDocuments).values(docs);
  console.log(`   ✓ Created ${docs.length} documents`);
}

// ─── Innovation Ideas ─────────────────────────────────────────────────────────
async function seedInnovationIdeas(userId: number) {
  console.log('💡 Seeding innovation ideas...');
  const existing = await db
    .select()
    .from(schema.innovationIdeas)
    .where(eq(schema.innovationIdeas.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Innovation ideas already exist');
    return;
  }
  const ideas = [
    // Business ideas
    { userId, title: 'AI-Powered LP Matching Platform', description: 'Use ML to match LPs with fund opportunities based on investment thesis, risk appetite, and historical returns. Reduce fundraising cycle from 18 months to 6.', source: 'internal', status: 'active', currentStage: 3, priority: 'high', category: 'business', confidenceScore: 82, tags: JSON.stringify(['AI', 'fundraising', 'LP', 'platform']), estimatedInvestment: JSON.stringify({ min: 500000, max: 1500000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 5000000, max: 20000000, timeframe: '3 years' }) },
    { userId, title: 'Tokenised Real Estate Fund (DIFC)', description: 'Launch a tokenised real estate fund under DIFC regulations, enabling retail investors to access institutional-grade UAE property assets with $1,000 minimum.', source: 'market_research', status: 'active', currentStage: 2, priority: 'high', category: 'investment', confidenceScore: 74, tags: JSON.stringify(['tokenisation', 'real estate', 'DIFC', 'retail']), estimatedInvestment: JSON.stringify({ min: 2000000, max: 5000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 10000000, max: 50000000, timeframe: '5 years' }) },
    { userId, title: 'GCC Corporate Governance AI Advisor', description: 'AI-native governance platform for GCC family offices and corporates. Automates board reporting, compliance monitoring, and regulatory filings.', source: 'client_feedback', status: 'active', currentStage: 4, priority: 'critical', category: 'product', confidenceScore: 88, tags: JSON.stringify(['governance', 'compliance', 'AI', 'family office']), estimatedInvestment: JSON.stringify({ min: 800000, max: 2000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 8000000, max: 30000000, timeframe: '4 years' }) },
    { userId, title: 'Persephone Intelligence Network', description: 'Expand the Persephone Board to a network of 500 AI personas representing global thought leaders. Enable multi-agent debate and consensus-building for complex decisions.', source: 'internal', status: 'active', currentStage: 2, priority: 'high', category: 'product', confidenceScore: 79, tags: JSON.stringify(['AI agents', 'decision support', 'network']), estimatedInvestment: JSON.stringify({ min: 300000, max: 800000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 3000000, max: 15000000, timeframe: '2 years' }) },
    { userId, title: 'Energy Transition Fund — MENA Renewables', description: 'Dedicated fund for renewable energy projects in MENA. Target $200M AUM. Focus on solar, green hydrogen, and grid storage. Aligned with UAE Net Zero 2050.', source: 'market_research', status: 'active', currentStage: 1, priority: 'high', category: 'investment', confidenceScore: 71, tags: JSON.stringify(['ESG', 'renewables', 'MENA', 'energy']), estimatedInvestment: JSON.stringify({ min: 5000000, max: 10000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 20000000, max: 100000000, timeframe: '7 years' }) },
    { userId, title: 'AI-Native CFO-as-a-Service', description: 'Offer fractional CFO services powered by AI agents. Real-time financial modelling, cash flow forecasting, and board reporting for SMEs at 10% of traditional cost.', source: 'client_feedback', status: 'active', currentStage: 3, priority: 'medium', category: 'business', confidenceScore: 76, tags: JSON.stringify(['CFO', 'SaaS', 'AI', 'SME']), estimatedInvestment: JSON.stringify({ min: 400000, max: 1000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 4000000, max: 12000000, timeframe: '3 years' }) },
    { userId, title: 'Sovereign Wealth Fund Co-Investment Platform', description: 'Digital platform enabling SWFs to co-invest in curated deal flow from top-tier GPs. Streamlines due diligence, legal, and reporting for SWF investment teams.', source: 'partner_referral', status: 'active', currentStage: 2, priority: 'critical', category: 'investment', confidenceScore: 85, tags: JSON.stringify(['SWF', 'co-investment', 'platform', 'institutional']), estimatedInvestment: JSON.stringify({ min: 3000000, max: 8000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 30000000, max: 150000000, timeframe: '5 years' }) },
    { userId, title: 'Arabic-First LLM for MENA Business', description: 'Fine-tune a large language model specifically for MENA business contexts: Arabic dialects, Islamic finance, GCC regulatory language, and regional cultural norms.', source: 'technology_scan', status: 'active', currentStage: 1, priority: 'high', category: 'technology', confidenceScore: 68, tags: JSON.stringify(['LLM', 'Arabic', 'MENA', 'AI']), estimatedInvestment: JSON.stringify({ min: 2000000, max: 6000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 20000000, max: 80000000, timeframe: '4 years' }) },
    { userId, title: 'Smart Contract Escrow for M&A Transactions', description: 'Blockchain-based escrow platform for M&A deal execution. Automates milestone-based payments, reduces legal costs by 40%, and provides real-time deal transparency.', source: 'market_research', status: 'active', currentStage: 2, priority: 'medium', category: 'technology', confidenceScore: 72, tags: JSON.stringify(['blockchain', 'M&A', 'escrow', 'smart contracts']), estimatedInvestment: JSON.stringify({ min: 600000, max: 1500000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 5000000, max: 20000000, timeframe: '3 years' }) },
    { userId, title: 'CEPHO Academy — AI Leadership Programme', description: 'Executive education programme teaching C-suite leaders how to deploy AI agents, build AI-native teams, and govern AI systems. 12-week cohort model.', source: 'client_feedback', status: 'active', currentStage: 3, priority: 'medium', category: 'business', confidenceScore: 80, tags: JSON.stringify(['education', 'AI', 'leadership', 'executive']), estimatedInvestment: JSON.stringify({ min: 200000, max: 500000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2000000, max: 8000000, timeframe: '2 years' }) },
    // Product ideas
    { userId, title: 'Predictive Deal Flow Engine', description: 'ML model that predicts which deals in the pipeline will close, at what valuation, and in what timeframe. Trained on 10 years of GCC deal data.', source: 'internal', status: 'active', currentStage: 2, priority: 'high', category: 'product', confidenceScore: 77, tags: JSON.stringify(['ML', 'deal flow', 'prediction', 'PE']), estimatedInvestment: JSON.stringify({ min: 500000, max: 1200000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 5000000, max: 25000000, timeframe: '3 years' }) },
    { userId, title: 'Automated Regulatory Intelligence Feed', description: 'Real-time monitoring of regulatory changes across 15 GCC jurisdictions. AI summarises impact, flags required actions, and auto-drafts compliance responses.', source: 'regulatory_scan', status: 'active', currentStage: 1, priority: 'medium', category: 'product', confidenceScore: 73, tags: JSON.stringify(['regulatory', 'compliance', 'AI', 'GCC']), estimatedInvestment: JSON.stringify({ min: 300000, max: 700000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 3000000, max: 10000000, timeframe: '2 years' }) },
    { userId, title: 'Digital Twin for Portfolio Companies', description: 'Extend the CEPHO Digital Twin concept to portfolio companies. Each company gets an AI model of its operations, enabling real-time performance monitoring and scenario planning.', source: 'internal', status: 'active', currentStage: 2, priority: 'high', category: 'product', confidenceScore: 81, tags: JSON.stringify(['digital twin', 'portfolio', 'monitoring']), estimatedInvestment: JSON.stringify({ min: 700000, max: 2000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 7000000, max: 30000000, timeframe: '4 years' }) },
    // Trend-based ideas
    { userId, title: 'Agentic Workflow Marketplace', description: 'Marketplace where businesses can purchase pre-built AI agent workflows for common business processes. Revenue share model with workflow creators.', source: 'technology_scan', status: 'active', currentStage: 1, priority: 'medium', category: 'trend', confidenceScore: 69, tags: JSON.stringify(['agents', 'marketplace', 'automation']), estimatedInvestment: JSON.stringify({ min: 400000, max: 1000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 4000000, max: 20000000, timeframe: '3 years' }) },
    { userId, title: 'Voice-First Executive Assistant', description: 'AI executive assistant that operates entirely through voice. Integrates with calendar, email, and CEPHO to manage the CEO\'s day through natural conversation.', source: 'technology_scan', status: 'active', currentStage: 2, priority: 'medium', category: 'product', confidenceScore: 75, tags: JSON.stringify(['voice', 'AI assistant', 'executive']), estimatedInvestment: JSON.stringify({ min: 350000, max: 900000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 3500000, max: 15000000, timeframe: '2 years' }) },
    // Validated/promoted ideas
    { userId, title: 'CEPHO Enterprise — White-Label Platform', description: 'White-label version of CEPHO for enterprise clients. Each client gets their own branded AI Chief of Staff with custom agents, workflows, and integrations.', source: 'client_feedback', status: 'validated', currentStage: 5, priority: 'critical', category: 'business', confidenceScore: 91, tags: JSON.stringify(['enterprise', 'white-label', 'B2B']), estimatedInvestment: JSON.stringify({ min: 1500000, max: 4000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 15000000, max: 60000000, timeframe: '3 years' }) },
    { userId, title: 'Real-Time Sentiment Analysis for Deal Negotiations', description: 'AI tool that analyses tone, language patterns, and sentiment in negotiation communications to provide real-time coaching and risk alerts.', source: 'internal', status: 'active', currentStage: 3, priority: 'medium', category: 'product', confidenceScore: 78, tags: JSON.stringify(['sentiment', 'negotiation', 'AI', 'coaching']), estimatedInvestment: JSON.stringify({ min: 250000, max: 600000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2500000, max: 8000000, timeframe: '2 years' }) },
    { userId, title: 'Islamic Finance AI Structuring Engine', description: 'AI system that structures Sharia-compliant financial products (Sukuk, Murabaha, Ijara) and validates compliance with AAOIFI standards.', source: 'market_research', status: 'active', currentStage: 2, priority: 'high', category: 'technology', confidenceScore: 83, tags: JSON.stringify(['Islamic finance', 'Sharia', 'AI', 'structuring']), estimatedInvestment: JSON.stringify({ min: 800000, max: 2000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 8000000, max: 35000000, timeframe: '4 years' }) },
    { userId, title: 'Automated LP Reporting Suite', description: 'Automated generation of quarterly LP reports, capital account statements, and ILPA-compliant disclosures. Reduces reporting time from 3 weeks to 2 hours.', source: 'client_feedback', status: 'active', currentStage: 4, priority: 'high', category: 'product', confidenceScore: 87, tags: JSON.stringify(['LP', 'reporting', 'automation', 'PE']), estimatedInvestment: JSON.stringify({ min: 300000, max: 700000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 3000000, max: 12000000, timeframe: '2 years' }) },
    // Deferred/on-hold ideas
    { userId, title: 'Metaverse Board Room for Remote Governance', description: 'Virtual board room in a metaverse environment for remote board meetings. Includes AI-generated avatars, real-time document collaboration, and voting systems.', source: 'technology_scan', status: 'on_hold', currentStage: 1, priority: 'low', category: 'trend', confidenceScore: 45, tags: JSON.stringify(['metaverse', 'governance', 'remote']), estimatedInvestment: JSON.stringify({ min: 1000000, max: 3000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2000000, max: 8000000, timeframe: '5 years' }) },
    { userId, title: 'Quantum Computing for Portfolio Optimisation', description: 'Explore quantum computing algorithms for portfolio optimisation. Partner with IBM Quantum or IonQ for early access to quantum hardware.', source: 'technology_scan', status: 'on_hold', currentStage: 1, priority: 'low', category: 'technology', confidenceScore: 38, tags: JSON.stringify(['quantum', 'portfolio', 'optimisation']), estimatedInvestment: JSON.stringify({ min: 2000000, max: 5000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 5000000, max: 20000000, timeframe: '7 years' }) },
    // Additional active ideas to fill tabs
    { userId, title: 'AI-Powered Pitch Deck Generator', description: 'Generate investor-ready pitch decks from a 10-minute questionnaire. AI selects design, writes copy, and builds financial charts automatically.', source: 'internal', status: 'active', currentStage: 3, priority: 'medium', category: 'product', confidenceScore: 76, tags: JSON.stringify(['pitch deck', 'AI', 'fundraising']), estimatedInvestment: JSON.stringify({ min: 150000, max: 400000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 1500000, max: 6000000, timeframe: '2 years' }) },
    { userId, title: 'Cross-Border Payment Intelligence', description: 'AI system that optimises cross-border payment routing, FX conversion, and compliance for GCC-to-global transactions. Integrates with SWIFT, CBUAE, and local payment rails.', source: 'market_research', status: 'active', currentStage: 2, priority: 'high', category: 'technology', confidenceScore: 79, tags: JSON.stringify(['payments', 'FX', 'cross-border', 'fintech']), estimatedInvestment: JSON.stringify({ min: 600000, max: 1500000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 6000000, max: 25000000, timeframe: '3 years' }) },
    { userId, title: 'Talent Intelligence Platform for GCC', description: 'AI platform that maps talent availability, compensation benchmarks, and career trajectories across the GCC. Helps companies hire faster and retain better.', source: 'client_feedback', status: 'active', currentStage: 1, priority: 'medium', category: 'business', confidenceScore: 70, tags: JSON.stringify(['talent', 'HR', 'GCC', 'AI']), estimatedInvestment: JSON.stringify({ min: 400000, max: 1000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 4000000, max: 15000000, timeframe: '3 years' }) },
    { userId, title: 'Automated ESG Reporting for GCC Corporates', description: 'AI-driven ESG data collection, analysis, and reporting platform aligned with GRI, SASB, and UAE Securities & Commodities Authority requirements.', source: 'regulatory_scan', status: 'active', currentStage: 2, priority: 'high', category: 'product', confidenceScore: 82, tags: JSON.stringify(['ESG', 'reporting', 'sustainability', 'GCC']), estimatedInvestment: JSON.stringify({ min: 500000, max: 1200000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 5000000, max: 18000000, timeframe: '3 years' }) },
    { userId, title: 'AI Legal Due Diligence Assistant', description: 'AI system that reviews legal documents, flags risks, and summarises key terms for M&A due diligence. Reduces legal review time by 70%.', source: 'internal', status: 'active', currentStage: 3, priority: 'high', category: 'product', confidenceScore: 84, tags: JSON.stringify(['legal', 'due diligence', 'AI', 'M&A']), estimatedInvestment: JSON.stringify({ min: 400000, max: 1000000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 4000000, max: 16000000, timeframe: '2 years' }) },
    { userId, title: 'Smart Office Management Platform', description: 'IoT + AI platform for managing hybrid office environments. Optimises desk booking, meeting room allocation, energy usage, and visitor management.', source: 'technology_scan', status: 'active', currentStage: 1, priority: 'low', category: 'trend', confidenceScore: 62, tags: JSON.stringify(['IoT', 'smart office', 'hybrid work']), estimatedInvestment: JSON.stringify({ min: 300000, max: 700000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2000000, max: 7000000, timeframe: '3 years' }) },
    { userId, title: 'Personalised Wealth Management AI', description: 'AI wealth manager that creates personalised investment portfolios for HNWI based on goals, risk tolerance, and Islamic finance preferences. Minimum AUM $500K.', source: 'client_feedback', status: 'active', currentStage: 2, priority: 'high', category: 'investment', confidenceScore: 80, tags: JSON.stringify(['wealth management', 'HNWI', 'AI', 'personalisation']), estimatedInvestment: JSON.stringify({ min: 700000, max: 1800000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 7000000, max: 30000000, timeframe: '4 years' }) },
    { userId, title: 'Startup Ecosystem Intelligence Platform', description: 'Real-time intelligence on GCC startup ecosystem: funding rounds, founder profiles, investor activity, and market trends. Powered by web scraping and AI analysis.', source: 'market_research', status: 'active', currentStage: 1, priority: 'medium', category: 'business', confidenceScore: 67, tags: JSON.stringify(['startup', 'intelligence', 'GCC', 'data']), estimatedInvestment: JSON.stringify({ min: 250000, max: 600000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2500000, max: 10000000, timeframe: '2 years' }) },
    { userId, title: 'AI-Powered Board Evaluation Framework', description: 'Annual board effectiveness evaluation powered by AI. Analyses board composition, decision quality, and governance practices against global best practices.', source: 'client_feedback', status: 'active', currentStage: 3, priority: 'medium', category: 'product', confidenceScore: 77, tags: JSON.stringify(['board', 'governance', 'evaluation', 'AI']), estimatedInvestment: JSON.stringify({ min: 200000, max: 500000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2000000, max: 7000000, timeframe: '2 years' }) },
    { userId, title: 'Automated Regulatory Sandbox Application', description: 'AI assistant that helps fintech startups apply for regulatory sandboxes in ADGM, DIFC, and Central Bank of UAE. Automates documentation and compliance checks.', source: 'regulatory_scan', status: 'active', currentStage: 2, priority: 'medium', category: 'technology', confidenceScore: 73, tags: JSON.stringify(['regulatory sandbox', 'fintech', 'UAE', 'compliance']), estimatedInvestment: JSON.stringify({ min: 200000, max: 500000, currency: 'USD' }), estimatedReturn: JSON.stringify({ min: 2000000, max: 8000000, timeframe: '2 years' }) },
  ];
  await db.insert(schema.innovationIdeas).values(ideas);
  console.log(`   ✓ Created ${ideas.length} innovation ideas`);
}

// ─── Subscriptions (Subscription Tracker) ─────────────────────────────────────
async function seedSubscriptionTracker(userId: number) {
  console.log('💳 Seeding subscription tracker...');
  const existing = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Subscriptions already exist');
    return;
  }
  const subs = [
    { userId, name: 'OpenAI API', provider: 'OpenAI', description: 'GPT-4.1 and embedding API access for all CEPHO AI features', category: 'ai_tools', cost: 1840, billingCycle: 'monthly', currency: 'AED', status: 'active', startDate: daysAgo(90), renewalDate: daysFromNow(30), usagePercent: 72, websiteUrl: 'https://openai.com', notes: 'Primary AI provider. Monitor token usage monthly.' },
    { userId, name: 'Render', provider: 'Render Inc.', description: 'Cloud hosting for CEPHO platform — web service + PostgreSQL + Redis', category: 'infrastructure', cost: 920, billingCycle: 'monthly', currency: 'AED', status: 'active', startDate: daysAgo(180), renewalDate: daysFromNow(15), usagePercent: 45, websiteUrl: 'https://render.com', notes: 'Production and staging environments.' },
    { userId, name: 'Supabase', provider: 'Supabase Inc.', description: 'Auth, real-time subscriptions, and storage for CEPHO', category: 'infrastructure', cost: 368, billingCycle: 'monthly', currency: 'AED', status: 'active', startDate: daysAgo(180), renewalDate: daysFromNow(15), usagePercent: 38, websiteUrl: 'https://supabase.com', notes: 'Pro plan. Includes 8GB database and 100GB storage.' },
    { userId, name: 'Asana', provider: 'Asana Inc.', description: 'Project management for the Boundless Platform development team', category: 'productivity', cost: 552, billingCycle: 'monthly', currency: 'AED', status: 'active', startDate: daysAgo(365), renewalDate: daysFromNow(20), usagePercent: 85, websiteUrl: 'https://asana.com', notes: 'Business plan for 10 users. Consider upgrading to Enterprise.' },
    { userId, name: 'Notion', provider: 'Notion Labs', description: 'Internal knowledge base, SOPs, and team documentation', category: 'productivity', cost: 276, billingCycle: 'monthly', currency: 'AED', status: 'active', startDate: daysAgo(270), renewalDate: daysFromNow(10), usagePercent: 60, websiteUrl: 'https://notion.so', notes: 'Plus plan for 8 users.' },
    { userId, name: 'Zoom', provider: 'Zoom Video Communications', description: 'Video conferencing for LP meetings, board calls, and team syncs', category: 'communication', cost: 184, billingCycle: 'monthly', currency: 'AED', status: 'active', startDate: daysAgo(400), renewalDate: daysFromNow(25), usagePercent: 55, websiteUrl: 'https://zoom.us', notes: 'Pro plan. Includes webinar add-on for LP events.' },
    { userId, name: 'Snyk', provider: 'Snyk Ltd.', description: 'Security vulnerability scanning for CEPHO codebase and dependencies', category: 'security', cost: 736, billingCycle: 'annual', currency: 'AED', status: 'active', startDate: daysAgo(60), renewalDate: daysFromNow(305), usagePercent: 30, websiteUrl: 'https://snyk.io', notes: 'Team plan. Annual billing saves 20%.' },
    { userId, name: 'Figma', provider: 'Figma Inc.', description: 'UI/UX design tool for Boundless Platform and CEPHO design system', category: 'design', cost: 460, billingCycle: 'monthly', currency: 'AED', status: 'trial', startDate: daysAgo(14), trialEndDate: daysFromNow(16), renewalDate: daysFromNow(16), usagePercent: 40, websiteUrl: 'https://figma.com', notes: 'Organisation trial. Evaluate vs current Sketch licence.' },
  ];
  await db.insert(schema.subscriptions).values(subs);
  console.log(`   ✓ Created ${subs.length} subscriptions`);
}

// ─── Notifications ────────────────────────────────────────────────────────────
async function seedNotifications(userId: number) {
  console.log('🔔 Seeding notifications...');
  const existing = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Notifications already exist');
    return;
  }
  const notifs = [
    { userId, type: 'task_due', title: 'Task Due Tomorrow', message: 'Extend offer to Head of Product candidate is due tomorrow. Action required.', actionUrl: '/chief-of-staff', actionLabel: 'View Task', read: false },
    { userId, type: 'ai_insight', title: 'Victoria: Deal Alert', message: 'Celadon Capital term sheet negotiation has stalled for 3 days. Recommend scheduling a call with the lead investor.', actionUrl: '/nexus', actionLabel: 'View Briefing', read: false },
    { userId, type: 'document_ready', title: 'Document Ready for Review', message: 'UAE Market Entry Strategy document has been generated and is awaiting your QA approval.', actionUrl: '/document-library', actionLabel: 'Review Document', read: false },
    { userId, type: 'subscription_renewal', title: 'Subscription Renewal in 10 Days', message: 'Notion subscription renews in 10 days. Current cost: AED 276/month.', actionUrl: '/subscription-tracker', actionLabel: 'View Subscription', read: false },
    { userId, type: 'innovation_milestone', title: 'Innovation Idea Reaches Stage 4', message: 'GCC Corporate Governance AI Advisor has progressed to Stage 4 (Validation). Ready for investment decision.', actionUrl: '/innovation-hub', actionLabel: 'View Idea', read: false },
    { userId, type: 'agent_report', title: 'Weekly Agent Performance Report', message: 'Your 51 AI agents completed 847 tasks this week. Average QA score: 8.4/10. 3 agents flagged for review.', actionUrl: '/ai-agents', actionLabel: 'View Report', read: false },
    { userId, type: 'task_completed', title: 'Task Completed by AI Agent', message: 'PE Partner agent completed: Finalise term sheet with lead investor. QA score: 9/10.', actionUrl: '/chief-of-staff', actionLabel: 'View Task', read: true, readAt: daysAgo(1) },
    { userId, type: 'project_update', title: 'Project Progress Update', message: 'Boundless Platform v3.0 reached 40% completion. On track for Q2 delivery.', actionUrl: '/nexus', actionLabel: 'View Project', read: true, readAt: daysAgo(1) },
    { userId, type: 'ai_insight', title: 'Market Intelligence Alert', message: 'New competitor entered GCC AI market: Falcon AI raised $30M Series A. Recommend competitive response analysis.', actionUrl: '/innovation-hub', actionLabel: 'Analyse Threat', read: false },
    { userId, type: 'document_approved', title: 'Document Approved', message: 'Q1 2026 Board Report has been approved by Victoria AI and is ready for distribution.', actionUrl: '/document-library', actionLabel: 'View Document', read: true, readAt: daysAgo(2) },
    { userId, type: 'task_overdue', title: 'Task Overdue', message: 'Review Q1 KPI dashboard and prepare commentary was due yesterday. Marked as completed.', actionUrl: '/chief-of-staff', actionLabel: 'View Task', read: true, readAt: daysAgo(1) },
    { userId, type: 'integration_alert', title: 'Integration Requires Attention', message: 'Google Calendar integration disconnected. Reconnect to resume automatic meeting brief generation.', actionUrl: '/settings', actionLabel: 'Reconnect', read: false },
    { userId, type: 'ai_insight', title: 'Victoria: Strategic Recommendation', message: 'Based on current deal pipeline, recommend prioritising ADNOC JV over Fund II LP roadshow this week. 3x higher expected value.', actionUrl: '/nexus', actionLabel: 'View Analysis', read: false },
    { userId, type: 'subscription_alert', title: 'High AI Spend Alert', message: 'OpenAI API spend is 72% of monthly budget with 8 days remaining. Consider enabling cost controls.', actionUrl: '/subscription-tracker', actionLabel: 'Manage Budget', read: false },
    { userId, type: 'evening_review', title: 'Evening Review Ready', message: 'Your daily evening review is ready. 6 tasks to review, 2 decisions required.', actionUrl: '/evening-review', actionLabel: 'Start Review', read: false },
  ];
  await db.insert(schema.notifications).values(notifs);
  console.log(`   ✓ Created ${notifs.length} notifications`);
}

// ─── Project Genesis (Workflows) ──────────────────────────────────────────────
async function seedProjectGenesis(userId: number) {
  console.log('🚀 Seeding project genesis records...');
  const existing = await db
    .select()
    .from(schema.projectGenesis)
    .where(eq(schema.projectGenesis.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Project genesis records already exist');
    return;
  }
  const genesis = [
    {
      userId,
      name: 'Celadon Capital Fund II — Full Fundraise Workflow',
      type: 'fundraising',
      stage: 'execution',
      status: 'active',
      counterparty: 'Multiple LPs',
      dealValue: 50000000,
      currency: 'USD',
      probability: 75,
      expectedCloseDate: daysFromNow(45),
      description: 'Complete fundraising workflow for $50M Series B. Includes LP outreach, data room management, legal, and closing.',
      metadata: JSON.stringify({ currentPhase: 3, currentStep: 2, skillType: 'fundraising', agentId: 'pe_partner' }),
    },
    {
      userId,
      name: 'ADNOC Ventures JV — Due Diligence & Negotiation',
      type: 'partnership',
      stage: 'due_diligence',
      status: 'active',
      counterparty: 'ADNOC Ventures',
      dealValue: 15000000,
      currency: 'USD',
      probability: 60,
      expectedCloseDate: daysFromNow(75),
      description: 'Joint venture workflow covering technical due diligence, financial modelling, and term negotiation.',
      metadata: JSON.stringify({ currentPhase: 2, currentStep: 1, skillType: 'partnership', agentId: 'strategy_consultant' }),
    },
    {
      userId,
      name: 'UAE Market Entry — ADGM Licence Application',
      type: 'regulatory',
      stage: 'preparation',
      status: 'active',
      counterparty: 'ADGM',
      dealValue: null,
      currency: 'AED',
      probability: 85,
      expectedCloseDate: daysFromNow(120),
      description: 'Regulatory workflow for ADGM Category 3C licence. Includes documentation, compliance, and submission.',
      metadata: JSON.stringify({ currentPhase: 1, currentStep: 3, skillType: 'regulatory', agentId: 'ma_lawyer' }),
    },
    {
      userId,
      name: 'Boundless Platform v3.0 — Product Launch Workflow',
      type: 'product_launch',
      stage: 'development',
      status: 'active',
      counterparty: null,
      dealValue: null,
      currency: 'AED',
      probability: 90,
      expectedCloseDate: daysFromNow(90),
      description: 'End-to-end product launch workflow: development, QA, marketing, and go-live.',
      metadata: JSON.stringify({ currentPhase: 2, currentStep: 2, skillType: 'product_launch', agentId: 'tech_cto' }),
    },
    {
      userId,
      name: 'Senior ML Engineer Hire — Full Recruitment Workflow',
      type: 'recruitment',
      stage: 'interviewing',
      status: 'active',
      counterparty: null,
      dealValue: null,
      currency: 'AED',
      probability: 80,
      expectedCloseDate: daysFromNow(21),
      description: 'Recruitment workflow for senior ML engineer: sourcing, screening, interviews, offer, and onboarding.',
      metadata: JSON.stringify({ currentPhase: 3, currentStep: 1, skillType: 'recruitment', agentId: 'hr_chro' }),
    },
  ];
  await db.insert(schema.projectGenesis).values(genesis);
  console.log(`   ✓ Created ${genesis.length} project genesis records`);
}

// ─── Evening Review Sessions ──────────────────────────────────────────────────
async function seedEveningReview(userId: number) {
  console.log('🌙 Seeding evening review sessions...');
  const existing = await db
    .select()
    .from(schema.eveningReviewSessions)
    .where(eq(schema.eveningReviewSessions.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Evening review sessions already exist');
    return;
  }
  const sessions = [
    {
      userId,
      reviewDate: daysAgo(1),
      startedAt: new Date(daysAgo(1).getTime() + 19 * 3600000), // 7pm
      completedAt: new Date(daysAgo(1).getTime() + 19.5 * 3600000), // 7:30pm
      mode: 'full',
      tasksAccepted: 8,
      tasksDeferred: 2,
      tasksRejected: 1,
      moodScore: 8,
      wentWellNotes: 'Term sheet negotiation progressed well. LP call was very positive.',
      didntGoWellNotes: 'ADGM documentation took longer than expected.',
      signalItemsGenerated: 3,
    },
    {
      userId,
      reviewDate: daysAgo(2),
      startedAt: new Date(daysAgo(2).getTime() + 20 * 3600000),
      completedAt: new Date(daysAgo(2).getTime() + 20.4 * 3600000),
      mode: 'quick',
      tasksAccepted: 5,
      tasksDeferred: 3,
      tasksRejected: 0,
      moodScore: 7,
      wentWellNotes: 'Board report completed ahead of schedule.',
      didntGoWellNotes: 'Team sync ran over time.',
      signalItemsGenerated: 2,
    },
    {
      userId,
      reviewDate: daysAgo(3),
      startedAt: new Date(daysAgo(3).getTime() + 19.5 * 3600000),
      completedAt: new Date(daysAgo(3).getTime() + 20 * 3600000),
      mode: 'full',
      tasksAccepted: 10,
      tasksDeferred: 1,
      tasksRejected: 2,
      moodScore: 9,
      wentWellNotes: 'ADNOC meeting exceeded expectations. Strong JV interest confirmed.',
      didntGoWellNotes: 'Nothing significant.',
      signalItemsGenerated: 5,
    },
    {
      userId,
      reviewDate: daysAgo(5),
      startedAt: new Date(daysAgo(5).getTime() + 21 * 3600000),
      completedAt: new Date(daysAgo(5).getTime() + 21.3 * 3600000),
      mode: 'quick',
      tasksAccepted: 4,
      tasksDeferred: 4,
      tasksRejected: 1,
      moodScore: 6,
      wentWellNotes: 'Recruitment pipeline is strong.',
      didntGoWellNotes: 'Fund II LP dropped out. Need replacement.',
      signalItemsGenerated: 1,
    },
    {
      userId,
      reviewDate: daysAgo(7),
      startedAt: new Date(daysAgo(7).getTime() + 19 * 3600000),
      completedAt: new Date(daysAgo(7).getTime() + 19.7 * 3600000),
      mode: 'full',
      tasksAccepted: 12,
      tasksDeferred: 0,
      tasksRejected: 3,
      moodScore: 8,
      wentWellNotes: 'Productive week. All critical tasks completed.',
      didntGoWellNotes: 'ADGM timeline slipped by 2 weeks.',
      signalItemsGenerated: 4,
    },
  ];
  await db.insert(schema.eveningReviewSessions).values(sessions);
  console.log(`   ✓ Created ${sessions.length} evening review sessions`);
}

// ─── Memory Bank ──────────────────────────────────────────────────────────────
async function seedMemoryBank(userId: number) {
  console.log('🧠 Seeding agent memory bank...');
  const existing = await db
    .select()
    .from(schema.memoryBank)
    .where(eq(schema.memoryBank.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Memory bank already exists');
    return;
  }
  const memories = [
    { userId, category: 'preference', key: 'communication_style', value: 'Prefers concise executive summaries. Maximum 3 bullet points per section. No jargon.', confidence: 0.95, source: 'digital_twin' },
    { userId, category: 'preference', key: 'meeting_preference', value: 'Prefers morning meetings before 11am. No meetings on Fridays. Always needs 10-minute buffer between calls.', confidence: 0.92, source: 'calendar_analysis' },
    { userId, category: 'decision_pattern', key: 'risk_appetite', value: 'Moderate-high risk tolerance for technology investments. Conservative on regulatory/compliance matters. Always seeks 2+ expert opinions before major decisions.', confidence: 0.88, source: 'decision_history' },
    { userId, category: 'priority', key: 'current_focus', value: 'Fund II closing is top priority until end of Q1. ADNOC JV is second priority. All other projects are maintenance mode.', confidence: 0.97, source: 'explicit_instruction' },
    { userId, category: 'relationship', key: 'key_contacts', value: 'Mohammed Al-Rashid (ADNOC Ventures, primary contact), Sarah Chen (Lead LP, Falcon Capital), David Park (Tech CTO, trusted advisor)', confidence: 0.90, source: 'crm_analysis' },
    { userId, category: 'knowledge', key: 'investment_thesis', value: 'Focus: AI-native businesses in GCC. Avoid: crypto, consumer social, hardware. Sweet spot: $2-10M tickets, Series A/B, 3-5 year hold.', confidence: 0.96, source: 'explicit_instruction' },
    { userId, category: 'workflow', key: 'daily_routine', value: 'Starts at 7am with Victoria briefing. Reviews CoS task queue at 8am. Blocks 2-4pm for deep work. Evening review at 7pm.', confidence: 0.85, source: 'behaviour_analysis' },
    { userId, category: 'preference', key: 'document_format', value: 'Prefers PDF for external documents, Markdown for internal. Always include executive summary on page 1. Use CEPHO brand colours.', confidence: 0.89, source: 'explicit_instruction' },
    { userId, category: 'knowledge', key: 'regulatory_context', value: 'Operating under ADGM Category 3C licence (pending). Familiar with DIFC, CBUAE, and SCA regulations. Legal counsel: Al Tamimi & Company.', confidence: 0.93, source: 'document_analysis' },
    { userId, category: 'decision_pattern', key: 'delegation_style', value: 'Delegates execution to AI agents. Reserves final approval for: deals > $1M, hiring decisions, regulatory submissions, external communications.', confidence: 0.91, source: 'behaviour_analysis' },
  ];
  await db.insert(schema.memoryBank).values(memories);
  console.log(`   ✓ Created ${memories.length} memory bank entries`);
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
async function seedActivityFeed(userId: number) {
  console.log('📊 Seeding activity feed...');
  const existing = await db
    .select()
    .from(schema.activityFeed)
    .where(eq(schema.activityFeed.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    console.log('   ✓ Activity feed already exists');
    return;
  }
  const activities = [
    { userId, actorType: 'ai_agent', actorId: 'pe_partner', action: 'task_completed', description: 'Completed term sheet review for Celadon Capital Fund II', metadata: JSON.stringify({ taskId: 1, score: 9 }), createdAt: daysAgo(0) },
    { userId, actorType: 'ai_agent', actorId: 'victoria', action: 'briefing_generated', description: 'Generated daily executive briefing for March 2, 2026', metadata: JSON.stringify({ type: 'daily_briefing' }), createdAt: daysAgo(0) },
    { userId, actorType: 'ai_agent', actorId: 'cfo_expert', action: 'document_created', description: 'Created investor data room index for Fund II', metadata: JSON.stringify({ documentType: 'index_document' }), createdAt: daysAgo(1) },
    { userId, actorType: 'user', actorId: String(userId), action: 'idea_promoted', description: 'Promoted CEPHO Enterprise White-Label to Stage 5 (Validated)', metadata: JSON.stringify({ ideaTitle: 'CEPHO Enterprise — White-Label Platform' }), createdAt: daysAgo(1) },
    { userId, actorType: 'ai_agent', actorId: 'strategy_consultant', action: 'analysis_completed', description: 'Completed competitive landscape analysis for GCC AI market', metadata: JSON.stringify({ documentType: 'market_analysis' }), createdAt: daysAgo(2) },
    { userId, actorType: 'ai_agent', actorId: 'tech_cto', action: 'task_completed', description: 'Completed performance audit — LCP reduced to 1.8s', metadata: JSON.stringify({ taskId: 10, score: 10 }), createdAt: daysAgo(3) },
    { userId, actorType: 'user', actorId: String(userId), action: 'project_created', description: 'Created new project: Strategic Partnership with ADNOC Ventures', metadata: JSON.stringify({ projectName: 'Strategic Partnership: ADNOC Ventures' }), createdAt: daysAgo(3) },
    { userId, actorType: 'ai_agent', actorId: 'hr_chro', action: 'task_completed', description: 'Screened 12 ML engineer candidates, shortlisted 3 for final interviews', metadata: JSON.stringify({ candidatesScreened: 12, shortlisted: 3 }), createdAt: daysAgo(4) },
    { userId, actorType: 'ai_agent', actorId: 'ma_lawyer', action: 'document_reviewed', description: 'Reviewed ADGM licence application — 2 amendments required', metadata: JSON.stringify({ documentType: 'regulatory_document', amendments: 2 }), createdAt: daysAgo(4) },
    { userId, actorType: 'system', actorId: 'cepho', action: 'notification_sent', description: 'Sent weekly agent performance report to Victoria', metadata: JSON.stringify({ agentCount: 51, avgScore: 8.4 }), createdAt: daysAgo(5) },
    { userId, actorType: 'ai_agent', actorId: 'victoria', action: 'evening_review_completed', description: 'Evening review completed: 10 tasks accepted, 1 deferred', metadata: JSON.stringify({ accepted: 10, deferred: 1, moodScore: 9 }), createdAt: daysAgo(3) },
    { userId, actorType: 'ai_agent', actorId: 'marketing_cmo', action: 'document_created', description: 'Created Q2 2026 Marketing Strategy for GCC Growth Plan', metadata: JSON.stringify({ documentType: 'strategy_document' }), createdAt: daysAgo(5) },
    { userId, actorType: 'user', actorId: String(userId), action: 'document_approved', description: 'Approved Q1 2026 Board Report for distribution', metadata: JSON.stringify({ documentId: `DOC-${Date.now()}-005` }), createdAt: daysAgo(7) },
    { userId, actorType: 'ai_agent', actorId: 'pe_partner', action: 'meeting_scheduled', description: 'Scheduled LP roadshow in Dubai, Abu Dhabi, and Riyadh', metadata: JSON.stringify({ cities: ['Dubai', 'Abu Dhabi', 'Riyadh'], meetings: 9 }), createdAt: daysAgo(6) },
    { userId, actorType: 'ai_agent', actorId: 'digital_twin', action: 'task_completed', description: 'Completed weekly board update — executive summary delivered', metadata: JSON.stringify({ taskId: 19, score: 9 }), createdAt: daysAgo(7) },
    { userId, actorType: 'system', actorId: 'cepho', action: 'subscription_alert', description: 'OpenAI API spend reached 72% of monthly budget', metadata: JSON.stringify({ provider: 'OpenAI', usagePercent: 72 }), createdAt: daysAgo(1) },
    { userId, actorType: 'ai_agent', actorId: 'cfo_expert', action: 'analysis_completed', description: 'Completed Q1 financial performance analysis — 23% above target', metadata: JSON.stringify({ performance: '+23%', period: 'Q1 2026' }), createdAt: daysAgo(8) },
    { userId, actorType: 'user', actorId: String(userId), action: 'idea_created', description: 'Added new innovation idea: AI-Powered Board Evaluation Framework', metadata: JSON.stringify({ ideaTitle: 'AI-Powered Board Evaluation Framework' }), createdAt: daysAgo(9) },
    { userId, actorType: 'ai_agent', actorId: 'operations_coo', action: 'process_optimised', description: 'Identified 3 workflow bottlenecks in Fund II process — recommendations submitted', metadata: JSON.stringify({ bottlenecks: 3, estimatedTimeSaving: '4 hours/week' }), createdAt: daysAgo(10) },
    { userId, actorType: 'ai_agent', actorId: 'data_scientist', action: 'model_updated', description: 'Updated deal flow prediction model with Q1 2026 data — accuracy improved to 84%', metadata: JSON.stringify({ modelVersion: '2.3', accuracy: 0.84 }), createdAt: daysAgo(11) },
  ];
  await db.insert(schema.activityFeed).values(activities);
  console.log(`   ✓ Created ${activities.length} activity feed entries`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 CEPHO.AI — Phase 2 Comprehensive Seed\n');
  try {
    const admin = await getAdminUser();
    const userId = admin.id;
    console.log(`   Using admin user: ${admin.email} (ID: ${userId})\n`);

    await seedProjects(userId);
    await seedTasks(userId);
    await seedDocuments(userId);
    await seedInnovationIdeas(userId);
    await seedSubscriptionTracker(userId);
    await seedNotifications(userId);
    await seedProjectGenesis(userId);
    await seedEveningReview(userId);
    await seedMemoryBank(userId);
    await seedActivityFeed(userId);

    console.log('\n✅ Phase 2 seed completed successfully.\n');
    console.log('Pages now populated:');
    console.log('  ✓ Nexus Dashboard — 5 projects, 25 tasks, 20 activity entries');
    console.log('  ✓ Document Library — 20 documents across all types');
    console.log('  ✓ Innovation Hub — 30 ideas across all stages and categories');
    console.log('  ✓ Subscription Tracker — 8 SaaS subscriptions with real costs');
    console.log('  ✓ Notifications — 15 notifications (8 unread)');
    console.log('  ✓ Workflows — 5 project genesis records in progress');
    console.log('  ✓ Evening Review — 5 historical sessions');
    console.log('  ✓ Agent Memory Bank — 10 memory entries');
    console.log('  ✓ Chief of Staff — 25 tasks with QA scores\n');
  } catch (error) {
    console.error('\n❌ Phase 2 seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
