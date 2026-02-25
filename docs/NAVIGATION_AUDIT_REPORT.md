# Navigation and Routes Audit Report

**Date:** February 25, 2026  
**Purpose:** Ensure page names, URLs, navigation labels, and process flows are consistent

---

## Current Navigation Structure (BrainLayout.tsx)

### 1. The Nexus
- **Label:** "The Nexus"
- **Path:** `/nexus`
- **Status:** ✅ Matches route

### 2. The Signal
- **Label:** "The Signal"
- **Path:** `/daily-brief`
- **Children:**
  - **Victoria's Brief** → `/daily-brief` ✅
  - **Evening Review** → `/evening-review` ✅

### 3. Chief of Staff
- **Label:** "Chief of Staff"
- **Path:** `/tasks`
- **Children:**
  - **Tasks** → `/tasks` ✅
  - **Odyssey Management** → `/odyssey-management` ✅
  - **Twin Training** → `/twin-training` ✅
  - **AI Agents** → `/ai-agents` ⚠️ (route exists but needs verification)
  - **AI-SMEs** → `/ai-experts` ✅
  - **Operations** → `/operations` ✅
  - **Analytics** → `/analytics` ✅
  - **Document Library** → `/documents` ✅

### 4. Odyssey Engine
- **Label:** "Odyssey Engine"
- **Path:** `/innovation-hub`
- **Children:**
  - **Innovation Hub** → `/innovation-hub` ✅
  - **Project Genesis** → `/project-genesis` ✅
  - **Workflows** → `/workflows` ✅
  - **Persephone Board** → `/persephone` ✅

### 5. Vault
- **Label:** "Vault"
- **Path:** `/vault` ✅

### 6. Settings
- **Label:** "Settings"
- **Path:** `/settings` ✅

---

## Issues Found

### 1. Duplicate/Obsolete Routes
❌ **Routes that should be removed:**
- `/chief-of-staff` - Duplicate of `/tasks`
- `/chief-of-staff-role` - Separate page, not in navigation
- `/morning-signal` - Removed from navigation (consolidated into Victoria's Brief)
- `/the-signal` - Duplicate route
- `/signal` - Duplicate route
- `/signal/morning` - Duplicate route
- `/signal/evening` - Duplicate route
- `/expert-network` - Removed from navigation (AI-SMEs moved to Chief of Staff)
- `/ai-team` - Not in navigation
- `/agents` - Duplicate of `/ai-agents`
- `/agents/:id` - Should be `/ai-agents/:id`
- `/library` - Not in navigation (replaced by `/documents`)

### 2. Missing AI Agents Route
⚠️ **AI Agents navigation points to `/ai-agents`**
- Need to verify this route exists and works
- May need to create or update the route

### 3. Page Name vs URL Mismatches

| Navigation Label | Current URL | Suggested URL | Status |
|-----------------|-------------|---------------|--------|
| The Nexus | `/nexus` | `/nexus` | ⚠️ Consider renaming |
| Tasks | `/tasks` | `/tasks` | ⚠️ Consider renaming |
| Analytics | `/analytics` | `/analytics` | ⚠️ Consider renaming |

---

## Recommended Actions

### Phase 1: Remove Obsolete Routes
Remove these routes from App.tsx:
- `/chief-of-staff` (use `/tasks`)
- `/morning-signal` (consolidated)
- `/the-signal`, `/signal`, `/signal/morning`, `/signal/evening` (duplicates)
- `/expert-network` (removed from nav)
- `/ai-team` (not in nav)
- `/agents` and `/agents/:id` (use `/ai-agents`)
- `/library` (use `/documents`)

### Phase 2: Fix URL Naming Consistency
**Option A: Keep current URLs** (minimal changes)
- Keep `/nexus` for The Nexus
- Keep `/tasks` for Tasks
- Keep `/analytics` for Analytics
- Update navigation labels if needed

**Option B: Rename URLs to match labels** (more consistent)
- `/nexus` → `/nexus`
- `/tasks` → `/tasks`
- `/analytics` → `/analytics`

**Recommendation:** Option A (keep current URLs) to avoid breaking existing bookmarks and references.

### Phase 3: Verify AI Agents Route
Check if `/ai-agents` route exists and points to correct component.

### Phase 4: Update QMS Documents
Update these documents with current navigation structure:
- `CEPHO_PROCESS_FLOW_DIAGRAMS.md`
- `CEPHO_QUALITY_MANAGEMENT_SYSTEM.md`
- `INNOVATION_HUB_WORKFLOWS.md`

---

## Navigation to URL Mapping (Final)

```
The Nexus → /nexus
The Signal
  ├─ Victoria's Brief → /daily-brief
  └─ Evening Review → /evening-review
Chief of Staff
  ├─ Tasks → /tasks
  ├─ Odyssey Management → /odyssey-management
  ├─ Twin Training → /twin-training
  ├─ AI Agents → /ai-agents
  ├─ AI-SMEs → /ai-experts
  ├─ Operations → /operations
  ├─ Analytics → /analytics
  └─ Document Library → /documents
Odyssey Engine
  ├─ Innovation Hub → /innovation-hub
  ├─ Project Genesis → /project-genesis
  ├─ Workflows → /workflows
  └─ Persephone Board → /persephone
Vault → /vault
Settings → /settings
```

---

## Next Steps

1. ✅ Remove obsolete routes from App.tsx
2. ✅ Verify AI Agents route exists
3. ✅ Update QMS and process flow documents
4. ✅ Commit all changes
5. ✅ Ready for Project 1
