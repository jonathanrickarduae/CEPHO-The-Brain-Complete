---
name: cepho-ai-sme-consultation
description: Access 287 specialized AI-SME experts for consultations, coaching, and collaborative reviews
homepage: https://cepho.ai/ai-sme
metadata:
  openclaw:
    emoji: "🧠"
    requires:
      env: ["CEPHO_API_URL", "CEPHO_API_KEY"]
    primaryEnv: "CEPHO_API_KEY"
---

# CEPHO AI-SME Consultation

Access **287 specialized AI-SME experts** across domains for expert consultations, coaching sessions, and collaborative reviews.

## Overview

AI-SME System provides:
- **287 Expert Personas** - Specialized domain experts
- **Consultation Sessions** - One-on-one expert guidance
- **Coaching Programs** - Long-term mentorship
- **Expert Teams** - Multi-expert collaboration
- **Review Sessions** - Document and plan validation

## Setup

```bash
export CEPHO_API_URL="https://cepho-the-brain-complete.onrender.com"
export CEPHO_API_KEY="your-cepho-api-key"
```

## Find Experts

### Browse Expert Catalog

```bash
curl "$CEPHO_API_URL/api/trpc/aiSme.listExperts?category=financial" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

### Search for Specific Expert

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.searchExperts" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "query": "SaaS pricing strategy",
    "industry": "B2B Software",
    "experience": "senior"
  }'
```

### Get Expert Profile

```bash
curl "$CEPHO_API_URL/api/trpc/aiSme.getExpertProfile?expertId=expert_123" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response:**
```json
{
  "expertId": "expert_123",
  "name": "Dr. Sarah Chen",
  "title": "Senior SaaS Pricing Strategist",
  "expertise": ["Pricing Strategy", "Revenue Optimization", "Value-Based Pricing"],
  "industries": ["B2B SaaS", "Enterprise Software"],
  "experience": "15 years",
  "specializations": [
    "Multi-tier pricing models",
    "Usage-based pricing",
    "Freemium strategies"
  ],
  "rating": 4.8,
  "consultations": 342,
  "availability": "available"
}
```

## Consultations

### Request Consultation

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.requestConsultation" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "expertId": "expert_123",
    "projectId": "proj_abc123",
    "topic": "Pricing strategy for B2B analytics platform",
    "context": "3-tier SaaS model, targeting SMEs, freemium entry",
    "urgency": "normal",
    "duration": "60min"
  }'
```

### Start Consultation Session

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.startConsultation" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "consultationId": "cons_456",
    "initialQuestion": "What pricing tiers would you recommend for our analytics platform?"
  }'
```

### Get Consultation Results

```bash
curl "$CEPHO_API_URL/api/trpc/aiSme.getConsultationResults?consultationId=cons_456" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response:**
```json
{
  "consultationId": "cons_456",
  "expert": "Dr. Sarah Chen",
  "topic": "Pricing Strategy",
  "duration": "60min",
  "recommendations": [
    {
      "title": "Three-Tier Pricing Model",
      "description": "Starter ($49/mo), Professional ($199/mo), Enterprise (Custom)",
      "rationale": "Aligns with SME budgets and provides clear upgrade path",
      "confidence": 0.92
    },
    {
      "title": "Feature Differentiation",
      "description": "Limit data sources in Starter, add advanced analytics in Pro, custom integrations in Enterprise",
      "rationale": "Creates clear value proposition for each tier",
      "confidence": 0.88
    }
  ],
  "actionItems": [
    "Conduct pricing survey with 50 target customers",
    "A/B test pricing page with two models",
    "Build upgrade flow from Starter to Pro"
  ],
  "followUp": "Schedule review in 30 days after pricing test results",
  "transcript": "...",
  "rating": null
}
```

## Coaching Programs

### Start Coaching Program

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.startCoachingProgram" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "expertId": "expert_789",
    "projectId": "proj_abc123",
    "programType": "go_to_market",
    "duration": "12_weeks",
    "frequency": "weekly"
  }'
```

### Schedule Coaching Session

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.scheduleCoachingSession" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "programId": "prog_101",
    "sessionNumber": 3,
    "agenda": ["Review customer acquisition metrics", "Refine messaging"]
  }'
```

## Expert Teams

### Assemble Expert Team

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
    ],
    "purpose": "Business plan comprehensive review"
  }'
```

### Start Team Review Session

```bash
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.startTeamReview" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{
    "teamId": "team_202",
    "documentId": "business_plan_v2",
    "reviewType": "comprehensive",
    "deadline": "2026-02-15"
  }'
```

### Get Team Feedback

```bash
curl "$CEPHO_API_URL/api/trpc/aiSme.getTeamFeedback?reviewId=rev_303" \
  -H "Authorization: Bearer $CEPHO_API_KEY"
```

**Response:**
```json
{
  "reviewId": "rev_303",
  "document": "Business Plan v2",
  "teamSize": 5,
  "reviews": [
    {
      "expert": "Financial Analyst",
      "rating": 8.5,
      "strengths": ["Strong unit economics", "Realistic projections"],
      "concerns": ["High CAC in year 1"],
      "recommendations": ["Add sensitivity analysis"]
    },
    {
      "expert": "Market Strategist",
      "rating": 9.0,
      "strengths": ["Clear differentiation"],
      "concerns": ["Competitive response not addressed"],
      "recommendations": ["Add competitive moat analysis"]
    }
  ],
  "overallScore": 8.7,
  "consensus": "Strong plan with minor improvements needed",
  "status": "revisions_recommended"
}
```

## Conversational Usage

```
You: "I need help with pricing strategy for my SaaS product"

CEPHO: "🧠 I'll connect you with a pricing expert.
        
        Found: Dr. Sarah Chen
        - Senior SaaS Pricing Strategist
        - 15 years experience
        - 342 consultations, 4.8★ rating
        
        Starting consultation...
        
        Dr. Chen: 'Tell me about your product and target market'"

---

You: "Get expert team to review my business plan"

CEPHO: "🧠 Assembling expert team...
        
        Team Members:
        ✅ Financial Analyst
        ✅ Market Strategist  
        ✅ Operations Expert
        ✅ Legal Advisor
        ✅ Tech Architect
        
        Starting comprehensive review...
        ETA: 2 hours
        
        I'll notify you when feedback is ready"

---

[2 hours later]

CEPHO: "💡 Expert team review complete!
        
        Overall Score: 8.7/10
        
        Top Strengths:
        ✅ Strong unit economics
        ✅ Clear market differentiation
        ✅ Realistic financial projections
        
        Key Recommendations:
        1. Add sensitivity analysis (Financial)
        2. Address competitive moat (Market)
        3. Detail ops scaling plan (Operations)
        
        All experts recommend: APPROVE with minor revisions
        
        Should I create improvement tickets?"
```

## Expert Categories

### Available Expert Types

- **Financial:** Analysts, CFOs, Investment Bankers
- **Market:** Strategists, Research Analysts, Growth Experts
- **Operations:** COOs, Process Experts, Supply Chain
- **Technology:** CTOs, Architects, DevOps Engineers
- **Legal:** Corporate Lawyers, IP Attorneys, Compliance
- **Sales:** VPs of Sales, Account Executives, BDRs
- **Marketing:** CMOs, Growth Marketers, Brand Strategists
- **Product:** Product Managers, UX Designers, Product Strategists
- **HR:** CHROs, Talent Acquisition, Culture Experts
- **Customer Success:** CS Leaders, Support Managers

## Database Tables

- `aiSmeExperts` - Expert profiles (287 experts)
- `aiSmeConsultations` - Consultation records
- `aiSmeCoachingPrograms` - Coaching programs
- `aiSmeExpertTeams` - Team configurations
- `aiSmeReviewSessions` - Review sessions
- `aiSmeRecommendations` - Expert recommendations

## Examples

### Complete Consultation Flow

```bash
# 1. Search for expert
EXPERT_ID=$(curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.searchExperts" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d '{"query": "SaaS pricing"}' | jq -r '.experts[0].expertId')

# 2. Request consultation
CONS_ID=$(curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.requestConsultation" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d "{\"expertId\": \"$EXPERT_ID\", \"topic\": \"Pricing strategy\"}" \
  | jq -r '.consultationId')

# 3. Start session
curl -X POST "$CEPHO_API_URL/api/trpc/aiSme.startConsultation" \
  -H "Authorization: Bearer $CEPHO_API_KEY" \
  -d "{\"consultationId\": \"$CONS_ID\"}"

# 4. Get results
curl "$CEPHO_API_URL/api/trpc/aiSme.getConsultationResults?consultationId=$CONS_ID" \
  -H "Authorization: Bearer $CEPHO_API_KEY" | jq
```

---

**Created by:** CEPHO.AI  
**Version:** 1.0
