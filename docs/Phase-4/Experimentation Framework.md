
# Experimentation Framework
Phase: 4
Status: Draft

## 1. Core Principle

We will build a culture of hypothesis-driven development. Instead of debating what the best approach is, we will build a system to find out. The Experimentation Framework is the set of tools and processes that will enable us to run A/B tests and other experiments quickly, safely, and with statistically significant results. Our goal is to increase our **learning velocity** – the speed at which we can learn what our users want and how to best provide it.

## 2. The Experiment Lifecycle

Every experiment will follow a standardised lifecycle.

| Phase | Description | Owner |
|---|---|---|
| 1. **Hypothesis** | A clear, testable statement: "We believe that changing X will result in Y, and we will know this is true when we see Z." | Product/Growth |
| 2. **Design** | Define the experiment: What is the control? What is the variant? What is the target audience? What is the primary success metric? | Product/Growth |
| 3. **Implementation** | Build the variant and integrate it into the platform behind a feature flag. | Engineering |
| 4. **Execution** | Roll out the experiment to a small percentage of users. Monitor key metrics for any negative impacts. | Engineering/Growth |
| 5. **Analysis** | Once the experiment has reached statistical significance, analyse the results. Did the variant win? Did it have any unexpected side effects? | Growth/Data Science |
| 6. **Decision** | Based on the analysis, decide to either roll out the feature to 100% of users, iterate on the design, or discard the idea. | Product/Growth |

## 3. Tooling & Infrastructure

- **Feature Flagging System:** We will use a robust feature flagging service (e.g., LaunchDarkly, or a well-supported open-source alternative). This is the core infrastructure that allows us to turn experiments on and off for specific user segments without deploying new code.
- **Experimentation Platform:** This platform will manage the lifecycle of experiments, from defining the hypothesis to analysing the results. It will be integrated with our feature flagging system and our analytics platform.
- **Analytics Platform:** This is the system (as defined in `metrics-and-observability.md`) that collects and processes the data needed to determine the outcome of an experiment.

## 4. Types of Experiments

We will run experiments across the entire user experience.

| Category | Example Experiment |
|---|---|
| **Growth & Onboarding** | Test different signup flows, referral rewards, or onboarding checklists. |
| **Feature Engagement** | Test different UI/UX for a new feature to see which one drives higher adoption. |
| **AI & Prompts** | A/B test different prompt templates to see which one has a higher user satisfaction score. |
| **Pricing & Packaging** | Test different price points or feature bundles on new users. |

## 5. Guiding Rules

- **Never test on all users at once.** Start with a small percentage (e.g., 1-5%) and ramp up.
- **Always have a clear primary metric.** It is easy to get lost in secondary metrics. Know what you are trying to move.
- **Don't stop an experiment early just because it looks good (or bad).** Wait for statistical significance.
- **Share all results, whether the experiment was a success or a failure.** A failed experiment that provides a learning is still a win.

---
*The Experimentation Framework is the engine of our product strategy. It will replace opinions with data and allow us to build a product that is proven to work.* 
