# Persephone-AI

## Knowledge Repository Structure

---

### Overview

This document defines the data collection and organization structure for the Persephone-AI Knowledge Repository. Each of the 14 AI Genius Board members will have a comprehensive profile built from publicly available sources.

---

## Repository Architecture

```
persephone-ai/
├── advisors/
│   ├── sam-altman/
│   │   ├── profile.json
│   │   ├── sources/
│   │   │   ├── books/
│   │   │   ├── speeches/
│   │   │   ├── interviews/
│   │   │   ├── articles/
│   │   │   ├── podcasts/
│   │   │   └── social/
│   │   ├── insights/
│   │   │   ├── predictions.md
│   │   │   ├── philosophy.md
│   │   │   ├── strategy.md
│   │   │   └── quotes.md
│   │   └── analysis/
│   │       ├── thinking-style.md
│   │       ├── decision-framework.md
│   │       └── key-themes.md
│   ├── jensen-huang/
│   ├── jony-ive/
│   ├── mark-zuckerberg/
│   ├── tekedra-mawakana/
│   ├── palmer-luckey/
│   ├── cc-wei/
│   ├── liang-wenfeng/
│   ├── elon-musk/
│   ├── fei-fei-li/
│   ├── demis-hassabis/
│   ├── satya-nadella/
│   ├── david-sacks/
│   └── mira-murati/
├── themes/
│   ├── agi-timeline.md
│   ├── ai-safety.md
│   ├── infrastructure.md
│   ├── regulation.md
│   └── commercialization.md
├── cross-reference/
│   ├── agreements.md
│   ├── disagreements.md
│   └── predictions-tracker.md
└── index.json
```

---

## Individual Advisor Profile Schema

### profile.json

```json
{
  "id": "sam-altman",
  "name": "Sam Altman",
  "role": "CEO",
  "company": "OpenAI",
  "age": 40,
  "nationality": "American",
  "focus_areas": ["AGI Development", "Consumer AI"],
  "key_themes": [],
  "source_count": {
    "books": 0,
    "speeches": 0,
    "interviews": 0,
    "articles": 0,
    "podcasts": 0,
    "social": 0
  },
  "last_updated": "2026-01-18",
  "completeness_score": 0
}
```

---

## Source Categories

### 1. Books
Published books authored or co-authored by the advisor.

| Field | Description |
|-------|-------------|
| title | Book title |
| year | Publication year |
| publisher | Publishing house |
| key_chapters | Most relevant chapters for AI insights |
| summary | Executive summary of key points |
| quotes | Notable quotations |

### 2. Speeches & Keynotes
Conference presentations, company announcements, and public addresses.

| Field | Description |
|-------|-------------|
| title | Speech title |
| event | Conference or venue |
| date | Date delivered |
| duration | Length in minutes |
| transcript_url | Link to transcript |
| video_url | Link to video |
| key_points | Main takeaways |
| quotes | Notable quotations |

### 3. Interviews
Long-form interviews in print, video, or podcast format.

| Field | Description |
|-------|-------------|
| title | Interview title |
| outlet | Media outlet |
| interviewer | Name of interviewer |
| date | Publication date |
| format | Video, audio, or text |
| url | Link to source |
| key_topics | Main subjects discussed |
| quotes | Notable quotations |

### 4. Articles & Op-Eds
Written pieces published by the advisor.

| Field | Description |
|-------|-------------|
| title | Article title |
| publication | Where published |
| date | Publication date |
| url | Link to article |
| summary | Key points summary |
| quotes | Notable quotations |

### 5. Podcasts
Podcast appearances as guest or host.

| Field | Description |
|-------|-------------|
| podcast_name | Name of podcast |
| episode_title | Episode title |
| host | Podcast host |
| date | Air date |
| duration | Length in minutes |
| url | Link to episode |
| key_topics | Main subjects discussed |
| quotes | Notable quotations |

### 6. Social Media
Significant posts from X/Twitter, LinkedIn, and other platforms.

| Field | Description |
|-------|-------------|
| platform | Social media platform |
| date | Post date |
| content | Full text of post |
| engagement | Likes, shares, comments |
| url | Link to post |
| context | Why this post is significant |

---

## Insight Categories

### predictions.md
Documented predictions about AI future, timelines, and outcomes.

| Field | Description |
|-------|-------------|
| prediction | What was predicted |
| date_made | When prediction was made |
| timeline | When they expect it to happen |
| source | Where they said it |
| status | Pending, correct, or incorrect |

### philosophy.md
Core beliefs about AI development, safety, and ethics.

| Field | Description |
|-------|-------------|
| topic | Subject area |
| position | Their stated position |
| reasoning | Why they hold this view |
| sources | Where they expressed this |

### strategy.md
Business and technology strategy insights.

| Field | Description |
|-------|-------------|
| area | Strategy domain |
| approach | Their strategic approach |
| rationale | Why this approach |
| examples | Specific examples |

### quotes.md
Most impactful and memorable quotations.

| Field | Description |
|-------|-------------|
| quote | The quotation |
| context | When and where said |
| topic | Subject matter |
| significance | Why this quote matters |

---

## Analysis Documents

### thinking-style.md
How the advisor approaches problems and makes decisions.

- Analytical frameworks they use
- Decision-making patterns
- Risk tolerance
- Time horizons
- Influences and mentors

### decision-framework.md
Documented decision-making approaches.

- Key decisions made
- Factors considered
- Trade-offs accepted
- Outcomes achieved

### key-themes.md
Recurring themes across all sources.

- Most frequently discussed topics
- Consistent positions
- Evolution of thinking over time
- Contradictions or changes

---

## Cross-Reference Analysis

### agreements.md
Areas where multiple advisors share similar views.

### disagreements.md
Areas of documented disagreement between advisors.

### predictions-tracker.md
Tracking predictions across all advisors with outcomes.

---

## Data Collection Priority

### Tier 1: Essential (Immediate)
- Official company blogs and announcements
- Major keynote speeches (CES, GTC, I/O, etc.)
- Published books and academic papers
- Congressional and regulatory testimonies

### Tier 2: Important (Phase 2)
- Podcast appearances (All-In, Lex Fridman, etc.)
- Long-form interviews (The Times, WSJ, etc.)
- Conference panel discussions
- Documentary features

### Tier 3: Supplementary (Ongoing)
- Social media posts and threads
- News quotes and statements
- Industry analyst coverage
- Biographical and profile pieces

---

## Completeness Scoring

Each advisor profile receives a completeness score based on:

| Category | Weight | Criteria |
|----------|--------|----------|
| Books | 10% | All published books captured |
| Speeches | 20% | Major keynotes documented |
| Interviews | 25% | Key interviews transcribed |
| Articles | 15% | Published writings collected |
| Podcasts | 15% | Significant appearances logged |
| Analysis | 15% | Thinking style and themes documented |

**Target:** 80% completeness for all 14 advisors before Phase 3 launch.

---

*Document Classification: Strategic*
*Version: 1.0*
*Date: 18 January 2026*
*Status: Active Development*

