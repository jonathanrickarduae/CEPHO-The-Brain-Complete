# PROJECT FOLDER TEMPLATE

**CEPHO.AI Standard Project Structure**
**Version:** 1.0
**Last Updated:** January 16, 2026

---

## Purpose

This template defines the standard folder structure and documentation requirements for all CEPHO.AI projects. Following this structure ensures consistency, enables efficient navigation, and supports the quality assurance process.

---

## Standard Folder Structure

```
[PROJECT_NAME]/
├── 00_Project_Brief/
│   ├── PROJECT_BRIEF.md
│   ├── SCOPE_DOCUMENT.md
│   └── STAKEHOLDER_REGISTER.md
│
├── 01_Planning/
│   ├── PROJECT_PLAN.md
│   ├── RESOURCE_MATRIX.md
│   ├── RISK_REGISTER.md
│   └── SME_TEAM_ROSTER.md
│
├── 02_Working_Documents/
│   ├── [Work products organized by phase]
│   └── NOTES/
│
├── 03_Deliverables/
│   ├── DRAFT/
│   └── FINAL/
│
├── 04_QA_Records/
│   ├── COS_REVIEWS/
│   ├── SECONDARY_AI_REVIEWS/
│   └── APPROVAL_LOG.md
│
├── 05_Communications/
│   ├── MEETING_NOTES/
│   └── STAKEHOLDER_UPDATES/
│
└── 06_Archive/
    ├── LESSONS_LEARNED.md
    └── FINAL_REPORT.md
```

---

## Required Documents

### Project Initiation (00_Project_Brief)

**PROJECT_BRIEF.md** - High-level project overview including objectives, success criteria, timeline, and key stakeholders. This document serves as the single source of truth for project scope.

**SCOPE_DOCUMENT.md** - Detailed scope definition including deliverables, exclusions, assumptions, and constraints. Must be approved by Chief of Staff before execution begins.

**STAKEHOLDER_REGISTER.md** - List of all project stakeholders with their roles, interests, influence levels, and communication preferences.

### Planning Phase (01_Planning)

**PROJECT_PLAN.md** - Detailed execution plan with phases, milestones, dependencies, and timeline. Updated throughout project lifecycle.

**RESOURCE_MATRIX.md** - Allocation of SME experts and other resources to project tasks. Includes availability and utilization tracking.

**RISK_REGISTER.md** - Identified risks with probability, impact, mitigation strategies, and owners. Updated as new risks emerge.

**SME_TEAM_ROSTER.md** - List of assigned AI SME experts with their roles, specializations, and performance notes.

### Quality Assurance (04_QA_Records)

**APPROVAL_LOG.md** - Chronological record of all QA reviews and approvals. Includes scores, feedback, and revision history.

### Project Closure (06_Archive)

**LESSONS_LEARNED.md** - Documented insights from project execution including what worked well, challenges encountered, and recommendations for future projects.

**FINAL_REPORT.md** - Comprehensive project summary including objectives achieved, deliverables produced, metrics, and stakeholder feedback.

---

## Linking to Master Index

Each project folder must be registered in the CEPHO.AI Master Index under the 05_Active_Projects section. The registration includes:

- Project name and identifier
- Direct link to project folder
- Project status (Active/Complete/On Hold)
- Primary SME team assigned
- Key milestones and dates

This registration enables cross-project visibility and supports portfolio management.

---

## Process Integration

Projects created using this template automatically integrate with CEPHO.AI core processes:

**Project Genesis Workflow** - The folder structure aligns with Project Genesis phases, ensuring smooth execution flow.

**QA Protocol** - The 04_QA_Records folder provides the required documentation structure for dual verification reviews.

**SME Framework** - The SME_TEAM_ROSTER.md connects to the SME Framework for team assembly and feedback tracking.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-16 | Initial release | CEPHO.AI |
