---
name: cepho-project-genesis
description: Automated Project Genesis 6-phase workflow for SME venture development with AI-SME integration and QMS validation
homepage: https://cepho.ai
metadata:
  openclaw:
    emoji: "🚀"
    requires:
      env: ["CEPHO_API_URL", "CEPHO_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
    primaryEnv: "CEPHO_API_KEY"
---

# CEPHO Project Genesis

Automate the complete **Project Genesis 6-phase workflow** for SME venture development. This skill integrates with CEPHO's AI-SME system, QMS validation, and blueprint library to guide ventures from concept to market-ready business plan.

## Overview

Project Genesis is CEPHO's flagship process for transforming SME ideas into validated, investor-ready ventures through:
- **6 structured phases** with quality gates
- **AI-SME expert consultation** at each phase
- **Automated research and analysis**
- **QMS validation** for quality assurance
- **Blueprint-driven** best practices

## Setup

### 1. CEPHO API Credentials

```bash
export CEPHO_API_URL="https://cepho-the-brain-complete.onrender.com"
export CEPHO_API_KEY="your-cepho-api-key"
```

### 2. Supabase Database

```bash
export SUPABASE_URL="https://uwyeubfgymgiabcuwikw.supabase.co"
export SUPABASE_KEY="your-supabase-service-role-key"
```

### 3. Verify Connection

```bash
curl "$CEPHO_API_URL/api/trpc/auth.getUser" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

## The 6 Phases

### Phase 1: Initiation & Discovery

**Purpose:** Capture venture concept and initial assessment

**Actions:**
- Create project record
- Gather company information
- Identify industry and stage
- Set objectives and timeline

**API Call:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.initiate" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "TechStartup Inc",
    "industry": "SaaS",
    "stage": "seed",
    "description": "AI-powered analytics platform for SMEs",
    "objectives": ["Validate market fit", "Secure seed funding", "Build MVP"]
  }'
```

**Response:**
```json
{
  "projectId": "proj_abc123",
  "status": "initiated",
  "currentPhase": 1,
  "nextSteps": ["Complete company profile", "Schedule deep dive"]
}
```

---

### Phase 2: Deep Dive Analysis

**Purpose:** Comprehensive research and market validation

**Auto-triggered after Phase 1 completion**

**Research Areas:**
1. **Company Analysis**
   - Business model
   - Value proposition
   - Competitive advantages
   - Team assessment

2. **Market Research**
   - Market size (TAM/SAM/SOM)
   - Growth trends
   - Customer segments
   - Pain points

3. **Competitive Landscape**
   - Direct competitors
   - Indirect competitors
   - Market positioning
   - Differentiation

4. **Financial Assessment**
   - Revenue model
   - Cost structure
   - Unit economics
   - Funding requirements

**Monitor Progress:**
```bash
curl "$CEPHO_API_URL/api/trpc/projectGenesis.getPhaseStatus?projectId=proj_abc123&phase=2" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**AI-SME Consultation:**
```bash
# Request market research expert
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.requestConsultation" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "expertType": "market_research",
    "topic": "SaaS market sizing and trends",
    "urgency": "normal"
  }'
```

---

### Phase 3: Business Plan Development

**Purpose:** Generate comprehensive, investor-ready business plan

**Auto-triggered after Phase 2 quality gate**

**Business Plan Sections:**
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization & Management
5. Products/Services
6. Marketing & Sales Strategy
7. Financial Projections (3-5 years)
8. Funding Requirements
9. Risk Analysis
10. Appendices

**Generate Business Plan:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.generateBusinessPlan" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "template": "master_business_plan",
    "includeFinancials": true,
    "projectionYears": 5
  }'
```

**Financial Modeling (BP-015):**
```bash
# Generate financial projections using CEPHO-BP-015
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.applyBlueprint" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "blueprintId": "BP-015",
    "projectId": "proj_abc123",
    "parameters": {
      "revenueModel": "subscription",
      "pricingTier": [10, 50, 200],
      "customerAcquisitionCost": 500,
      "churnRate": 0.05
    }
  }'
```

---

### Phase 4: Expert Review & Validation

**Purpose:** Multi-expert review and refinement

**Auto-triggered after Phase 3 completion**

**Expert Team Assembly:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.assembleExpertTeam" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "expertTypes": [
      "financial_analyst",
      "market_strategist",
      "operations_expert",
      "legal_advisor",
      "technology_architect"
    ]
  }'
```

**Review Sessions:**
```bash
# Start collaborative review session
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.startReviewSession" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "documentId": "business_plan_v1",
    "reviewType": "comprehensive"
  }'
```

**Gather Feedback:**
```bash
# Get expert feedback
curl "$CEPHO_API_URL/api/trpc/aiSme.getReviewFeedback?projectId=proj_abc123" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response Example:**
```json
{
  "reviews": [
    {
      "expert": "financial_analyst",
      "rating": 8.5,
      "strengths": ["Strong unit economics", "Realistic projections"],
      "concerns": ["High CAC in year 1", "Churn assumptions optimistic"],
      "recommendations": ["Add sensitivity analysis", "Detail customer retention strategy"]
    },
    {
      "expert": "market_strategist",
      "rating": 9.0,
      "strengths": ["Clear differentiation", "Well-defined target market"],
      "concerns": ["Competitive response not addressed"],
      "recommendations": ["Add competitive moat analysis"]
    }
  ],
  "overallScore": 8.7,
  "status": "revisions_recommended"
}
```

---

### Phase 5: Quality Gate & Compliance

**Purpose:** QMS validation and compliance checking

**Auto-triggered after Phase 4 approval**

**Quality Gates:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/qms.runQualityGate" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "phase": 5,
    "checkpoints": [
      "completeness",
      "accuracy",
      "consistency",
      "compliance",
      "best_practices"
    ]
  }'
```

**QMS Validation Results:**
```json
{
  "gateId": "qg_xyz789",
  "status": "passed_with_notes",
  "score": 92,
  "checkpoints": {
    "completeness": {
      "status": "passed",
      "score": 95,
      "notes": "All required sections present"
    },
    "accuracy": {
      "status": "passed",
      "score": 90,
      "notes": "Financial data validated"
    },
    "consistency": {
      "status": "passed",
      "score": 88,
      "notes": "Minor formatting inconsistencies"
    },
    "compliance": {
      "status": "passed",
      "score": 100,
      "notes": "Meets all regulatory requirements"
    },
    "best_practices": {
      "status": "passed",
      "score": 87,
      "notes": "Follows SME Success DNA patterns"
    }
  },
  "recommendations": [
    "Standardize financial table formatting",
    "Add executive summary highlights"
  ],
  "approved": true
}
```

**Due Diligence Checklist (BP-012):**
```bash
# Run due diligence checklist
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.applyBlueprint" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "blueprintId": "BP-012",
    "projectId": "proj_abc123",
    "checklistType": "investor_ready"
  }'
```

---

### Phase 6: Delivery & Packaging

**Purpose:** Final deliverables and stakeholder distribution

**Auto-triggered after Phase 5 approval**

**Generate Deliverables:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.generateDeliverables" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "formats": ["pdf", "pptx", "docx"],
    "includeDocs": [
      "business_plan",
      "financial_model",
      "pitch_deck",
      "executive_summary",
      "market_research",
      "competitive_analysis"
    ]
  }'
```

**Data Room Setup (BP-014):**
```bash
# Create secure data room
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.applyBlueprint" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "blueprintId": "BP-014",
    "projectId": "proj_abc123",
    "securityLevel": "investor_grade",
    "accessControl": {
      "owners": ["user@company.com"],
      "viewers": ["investor@vc.com"],
      "expiry": "90d"
    }
  }'
```

**Send to Stakeholders:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.distributeDeliverables" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "recipients": [
      {"email": "investor@vc.com", "role": "investor", "access": "view"},
      {"email": "advisor@firm.com", "role": "advisor", "access": "comment"}
    ],
    "message": "Please review our business plan for TechStartup Inc"
  }'
```

---

## Workflow Automation

### Autonomous Execution

Once initiated, Project Genesis runs autonomously with periodic check-ins:

```bash
# Enable autonomous mode
curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.setAutonomousMode" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "projectId": "proj_abc123",
    "enabled": true,
    "checkInFrequency": "daily",
    "notifyOn": ["phase_complete", "quality_gate_fail", "expert_feedback"]
  }'
```

### Progress Monitoring

**Get Overall Status:**
```bash
curl "$CEPHO_API_URL/api/trpc/projectGenesis.getStatus?projectId=proj_abc123" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response:**
```json
{
  "projectId": "proj_abc123",
  "companyName": "TechStartup Inc",
  "currentPhase": 3,
  "phaseStatus": "in_progress",
  "progress": 45,
  "timeline": {
    "started": "2026-02-01",
    "estimatedCompletion": "2026-02-28",
    "daysElapsed": 10,
    "daysRemaining": 18
  },
  "phases": [
    {"phase": 1, "status": "completed", "score": 95},
    {"phase": 2, "status": "completed", "score": 92},
    {"phase": 3, "status": "in_progress", "progress": 60},
    {"phase": 4, "status": "pending"},
    {"phase": 5, "status": "pending"},
    {"phase": 6, "status": "pending"}
  ],
  "nextMilestone": "Complete business plan draft"
}
```

---

## Integration with CEPHO Blueprints

Project Genesis leverages CEPHO's blueprint library:

### BP-012: Due Diligence Process
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.execute" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{"blueprintId": "BP-012", "projectId": "proj_abc123"}'
```

### BP-013: Digital Twin Profile
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.execute" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{"blueprintId": "BP-013", "projectId": "proj_abc123"}'
```

### BP-014: Data Room Management
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.execute" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{"blueprintId": "BP-014", "projectId": "proj_abc123"}'
```

### BP-015: Financial Modeling
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.execute" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{"blueprintId": "BP-015", "projectId": "proj_abc123"}'
```

### BP-016: Brand Guidelines
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/blueprints.execute" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{"blueprintId": "BP-016", "projectId": "proj_abc123"}'
```

---

## AI-SME Expert System

### 287 Expert Personas

CEPHO has 287 specialized AI-SME experts across domains:

**Request Specific Expert:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.getExpert" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "expertType": "saas_pricing_strategist",
    "industry": "B2B SaaS",
    "experience": "senior"
  }'
```

**Start Consultation:**
```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.startConsultation" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "expertId": "expert_123",
    "projectId": "proj_abc123",
    "topic": "Pricing strategy for multi-tier SaaS product",
    "context": "B2B analytics platform, 3 pricing tiers, freemium model"
  }'
```

**Get Recommendations:**
```bash
curl "$CEPHO_API_URL/api/trpc/aiSme.getConsultationResults?consultationId=cons_456" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

---

## Examples

### Complete Workflow Example

```bash
# 1. Initiate Project Genesis
PROJECT_ID=$(curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.initiate" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "companyName": "CloudAnalytics Pro",
    "industry": "SaaS - Business Intelligence",
    "stage": "pre-seed",
    "description": "AI-powered analytics platform for SME decision-makers"
  }' | jq -r '.projectId')

echo "Project ID: $PROJECT_ID"

# 2. Enable autonomous mode
curl -X POST "$CEPHO_API_URL/api/trpc/projectGenesis.setAutonomousMode" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d "{\"projectId\": \"$PROJECT_ID\", \"enabled\": true}"

# 3. Monitor progress (run periodically)
curl "$CEPHO_API_URL/api/trpc/projectGenesis.getStatus?projectId=$PROJECT_ID" \
  -H "Authorization: Bearer $CEPHO_API_KEY" | jq

# 4. When Phase 4 starts, check expert feedback
curl "$CEPHO_API_URL/api/trpc/aiSme.getReviewFeedback?projectId=$PROJECT_ID" \
  -H "Authorization: Bearer $CEPHO_API_KEY" | jq

# 5. When Phase 5 completes, get deliverables
curl "$CEPHO_API_URL/api/trpc/projectGenesis.getDeliverables?projectId=$PROJECT_ID" \
  -H "Authorization: Bearer $CEPHO_API_KEY" | jq
```

---

## Conversational Usage

When integrated with OpenClaw, you can manage Project Genesis conversationally:

**Via WhatsApp/Telegram:**
```
You: "Start Project Genesis for CloudAnalytics Pro, a B2B SaaS analytics platform"

CEPHO: "🚀 Initiating Project Genesis for CloudAnalytics Pro...
        
        ✅ Phase 1: Project created (ID: proj_abc123)
        ⏳ Phase 2: Starting deep dive analysis
        
        I'll gather:
        - Market size and trends
        - Competitive landscape
        - Financial requirements
        
        I'll update you when Phase 2 completes (est. 2 hours)"

---

You: "What's the status of CloudAnalytics?"

CEPHO: "📊 CloudAnalytics Pro - Project Genesis Status
        
        Current Phase: 3 (Business Plan Development)
        Progress: 60% complete
        
        ✅ Phase 1: Completed (Score: 95/100)
        ✅ Phase 2: Completed (Score: 92/100)
        ⏳ Phase 3: In Progress (60%)
           - Executive Summary: ✅ Done
           - Market Analysis: ✅ Done
           - Financial Projections: ⏳ In Progress
           - Risk Analysis: ⏳ Pending
        
        Next: Complete financial model (BP-015)
        ETA: 4 hours"

---

You: "Get expert feedback on the financial projections"

CEPHO: "🧠 Requesting AI-SME consultation...
        
        Expert: Senior Financial Analyst
        Topic: SaaS Financial Projections Review
        
        ⏳ Analysis in progress...
        
        [5 minutes later]
        
        💡 Expert Feedback Received:
        
        Strengths:
        ✅ Realistic revenue growth (40% YoY)
        ✅ Strong unit economics (LTV/CAC = 3.2)
        ✅ Conservative churn assumptions
        
        Concerns:
        ⚠️  CAC payback period too long (18 months)
        ⚠️  Operating expenses seem low for year 2
        
        Recommendations:
        1. Add customer acquisition efficiency metrics
        2. Include sensitivity analysis for churn
        3. Detail hiring plan for ops team
        
        Overall Score: 8.5/10
        
        Should I incorporate these recommendations?"
```

---

## Quality Metrics

Project Genesis tracks quality at every phase:

```bash
curl "$CEPHO_API_URL/api/trpc/qms.getProjectMetrics?projectId=proj_abc123" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response:**
```json
{
  "overallScore": 91,
  "phaseScores": [
    {"phase": 1, "score": 95, "status": "excellent"},
    {"phase": 2, "score": 92, "status": "excellent"},
    {"phase": 3, "score": 88, "status": "good"},
    {"phase": 4, "score": 90, "status": "excellent"},
    {"phase": 5, "score": 93, "status": "excellent"}
  ],
  "qualityGates": {
    "passed": 5,
    "failed": 0,
    "warnings": 2
  },
  "expertReviews": {
    "total": 12,
    "averageScore": 8.7,
    "recommendations": 18,
    "implemented": 15
  },
  "blueprintsApplied": ["BP-012", "BP-013", "BP-014", "BP-015", "BP-016"],
  "certification": "investor_ready"
}
```

---

## Notes

- **Autonomous Mode:** Project Genesis can run fully autonomously with periodic check-ins
- **Quality First:** Every phase has quality gates and expert validation
- **Blueprint-Driven:** Leverages CEPHO's blueprint library for best practices
- **AI-SME Integration:** 287 expert personas provide specialized guidance
- **Conversational:** Fully accessible via WhatsApp, Telegram, Slack
- **Secure:** Data room (BP-014) ensures investor-grade security

## Related Skills

- `cepho-due-diligence` (BP-012)
- `cepho-digital-twin` (BP-013)
- `cepho-data-room` (BP-014)
- `cepho-financial-modeling` (BP-015)
- `cepho-brand-guidelines` (BP-016)
- `cepho-ai-sme-consultation`
- `cepho-qms-validation`

---

**Created by:** CEPHO.AI  
**Version:** 1.0  
**Last Updated:** February 11, 2026
