# CEPHO.AI Grand Master Plan v6.0 — Gap Analysis

## What is currently in the plan (v4.0) that is good:
- Phase 0: CI/CD, branch strategy, env vars, seed data, ADRs ✓
- Phase 1: Security fixes, DB cleanup, API crashes, stub implementations ✓
- Phase 2: pgvector, agent memory, model router, expert prompts, confidence scoring, Settings, mobile, integrations ✓
- Phase 3: Cron jobs, autonomous tasks, anomaly detection, NL commands, webhooks, KPIs/OKRs ✓
- Phase 4: Design system, pagination, Redis, multi-workspace ✓
- Phase 5: Health check, Sentry, rate limiting, audit log, GDPR, onboarding, error boundaries, offline banner ✓
- Phase 6: Agent ratings, competitor intelligence, board reports, scheduled reports, feature flags, public API, status page ✓
- Appendix A: 105 orphaned tables ✓
- Appendix E: 31 env vars ✓
- Appendix F: 20 active tables ✓
- Appendix G: 26 stub procedures ✓
- Appendix H: Full data architecture map (pgvector, Redis, S3, auth, agent memory) ✓
- Appendix I: 10 expert agent prompts ✓

## GAPS IDENTIFIED — What is missing from the plan:

### GAP 1: Agent Performance & Monitoring Dashboard (Phase 6 requirement from project instructions)
The project instructions explicitly state: "There needs to be a place within the website to access these AI agents to monitor their performance and ratings."
Current plan mentions agent ratings in Phase 6 (ENH-01) but does NOT specify:
- A dedicated /ai-agents/performance page
- Real-time agent activity feed
- Per-agent performance metrics (tasks completed, avg confidence, avg rating, uptime)
- Agent health status (active/idle/error)
- Daily activity log per agent
- Improvement request approval workflow (CoS approves/denies agent self-improvement suggestions)
- Agent comparison dashboard

### GAP 2: Digital Twin / Personality Calibration
The codebase has DigitalTwinQuestionnaire.tsx and TrainingStudio.tsx but the plan doesn't specify:
- How the Digital Twin is built from the questionnaire responses
- How it influences agent behaviour and briefing tone
- The training pipeline from questionnaire → user profile → agent prompt injection
- Periodic recalibration (quarterly questionnaire refresh)

### GAP 3: Monetisation Architecture
No monetisation strategy in the plan at all. A world-class platform needs:
- Freemium tier definition (what's free vs paid)
- Stripe subscription tiers (Starter, Professional, Enterprise)
- Usage-based billing for AI tokens
- Metered billing for API calls
- Trial period logic (14-day free trial)
- Upgrade prompts in the UI when limits are hit
- Stripe webhook handling for subscription lifecycle events

### GAP 4: Email Intelligence (not just calendar)
The plan covers Google Calendar but not email:
- Gmail/Outlook integration for email triage
- AI email summarisation (surface important emails in briefing)
- AI email drafting (Victoria says "reply to John about the Q2 meeting" → agent drafts)
- Email thread summarisation
- Smart follow-up reminders (agent notices an email was not replied to in 48h)

### GAP 5: Meeting Intelligence
No meeting intelligence in the plan:
- Pre-meeting briefs (auto-generated 5-min before a meeting: who is attending, context, suggested talking points)
- Post-meeting action item extraction (paste meeting transcript → agent extracts action items → creates tasks)
- Meeting note templates
- Zoom/Teams integration for automatic meeting notes

### GAP 6: AI Agent Continuous Learning Architecture
The plan mentions agent improvements but doesn't specify the full learning loop:
- How agents research their field daily (what sources, what APIs)
- How improvement suggestions are structured (what format, what fields)
- The approval workflow (CoS reviews → Victoria approves/denies)
- How approved improvements are applied to the agent's system prompt
- Version history of agent prompts (so Victoria can roll back)
- A/B testing of agent prompt variants

### GAP 7: Data Ingestion Pipeline
No specification for how Victoria's existing data gets into the system:
- Document upload (PDF, Word, Excel → text extraction → embedding → knowledge base)
- URL ingestion (paste a URL → agent scrapes → embeds → knowledge base)
- CSV data import (financial data, project data)
- Integration data sync (Notion pages → knowledge base, Trello cards → tasks)

### GAP 8: Notification & Communication Architecture
The plan has a notifications table but doesn't specify:
- Push notifications (PWA service worker for mobile push)
- Email notifications (Resend/SendGrid for daily briefing email digest)
- Slack notifications (briefing summary to Slack)
- In-app notification preferences (what triggers a notification, what doesn't)
- Notification batching (don't send 50 notifications, send 1 digest)

### GAP 9: Search Architecture
No global search in the plan:
- Full-text search across all content (tasks, projects, documents, briefings, ideas)
- Semantic search using pgvector (ask a question, find relevant content)
- Search result ranking
- Search history
- The search bar in BrainLayout.tsx exists but is not wired to anything

### GAP 10: White-Label / Multi-Tenant Architecture
For enterprise sales, the plan needs:
- Custom domain support (client.cepho.ai or cepho.clientdomain.com)
- Custom branding per workspace (logo, colours, name)
- Admin panel for managing enterprise clients
- Usage reporting per client
- Enterprise SSO (SAML/OIDC)

### GAP 11: Testing Strategy
The plan mentions pnpm test in CI/CD but never specifies:
- What tests need to be written
- Unit tests for all tRPC procedures
- Integration tests for the auth flow
- E2E tests for critical user journeys (login → briefing → export)
- Test coverage targets (minimum 70%)
- Mock strategy for external APIs (OpenAI, Stripe, etc.)

### GAP 12: AI Cost Management & Observability
No AI cost tracking in the plan:
- Per-user AI token usage tracking
- Cost per briefing, cost per agent task
- Monthly AI cost dashboard
- Cost alerts (notify when monthly AI spend exceeds threshold)
- Token budget per user tier (Starter: 100k tokens/month, Pro: 1M tokens/month)
- Model fallback (if GPT-4o is unavailable, fall back to GPT-4o-mini)

### GAP 13: Disaster Recovery & Business Continuity
No DR/BC plan:
- Database backup schedule (Supabase daily backups + point-in-time recovery)
- S3 versioning for file recovery
- RTO/RPO targets
- Incident response runbook
- On-call rotation (even if it's just one person)

### GAP 14: Accessibility (WCAG 2.1 AA)
The plan has an AccessibilitySettingsPanel component but no specification:
- WCAG 2.1 AA compliance requirements
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels)
- Colour contrast requirements
- Focus management
- Reduced motion support

### GAP 15: Internationalisation (i18n)
The plan has a language setting but no i18n architecture:
- i18next setup
- Translation file structure
- Which languages to support (English, Arabic, French, Spanish as minimum)
- RTL support for Arabic
- Date/time/currency formatting per locale

### GAP 16: Performance Budgets & Core Web Vitals
No performance targets in the plan:
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle size budget (< 500KB initial JS)
- Code splitting strategy (lazy load all pages)
- Image optimisation
- API response time targets (p50 < 200ms, p99 < 1000ms)

### GAP 17: Victoria's Briefing — Personalisation Engine
The briefing is generated from data but not personalised to Victoria's preferences:
- Briefing length preference (executive summary vs detailed)
- Sections to include/exclude (Victoria might not want competitor intelligence every day)
- Tone preference (formal vs conversational)
- Priority weighting (Victoria might weight financial metrics higher than project updates)
- Feedback loop (Victoria rates each briefing section → influences next briefing)

### GAP 18: Offline / PWA Capability
The plan has an offline banner but no PWA specification:
- Service worker for offline caching
- App manifest for "Add to Home Screen"
- Background sync for offline actions
- Push notification support via service worker

### GAP 19: Security Penetration Testing Plan
No security testing specification:
- OWASP Top 10 checklist
- Dependency vulnerability scanning (Snyk or similar)
- Penetration testing schedule (before each major release)
- Security headers audit (CSP, HSTS, X-Frame-Options)
- Secrets scanning in CI/CD (prevent accidental key commits)

### GAP 20: Agent Orchestration for Complex Multi-Step Tasks
The plan has individual agents but no orchestration for complex tasks:
- How the Chief of Staff agent delegates to specialist agents
- How results from multiple agents are synthesised
- Parallel agent execution (run Financial Analyst + Risk Analyst simultaneously)
- Agent handoffs (Legal Advisor flags something → Chief of Staff creates a task)
- Timeout and retry logic for agent tasks
