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
# Venture Workspace & State Model
Phase: 3
Work Package: 3.1
Status: Draft

---

## Purpose

Define a stable, human-readable venture workspace that all future intelligence
can attach to — without requiring AI involvement to understand the venture.

This workspace is the source of truth for:
- Venture identity
- Venture state
- Inputs, assumptions, and constraints

---

## Core Principles

- No hidden inference
- No automatic transitions
- No implicit intelligence
- All outputs must trace back to explicit inputs or sources
- A venture must be understandable without AI assistance

---

## Venture Workspace Definition

A **Venture Workspace** represents a single venture instance and contains:

- Identity
- Current state
- Declared inputs
- Assumptions
- Constraints
- System metadata

It does not contain:
- Recommendations
- Scores
- Decisions
- Actions

---

## Venture Identity

Each venture must explicitly define:

- Venture name
- Short description
- Founder / owner
- Creation date
- Last updated date

Identity is immutable once created, except for descriptive fields.

---

## Venture State Model

A venture always exists in exactly one state.

States are explicit and human-assigned.

### Allowed States

- Idea
- Researching
- Validating
- Building
- Preparing to Launch
- Live
- Paused
- Closed

---

## State Rules

- States do not change automatically
- State changes require an explicit user action
- State history must be retained
- AI may reference state but never modify it

---

## Inputs

Inputs are facts provided by the user or external sources.

Examples:
- Market description
- Target customer
- Geography
- Budget range
- Timeline expectations

Inputs must be:
- Explicit
- Editable
- Attributable

---

## Assumptions

Assumptions are statements believed to be true but not yet validated.

Examples:
- Customer willingness to pay
- Market growth expectations
- Regulatory feasibility

Assumptions must:
- Be explicitly declared
- Be reviewable
- Never be silently upgraded to facts

---

## Constraints

Constraints define boundaries the venture must operate within.

Examples:
- Budget caps
- Regulatory restrictions
- Geographic limits
- Ethical constraints

Constraints override all downstream intelligence.

---

## System Metadata

System metadata is maintained by the platform and includes:

- Venture ID
- Creation timestamp
- Modification history
- Linked artefacts (documents, outputs)

Metadata is never interpreted as intelligence.

---

## Out of Scope (Work Package 3.1)

Explicitly excluded:

- Market analysis
- Opportunity scoring
- Automation
- Agent behaviour
- External integrations
- Execution logic

These belong to later work packages.

---

## Exit Criteria

Work Package 3.1 is complete when:

- A venture can be created with all sections populated
- A human can understand the venture without AI help
- State can be changed explicitly and tracked
- No intelligence or inference is required to reason about the venture


