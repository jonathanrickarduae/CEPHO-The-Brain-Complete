# CEPHO Workflow Engine Architecture

## Overview

The CEPHO Workflow Engine is a state machine-based system that manages multi-step processes across all 7 skills. It provides state persistence, validation, progress tracking, and deliverable generation.

## Core Components

### 1. Workflow State Machine

**States:**
- `not_started` - Workflow created but not begun
- `in_progress` - Workflow actively being executed
- `paused` - Workflow temporarily suspended
- `completed` - Workflow successfully finished
- `failed` - Workflow encountered unrecoverable error

**Transitions:**
```
not_started → in_progress (start)
in_progress → paused (pause)
paused → in_progress (resume)
in_progress → completed (complete)
in_progress → failed (error)
failed → in_progress (retry)
```

### 2. Database Schema

**workflows table:**
```typescript
{
  id: string (UUID)
  userId: number
  skillType: enum('project_genesis', 'ai_sme', 'quality_gates', 'due_diligence', 'financial_modeling', 'data_room', 'digital_twin')
  name: string
  currentPhase: number
  currentStep: number
  status: enum('not_started', 'in_progress', 'paused', 'completed', 'failed')
  data: jsonb (workflow-specific data)
  metadata: jsonb (timestamps, user info, etc.)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**workflowSteps table:**
```typescript
{
  id: string (UUID)
  workflowId: string (FK)
  stepNumber: number
  stepName: string
  status: enum('pending', 'in_progress', 'completed', 'skipped', 'failed')
  data: jsonb (step-specific data)
  validationResult: jsonb (validation outcomes)
  completedAt: timestamp
  createdAt: timestamp
}
```

**workflowValidations table:**
```typescript
{
  id: string (UUID)
  workflowId: string (FK)
  stepId: string (FK)
  validationType: string
  result: enum('pass', 'fail', 'warning')
  message: string
  data: jsonb
  createdAt: timestamp
}
```

### 3. Workflow Engine Service

**Location:** `server/services/workflow-engine.ts`

**Core Methods:**
- `createWorkflow(userId, skillType, config)` - Initialize new workflow
- `startWorkflow(workflowId)` - Begin workflow execution
- `getWorkflow(workflowId)` - Retrieve workflow state
- `updateWorkflowData(workflowId, data)` - Update workflow data
- `advanceWorkflow(workflowId)` - Move to next step
- `completeStep(workflowId, stepId, data)` - Mark step complete
- `validateStep(workflowId, stepId)` - Run step validations
- `pauseWorkflow(workflowId)` - Pause execution
- `resumeWorkflow(workflowId)` - Resume execution
- `failWorkflow(workflowId, error)` - Mark workflow as failed
- `completeWorkflow(workflowId)` - Mark workflow complete
- `generateDeliverable(workflowId, stepId)` - Create deliverable

### 4. Skill-Specific Workflow Services

Each skill has its own workflow service that extends the base engine:

- `server/workflows/project-genesis-workflow.ts`
- `server/workflows/ai-sme-workflow.ts`
- `server/workflows/quality-gates-workflow.ts`
- `server/workflows/due-diligence-workflow.ts`
- `server/workflows/financial-modeling-workflow.ts`
- `server/workflows/data-room-workflow.ts`
- `server/workflows/digital-twin-workflow.ts`

### 5. Workflow UI Components

**Location:** `src/components/workflows/`

- `WorkflowProgress.tsx` - Visual progress indicator
- `WorkflowStepper.tsx` - Step-by-step navigation
- `WorkflowValidation.tsx` - Validation results display
- `WorkflowDeliverables.tsx` - Generated deliverables list

## Workflow Definitions

### 1. Project Genesis (6 Phases)

**Phases:**
1. Discovery (Market research, competitor analysis)
2. Definition (Business model, value proposition)
3. Design (Product design, prototyping)
4. Development (MVP development, testing)
5. Deployment (Go-to-market strategy)
6. Delivery (Launch and scale)

**Steps per Phase:** 4-6 steps
**Total Steps:** ~30 steps
**Estimated Duration:** 4-12 weeks

### 2. AI-SME Consultation (4 Steps)

**Steps:**
1. Expert Selection (choose from 310 experts)
2. Panel Assembly (multi-expert selection)
3. Consultation Session (Q&A with experts)
4. Deliverable Generation (consultation report)

**Total Steps:** 4 steps
**Estimated Duration:** 1-3 days

### 3. Quality Gates (4 Steps)

**Steps:**
1. Gate Definition (define criteria)
2. Validation Execution (run checks)
3. Compliance Review (review results)
4. Audit Trail (generate audit report)

**Total Steps:** 4 steps
**Estimated Duration:** 1-2 days

### 4. Due Diligence (4 Steps)

**Steps:**
1. DD Checklist (select template)
2. Document Collection (upload documents)
3. Analysis & Findings (AI analysis)
4. DD Report (comprehensive report)

**Total Steps:** 4 steps
**Estimated Duration:** 1-4 weeks

### 5. Financial Modeling (4 Steps)

**Steps:**
1. Model Selection (choose model type)
2. Data Input (enter financial data)
3. Model Generation (generate statements)
4. Visualization & Export (charts and export)

**Total Steps:** 4 steps
**Estimated Duration:** 1-3 days

### 6. Data Room (4 Steps)

**Steps:**
1. Room Creation (setup data room)
2. Document Upload (upload documents)
3. Access Management (configure permissions)
4. Activity Tracking (monitor access)

**Total Steps:** 4 steps
**Estimated Duration:** 1-2 days

### 7. Digital Twin (Continuous)

**Daily Workflow:**
1. Morning Briefing (daily summary)
2. Task Prioritization (organize tasks)
3. Progress Tracking (monitor progress)
4. Evening Review (end-of-day summary)

**Total Steps:** 4 steps per day
**Estimated Duration:** Continuous

## Implementation Plan

### Phase 1: Core Engine (8-10 hours)
- Create workflow engine service
- Implement state machine
- Add database persistence
- Create workflow CRUD operations

### Phase 2: Project Genesis (12-15 hours)
- Define 6 phases with steps
- Implement phase transitions
- Add validation logic
- Create deliverable generators

### Phase 3: AI-SME & Quality Gates (10-12 hours)
- Implement AI-SME workflow
- Implement Quality Gates workflow
- Add expert selection logic
- Add validation checks

### Phase 4: Due Diligence & Financial Modeling (10-12 hours)
- Implement DD workflow
- Implement Financial Modeling workflow
- Add document processing
- Add financial calculations

### Phase 5: Data Room & Digital Twin (10-12 hours)
- Implement Data Room workflow
- Implement Digital Twin workflow
- Add access control
- Add daily briefing logic

### Phase 6: Testing & Deployment (10-12 hours)
- End-to-end workflow testing
- Integration testing
- Performance testing
- Production deployment

**Total Estimated Effort:** 60-73 hours

## API Endpoints

### Workflow Management
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/start` - Start workflow
- `POST /api/workflows/:id/pause` - Pause workflow
- `POST /api/workflows/:id/resume` - Resume workflow
- `POST /api/workflows/:id/complete` - Complete workflow

### Step Management
- `GET /api/workflows/:id/steps` - Get all steps
- `GET /api/workflows/:id/steps/:stepId` - Get step
- `POST /api/workflows/:id/steps/:stepId/complete` - Complete step
- `POST /api/workflows/:id/steps/:stepId/validate` - Validate step

### Deliverables
- `GET /api/workflows/:id/deliverables` - Get deliverables
- `POST /api/workflows/:id/deliverables` - Generate deliverable
- `GET /api/workflows/:id/deliverables/:deliverableId` - Download deliverable

## Success Metrics

- Workflow completion rate > 80%
- Average time per workflow < expected duration
- Step validation pass rate > 90%
- User satisfaction score > 4.5/5
- Error rate < 5%
- Deliverable generation success rate > 95%

## Next Steps

1. Implement core workflow engine
2. Create database migrations for workflow tables
3. Implement Project Genesis workflow (highest priority)
4. Add workflow UI components
5. Test end-to-end workflow execution
6. Deploy and monitor
