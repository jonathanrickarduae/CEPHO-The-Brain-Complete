/**
 * Funding Assessment Service
 * Provides information about government funding programs
 */

export const ALL_FUNDING_PROGRAMS = [
  {
    id: "uae-innovation-grant",
    country: "UAE",
    name: "UAE Innovation Grant",
    type: "grant",
    description: "Government grant for innovative technology projects",
    maxAmount: 500000,
    eligibility: ["UAE-based companies", "Technology focus", "Innovation component"],
  },
  {
    id: "uk-innovate-uk",
    country: "UK",
    name: "Innovate UK Smart Grants",
    type: "grant",
    description: "Funding for game-changing and commercially viable R&D innovation",
    maxAmount: 1000000,
    eligibility: ["UK-registered companies", "R&D project", "Commercial viability"],
  },
];

export const STRATEGIC_FRAMEWORK = {
  market_analysis: {
    questions: [
      "What is the total addressable market (TAM)?",
      "Who are the key competitors?",
      "What are the market trends?",
    ],
  },
  feasibility: {
    questions: [
      "What resources are required?",
      "What are the technical challenges?",
      "What is the timeline?",
    ],
  },
  competitive_landscape: {
    questions: [
      "Who are the direct competitors?",
      "What is our competitive advantage?",
      "What are the barriers to entry?",
    ],
  },
  financial_viability: {
    questions: [
      "What is the revenue model?",
      "What are the cost structures?",
      "What is the break-even point?",
    ],
  },
  risk_assessment: {
    questions: [
      "What are the key risks?",
      "What are the mitigation strategies?",
      "What are the contingency plans?",
    ],
  },
};
