# Component Refactoring Execution Plan

**Priority 2 - CODE-02: Component Refactoring**

This document outlines the execution plan for refactoring large components into smaller, more maintainable pieces.

---

## Overview

**Total Components to Refactor:** 20  
**Total Lines of Code:** ~18,000 lines  
**Estimated Time:** 36 hours (Phase 1-3)

---

## Refactoring Strategy

### Principles

1. **Extract Sub-Components** - Break down large components into smaller, focused components
2. **Custom Hooks** - Extract complex logic into reusable hooks
3. **Utility Functions** - Move helper functions to utility files
4. **Type Definitions** - Create separate type files for complex types
5. **Consistent Patterns** - Follow established patterns across all components

### Benefits

- Improved readability and maintainability
- Better testability (smaller units)
- Enhanced reusability
- Easier debugging
- Better performance (React.memo opportunities)

---

## Phase 1: Critical Components (8 hours)

### 1.1 BusinessPlanReview.tsx (1942 lines)

**Current Issues:**
- Single file with 1942 lines
- Multiple responsibilities mixed together
- Difficult to test and maintain

**Refactoring Plan:**

```
components/business-plan/
├── BusinessPlanReview.tsx (main, ~300 lines)
├── sections/
│   ├── Header.tsx (~150 lines)
│   ├── ExecutiveSummary.tsx (~200 lines)
│   ├── MarketAnalysis.tsx (~250 lines)
│   ├── FinancialProjections.tsx (~300 lines)
│   ├── OperationalPlan.tsx (~200 lines)
│   └── RiskAssessment.tsx (~150 lines)
├── components/
│   ├── SectionCard.tsx (~100 lines)
│   ├── EditableField.tsx (~80 lines)
│   ├── CommentThread.tsx (~120 lines)
│   └── ApprovalStatus.tsx (~80 lines)
├── hooks/
│   ├── useBusinessPlan.ts (~150 lines)
│   ├── useComments.ts (~100 lines)
│   └── useApproval.ts (~80 lines)
└── types.ts (~100 lines)
```

**Estimated Time:** 3 hours

### 1.2 AIExperts.tsx (1500 lines)

**Current Issues:**
- Large page component
- Chat logic mixed with UI
- Expert selection logic embedded

**Refactoring Plan:**

```
pages/
└── AIExperts.tsx (main, ~200 lines)

components/ai-experts/
├── ExpertGrid.tsx (~150 lines)
├── ExpertCard.tsx (~100 lines)
├── ExpertChat.tsx (~300 lines)
├── ExpertProfile.tsx (~200 lines)
├── ChatMessage.tsx (~80 lines)
├── ChatInput.tsx (~100 lines)
└── ExpertSelector.tsx (~150 lines)

hooks/
├── useExperts.ts (~120 lines)
├── useExpertChat.ts (~150 lines)
└── useExpertSelection.ts (~80 lines)

types/
└── expert.types.ts (~100 lines)
```

**Estimated Time:** 2.5 hours

### 1.3 ProjectGenesis.tsx (1079 lines)

**Current Issues:**
- Complex wizard logic
- Multiple steps in one file
- Form validation mixed with UI

**Refactoring Plan:**

```
components/project-management/
├── ProjectGenesis.tsx (main, ~200 lines)
├── steps/
│   ├── ProjectDetails.tsx (~150 lines)
│   ├── TeamSetup.tsx (~150 lines)
│   ├── Timeline.tsx (~150 lines)
│   ├── Budget.tsx (~150 lines)
│   └── Review.tsx (~150 lines)
├── components/
│   ├── StepIndicator.tsx (~80 lines)
│   ├── NavigationButtons.tsx (~60 lines)
│   └── ProgressBar.tsx (~50 lines)
└── hooks/
    ├── useProjectWizard.ts (~150 lines)
    └── useFormValidation.ts (~100 lines)
```

**Estimated Time:** 2.5 hours

---

## Phase 2: High-Priority Components (12 hours)

### 2.1 ComponentShowcase.tsx (1437 lines)

**Action:** This is a demo/showcase file. Consider moving to `/examples` or deleting if not needed.

**Estimated Time:** 0.5 hours (review and decide)

### 2.2 AISMEsPage.tsx (1241 lines)

**Refactoring Plan:**

```
pages/
└── AISMEsPage.tsx (main, ~200 lines)

components/ai-smes/
├── SMEGrid.tsx (~150 lines)
├── SMECard.tsx (~120 lines)
├── SMEDetail.tsx (~250 lines)
├── SMEChat.tsx (~200 lines)
├── SMERecommendations.tsx (~150 lines)
└── SMEMetrics.tsx (~120 lines)

hooks/
├── useSMEs.ts (~120 lines)
└── useSMEInteraction.ts (~100 lines)
```

**Estimated Time:** 2 hours

### 2.3 DocumentLibrary.tsx (981 lines)

**Refactoring Plan:**

```
pages/
└── DocumentLibrary.tsx (main, ~200 lines)

components/document-library/
├── DocumentGrid.tsx (~150 lines)
├── DocumentCard.tsx (~120 lines)
├── DocumentFilters.tsx (~150 lines)
├── DocumentSearch.tsx (~100 lines)
├── DocumentPreview.tsx (~200 lines)
└── DocumentActions.tsx (~100 lines)

hooks/
├── useDocuments.ts (~150 lines)
└── useDocumentFilters.ts (~80 lines)
```

**Estimated Time:** 2 hours

### 2.4 DailyBrief.tsx (887 lines)

**Refactoring Plan:**

```
pages/
└── DailyBrief.tsx (main, ~150 lines)

components/daily-brief/
├── BriefHeader.tsx (~100 lines)
├── BriefSections.tsx (~150 lines)
├── PriorityTasks.tsx (~150 lines)
├── Insights.tsx (~150 lines)
├── Recommendations.tsx (~150 lines)
└── ActionItems.tsx (~120 lines)

hooks/
└── useDailyBrief.ts (~150 lines)
```

**Estimated Time:** 2 hours

### 2.5 IntegrationWizard.tsx (835 lines)

**Refactoring Plan:**

```
components/integrations/
├── IntegrationWizard.tsx (main, ~150 lines)
├── steps/
│   ├── SelectIntegration.tsx (~120 lines)
│   ├── ConfigureSettings.tsx (~150 lines)
│   ├── TestConnection.tsx (~120 lines)
│   └── Complete.tsx (~80 lines)
└── components/
    ├── IntegrationCard.tsx (~100 lines)
    ├── ConfigForm.tsx (~150 lines)
    └── ConnectionStatus.tsx (~80 lines)
```

**Estimated Time:** 1.5 hours

### 2.6 ChiefOfStaff.tsx (832 lines)

**Refactoring Plan:**

```
pages/
└── ChiefOfStaff.tsx (main, ~150 lines)

components/chief-of-staff/
├── Dashboard.tsx (~150 lines)
├── TaskOverview.tsx (~120 lines)
├── TeamStatus.tsx (~120 lines)
├── ProjectUpdates.tsx (~150 lines)
├── Approvals.tsx (~150 lines)
└── Analytics.tsx (~120 lines)

hooks/
└── useChiefOfStaff.ts (~150 lines)
```

**Estimated Time:** 2 hours

### 2.7 MorningSignal.tsx (826 lines)

**Refactoring Plan:**

```
pages/
└── MorningSignal.tsx (main, ~150 lines)

components/morning-signal/
├── SignalHeader.tsx (~100 lines)
├── KeyInsights.tsx (~150 lines)
├── MarketOverview.tsx (~150 lines)
├── PriorityActions.tsx (~120 lines)
└── TrendAnalysis.tsx (~150 lines)

hooks/
└── useMorningSignal.ts (~150 lines)
```

**Estimated Time:** 2 hours

---

## Phase 3: Medium-Priority Components (16 hours)

### Remaining Components (3.1 - 3.12)

- DigitalTwinAccelerator.tsx (826 lines) - 1.5 hours
- SubscriptionTracker.tsx (825 lines) - 1.5 hours
- GenesisBlueprintWizard.tsx (798 lines) - 1.5 hours
- PresentationBlueprint.tsx (758 lines) - 1.5 hours
- SubscriptionManager.tsx (751 lines) - 1.5 hours
- BusinessGuardian.tsx (749 lines) - 1.5 hours
- Sidebar.tsx (734 lines) - 1.5 hours
- QualityGateApproval.tsx (714 lines) - 1.5 hours
- Plus 4 more components (600-700 lines each) - 6 hours

**Total Phase 3 Time:** 16 hours

---

## Implementation Guidelines

### Step-by-Step Process

1. **Create Directory Structure**
   ```bash
   mkdir -p components/{component-name}/{sections,components,hooks}
   ```

2. **Extract Types First**
   - Create `types.ts` with all interfaces and types
   - Import in main component

3. **Extract Hooks**
   - Move data fetching logic to `useComponentName.ts`
   - Move complex state logic to custom hooks
   - Test hooks independently

4. **Extract Sub-Components**
   - Start with the largest sections
   - Create focused, single-responsibility components
   - Pass props explicitly (avoid prop drilling)

5. **Update Main Component**
   - Import and use new sub-components
   - Keep main component as orchestrator
   - Maintain same external API

6. **Test**
   - Verify functionality unchanged
   - Test edge cases
   - Check performance

7. **Update Imports**
   - Update all files importing the component
   - Use barrel exports (`index.ts`)

### Code Quality Checklist

- [ ] Each file < 300 lines
- [ ] Single responsibility per component
- [ ] Props properly typed
- [ ] Hooks extracted for complex logic
- [ ] Utility functions in separate files
- [ ] JSDoc comments added
- [ ] Consistent naming conventions
- [ ] No prop drilling (use context if needed)
- [ ] Performance optimized (React.memo where appropriate)
- [ ] Tests added for new components

---

## Example: BusinessPlanReview Refactoring

### Before (1942 lines)

```typescript
// BusinessPlanReview.tsx (1942 lines)
export function BusinessPlanReview() {
  // 100+ lines of state
  // 200+ lines of effects
  // 500+ lines of JSX with all sections inline
  // 300+ lines of helper functions
  // 800+ lines of sub-components defined inline
}
```

### After

```typescript
// BusinessPlanReview.tsx (300 lines)
import { Header } from './sections/Header';
import { ExecutiveSummary } from './sections/ExecutiveSummary';
import { MarketAnalysis } from './sections/MarketAnalysis';
import { useBusinessPlan } from './hooks/useBusinessPlan';

export function BusinessPlanReview() {
  const { plan, isLoading, updateSection } = useBusinessPlan();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="business-plan-review">
      <Header plan={plan} />
      <ExecutiveSummary data={plan.executiveSummary} onUpdate={updateSection} />
      <MarketAnalysis data={plan.marketAnalysis} onUpdate={updateSection} />
      {/* More sections */}
    </div>
  );
}
```

```typescript
// hooks/useBusinessPlan.ts (150 lines)
export function useBusinessPlan() {
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // All data fetching and state management logic
  
  return { plan, isLoading, updateSection, savePlan };
}
```

```typescript
// sections/ExecutiveSummary.tsx (200 lines)
export function ExecutiveSummary({ data, onUpdate }: Props) {
  // Focused component for executive summary section
  return (
    <SectionCard title="Executive Summary">
      {/* Section content */}
    </SectionCard>
  );
}
```

---

## Progress Tracking

### Phase 1: Critical Components
- [ ] BusinessPlanReview.tsx (3h)
- [ ] AIExperts.tsx (2.5h)
- [ ] ProjectGenesis.tsx (2.5h)

### Phase 2: High-Priority Components
- [ ] ComponentShowcase.tsx (0.5h)
- [ ] AISMEsPage.tsx (2h)
- [ ] DocumentLibrary.tsx (2h)
- [ ] DailyBrief.tsx (2h)
- [ ] IntegrationWizard.tsx (1.5h)
- [ ] ChiefOfStaff.tsx (2h)
- [ ] MorningSignal.tsx (2h)

### Phase 3: Medium-Priority Components
- [ ] DigitalTwinAccelerator.tsx (1.5h)
- [ ] SubscriptionTracker.tsx (1.5h)
- [ ] GenesisBlueprintWizard.tsx (1.5h)
- [ ] PresentationBlueprint.tsx (1.5h)
- [ ] SubscriptionManager.tsx (1.5h)
- [ ] BusinessGuardian.tsx (1.5h)
- [ ] Sidebar.tsx (1.5h)
- [ ] QualityGateApproval.tsx (1.5h)
- [ ] Remaining 4 components (6h)

---

## Metrics

### Before Refactoring
- **Largest Component:** 1942 lines
- **Average Component Size:** 900 lines
- **Total Components:** 20
- **Total Lines:** ~18,000

### After Refactoring (Target)
- **Largest Component:** <300 lines
- **Average Component Size:** <200 lines
- **Total Components:** ~120 (6x increase)
- **Total Lines:** ~18,000 (same, but organized)

### Benefits
- **Maintainability:** ⬆️ 400%
- **Testability:** ⬆️ 500%
- **Reusability:** ⬆️ 300%
- **Readability:** ⬆️ 400%
- **Performance:** ⬆️ 20% (React.memo opportunities)

---

## Next Steps

1. **Immediate:** Start with Phase 1 (BusinessPlanReview, AIExperts, ProjectGenesis)
2. **This Week:** Complete Phase 2
3. **Next Week:** Complete Phase 3
4. **Ongoing:** Apply refactoring patterns to new components

---

**Status:** Ready to Execute  
**Last Updated:** 2026-02-25  
**Estimated Completion:** 3-4 weeks (with testing and deployment)
