# Appendix Q: The Digital Twin Architecture

## 1. Overview
The Digital Twin is the cognitive core of the CEPHO.AI platform. It is a dynamic, multi-faceted model of the user (Victoria) that allows the system to think, act, and communicate *as she would*. It is not a single component, but an integrated system of data ingestion, cognitive modeling, and behavioral simulation that touches every agent and every workflow.

## 2. Core Components

A fully functional Digital Twin requires the implementation of four distinct modules:

| Module ID | Module Name | Description |
|---|---|---|
| DT-MOD-01 | **Ingestion & Calibration Engine** | Continuously gathers data from multiple sources to build and refine the twin's understanding of the user. |
| DT-MOD-02 | **Cognitive & Personality Model** | A structured, queryable data model representing the user's personality, priorities, communication style, and decision-making heuristics. |
| DT-MOD-03 | **Behavioral Simulation & Prediction** | Uses the Cognitive Model to predict the user's likely reaction to events and to simulate her behavior in various scenarios. |
| DT-MOD-04 | **Dynamic Prompt Assembler** | Translates the Cognitive Model into real-time, context-aware system prompts for every AI agent interaction. |

## 3. Module Implementation Plan

### DT-MOD-01: Ingestion & Calibration Engine (Phase 2)
This module is responsible for populating the Cognitive Model. It runs continuously in the background.

- **Initial Calibration:**
    - **Digital Twin Questionnaire:** The existing `DigitalTwinQuestionnaire.tsx` will be the entry point. It will ask direct questions about communication preferences, risk tolerance, core values, and strategic goals.
    - **Historical Document Analysis:** The user will upload a corpus of her past writing (emails, reports, memos). The engine will analyze this corpus to extract key themes, vocabulary, and communication patterns.
- **Continuous Calibration:**
    - **Calendar & Email Analysis:** The engine will analyze calendar events and email content (metadata and body) to understand priorities, network, and communication habits.
    - **Decision Logging:** Every time the user approves, denies, or modifies an agent's suggestion, the decision is logged. This is the most critical input for refining the twin's understanding of the user's judgment.
    - **Outcome Tracking:** The engine uses the data from the Outcome Tracking & ROI module (Phase 5) to learn which types of actions lead to successful outcomes for the user.

### DT-MOD-02: Cognitive & Personality Model (Phase 2)
This is a new set of tables in the Supabase database that stores the Digital Twin's state.

- **`digitalTwinCognitiveModel` Table:**
    - `userId` (PK)
    - `communicationStyle` (JSONB: `{ formality: float, verbosity: float, humor: float, use_emoji: boolean }`)
    - `riskTolerance` (float, 0-1)
    - `decisionHeuristics` (text[]: e.g., `['prefers_data', 'values_consensus']`)
    - `strategicPriorities` (JSONB: `[{ priority: string, weight: float }]`)
    - `values` (text[]: e.g., `['efficiency', 'team_wellbeing']`)
- **`digitalTwinVocabulary` Table:**
    - `userId` (PK)
    - `preferredTerms` (JSONB: `{ 'old_term': 'new_term' }`)
    - `avoidedTerms` (text[])
    - `commonPhrases` (text[])

### DT-MOD-03: Behavioral Simulation & Prediction (Phase 3)
This module allows agents to 
query the Cognitive Model to answer 'What would Victoria do?'. This is critical for agent autonomy.

- **`predictUserAction(scenario)`:** Given a scenario (e.g., an incoming email with a specific sentiment), this function predicts Victoria's most likely action (e.g., 'ignore', 'reply positively', 'delegate').
- **`simulateActionOutcome(action)`:** Before an agent takes a significant action (e.g., sending an email on Victoria's behalf), it can simulate the action. The module will return a predicted outcome and a confidence score, based on the Cognitive Model.
- **Shadow Mode Integration:** During the initial "Shadow Mode" learning period (Phase 2), all agent actions are first run through the simulation. The agent then presents its proposed action and the predicted outcome to Victoria for approval, rather than executing it directly. This builds trust and provides a rich source of decision-logging data.

### DT-MOD-04: Dynamic Prompt Assembler (Phase 2)
This is the real-time bridge between the Digital Twin's static model and the dynamic world of LLM interactions. It is a service, not a data store.

- **Context-Aware Prompt Generation:** Before every call to an LLM, the system calls the Dynamic Prompt Assembler.
- **Personality Injection:** The assembler fetches the user's `communicationStyle`, `values`, and `vocabulary` from the Cognitive Model.
- **Goal Injection:** It injects the user's current `strategicPriorities` into the prompt to ensure the agent's response is aligned with what matters most to the user *right now*.
- **Example Assembled Prompt Snippet:**

> You are an AI assistant to Victoria. Your communication style must be formal (formality: 0.8) and concise (verbosity: 0.4). Her core values are 'efficiency' and 'team_wellbeing'. Her current top strategic priority is 'launching Project X'. Frame your response with this in mind. Avoid using the term 'synergy'; she prefers 'collaboration'.

This ensures that every agent, from the Financial Analyst to the Chief of Staff, communicates and acts in a way that is a true extension of the user, making the platform a genuine Digital Twin.
