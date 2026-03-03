# CEPHO.AI — Page-by-Page Process Inventory

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Author:** Manus AI

## 1. Introduction

This document provides a comprehensive, page-by-page inventory of all processes, features, and workflows within the CEPHO.AI application. It is compiled from an audit of the live codebase, tRPC routers, and all available specification documents. Each entry details the user-facing features and the corresponding backend processes that power them.

---

## 2. Core Application Pages

### 2.1. Nexus Dashboard (`/`)

**Page Purpose:** The central landing page after login, providing a high-level overview of the user's digital twin, key insights, and operational status.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Core Insights** | `dashboard.getInsights` |
| **Get CEPHO Score** | `cephoScore.get` |
| **List Recent Tasks** | `tasks.list` |
| **List Active Projects** | `projects.list` |
| **Get Innovation Flywheel Stats** | `innovation.getFlywheelStats` |

### 2.2. Daily Brief (`/daily-brief`)

**Page Purpose:** Presents Victoria's personalized daily briefing, including summaries, calendar, and key action items.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Daily Briefing Content** | `victoriaBriefing.getDailyBriefing` |
| **Generate Audio Version of Briefing** | `victoriaBriefing.generateAudio` |
| **Generate PDF Version of Briefing** | `victoriaBriefing.generatePdf` |
| **Generate Video Version of Briefing** | `victoriaBriefing.generateVideo` |
| **Check Video Generation Status** | `victoriaBriefing.getVideoStatus` |

### 2.3. Evening Review (`/evening-review`)

**Page Purpose:** A tool for end-of-day reflection, mood tracking, and planning for the next day.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Log Daily Mood & Reflections** | `mood.create` |
| **View Mood History** | `mood.history` |
| **View Mood Trends** | `mood.trends` |

### 2.4. Settings (`/settings`)

**Page Purpose:** User profile management, API key generation, security settings, and data export.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get User Profile** | `auth.me` |
| **Update User Profile** | `auth.updateProfile` |
| **Get User Settings** | `settings.get` |
| **Update User Settings** | `settings.update` |
| **List API Keys** | `apiKeys.listKeys` |
| **Create API Key** | `apiKeys.createKey` |
| **Revoke API Key** | `apiKeys.revokeKey` |
| **Export GDPR Data** | `gdpr.exportMyData` |
| **View Subscription Summary** | `subscriptionTracker.getSummary` |
| **View Renewal Summary** | `subscriptionTracker.getRenewalSummary` |
| **List Integrations** | `integrations.list` |
| **View My Audit Log** | `auditLog.getMyLogs` |

---

## 3. Project & Task Management

### 3.1. Project Genesis (`/project-genesis`)

**Page Purpose:** A structured, multi-phase process for taking a validated idea from concept to market launch.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All Genesis Projects** | `projectGenesis.listProjects` |
| **Get Specific Project Details** | `projectGenesis.getProject` |
| **Initiate a New Project** | `projectGenesis.initiate` |
| **Update Project Phase** | `projectGenesis.updatePhase` |
| **Delete a Project** | `projectGenesis.deleteProject` |
| **Generate Presentation Slides** | `projectGenesis.generatePresentationSlides` |

### 3.2. Project Genesis Wizard (`/project-genesis/:id/wizard`)

**Page Purpose:** A step-by-step wizard guiding the user through the active phase of a Project Genesis project.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Workflow Details** | `workflows.get` |
| **Update Workflow Step** | `workflows.updateStep` |
| **Update Workflow Progress** | `workflows.updateProgress` |
| **Complete Workflow Step** | `workflows.completeStep` |
| **Generate Step Deliverable** | `workflows.generateDeliverable` |

### 3.3. Workflows (`/workflows`)

**Page Purpose:** A list of all autonomous workflows, their statuses, and entry points to view details.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All Workflows** | `workflows.list` |

### 3.4. Workflow Detail (`/workflows/:id`)

**Page Purpose:** Detailed view of a single workflow, including its steps, status, and controls.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Workflow Details** | `workflows.get` |
| **Get Guidance for a Step** | `workflows.getStepGuidance` |
| **Start a Workflow** | `workflows.start` |
| **Pause a Workflow** | `workflows.pause` |
| **Resume a Workflow** | `workflows.resume` |

### 3.5. KPI & OKR Dashboard (`/kpis-okrs`)

**Page Purpose:** Track Key Performance Indicators (KPIs) and Objectives and Key Results (OKRs), with AI-powered suggestions.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List KPIs** | `kpiOkr.kpi.list` |
| **Create KPI** | `kpiOkr.kpi.create` |
| **Update KPI** | `kpiOkr.kpi.update` |
| **Delete KPI** | `kpiOkr.kpi.delete` |
| **Suggest KPIs from Context** | `kpiOkr.kpi.suggestFromContext` |
| **List OKRs** | `kpiOkr.okr.list` |
| **Create OKR** | `kpiOkr.okr.create` |
| **Update Key Result** | `kpiOkr.okr.updateKeyResult` |
| **Delete OKR** | `kpiOkr.okr.delete` |
| **Suggest OKRs for Quarter** | `kpiOkr.okr.suggestForQuarter` |

---

## 4. AI Agents & Experts

### 4.1. AI Agents (`/agents`)

**Page Purpose:** A directory of all available AI agents, their roles, and their current status.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All Agents** | `aiAgents.list` |
| **Get Agent Details** | `aiAgents.get` |

### 4.2. AI Agent Monitoring (`/agents/monitoring`)

**Page Purpose:** A real-time dashboard to monitor the health, performance, and activity of all AI agents.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get All Agent Statuses** | `aiAgentsMonitoring.getAllStatus` |
| **Get Agent Logs** | `aiAgentsMonitoring.getAgentLogs` |
| **Get Agent Metrics** | `aiAgentsMonitoring.getAgentMetrics` |

### 4.3. AI SMEs (`/ai-smes`)

**Page Purpose:** A directory of specialized AI Subject Matter Experts (SMEs) available for consultation.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All SMEs** | `aiSMEs.list` |
| **Get SME Details** | `aiSMEs.get` |

### 4.4. Expert Chat (`/expert-chat/:id`)

**Page Purpose:** A chat interface for direct interaction and consultation with a selected AI SME.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Start Chat Session** | `expertChat.startSession` |
| **Send Message** | `expertChat.sendMessage` |
| **Get Chat History** | `expertChat.getHistory` |

### 4.5. Persephone Board (`/persephone`)

**Page Purpose:** A virtual board of AI leaders providing strategic oversight and governance for the platform.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Start Board Session** | `expertChat.startSession` (re-used for board) |
| **Send Message to Board** | `expertChat.sendMessage` (re-used for board) |
| **Execute Board Goal** | `autonomousExecution.execute` |
| **View Recent Executions** | `autonomousExecution.getRecentExecutions` |

---

## 5. Intelligence & Automation

### 5.1. Email Intelligence (`/email-intelligence`)

**Page Purpose:** Triage, summarize, and draft emails using AI, integrated with Gmail and Outlook.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List Prioritized Emails** | `emailIntelligence.list` |
| **Get Email Thread Details** | `emailIntelligence.getThread` |
| **Generate Email Summary** | `emailIntelligence.summarize` |
| **Draft AI Email Reply** | `emailIntelligence.draftReply` |
| **Send Email** | `emailIntelligence.send` |

### 5.2. Meeting Intelligence (`/meeting-intelligence`)

**Page Purpose:** Generate pre-meeting briefs and extract action items from post-meeting transcripts.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All Meetings/Notes** | `meetingIntelligence.list` |
| **Generate Pre-Meeting Brief** | `meetingIntelligence.generatePreBrief` |
| **Process Meeting Transcript** | `meetingIntelligence.processTranscript` |
| **Delete Meeting Note** | `meetingIntelligence.delete` |
| **Regenerate Meeting Summary** | `meetingIntelligence.regenerateSummary` |

### 5.3. Innovation Hub (`/innovation-hub`)

**Page Purpose:** A flywheel for capturing, assessing, and refining new ideas before they become full projects.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Capture New Idea** | `innovation.captureIdea` |
| **Analyze Article for Ideas** | `innovation.analyzeArticle` |
| **Generate Daily Ideas** | `innovation.generateDailyIdeas` |
| **Get Idea with Assessments** | `innovation.getIdeaWithAssessments` |
| **Run Strategic Assessment** | `innovation.runAssessment` |
| **Promote Idea to Project Genesis** | `innovation.promoteToGenesis` |

### 5.4. Integration Hub (`/integration-hub`)

**Page Purpose:** A central place to connect and manage all third-party service integrations.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Register a New Integration** | `realWorldIntegration.register` |
| **List All Integrations** | `realWorldIntegration.list` |
| **Get Integration Details** | `realWorldIntegration.getById` |
| **Update Integration Status** | `realWorldIntegration.updateStatus` |
| **Remove an Integration** | `realWorldIntegration.remove` |
| **List Supported Providers** | `realWorldIntegration.listProviders` |

---

## 6. Data & Knowledge Management

### 6.1. Document Library (`/document-library`)

**Page Purpose:** A repository for all documents, reports, and files managed within the system.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All Documents** | `documentLibrary.list` |
| **Get Document Details** | `documentLibrary.get` |
| **Upload Document** | `documentLibrary.upload` |
| **Delete Document** | `documentLibrary.delete` |
| **Search Documents** | `documentLibrary.search` |

### 6.2. Knowledge Base (`/knowledge-base`)

**Page Purpose:** A searchable knowledge base created from uploaded documents and scraped URLs.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Ingest Document into KB** | `dataIngestion.ingestDocument` |
| **Ingest URL into KB** | `dataIngestion.ingestUrl` |
| **Search Knowledge Base** | `agentMemory.search` |
| **Ask Question to Knowledge Base** | `agentMemory.ask` |


---

## 7. Operations & Strategy

### 7.1. Operations (`/operations`)

**Page Purpose:** A hub for operational management including NPS surveys, partnership pipeline, and team capability tracking.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Submit NPS Survey** | `nps.submit` |
| **View NPS Stats Dashboard** | `nps.getStats` |
| **List Partnership Pipeline** | `partnerships.list` |
| **Create Partnership** | `partnerships.create` |
| **Update Partnership** | `partnerships.update` |
| **Delete Partnership** | `partnerships.delete` |
| **Get Partnership Summary** | `partnerships.getSummary` |
| **View Team Capability Matrix** | `teamCapability.list` |

### 7.2. Chief of Staff (`/chief-of-staff`)

**Page Purpose:** The primary command interface for Victoria to interact with her AI Chief of Staff, manage tasks, and review strategic priorities.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Send Command to Chief of Staff** | `chiefOfStaff.command` |
| **Get Chief of Staff Recommendations** | `chiefOfStaff.getRecommendations` |
| **Get Chief of Staff Summary** | `chiefOfStaff.getSummary` |

### 7.3. War Room (`/war-room`)

**Page Purpose:** A high-stakes command centre for executing complex, multi-step autonomous tasks with real-time oversight.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Execute Autonomous Task** | `autonomousExecution.execute` |
| **Get Recent Executions** | `autonomousExecution.getRecentExecutions` |

### 7.4. Statistics (`/statistics`)

**Page Purpose:** A high-level analytics dashboard showing platform usage, agent performance, and business metrics.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Core Insights** | `dashboard.getInsights` |
| **Get All Agent Statuses** | `aiAgentsMonitoring.getAllStatus` |

---

## 8. Training & Development

### 8.1. COS Training (`/cos-training`)

**Page Purpose:** A training module for the AI Chief of Staff, allowing Victoria to calibrate its behaviour and priorities.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Training Modules** | `cosTraining.getModules` |
| **Submit Training Response** | `cosTraining.submitResponse` |
| **Get Training Progress** | `cosTraining.getProgress` |

### 8.2. Development Pathway (`/development-pathway`)

**Page Purpose:** A structured learning and development pathway for the user, powered by AI recommendations.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Development Recommendations** | `expertEvolution.getRecommendations` |
| **Update Development Progress** | `expertEvolution.updateProgress` |

---

## 9. Briefing & Preferences

### 9.1. Briefing Preferences (`/briefing-preferences`)

**Page Purpose:** Allows Victoria to personalise the format, length, tone, and sections of her daily briefing.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Get Briefing Preferences** | `briefingPersonalisation.getPreferences` |
| **Update Briefing Preferences** | `briefingPersonalisation.updatePreferences` |
| **Submit Briefing Feedback** | `briefingPersonalisation.submitFeedback` |
| **Get Feedback History** | `briefingPersonalisation.getFeedbackHistory` |
| **Get Personalisation Analytics** | `briefingPersonalisation.getAnalytics` |
| **Reset to Defaults** | `briefingPersonalisation.resetToDefaults` |

---

## 10. Onboarding & Authentication

### 10.1. Login (`/login`)

**Page Purpose:** User authentication page.

| Feature / Process | Endpoint |
|---|---|
| **Get CSRF Token** | `GET /api/csrf-token` |
| **Login with Email/Password** | `POST /api/auth/login` |
| **Google OAuth Login** | `GET /api/auth/google` |

### 10.2. Onboarding (`/onboarding`)

**Page Purpose:** A guided setup flow for new users to configure their digital twin and preferences.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Recalibrate Digital Twin** | `digitalTwin.recalibrate` |
| **Complete Onboarding / Update Profile** | `auth.updateProfile` |

---

## 11. Admin

### 11.1. Admin Dashboard (`/admin`)

**Page Purpose:** A restricted dashboard for platform administrators to manage users, view system health, and configure the platform.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **List All Users** | `admin.listUsers` |
| **Update User Role** | `admin.updateUserRole` |
| **Delete User** | `admin.deleteUser` |
| **View System Stats** | `admin.getSystemStats` |
| **View All Audit Logs** | `admin.getAuditLogs` |

---

## 12. Phase 3 Autonomous Operations

### 12.1. Human Approval Gates (embedded across all autonomous features)

**Purpose:** Mandatory checkpoints that pause autonomous agent actions before irreversible operations, requiring explicit human approval.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Create Approval Request** | `humanApprovalGates.createRequest` |
| **Approve a Request** | `humanApprovalGates.approve` |
| **Reject a Request** | `humanApprovalGates.reject` |
| **List Pending Approvals** | `humanApprovalGates.listPending` |
| **Get Approval History** | `humanApprovalGates.getHistory` |

### 12.2. Market Launch Automation (linked from Project Genesis)

**Purpose:** A staged, AI-orchestrated go-to-market execution engine with approval gates at each launch stage.

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Create Launch Campaign** | `marketLaunchAutomation.createCampaign` |
| **List All Campaigns** | `marketLaunchAutomation.listCampaigns` |
| **Get Campaign Details** | `marketLaunchAutomation.getCampaign` |
| **Advance Campaign Stage** | `marketLaunchAutomation.advanceStage` |
| **Update Campaign Status** | `marketLaunchAutomation.updateStatus` |

### 12.3. Real-World Integration Layer (linked from Integration Hub)

**Purpose:** Adapters enabling autonomous agents to take actions in real third-party services (Stripe, AWS, Google Ads, Mailchimp, Twilio, Zapier, etc.).

| Feature / Process | Backend tRPC Procedure(s) |
|---|---|
| **Register Integration** | `realWorldIntegration.register` |
| **List All Integrations** | `realWorldIntegration.list` |
| **Get Integration Details** | `realWorldIntegration.getById` |
| **Update Integration Status** | `realWorldIntegration.updateStatus` |
| **Remove Integration** | `realWorldIntegration.remove` |
| **List Supported Providers** | `realWorldIntegration.listProviders` |

---

## 13. Planned Pages (Not Yet Built)

The following pages and processes are specified in the roadmap but have not yet been implemented. They are listed here to ensure they are tracked and built.

| Page | Route | Priority | Key Processes to Build |
|---|---|---|---|
| **Email Accounts** | `/accounts` | High | Connect email accounts, OAuth sync, show sync status |
| **Vault** | `/vault` | Medium | Secure document storage, encryption at rest, access control |
| **AI Experts Directory** | `/ai-experts` | Medium | Full expert profiles, availability, booking |
| **Agent Detail** | `/agents/:id` | Medium | Individual agent performance, logs, configuration |
| **Notifications Centre** | `/notifications` | Medium | `notifications.list`, `notifications.markRead`, `notifications.markAllRead` |
| **Voice Notes** | `/voice-notes` | Medium | `voiceNotes.list`, `voiceNotes.create`, `voiceNotes.convertToTask` |
| **Subscription Tracker** | `/subscriptions` | Low | `subscriptionTracker.getAll`, `subscriptionTracker.getCostHistory` |
| **Two-Factor Auth Setup** | `/settings/2fa` | High | `twoFactor.setup`, `twoFactor.verify`, `twoFactor.disable` |
| **Brand Kit** | `/brand-kit` | Low | `brandKit.get`, `brandKit.update`, `brandKit.generateAssets` |
| **Analytics Deep Dive** | `/analytics` | Low | `analytics.getReport`, `analytics.getMetrics`, `analytics.export` |

---

## 14. Cross-Cutting Processes (All Pages)

These processes run across every page and are not tied to a single route.

| Process | Description | Status |
|---|---|---|
| **CSRF Protection** | All state-mutating requests include a CSRF token | Done |
| **Rate Limiting** | All API endpoints are rate-limited | Done |
| **Audit Logging** | All user actions are written to the audit log | Done |
| **Error Boundaries** | All pages wrapped in React Error Boundary | Done |
| **JWT Authentication** | All protected routes require a valid JWT | Done |
| **Natural Language Command Bar** | Global `Cmd+K` command bar for any action | Done |
| **Notifications** | Real-time notification bell on all pages | Done |
| **Offline Banner** | Banner shown when server is unreachable | Planned |
| **Structured Logging (Pino)** | Replace all `console.log` with structured logger | Planned |
| **Sentry Error Monitoring** | Capture and report all runtime errors | Planned |

---

*This document is a living reference. It should be updated whenever a new page is added or a new process is implemented.*
