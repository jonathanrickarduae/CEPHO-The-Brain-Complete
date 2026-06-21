# Project Genesis Blueprint

## The Workflow Discovery

This blueprint captures the proven workflow for transforming a voice note into a fully researched, expert-driven deliverable. The process was validated through the creation of an award-winning graduate program for the Middle East.

---

## Phase 1: Voice Note Intake

The journey begins with a voice note. A stakeholder records their vision, requirements, and context in a 2-5 minute voice message. This captures nuance, emotion, and implicit requirements that text often misses.

**What happens:**

The voice note is transcribed using speech-to-text technology. The transcription is then analyzed to extract key information that pre-populates the Project Genesis wizard questions.

**Pre-population targets:**

| Wizard Question | Extracted From Voice Note |
|-----------------|---------------------------|
| What are we trying to achieve? | Primary objective statements |
| Who is this for? | Target audience mentions |
| Internal or external project? | Context clues about stakeholders |
| Timeline expectations | Any deadline or urgency mentions |
| Success criteria | Outcome descriptions |
| Constraints or requirements | Budget, resource, or scope mentions |

**Value proposition:** Rather than asking the user 15 questions, the system pre-fills 10-12 based on voice analysis, requiring only confirmation or refinement.

---

## Phase 2: Project Genesis Wizard

Once the voice note has pre-populated the intake, the wizard validates and enriches the brief through targeted questions.

**Core wizard questions:**

1. What is the primary objective? (pre-filled from voice)
2. Who is the target audience? (pre-filled from voice)
3. Is this internal or external facing?
4. What is the timeline? (Immediate / 1 week / 1 month / Ongoing)
5. What does success look like?
6. Are there budget or resource constraints?
7. Who needs to approve the final output?
8. What format should the deliverable take?

**Output:** A structured project brief that can be handed to the AI system.

---

## Phase 3: Initial Expert Consultation

With the brief defined, the system assembles a preliminary team of AI-SME experts to conduct initial research.

**How it works:**

The Digital Twin (Chief of Staff) analyzes the project brief and selects 5-8 relevant experts from the 290+ available. These experts conduct parallel research on their domains.

**Example for Graduate Program project:**

| Expert | Domain | Research Focus |
|--------|--------|----------------|
| Dr. Fatima Al-Mansouri | L&D (GCC) | Regional training best practices |
| Dr. Sarah Mitchell | L&D (Western) | Global program benchmarks |
| Dr. Ahmed Al-Rashid | Behavioural Psychology (GCC) | Motivation and engagement |
| Sheikh Khalid Al-Thaqafi | GCC Culture | Cultural considerations |
| Corporate: McKinsey | Strategy | Industry frameworks |

**Output:** Initial research synthesis with key findings, gaps identified, and recommendations for deeper exploration.

---

## Phase 4: Project Lead Assignment

Every project needs a single point of accountability. The system assigns a Project Lead based on the project type.

**Assignment logic:**

| Project Type | Recommended Lead |
|--------------|------------------|
| Learning & Development | L&D Expert (GCC or Western based on context) |
| Investment Analysis | Warren Buffett persona |
| Marketing Campaign | Brand Strategy Expert |
| Legal/Compliance | Legal Expert |
| Technology Build | Tech Expert |
| Cross-cultural Initiative | Culture Expert |

The Project Lead becomes the primary interface for the user, coordinating the expert team and synthesizing outputs.

---

## Phase 5: Expert Team Assembly (12-Person Team)

For significant projects, a full 12-person expert team is assembled. This team provides diverse perspectives essential for comprehensive deliverables.

**The 12-Person Team Structure:**

| Role | Purpose | Example for Graduate Program |
|------|---------|------------------------------|
| 1. Project Lead | Coordination and synthesis | Dr. Fatima Al-Mansouri (L&D GCC) |
| 2. Domain Expert (GCC) | Local expertise | Sheikh Khalid Al-Thaqafi (Culture) |
| 3. Domain Expert (Western) | Global benchmarks | Dr. James Crawford (Western Culture) |
| 4. Target Audience Voice 1 | User perspective | Noura Al-Suwaidi (GCC Gen Z Female) |
| 5. Target Audience Voice 2 | User perspective | Sultan Al-Harthi (GCC Gen Z Male) |
| 6. Recent Graduate | Fresh perspective | Mariam Al-Blooshi (GCC Engineering Grad) |
| 7. Behavioural Expert | Engagement design | Dr. Ahmed Al-Rashid (Behavioural GCC) |
| 8. Storytelling Expert | Narrative and messaging | Creative Director persona |
| 9. Visual/Design Expert | Presentation and materials | Design Expert persona |
| 10. Strategy Consultant | Framework and structure | Corporate: McKinsey |
| 11. Quality Reviewer | Standards and benchmarks | Industry Expert |
| 12. Digital Twin | Coordination and user alignment | Chief of Staff |

**Team composition principles:**

The team always includes at least one GCC perspective and one Western perspective for cross-cultural projects. Target audience voices (Gen Z, recent graduates) provide reality checks. The Digital Twin ensures alignment with user preferences and past decisions.

---

## Phase 6: Deep Dive Research

With the full team assembled, each expert conducts deep research in their domain.

**Research outputs:**

Each expert produces a focused brief covering their domain. For the graduate program example:

| Expert | Deliverable |
|--------|-------------|
| L&D Expert | Best practices for graduate programs globally |
| Culture Expert | GCC-specific considerations and adaptations |
| Gen Z Voices | What young professionals actually want |
| Recent Graduate | Real experience and expectations |
| Behavioural Expert | Engagement and retention strategies |
| Strategy Consultant | Program structure and KPIs |

**Synthesis meeting:** The Project Lead synthesizes all inputs into a coherent recommendation.

---

## Phase 7: Deliverable Creation

Based on the research synthesis, the team creates the final deliverable.

**Deliverable types:**

| Format | When to Use |
|--------|-------------|
| Presentation (PPT) | Stakeholder pitches, board meetings |
| Report (PDF) | Detailed analysis, business cases |
| Executive Summary | Quick decision documents |
| Implementation Plan | Action-oriented projects |
| Workshop Materials | Training or facilitation |

**Quality gates:**

Before delivery, the output passes through:

1. **Storytelling Expert review:** Is the narrative compelling?
2. **Visual Expert review:** Is the design professional?
3. **Digital Twin review:** Does this match user preferences?
4. **Target Audience review:** Would this resonate with the intended audience?

---

## Phase 8: User Review and Iteration

The deliverable is presented to the user for feedback.

**Review interface:**

The user can provide feedback through voice note, text, or direct annotation. The expert team iterates based on feedback until approval.

**Approval workflow:**

1. Initial draft presented
2. User provides feedback (voice or text)
3. Expert team revises
4. Second review
5. Final approval or further iteration

---

## Implementation Recommendations

**For Project Genesis wizard:**

Add a "Start with Voice Note" option at the beginning of project creation. The voice note is transcribed and analyzed before presenting the wizard, with fields pre-populated based on the analysis.

**For expert team assembly:**

Create a "Suggest Expert Team" function that analyzes the project brief and recommends a 12-person team. The user can accept, modify, or manually select experts.

**For project lead assignment:**

Automatically suggest a Project Lead based on project type, with the option for user override.

**For voice note integration:**

The floating voice note button should have a "New Project" mode that routes directly to Project Genesis with transcription.

---

## Technical Requirements

**Voice transcription:**

Use the existing Whisper API integration for transcription. Add entity extraction to identify key project parameters.

**Expert selection algorithm:**

Match project keywords and categories to expert specialties. Weight by performance scores and past success on similar projects.

**Team coordination:**

The Digital Twin (Chief of Staff) manages the expert team, ensuring all perspectives are captured and synthesized.

**Progress tracking:**

Show project status in Workflow with clear phase indicators (Intake → Research → Assembly → Deep Dive → Creation → Review → Complete).

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time from voice note to initial research | Under 30 minutes |
| Expert team assembly time | Under 5 minutes |
| First draft delivery | Within timeline specified |
| User satisfaction with pre-population | 80%+ accuracy |
| Iteration cycles before approval | 2 or fewer |

---

## Appendix: Expert Team Templates

**Template A: Learning & Development Project**

1. L&D Expert (GCC)
2. L&D Expert (Western)
3. Behavioural Psychologist
4. Culture Expert (GCC)
5. Gen Z Female (GCC)
6. Gen Z Male (GCC)
7. Recent Graduate
8. HR Expert
9. Storytelling Expert
10. Visual Designer
11. Strategy Consultant
12. Digital Twin

**Template B: Investment Analysis Project**

1. Warren Buffett (Value Investing)
2. Ray Dalio (Macro)
3. Cathie Wood (Growth)
4. Regional Market Expert
5. Industry Specialist
6. Risk Analyst
7. Financial Modeler
8. Legal/Compliance Expert
9. Tax Expert
10. Storytelling Expert
11. Visual Designer
12. Digital Twin

**Template C: Marketing Campaign Project**

1. Brand Strategy Expert
2. Consumer Psychology Expert
3. Culture Expert (GCC)
4. Culture Expert (Western)
5. Gen Z Female
6. Gen Z Male
7. Creative Director
8. Visual Designer
9. Copywriter
10. Media Strategist
11. Analytics Expert
12. Digital Twin

---

*This blueprint captures the proven workflow for transforming stakeholder vision into expert-driven deliverables. The process ensures diverse perspectives, cultural awareness, and user alignment at every stage.*
