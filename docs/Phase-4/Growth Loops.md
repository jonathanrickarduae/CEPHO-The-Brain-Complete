
# Growth Loops
Phase: 4
Status: Draft

## 1. Philosophy

Our growth strategy transitions from a linear, funnel-based model to a system of compounding loops. A growth loop is a closed system where the output of one cycle becomes the input for the next, driving exponential growth. This is fundamental to achieving the cost-efficiency and scale targets of Phase 4.

## 2. Core Growth Loops

We will design, implement, and measure three primary growth loops.

### 2.1. The "Insight" Loop (Organic Content & SEO)

This loop turns platform usage into public-facing content, which in turn attracts new users.

**Diagram Description:**
- A user generates an output on the Cepho platform (e.g., a report, an analysis).
- The platform identifies a non-sensitive, valuable insight from this output.
- An anonymised, aggregated version of this insight is used to generate a public-facing content piece (e.g., a blog post, a market trend report).
- This content ranks on search engines (SEO) and is shared on social media.
- New users discover this content and sign up for the platform to generate their own insights.

| Step | Action | Metric | Owner |
|---|---|---|---|
| 1. **Generate Insight** | User creates valuable output. | `Outputs Generated` | Product |
| 2. **Extract & Anonymise** | AI identifies and generalises a shareable insight. | `Insights Identified` | AI/Growth |
| 3. **Publish Content** | A blog post or report is automatically generated. | `Content Published` | Growth |
| 4. **Acquire User** | New user signs up from the content. | `Signups from Content` | Growth |

**Trade-off:** Requires a robust system for ensuring data privacy and anonymisation. We will be overly conservative initially, only sharing high-level, aggregated trends.

### 2.2. The "Referral" Loop (Viral & Incentivised Sharing)

This loop encourages users to invite others directly, creating a classic viral growth mechanism.

**Diagram Description:**
- An existing user (User A) is on the platform.
- User A is prompted to share a specific feature or benefit with a colleague (User B).
- The prompt is contextual (e.g., "Share this report with your team").
- User A sends an invite, which contains a unique referral link.
- User B signs up using the link.
- Both User A and User B receive a small reward (e.g., extra credits, access to a premium feature for a limited time).

| Step | Action | Metric | Owner |
|---|---|---|---|
| 1. **Prompt Share** | User is presented with a compelling reason to share. | `Share Prompts Shown` | Product |
| 2. **Send Invite** | User sends an invitation. | `Invites Sent` | Growth |
| 3. **Acquire User** | New user signs up from the invite. | `Viral Signups` | Growth |
| 4. **Reward** | Both users receive a benefit. | `Rewards Claimed` | Product |

**Trade-off:** Over-incentivising can lead to low-quality users. The reward must be tied to platform value, not just signups.

### 2.3. The "Collaboration" Loop (Product-Led Growth)

This loop is built around features that are inherently more valuable when used with others.

**Diagram Description:**
- A user (User A) is using a collaborative feature (e.g., a shared workspace, a multi-user project).
- To fully utilise the feature, User A must invite a team member (User B).
- User A invites User B directly within the product flow.
- User B signs up to access the shared workspace or project.
- User B now has their own account and can start their own projects, potentially inviting more users.

| Step | Action | Metric | Owner |
|---|---|---|---|
| 1. **Use Collaborative Feature** | User engages with a feature designed for teams. | `Collaborative Features Used` | Product |
| 2. **Invite Collaborator** | User invites a team member to their workspace. | `Collaborator Invites Sent` | Product |
| 3. **Acquire User** | New user signs up to collaborate. | `Collaborative Signups` | Product |
| 4. **New User Activation** | The new user starts their own work on the platform. | `New User Activation Rate` | Growth |

**Trade-off:** Requires a more complex team and permissions model. This loop is most effective for B2B use cases and must be a core part of the product design, not an add-on.

---
*Execution of these loops will be managed via the Experimentation Framework to measure impact and iterate quickly.* 

