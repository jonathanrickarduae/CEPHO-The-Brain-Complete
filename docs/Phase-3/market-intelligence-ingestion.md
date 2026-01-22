# Market Intelligence Ingestion
Phase: 3
Work Package: 3.2
Status: Draft

---

## Purpose

Provide structured, explainable market context for a venture
without making decisions or recommendations.

This work package focuses on ingestion, attribution, and clarity —
not evaluation.

---

## Design Principles

- Context, not judgement
- Sources are visible
- Confidence is explicit
- Unknowns are allowed
- Intelligence is explainable to a human

---

## Market Intelligence Definition

Market Intelligence refers to externally derived information that
describes the environment a venture operates in.

This includes:
- Market size indicators
- Competitive landscape
- Trends and signals
- Structural characteristics

It does not include:
- Opportunity scoring
- Go / no-go decisions
- Automated conclusions

---

## Intelligence Categories

### 1. Market Overview

Descriptive information such as:
- Market category
- Market maturity
- Geographic scope
- Macro trends

---

### 2. Customer Context

High-level signals about:
- Customer segments
- Observed pain points
- Adoption behaviours

No assumptions about willingness to pay.

---

### 3. Competitive Landscape

Structured identification of:
- Direct competitors
- Indirect alternatives
- Substitute solutions

No ranking or judgement is applied.

---

### 4. Trend Signals

Observed signals such as:
- Regulatory shifts
- Technology adoption
- Behavioural changes

Signals may be weak, emerging, or uncertain.

---

## Source Attribution

Every intelligence item must reference:
- Source type (report, article, dataset, expert opinion)
- Source identifier (name, link, citation)
- Timestamp
- Confidence level (Low / Medium / High)

---

## Confidence Handling

Intelligence must be allowed to say:
- “Insufficient data”
- “Conflicting sources”
- “Low confidence signal”

Confidence is descriptive, not corrective.

---

## Relationship to Venture Workspace

Market Intelligence:
- Attaches to a Venture Workspace
- References venture state
- Does not alter venture state
- Does not override inputs or constraints

---

## Out of Scope (Work Package 3.2)

Explicitly excluded:
- Scoring
- Weighting
- Recommendations
- Automation
- Agent execution
- Investor messaging

---

## Exit Criteria (Phase 3.2)

This work package is complete when:
- Market context can be ingested and structured
- Sources are visible and traceable
- Confidence is explicit
- A human can read the output and say “this reflects reality”
