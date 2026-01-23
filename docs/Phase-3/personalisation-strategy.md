# Personalisation Strategy
Phase: 3
Status: Consolidated Draft

## 1. Personalisation Framework

The personalisation strategy is designed to tailor the user experience based on the user's role, industry, and goals. This is achieved through a combination of explicit data collection during onboarding and implicit data analysis of user behavior.

## 2. Customer Onboarding & Personalisation

The customer onboarding process is the primary mechanism for explicit personalisation.

| Onboarding Step | Description | Personalisation Goal |
|---|---|---|
| **Personalization Questionnaire** | A short questionnaire during the guided setup wizard asks the user about their role (e.g., CEO, Head of Quality, Marketing Manager), industry, and primary objectives. | To tailor the initial dashboard, recommended features, and content to the user's specific context. |
| **Interactive Product Tour** | The product tour highlights features most relevant to the user's stated goals. | To accelerate time-to-value by focusing the user on the most impactful functionalities for their needs. |
| **Sample Data and Templates** | The platform provides sample data and pre-built templates relevant to the user's industry. | To help users get started quickly and understand how the platform can be applied to their specific use cases. |

## 3. AI-Driven Personalisation

Beyond onboarding, the platform will use AI to implicitly personalize the user experience.

-   **Personalized Recommendations:** The AI SME Expert Panel will provide recommendations that are tailored to the user's industry and the specific challenges identified in their data (e.g., from the QMS integration).
-   **Proactive Support:** The system will analyze user behavior to identify potential struggles or areas of confusion, triggering proactive support outreach (e.g., in-app messages with links to relevant help articles).
-   **Content Personalisation:** The content delivered through the platform (e.g., articles, insights) will be personalized based on the user's interests and the topics they engage with most.

## 4. Data Model for Personalisation

The `user_personalization` table will store the explicit data collected during onboarding.

| Column Name | Data Type | Description |
|---|---|---|
| `user_id` | `INT` | Foreign key to the `users` table. |
| `question` | `VARCHAR(255)` | The question asked in the personalization questionnaire. |
| `answer` | `TEXT` | The user's answer to the question. |
