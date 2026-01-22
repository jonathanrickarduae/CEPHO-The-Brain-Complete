# Venture Workspace & State Model
Phase: 3
Status: Draft

## Purpose

Define a stable, inspectable structure for representing a venture inside Cepho.

This workspace is the anchor point for:
- Market intelligence
- Opportunity analysis
- Scoring
- Outputs

No inference is implicit. All state is explicit.

---

## Venture Identity

| Field | Description |
|------|------------|
| venture_id | Unique identifier |
| name | Venture working name |
| description | Human-provided summary |
| created_by | User identifier |
| created_at | Timestamp |

---

## Venture Stage

Represents where the venture is in its lifecycle.

Examples:
- Ideation
- Research
- Validation
- Prototype
- Market Entry

Only one stage may be active at a time.

---

## Inputs (Human-Provided)

Explicit inputs supplied by the user.

Examples:
- Problem statement
- Target customer
- Initial assumptions
- Constraints (budget, geography, timeline)

Inputs are never modified by the system.

---

## Derived Insights (System-Generated)

Insights produced by Cepho based on inputs and external data.

Examples:
- Market summaries
- Opportunity framing
- Risk observations

Each insight must reference:
- Source
- Confidence level
- Timestamp

---

## Assumptions & Hypotheses

Tracked statements that may later be validated or disproven.

Examples:
- Market demand assumptions
- Cost assumptions
- Timing assumptions

Assumptions are first-class objects and may change state.

---

## State Principles

- No hidden inference
- No automatic transitions
- All outputs trace back to inputs or sources
- The venture can be understood without AI involvement

---

## Out of Scope (Phase 3.1)

- Scoring
- Automation
- Agent behaviour
- External integrations

