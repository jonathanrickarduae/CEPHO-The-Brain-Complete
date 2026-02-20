# Frontend Improvements Documentation

## Overview

This document outlines the frontend improvements implemented in Phase 13, including state management, performance optimizations, and new features.

---

## State Management with Zustand

### Global Store (`useStore.ts`)

A centralized Zustand store for managing global application state:

**Features:**
- User preferences (theme, language, notifications, dashboard layout)
- UI state (sidebar, modals, loading states, toasts)
- Cache for optimistic updates
- Recent activity tracking
- LocalStorage persistence

**Usage Example:**
```typescript
import { useStore, selectTheme, selectSidebarOpen } from '@/store/useStore';

function MyComponent() {
  // Using selectors for optimal performance
  const theme = useStore(selectTheme);
  const sidebarOpen = useStore(selectSidebarOpen);
  
  // Using actions
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const showToast = useStore((state) => state.showToast);
  
  return (
    <button onClick={() => {
      toggleSidebar();
      showToast('Sidebar toggled', 'success');
    }}>
      Toggle Sidebar
    </button>
  );
}
```

**Benefits:**
- ✅ No prop drilling
- ✅ Automatic re-renders only when needed
- ✅ TypeScript type safety
- ✅ Persistent state across sessions
- ✅ Simple API

---

### AI Agents Store (`useAgentsStore.ts`)

Specialized store for AI agents monitoring and performance tracking:

**Features:**
- Agent status tracking (active, idle, training, error, offline)
- Performance metrics (response time, success rate, user satisfaction)
- Training progress tracking
- Daily reports with activities, improvements, suggestions
- Approval workflow for agent requests
- Filtering and sorting capabilities

**Usage Example:**
```typescript
import { useAgentsStore } from '@/store/useAgentsStore';

function AgentCard({ agentId }: { agentId: string }) {
  const agent = useAgentsStore((state) => state.getAgentById(agentId));
  const rateAgent = useAgentsStore((state) => state.rateAgent);
  
  if (!agent) return null;
  
  return (
    <div>
      <h3>{agent.name}</h3>
      <p>Rating: {agent.rating}</p>
      <button onClick={() => rateAgent(agentId, 5)}>
        Rate 5 Stars
      </button>
    </div>
  );
}
```

**Agent Types:**
- `digital-twin`: Digital Twin agent
- `chief-of-staff`: Chief of Staff agent
- `sme`: SME Network coordinator
- `expert`: Expert team members

**Agent Statuses:**
- `active`: Currently processing tasks
- `idle`: Available but not active
- `training`: Undergoing training
- `error`: Encountered an error
- `offline`: Not available

---

## AI Agents Monitoring Page

A comprehensive dashboard for monitoring AI agent performance and managing daily reports.

**Features:**

### 1. Agent Overview Cards
- Real-time status indicators
- Performance metrics (accuracy, response time)
- Training progress bars
- Task completion counts
- Star ratings

### 2. Filtering and Sorting
- Filter by agent type (Digital Twin, Chief of Staff, SME, Expert)
- Filter by status (Active, Idle, Training, Error, Offline)
- Filter by minimum rating
- Sort by name, rating, performance, or last active time

### 3. Daily Reports
- Activities performed
- Improvements made
- Suggestions for enhancements
- Requests for approval with approve/deny actions

### 4. Performance Tracking
- Response time monitoring
- Success rate tracking
- User satisfaction scores
- Competency progress

**Access:**
Navigate to `/agents-monitoring` to view the dashboard.

---

## Performance Optimizations

### 1. Selective Re-renders

Using Zustand selectors to prevent unnecessary re-renders:

```typescript
// ❌ Bad: Re-renders on any state change
const state = useStore();

// ✅ Good: Only re-renders when theme changes
const theme = useStore(selectTheme);
```

### 2. Computed Values

Memoized computed values in stores:

```typescript
// Computed in store, not in component
const filteredAgents = useAgentsStore((state) => state.getFilteredAgents());
```

### 3. Optimistic Updates

Cache layer for immediate UI feedback:

```typescript
const setCache = useStore((state) => state.setCache);

// Update UI immediately
setCache('project-123', updatedData);

// Then sync with server
await updateProject(updatedData);
```

---

## State Persistence

### LocalStorage Integration

User preferences and some UI state persist across sessions:

**Persisted Data:**
- Theme preference
- Language selection
- Notification settings
- Dashboard layout
- Sidebar open/closed state

**Not Persisted:**
- Loading states
- Toast notifications
- Active modals
- Cache data

---

## Best Practices

### 1. Use Selectors

Always use selectors for better performance:

```typescript
// Define selectors
export const selectTheme = (state: StoreState) => state.preferences.theme;

// Use in components
const theme = useStore(selectTheme);
```

### 2. Batch Updates

Use set() to batch multiple state updates:

```typescript
set((state) => ({
  preferences: { ...state.preferences, theme: 'dark' },
  ui: { ...state.ui, sidebarOpen: false },
}));
```

### 3. Avoid Inline Selectors

Don't create new functions on every render:

```typescript
// ❌ Bad: Creates new function every render
const loading = useStore((state) => state.ui.loading['myKey']);

// ✅ Good: Use predefined selector
const loading = useStore(selectLoading('myKey'));
```

### 4. Type Safety

Always define proper TypeScript interfaces:

```typescript
interface StoreState {
  preferences: UserPreferences;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
}
```

---

## Migration Guide

### From Props to Store

**Before:**
```typescript
function Parent() {
  const [theme, setTheme] = useState('light');
  return <Child theme={theme} setTheme={setTheme} />;
}

function Child({ theme, setTheme }) {
  return <GrandChild theme={theme} setTheme={setTheme} />;
}

function GrandChild({ theme, setTheme }) {
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

**After:**
```typescript
function Parent() {
  return <Child />;
}

function Child() {
  return <GrandChild />;
}

function GrandChild() {
  const theme = useStore(selectTheme);
  const setPreferences = useStore((state) => state.setPreferences);
  
  return (
    <button onClick={() => setPreferences({ theme: 'dark' })}>
      {theme}
    </button>
  );
}
```

---

## Toast Notifications

The existing toast system has been integrated with the Zustand store for consistency.

**Usage:**
```typescript
const showToast = useStore((state) => state.showToast);

// Show success toast
showToast('Changes saved successfully', 'success');

// Show error toast
showToast('Failed to save changes', 'error');

// Show info toast
showToast('New feature available', 'info');

// Show warning toast
showToast('Please review your settings', 'warning');
```

**Features:**
- Auto-dismiss after 5 seconds
- Manual dismiss button
- Color-coded by type
- Smooth animations
- Fixed position (bottom-right)

---

## Activity Tracking

Track user activities for analytics and recent activity feeds:

```typescript
const addActivity = useStore((state) => state.addActivity);

// Track activity
addActivity({
  type: 'project-created',
  data: { projectId: 123, name: 'New Project' },
});

// Get recent activities
const recentActivity = useStore(selectRecentActivity);
```

**Features:**
- Automatic timestamp
- Unique ID generation
- Keeps last 50 activities
- Type-safe activity data

---

## Future Enhancements

### Planned Improvements

1. **Offline Support**
   - Service worker integration
   - Offline queue for mutations
   - Sync when online

2. **Real-time Updates**
   - WebSocket integration
   - Live agent status updates
   - Real-time notifications

3. **Advanced Caching**
   - TTL for cache entries
   - Cache invalidation strategies
   - Background refresh

4. **State Devtools**
   - Redux DevTools integration
   - Time-travel debugging
   - State snapshots

5. **Performance Monitoring**
   - Render tracking
   - State change analytics
   - Performance metrics

---

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## Support

For questions or issues related to state management:
- Check the store definitions in `client/src/store/`
- Review usage examples in this document
- Consult the Zustand documentation
