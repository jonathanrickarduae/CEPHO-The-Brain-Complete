# Chief of Staff Role Definition

**Version:** 1.0  
**Effective Date:** 17 January 2026  
**Status:** ACTIVE  

---

## 1. Role Overview

The Chief of Staff serves as the **quality gatekeeper** for all CEPHO.Ai outputs. This role ensures that every document, report, presentation, or deliverable meets professional standards before reaching the user.

**Core Principle:** No output leaves CEPHO.Ai without Chief of Staff approval.

---

## 2. Primary Responsibilities

### 2.1 Quality Gate Function

The Chief of Staff is the **mandatory validation layer** between document generation and user delivery. Every output must pass through this gate.

| Responsibility | Description |
|----------------|-------------|
| Design Compliance | Verify all outputs follow CEPHO Master Design Guidelines |
| Content Quality | Ensure accuracy, completeness, and professional tone |
| Brand Consistency | Maintain CEPHO.Ai brand standards across all outputs |
| Rejection Authority | Power to reject and require regeneration of substandard work |

### 2.2 Validation Workflow

```
Document Request
       ↓
Document Generation
       ↓
Chief of Staff Review ←──────────────────┐
       ↓                                  │
   PASS?                                  │
   /    \                                 │
 YES     NO → Identify Issues → Regenerate
  ↓
Deliver to User
```

### 2.3 Never Deliver If

The Chief of Staff MUST reject any document that:

1. Uses incorrect CEPHO.Ai spelling or branding
2. Contains colors outside the approved palette
3. Uses wrong fonts or font sizes
4. Includes page numbers (not permitted)
5. Contains hyphens in compound words
6. References "Manus", "AI", "ChatGPT" or similar
7. Has poor text contrast (unreadable)
8. Missing header/footer elements
9. Incorrect file naming convention
10. Incomplete or inaccurate content

---

## 3. Quality Checklist

Before approving ANY document, the Chief of Staff must verify:

### 3.1 Brand Identity

| Check | Requirement |
|-------|-------------|
| ☐ | CEPHO.Ai spelled correctly (not Cepho, CEPHO.AI, etc.) |
| ☐ | Logo block present: black rectangle, white text, top left |
| ☐ | Pink accent line below header |
| ☐ | Footer present with document type and "Confidential" |
| ☐ | No page numbers anywhere |

### 3.2 Color Compliance

| Check | Requirement |
|-------|-------------|
| ☐ | Only approved colors: black, white, grey shades, pink accent |
| ☐ | Pink (#FF006E) used only for accents, not body elements |
| ☐ | Score cells: white text on dark backgrounds (green 80+, orange, red) |
| ☐ | Score cells: black text on light backgrounds (lime, yellow) |
| ☐ | No blue, purple, teal, or unapproved colors |

### 3.3 Typography

| Check | Requirement |
|-------|-------------|
| ☐ | Calibri font throughout (or approved fallback) |
| ☐ | Title: 24pt bold black |
| ☐ | Section headers: 18pt bold black |
| ☐ | Body text: 11pt regular dark grey |
| ☐ | No hyphens in compound words |
| ☐ | No italic text |

### 3.4 Structure

| Check | Requirement |
|-------|-------------|
| ☐ | Correct margins (20mm sides, 25mm top, 20mm bottom) |
| ☐ | Section dividers present (0.5pt light grey lines) |
| ☐ | Tables formatted correctly (light grey headers, proper borders) |
| ☐ | Callout boxes styled (light grey background, pink left accent) |

### 3.5 Content Quality

| Check | Requirement |
|-------|-------------|
| ☐ | Professional tone throughout |
| ☐ | No AI self-references (Manus, ChatGPT, AI assistant, etc.) |
| ☐ | Factually accurate information |
| ☐ | Complete and coherent narrative |
| ☐ | Appropriate for intended audience |

### 3.6 File Standards

| Check | Requirement |
|-------|-------------|
| ☐ | Correct naming: CEPHO_[Type]_[Subject]_[DDMMMYYYY].pdf |
| ☐ | Author field: blank or "X" |
| ☐ | Correct file format for document type |

---

## 4. Rejection Protocol

### 4.1 When to Reject

Reject immediately if ANY checklist item fails. Do not deliver partial compliance.

### 4.2 Rejection Process

1. **Identify** all specific failures from the checklist
2. **Document** what needs to be corrected
3. **Regenerate** the document with corrections applied
4. **Re-validate** against full checklist
5. **Repeat** until 100% compliance achieved
6. **Only then** deliver to user

### 4.3 User Visibility

The user should NEVER see:
- Failed validation attempts
- Partially compliant documents
- Documents requiring corrections
- Quality gate process details

The user should ONLY see:
- Fully validated, professional outputs
- Final approved documents

---

## 5. Proactive Quality Management

### 5.1 Pre-Generation Checks

Before generating any document, verify:

1. Design guidelines document is accessible
2. Correct template is selected for document type
3. All required inputs are available
4. Brand assets (logo, colors) are correctly configured

### 5.2 Process Improvement

Track and report:

| Metric | Purpose |
|--------|---------|
| Rejection rate | Identify systematic issues |
| Common failures | Target training/process improvements |
| Time to approval | Optimize generation quality |

### 5.3 Escalation

If a document cannot be brought to compliance after 3 regeneration attempts:

1. Pause delivery
2. Identify root cause
3. Fix underlying process issue
4. Resume with corrected process

---

## 6. Document Type Specific Requirements

### 6.1 Reports (KPI, Assessment, Research)

| Requirement | Specification |
|-------------|---------------|
| Title page | Centered title, subtitle with stage/framework |
| Executive summary | Light grey box with pink left accent |
| Data tables | Proper score coloring, SME scores visible |
| Validation section | Approval status, date, framework reference |

### 6.2 Briefing Papers

| Requirement | Specification |
|-------------|---------------|
| Length | Maximum 2 pages |
| Structure | Context → Key Points → Recommendations → Next Steps |
| Format | Paragraphs, not bullet points |

### 6.3 Executive Summaries

| Requirement | Specification |
|-------------|---------------|
| Length | Maximum 1 page |
| Structure | Situation → Analysis → Recommendation |
| Numbers | Avoid unless critical |

### 6.4 Presentations

| Requirement | Specification |
|-------------|---------------|
| Format | 16:9 aspect ratio |
| Background | White |
| Content | Maximum 6 points per slide |
| Images | Real photographs, not stock graphics |

---

## 7. Authority and Accountability

### 7.1 Authority

The Chief of Staff has full authority to:

- Reject any document that fails validation
- Require regeneration of substandard outputs
- Block delivery until compliance is achieved
- Escalate systematic quality issues

### 7.2 Accountability

The Chief of Staff is accountable for:

- Every document that reaches the user meeting standards
- Maintaining consistent quality across all outputs
- Protecting the CEPHO.Ai brand reputation
- Continuous improvement of output quality

---

## 8. Integration with Document Generation

### 8.1 Mandatory Integration

Every document generation process MUST include:

```python
def generate_document(request):
    # 1. Generate document
    document = create_document(request)
    
    # 2. Chief of Staff validation (MANDATORY)
    validation_result = chief_of_staff_validate(document)
    
    # 3. Handle result
    if validation_result.passed:
        return deliver_to_user(document)
    else:
        # Regenerate with corrections
        return generate_document(request, corrections=validation_result.issues)
```

### 8.2 Validation Function

The Chief of Staff validation must check:

1. Load CEPHO_MASTER_DESIGN_GUIDELINES.md
2. Run all checklist items
3. Return pass/fail with specific issues
4. Never allow bypass of this step

---

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 17 Jan 2026 | Initial release |

---

**The Chief of Staff role is essential to maintaining CEPHO.Ai quality standards. This gate cannot be bypassed.**
