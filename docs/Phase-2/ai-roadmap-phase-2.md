# AI Roadmap - Phase 2

Phase: 2
Status: Consolidated Draft

---

## 1. Model Evolution

Phase 2 will focus on diversifying our use of AI models, moving from a one-size-fits-all approach to a more nuanced, cost-effective, and capable strategy.

| Model Type | Phase 1 Implementation | Phase 2 Strategy |
|---|---|---|
| **Large Language Models (LLMs)** | Primarily used a single, high-end model (e.g., GPT-4) for all text generation tasks. | **Dynamic Routing:** Implement a model router that selects the best model for the job based on a cost/performance analysis. Use GPT-4 for complex reasoning, but a smaller, faster model (e.g., GPT-3.5-Turbo, Claude Haiku) for summarization, classification, and data extraction. |
| **Embedding Models** | Used a single embedding model for all semantic search tasks. | **Specialized Embeddings:** Evaluate and potentially implement specialized embedding models for different data types (e.g., a model fine-tuned on code for code search, a different one for general text). |
| **Local Models** | No local models used. | **Hybrid Approach:** For high-volume, low-complexity tasks like sentiment analysis or entity recognition, deploy a small, efficient model (e.g., from the `transformers.js` library) directly within our infrastructure to reduce latency and cost. |

## 2. Prompt Intelligence

Improving the quality and contextuality of our prompts is a key focus for enhancing the AI's performance.

| Technique | Description | Implementation Plan |
|---|---|---|
| **Dynamic Prompt Injection** | Prompts will be dynamically constructed based on the user, their preferences, and the immediate context of their task. | A new `PromptBuilder` service will be created. It will fetch user preferences, recent activity, and relevant data from the database to construct highly contextualized prompts. |
| **Few-Shot Learning** | For complex tasks, the prompt will include several examples of successful completions to guide the model. | The `PromptBuilder` will have access to a library of high-quality examples for different task types. |
| **Prompt Performance Monitoring** | We will track the performance of different prompt templates to identify which ones are most effective. | A new `PromptPerformance` table will be added to the database to log prompt versions, completion quality (based on user feedback), and cost. |

## 3. Agent Orchestration

The most significant leap in AI capability for Phase 2 is the introduction of an agentic framework. This transforms the AI from a passive tool into a proactive assistant.

| Component | Description | Architecture |
|---|---|---|
| **Agent Service** | The core orchestrator that manages the lifecycle of an AI agent performing a task. | A new, long-running Node.js service (`AgentService`) will be created. It will manage agent state in a Redis cache for persistence and speed. |
| **Tool Library** | A collection of well-defined, single-purpose tools that an agent can use. | Each tool will be a simple function with a clear input/output schema and a description of what it does. Examples: `webSearch(query)`, `readGmail()`, `createCalendarEvent(details)`. |
| **Task Planner** | A meta-AI function that takes a user's goal and breaks it down into a sequence of steps that the agent can execute. | The `AgentService` will make an initial call to an LLM with a specialized "planner" prompt, which will return a JSON object representing the task plan. |
| **State Management** | The mechanism for an agent to maintain context and memory across multiple steps. | The `AgentService` will use Redis to store a "scratchpad" for each active agent, containing the goal, the plan, the results of each step, and any user feedback received mid-task. |
