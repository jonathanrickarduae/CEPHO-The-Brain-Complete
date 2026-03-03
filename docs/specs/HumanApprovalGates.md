# Human Approval Gates

Phase: 5
Status: Draft

## 1. Introduction

Human Approval Gates are a critical component of the Phase 5 architecture, serving as the primary mechanism for ensuring user control and oversight. These gates are mandatory, non-bypassable checkpoints within an `Autonomous Workflow` where the system must halt and receive explicit confirmation from the user before proceeding.

This design ensures that while the platform can execute complex tasks autonomously, all strategic decisions and high-stakes actions remain under the ultimate authority of the human user.

## 2. Gate Definition and Placement

Gates are defined within the workflow templates and are strategically placed before any action that is:

- **Irreversible:** Such as sending a mass email, making a public announcement, or deleting a large amount of data.
- **High-Cost:** Involving significant financial expenditure, such as launching a large-scale advertising campaign.
- **Strategically Significant:** Defining the direction of the venture, such as approving the final product design or confirming a pivot in marketing strategy.
- **Legally Binding:** Such as agreeing to the terms of service for a new software tool or generating a formal legal document.

### 2.1. Example Gates in the `NewVentureLaunch` Workflow

- **Gate:** `Approve Final Product Definition`
- **Gate:** `Approve MVP Budget and Timeline`
- **Gate:** `Approve Final Brand Identity and Marketing Copy`
- **Gate:** `Final Launch Approval`

## 3. The Approval Process

1.  **Workflow Suspension:** When a workflow reaches a gate, the Orchestrator changes the workflow status to `suspended` and creates a new `ApprovalRequest` object.
2.  **User Notification:** The user is notified via their preferred channel (e.g., email, push notification) that their approval is required.
3.  **Review and Decision:** The user is presented with a clear, concise summary of the decision being requested, including all relevant context and pre-computed outcomes. The user can `Approve` or `Reject` the request.
4.  **Workflow Resumption/Termination:**
    - On `Approve`, the `ApprovalRequest` is marked as `approved`, and the Orchestrator resumes the workflow.
    - On `Reject`, the `ApprovalRequest` is marked as `rejected`, and the Orchestrator terminates the workflow, flagging it for manual review.

## 4. The Approval Request UI

The user interface for an approval request is designed for clarity and decisive action. It must contain:

- **A clear question:** e.g., "Do you approve the launch of the marketing campaign with a budget of $10,000?"
- **A summary of the context:** Key data and reports that led to this decision point.
- **A preview of the outcome:** What will happen immediately after approval (e.g., "The campaign will go live on Google and Facebook.").
- **Explicit `Approve` and `Reject` buttons.**

## 5. Data Model and API

### 5.1. Data Model: `ApprovalRequest`

```json
{
  "approvalId": "uuid",
  "workflowId": "uuid",
  "gateName": "Final Launch Approval",
  "status": "pending | approved | rejected",
  "requestSummary": "Approve the launch of the new SaaS product...",
  "contextDocs": ["/path/to/final_checklist.md"],
  "requestedBy": "Orchestrator",
  "createdAt": "timestamp",
  "resolvedAt": "timestamp",
  "resolvedBy": "user_id"
}
```

### 5.2. API Endpoint: `POST /api/v1/approvals/{approvalId}/decision`

- **Description:** Allows the user to submit their decision for a pending approval request.
- **Request Body:**
  ```json
  {
    "decision": "approved" // or "rejected"
  }
  ```
- **Response:**
  - `200 OK`: If the decision is successfully recorded.

---
