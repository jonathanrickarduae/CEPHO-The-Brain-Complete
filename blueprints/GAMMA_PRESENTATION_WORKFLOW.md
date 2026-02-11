# Gamma Presentation Workflow

**Document ID:** INT-002  
**Version:** 1.0  
**Date:** January 15, 2026  
**Purpose:** Standard process for creating presentations using Gamma within CEPHO

---

## Overview

Gamma is an AI-powered presentation tool that transforms structured content into professional slide decks. This document defines how Gamma integrates with the CEPHO/Project Genesis workflow.

---

## When to Use Gamma

| Use Case | Trigger | Output |
|----------|---------|--------|
| Investor Pitch Deck | Business Plan complete | 15-20 slide investor presentation |
| Executive Summary | Deep Dive complete | 5-10 slide summary |
| Progress Report | Status update needed | 3-5 slide update |
| Training Material | New process documented | Variable length training deck |

---

## Workflow Process

### Step 1: Prepare Content

Before using Gamma, prepare structured content in Markdown format:

1. Create slide content outline in `/home/ubuntu/the-brain/[PROJECT]_SLIDE_CONTENT.md`
2. Follow the standard structure:
   - Title slide
   - Problem/Opportunity
   - Solution
   - Market
   - Business Model
   - Traction/Validation
   - Team
   - Financials
   - Ask
   - Appendix

3. Ensure each slide has:
   - Clear headline (insight, not topic label)
   - 3-5 supporting points
   - Data or evidence where applicable

### Step 2: Access Gamma

1. Navigate to [gamma.app](https://gamma.app)
2. Log in with CEPHO credentials
3. Select "Create new" → "Paste in text"

### Step 3: Input Content

1. Copy the prepared Markdown content
2. Paste into Gamma's text input
3. Select presentation style:
   - **Investor Deck:** Professional, data-focused
   - **Executive Summary:** Clean, minimal
   - **Training:** Instructional, step-by-step

### Step 4: Customize Design

1. Select theme matching CEPHO brand:
   - Colors: Black, white, grey (per brand guidelines)
   - Fonts: Professional, readable
   - Layout: Clean, not cluttered

2. Review each slide for:
   - Readability
   - Visual balance
   - Data accuracy

### Step 5: Export and Store

1. Export as:
   - PDF (for sharing)
   - PowerPoint (for editing)
   - Link (for live presentation)

2. Save to:
   - `/home/ubuntu/the-brain/offline_package/04_CASE_STUDIES/[PROJECT]/`
   - Name: `[PROJECT]_INVESTOR_DECK_V[X].pdf`

### Step 6: Quality Check

Before delivery, verify:

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Branding | Colors and fonts match guidelines | |
| Content | All key points included | |
| Data | Numbers accurate and sourced | |
| Flow | Logical narrative progression | |
| Length | Appropriate for audience | |
| Readability | Text visible, not cluttered | |

---

## Integration with Project Genesis

```
PROJECT GENESIS WORKFLOW
         │
         ▼
┌─────────────────┐
│ Phase 3:        │
│ Business Plan   │
│ Development     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Slide Content   │
│ Preparation     │
│ (Markdown)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GAMMA           │
│ Presentation    │
│ Generation      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Phase 4:        │
│ Expert Review   │
│ (incl. deck)    │
└─────────────────┘
```

---

## Quality Standards

### Slide Design Principles

1. **One idea per slide** - Don't overcrowd
2. **Headlines as insights** - "Revenue grew 40%" not "Revenue"
3. **Visual hierarchy** - Most important information prominent
4. **Consistent formatting** - Same fonts, colors throughout
5. **Data visualization** - Charts over tables where possible

### Content Standards

1. **Evidence-based claims** - Support assertions with data
2. **Clear narrative** - Story flows logically
3. **Audience-appropriate** - Adjust depth for audience
4. **Honest representation** - No misleading statistics

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Gamma not parsing content correctly | Simplify Markdown, use clear headers |
| Design doesn't match brand | Manually adjust colors and fonts |
| Too many slides generated | Consolidate content before input |
| Images not appropriate | Replace with custom images or remove |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 15, 2026 | Initial workflow document | Project Genesis |
