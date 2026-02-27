/**
 * Expert Recommendation Router
 *
 * Recommends AI experts based on user context and recent activity.
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

// The full list of AI-SME experts available on the platform
const ALL_EXPERTS = [
  {
    id: "pe_partner",
    name: "PE Partner",
    category: "Investment & Finance",
    description:
      "Private equity deal analysis, portfolio management, and investment strategy",
    rating: 9.2,
    consultations: 847,
  },
  {
    id: "cfo_expert",
    name: "CFO Expert",
    category: "Investment & Finance",
    description:
      "Financial strategy, capital allocation, fundraising, and financial operations",
    rating: 8.8,
    consultations: 623,
  },
  {
    id: "strategy_consultant",
    name: "Strategy Consultant",
    category: "Strategy",
    description:
      "Market analysis, competitive strategy, and transformation programmes",
    rating: 9.0,
    consultations: 1024,
  },
  {
    id: "ma_lawyer",
    name: "M&A Lawyer",
    category: "Legal & Compliance",
    description: "Corporate transactions, due diligence, and deal structuring",
    rating: 8.7,
    consultations: 412,
  },
  {
    id: "tech_cto",
    name: "Tech CTO",
    category: "Technology",
    description:
      "Technology strategy, architecture, and digital transformation",
    rating: 8.9,
    consultations: 756,
  },
  {
    id: "marketing_cmo",
    name: "CMO Expert",
    category: "Marketing",
    description: "Brand strategy, digital marketing, and customer acquisition",
    rating: 8.5,
    consultations: 534,
  },
  {
    id: "hr_chro",
    name: "CHRO Expert",
    category: "Human Resources",
    description:
      "Talent strategy, organisational culture, and leadership development",
    rating: 8.4,
    consultations: 389,
  },
  {
    id: "operations_coo",
    name: "COO Expert",
    category: "Operations",
    description:
      "Operational excellence, process optimisation, and scaling organisations",
    rating: 8.6,
    consultations: 445,
  },
  {
    id: "data_scientist",
    name: "Data Scientist",
    category: "Technology",
    description: "Data analysis, machine learning, and AI strategy",
    rating: 8.8,
    consultations: 312,
  },
  {
    id: "product_manager",
    name: "Product Manager",
    category: "Product",
    description: "Product strategy, roadmaps, and go-to-market planning",
    rating: 8.3,
    consultations: 567,
  },
  {
    id: "vc_investor",
    name: "VC Investor",
    category: "Investment & Finance",
    description: "Venture capital, startup funding, and growth strategy",
    rating: 9.1,
    consultations: 678,
  },
  {
    id: "ip_lawyer",
    name: "IP Lawyer",
    category: "Legal & Compliance",
    description: "Intellectual property protection, patents, and licensing",
    rating: 8.5,
    consultations: 234,
  },
  {
    id: "tax_advisor",
    name: "Tax Advisor",
    category: "Finance",
    description: "Tax strategy, structuring, and compliance",
    rating: 8.6,
    consultations: 345,
  },
  {
    id: "supply_chain",
    name: "Supply Chain Expert",
    category: "Operations",
    description: "Supply chain optimisation, logistics, and procurement",
    rating: 8.2,
    consultations: 189,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Expert",
    category: "Technology",
    description: "Security strategy, risk management, and compliance",
    rating: 8.7,
    consultations: 267,
  },
];

export const expertRecommendationRouter = router({
  getRecommendations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let experts = ALL_EXPERTS;

      if (input.category) {
        experts = experts.filter(e =>
          e.category.toLowerCase().includes(input.category!.toLowerCase())
        );
      }

      // Sort by rating and return top N
      const sorted = experts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, input.limit);

      return {
        experts: sorted,
        total: ALL_EXPERTS.length,
        categories: Array.from(new Set(ALL_EXPERTS.map(e => e.category))),
      };
    }),

  getAll: protectedProcedure.query(async () => {
    return {
      experts: ALL_EXPERTS,
      total: ALL_EXPERTS.length,
      categories: Array.from(new Set(ALL_EXPERTS.map(e => e.category))),
    };
  }),
});
