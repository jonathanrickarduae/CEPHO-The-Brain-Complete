# Component Refactoring Guide

**Priority 2 - CODE-02: Refactor Large Components**

## Overview

This guide documents the refactoring strategy for large components (>500 lines) to improve maintainability, reusability, and testability.

---

## Components Requiring Refactoring

### Critical (>1000 lines)

1. **BusinessPlanReview.tsx** (1942 lines) - HIGHEST PRIORITY
2. **AIExperts.tsx** (1500 lines)
3. **ComponentShowcase.tsx** (1437 lines) - Can be removed if not used
4. **AISMEsPage.tsx** (1241 lines)
5. **ProjectGenesis.tsx** (1079 lines)

### High (700-1000 lines)

6. **DocumentLibrary.tsx** (981 lines)
7. **DailyBrief.tsx** (887 lines)
8. **EveningReview_OLD.tsx** (841 lines) - Can be removed if deprecated
9. **IntegrationWizard.tsx** (835 lines)
10. **ChiefOfStaff.tsx** (832 lines)
11. **MorningSignal.tsx** (826 lines)
12. **DigitalTwinAccelerator.tsx** (826 lines)
13. **SubscriptionTracker.tsx** (825 lines)
14. **GenesisBlueprintWizard.tsx** (798 lines)
15. **PresentationBlueprint.tsx** (758 lines)
16. **SubscriptionManager.tsx** (751 lines)
17. **BusinessGuardian.tsx** (749 lines)
18. **sidebar.tsx** (734 lines)
19. **QualityGateApproval.tsx** (714 lines)
20. **DirectExpertChat.tsx** (705 lines)

---

## Refactoring Strategy

### 1. Extract Sub-Components

**Before:**

```tsx
// BusinessPlanReview.tsx (1942 lines)
export function BusinessPlanReview() {
  // 200 lines of state
  // 400 lines of handlers
  // 1342 lines of JSX
}
```

**After:**

```tsx
// BusinessPlanReview.tsx (200 lines)
export function BusinessPlanReview() {
  // Main component logic
  return (
    <BusinessPlanReviewLayout>
      <BusinessPlanHeader />
      <BusinessPlanSections />
      <BusinessPlanActions />
    </BusinessPlanReviewLayout>
  );
}

// components/business-plan/sections/Header.tsx (50 lines)
// components/business-plan/sections/Sections.tsx (100 lines)
// components/business-plan/sections/Actions.tsx (80 lines)
```

### 2. Extract Custom Hooks

**Before:**

```tsx
export function AIExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 50 lines of data fetching logic
  }, []);

  // 1400 more lines...
}
```

**After:**

```tsx
// hooks/useExperts.ts
export function useExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Data fetching logic
  }, []);

  return { experts, loading, error };
}

// AIExperts.tsx
export function AIExperts() {
  const { experts, loading, error } = useExperts();
  // 200 lines of UI logic
}
```

### 3. Extract Utility Functions

**Before:**

```tsx
export function DocumentLibrary() {
  const formatDate = date => {
    // 20 lines of date formatting
  };

  const calculateStats = docs => {
    // 30 lines of calculation
  };

  // 900 more lines...
}
```

**After:**

```tsx
// utils/documentHelpers.ts
export function formatDocumentDate(date: Date): string {
  // Date formatting logic
}

export function calculateDocumentStats(docs: Document[]): Stats {
  // Calculation logic
}

// DocumentLibrary.tsx
import {
  formatDocumentDate,
  calculateDocumentStats,
} from "@/utils/documentHelpers";

export function DocumentLibrary() {
  // 300 lines of UI logic
}
```

### 4. Use Composition

**Before:**

```tsx
export function ProjectGenesis() {
  return <div>{/* 1000 lines of nested JSX */}</div>;
}
```

**After:**

```tsx
export function ProjectGenesis() {
  return (
    <ProjectGenesisProvider>
      <ProjectGenesisWizard>
        <ProjectGenesisStep1 />
        <ProjectGenesisStep2 />
        <ProjectGenesisStep3 />
      </ProjectGenesisWizard>
    </ProjectGenesisProvider>
  );
}
```

---

## Refactoring Checklist

For each component:

- [ ] Identify logical sections (header, body, footer, etc.)
- [ ] Extract sections into separate components
- [ ] Identify repeated logic and extract into hooks
- [ ] Identify utility functions and extract into utils
- [ ] Create proper TypeScript interfaces
- [ ] Add JSDoc comments
- [ ] Ensure props are properly typed
- [ ] Test component after refactoring
- [ ] Update imports in parent components
- [ ] Remove unused code

---

## File Structure

```
client/src/
├── components/
│   ├── business-plan/
│   │   ├── BusinessPlanReview.tsx (main component, 200 lines)
│   │   ├── sections/
│   │   │   ├── Header.tsx
│   │   │   ├── Sections.tsx
│   │   │   └── Actions.tsx
│   │   └── hooks/
│   │       ├── useBusinessPlan.ts
│   │       └── useBusinessPlanActions.ts
│   └── ...
├── hooks/
│   ├── useExperts.ts
│   ├── useDocuments.ts
│   └── ...
└── utils/
    ├── documentHelpers.ts
    ├── expertHelpers.ts
    └── ...
```

---

## Priority Order

### Phase 1 (Immediate - 8 hours)

1. **BusinessPlanReview.tsx** (1942 → 200 lines)
   - Extract: Header, Sections, Actions, Sidebar
   - Create: useBusinessPlan hook
   - Utils: formatters, validators

2. **AIExperts.tsx** (1500 → 250 lines)
   - Extract: ExpertCard, ExpertList, ExpertFilters
   - Create: useExperts, useExpertChat hooks
   - Utils: expertHelpers

### Phase 2 (This Week - 12 hours)

3. **AISMEsPage.tsx** (1241 → 300 lines)
4. **ProjectGenesis.tsx** (1079 → 250 lines)
5. **DocumentLibrary.tsx** (981 → 300 lines)

### Phase 3 (Next Week - 16 hours)

6-10. Medium-sized components (700-900 lines)

---

## Naming Conventions

### Components

- PascalCase: `BusinessPlanHeader`
- Descriptive: `ExpertChatMessage` not `Message`
- Specific: `ProjectGenesisStep1` not `Step1`

### Hooks

- camelCase with `use` prefix: `useBusinessPlan`
- Descriptive: `useExpertChat` not `useChat`

### Utils

- camelCase: `formatDocumentDate`
- Verb-first: `calculateStats` not `statsCalculation`

---

## Testing Strategy

After refactoring each component:

1. **Manual Testing**
   - Open page in browser
   - Test all interactions
   - Check console for errors
   - Verify data loading

2. **Visual Testing**
   - Compare before/after screenshots
   - Check responsive behavior
   - Verify animations/transitions

3. **Unit Testing** (Future)
   - Test extracted hooks
   - Test utility functions
   - Test component rendering

---

## Benefits

### Before Refactoring

- ❌ 1942-line components (hard to understand)
- ❌ Duplicate logic across components
- ❌ Difficult to test
- ❌ Hard to maintain
- ❌ Slow IDE performance

### After Refactoring

- ✅ 200-300 line components (easy to understand)
- ✅ Reusable hooks and utils
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Fast IDE performance
- ✅ Better code organization

---

## Progress Tracking

- [ ] Phase 1: BusinessPlanReview.tsx
- [ ] Phase 1: AIExperts.tsx
- [ ] Phase 2: AISMEsPage.tsx
- [ ] Phase 2: ProjectGenesis.tsx
- [ ] Phase 2: DocumentLibrary.tsx
- [ ] Phase 3: Remaining components

**Estimated Total Time:** 36 hours  
**Estimated Completion:** 1-2 weeks

---

## Notes

- Refactor incrementally (one component at a time)
- Test after each refactoring
- Commit after each successful refactoring
- Deploy and verify in production
- Document any breaking changes

---

**Last Updated:** 2026-02-25  
**Status:** Planning Complete, Ready to Start
