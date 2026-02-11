# Feature Enhancements

Phase: 2
Status: Consolidated Draft

---

## 1. AI Capability Improvements

Phase 2 moves beyond single-prompt execution to more sophisticated, multi-step AI workflows. These enhancements focus on making the AI more proactive, context-aware, and capable of complex task completion.

| Feature | Description | Phase 1 State | Phase 2 Enhancement |
|---|---|---|---|
| **Agentic Workflows** | The ability for the AI to perform a series of actions to achieve a goal, such as researching a topic, summarizing findings, and then drafting an email. | Single, isolated prompt executions. | Introduction of a new `AgentService` that can orchestrate multi-step tasks using a predefined set of tools (e.g., web search, database query). |
| **Prompt Chaining** | The output of one AI model call is used as the input for another, allowing for progressive refinement of results. | No chaining capability. | The `AgentService` will manage a state object that is passed between steps, allowing for context to be built up over time. |
| **Dynamic Model Selection** | The ability to choose the best AI model (e.g., GPT-4 for reasoning, a cheaper model for summarization) for a specific sub-task. | Hardcoded model selection per feature. | The `AgentService` will include a routing mechanism to select the most appropriate model based on the task type and complexity. |
| **AI-SME Memory** | The AI will remember past interactions and feedback to improve its future responses and recommendations. | Stateless interactions. | A new `UserPreference` table will be added to the database to store user feedback and explicit preferences, which will be injected into relevant prompts. |

## 2. UX Improvements

User experience enhancements focus on making the platform more interactive, intuitive, and visually informative.

| Feature | Description | Phase 1 State | Phase 2 Enhancement |
|---|---|---|---|
| **Interactive Charts** | Data visualizations will be interactive, allowing users to hover for details, filter data, and drill down into specifics. | Static charts (rendered as images or basic SVGs). | Replace `recharts` with a more interactive library like `echarts` or `plotly.js` for key dashboards. |
| **Command Palette** | A global, keyboard-accessible command palette (e.g., `Cmd+K`) for quick navigation and action execution. | Navigation is purely mouse-driven via sidebar. | Implement a command palette using a library like `cmdk`, providing quick access to all major application functions. |
| **Two-Way Email Sync** | Users can not only read but also reply to and compose emails directly within the CEPHO.AI interface. | Read-only access to Gmail. | Requires requesting `gmail.send` scope and building a new email composition UI and corresponding backend service. |
| **Proactive Notifications** | The system will generate notifications for important events, such as an upcoming calendar event or a newly received, high-priority email. | No notification system. | A new `NotificationService` will be created, which can generate in-app notifications based on events from other services. |

## 3. Data Intelligence Enhancements

These features focus on extracting deeper insights from the user's connected data sources.

| Feature | Description | Phase 1 State | Phase 2 Enhancement |
|---|---|---|---|
| **Cross-Source Insights** | The AI can correlate information from multiple sources, such as identifying an email that relates to a specific calendar event. | Data sources are treated in isolation. | A new `CorrelationService` will run periodically to analyze new data and create links between related items in the database. |
| **Sentiment Analysis** | Incoming emails and documents can be automatically analyzed for sentiment (positive, negative, neutral). | No sentiment analysis. | Integrate a lightweight, on-premise sentiment analysis model or a third-party API to enrich email and document data. |
| **Entity Recognition** | The system can automatically identify and tag entities (people, companies, locations) mentioned in text. | No entity recognition. | Use a library like `spacy.js` or a cloud NLP service to extract entities from text content, storing them for future search and analysis. |
