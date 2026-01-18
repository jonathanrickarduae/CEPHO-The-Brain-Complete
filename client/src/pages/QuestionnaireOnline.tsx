import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  type: "scale" | "boolean";
  section: string;
  sectionNumber: number;
  scaleLabels?: { low: string; high: string };
}

const SECTIONS = [
  { id: 1, name: "Leadership & Vision", color: "from-blue-500 to-blue-600" },
  { id: 2, name: "Risk & Decision Making", color: "from-amber-500 to-amber-600" },
  { id: 3, name: "Team & Culture", color: "from-green-500 to-green-600" },
  { id: 4, name: "Communication Style", color: "from-purple-500 to-purple-600" },
  { id: 5, name: "Financial Philosophy", color: "from-emerald-500 to-emerald-600" },
  { id: 6, name: "Business Operations", color: "from-rose-500 to-rose-600" },
  { id: 7, name: "Innovation & Technology", color: "from-cyan-500 to-cyan-600" },
  { id: 8, name: "Market & Competition", color: "from-orange-500 to-orange-600" },
  { id: 9, name: "Personal Productivity", color: "from-indigo-500 to-indigo-600" },
  { id: 10, name: "Strategic Thinking", color: "from-fuchsia-500 to-fuchsia-600" },
];

// Full 200 questions across 10 sections
const ALL_QUESTIONS: Question[] = [
  // Section 1: Leadership & Vision (10 questions)
  { id: "A1", text: "I prefer to lead from the front vs. empower others to lead", type: "scale", section: "Leadership & Vision", sectionNumber: 1, scaleLabels: { low: "Empower others", high: "Lead from front" } },
  { id: "A2", text: "I focus on long-term vision vs. short-term results", type: "scale", section: "Leadership & Vision", sectionNumber: 1, scaleLabels: { low: "Short-term", high: "Long-term" } },
  { id: "A3", text: "I prefer consensus-building vs. decisive unilateral action", type: "scale", section: "Leadership & Vision", sectionNumber: 1, scaleLabels: { low: "Unilateral", high: "Consensus" } },
  { id: "A4", text: "I am comfortable with ambiguity in strategic direction", type: "scale", section: "Leadership & Vision", sectionNumber: 1, scaleLabels: { low: "Need clarity", high: "Comfortable" } },
  { id: "A5", text: "I believe in setting stretch goals vs. achievable targets", type: "scale", section: "Leadership & Vision", sectionNumber: 1, scaleLabels: { low: "Achievable", high: "Stretch goals" } },
  { id: "B1", text: "Do you have a written personal mission statement?", type: "boolean", section: "Leadership & Vision", sectionNumber: 1 },
  { id: "B2", text: "Do you regularly communicate vision to your team?", type: "boolean", section: "Leadership & Vision", sectionNumber: 1 },
  { id: "B3", text: "Do you believe leaders are born, not made?", type: "boolean", section: "Leadership & Vision", sectionNumber: 1 },
  { id: "B4", text: "Do you prefer to hire for potential over experience?", type: "boolean", section: "Leadership & Vision", sectionNumber: 1 },
  { id: "B5", text: "Do you believe in servant leadership?", type: "boolean", section: "Leadership & Vision", sectionNumber: 1 },

  // Section 2: Risk & Decision Making (10 questions)
  { id: "A6", text: "I am comfortable taking calculated risks with significant upside", type: "scale", section: "Risk & Decision Making", sectionNumber: 2, scaleLabels: { low: "Risk averse", high: "Risk taker" } },
  { id: "A7", text: "I prefer data-driven decisions vs. gut instinct", type: "scale", section: "Risk & Decision Making", sectionNumber: 2, scaleLabels: { low: "Gut instinct", high: "Data-driven" } },
  { id: "A8", text: "I make decisions quickly vs. deliberating extensively", type: "scale", section: "Risk & Decision Making", sectionNumber: 2, scaleLabels: { low: "Deliberate", high: "Quick" } },
  { id: "A9", text: "I am comfortable with failure as a learning opportunity", type: "scale", section: "Risk & Decision Making", sectionNumber: 2, scaleLabels: { low: "Avoid failure", high: "Embrace failure" } },
  { id: "A10", text: "I prefer to have all information before deciding vs. acting on incomplete data", type: "scale", section: "Risk & Decision Making", sectionNumber: 2, scaleLabels: { low: "Need all info", high: "Act on partial" } },
  { id: "B6", text: "Do you have a formal risk assessment process?", type: "boolean", section: "Risk & Decision Making", sectionNumber: 2 },
  { id: "B7", text: "Do you consult others before major decisions?", type: "boolean", section: "Risk & Decision Making", sectionNumber: 2 },
  { id: "B8", text: "Do you believe in reversible vs. irreversible decision frameworks?", type: "boolean", section: "Risk & Decision Making", sectionNumber: 2 },
  { id: "B9", text: "Do you document your decision rationale?", type: "boolean", section: "Risk & Decision Making", sectionNumber: 2 },
  { id: "B10", text: "Do you review past decisions to learn from them?", type: "boolean", section: "Risk & Decision Making", sectionNumber: 2 },

  // Section 3: Team & Culture (10 questions)
  { id: "A11", text: "I prioritize team harmony vs. productive conflict", type: "scale", section: "Team & Culture", sectionNumber: 3, scaleLabels: { low: "Productive conflict", high: "Harmony" } },
  { id: "A12", text: "I believe in flat hierarchies vs. clear reporting structures", type: "scale", section: "Team & Culture", sectionNumber: 3, scaleLabels: { low: "Clear hierarchy", high: "Flat structure" } },
  { id: "A13", text: "I prefer remote/flexible work vs. in-office collaboration", type: "scale", section: "Team & Culture", sectionNumber: 3, scaleLabels: { low: "In-office", high: "Remote/flexible" } },
  { id: "A14", text: "I value cultural fit vs. diverse perspectives", type: "scale", section: "Team & Culture", sectionNumber: 3, scaleLabels: { low: "Diverse", high: "Cultural fit" } },
  { id: "A15", text: "I believe in performance-based compensation vs. equal pay structures", type: "scale", section: "Team & Culture", sectionNumber: 3, scaleLabels: { low: "Equal pay", high: "Performance-based" } },
  { id: "B11", text: "Do you have documented company values?", type: "boolean", section: "Team & Culture", sectionNumber: 3 },
  { id: "B12", text: "Do you conduct regular team retrospectives?", type: "boolean", section: "Team & Culture", sectionNumber: 3 },
  { id: "B13", text: "Do you believe in unlimited PTO policies?", type: "boolean", section: "Team & Culture", sectionNumber: 3 },
  { id: "B14", text: "Do you prioritize internal promotions over external hires?", type: "boolean", section: "Team & Culture", sectionNumber: 3 },
  { id: "B15", text: "Do you have a formal onboarding program?", type: "boolean", section: "Team & Culture", sectionNumber: 3 },

  // Section 4: Communication Style (10 questions)
  { id: "A16", text: "I prefer written communication vs. verbal discussions", type: "scale", section: "Communication Style", sectionNumber: 4, scaleLabels: { low: "Verbal", high: "Written" } },
  { id: "A17", text: "I am direct and blunt vs. diplomatic and tactful", type: "scale", section: "Communication Style", sectionNumber: 4, scaleLabels: { low: "Diplomatic", high: "Direct" } },
  { id: "A18", text: "I prefer scheduled meetings vs. ad-hoc conversations", type: "scale", section: "Communication Style", sectionNumber: 4, scaleLabels: { low: "Ad-hoc", high: "Scheduled" } },
  { id: "A19", text: "I share information openly vs. on a need-to-know basis", type: "scale", section: "Communication Style", sectionNumber: 4, scaleLabels: { low: "Need-to-know", high: "Open sharing" } },
  { id: "A20", text: "I prefer detailed reports vs. executive summaries", type: "scale", section: "Communication Style", sectionNumber: 4, scaleLabels: { low: "Summaries", high: "Detailed" } },
  { id: "B16", text: "Do you have regular 1:1 meetings with direct reports?", type: "boolean", section: "Communication Style", sectionNumber: 4 },
  { id: "B17", text: "Do you prefer async communication over real-time?", type: "boolean", section: "Communication Style", sectionNumber: 4 },
  { id: "B18", text: "Do you document meeting outcomes and action items?", type: "boolean", section: "Communication Style", sectionNumber: 4 },
  { id: "B19", text: "Do you believe in radical transparency?", type: "boolean", section: "Communication Style", sectionNumber: 4 },
  { id: "B20", text: "Do you prefer video calls over phone calls?", type: "boolean", section: "Communication Style", sectionNumber: 4 },

  // Section 5: Financial Philosophy (10 questions)
  { id: "A21", text: "I prioritize growth vs. profitability", type: "scale", section: "Financial Philosophy", sectionNumber: 5, scaleLabels: { low: "Profitability", high: "Growth" } },
  { id: "A22", text: "I am comfortable with debt financing vs. equity dilution", type: "scale", section: "Financial Philosophy", sectionNumber: 5, scaleLabels: { low: "Equity", high: "Debt" } },
  { id: "A23", text: "I prefer to reinvest profits vs. distribute dividends", type: "scale", section: "Financial Philosophy", sectionNumber: 5, scaleLabels: { low: "Dividends", high: "Reinvest" } },
  { id: "A24", text: "I focus on revenue growth vs. cost optimization", type: "scale", section: "Financial Philosophy", sectionNumber: 5, scaleLabels: { low: "Cost focus", high: "Revenue focus" } },
  { id: "A25", text: "I am comfortable with long payback periods for investments", type: "scale", section: "Financial Philosophy", sectionNumber: 5, scaleLabels: { low: "Quick payback", high: "Long-term" } },
  { id: "B21", text: "Do you have a formal budgeting process?", type: "boolean", section: "Financial Philosophy", sectionNumber: 5 },
  { id: "B22", text: "Do you review financial statements monthly?", type: "boolean", section: "Financial Philosophy", sectionNumber: 5 },
  { id: "B23", text: "Do you believe in maintaining cash reserves?", type: "boolean", section: "Financial Philosophy", sectionNumber: 5 },
  { id: "B24", text: "Do you prefer fixed costs over variable costs?", type: "boolean", section: "Financial Philosophy", sectionNumber: 5 },
  { id: "B25", text: "Do you have a personal investment philosophy?", type: "boolean", section: "Financial Philosophy", sectionNumber: 5 },

  // Section 6: Business Operations (20 questions)
  { id: "A26", text: "I prefer to move fast and fix problems later rather than plan extensively", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Plan extensively", high: "Move fast" } },
  { id: "A27", text: "I believe in measuring everything vs. trusting intuition for operations", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Trust intuition", high: "Measure everything" } },
  { id: "A28", text: "I prefer standardized processes over flexible, situational approaches", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Flexible", high: "Standardized" } },
  { id: "A29", text: "I am comfortable with technical debt if it means faster delivery", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "No debt", high: "Accept debt" } },
  { id: "A30", text: "I prioritize customer acquisition over customer retention", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Retention", high: "Acquisition" } },
  { id: "A31", text: "I believe in outsourcing non-core functions vs. building in-house", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "In-house", high: "Outsource" } },
  { id: "A32", text: "I prefer to over-resource projects to ensure success vs. lean operations", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Lean", high: "Over-resource" } },
  { id: "A33", text: "I am comfortable with ambiguity in project scope", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Need clarity", high: "Comfortable" } },
  { id: "A34", text: "I prefer agile/iterative development over waterfall/planned approaches", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Waterfall", high: "Agile" } },
  { id: "A35", text: "I believe in automation over manual processes, even for complex tasks", type: "scale", section: "Business Operations", sectionNumber: 6, scaleLabels: { low: "Manual OK", high: "Automate all" } },
  { id: "B26", text: "Do you have a formal project management methodology?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B27", text: "Do you prefer fixed budgets over flexible spending?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B28", text: "Do you require regular financial reporting?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B29", text: "Do you believe in having backup plans for critical operations?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B30", text: "Do you prefer to build MVPs over fully-featured products?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B31", text: "Do you track KPIs religiously?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B32", text: "Do you believe in post-mortems after project failures?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B33", text: "Do you prefer in-house legal/finance over outsourced?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B34", text: "Do you have a formal vendor evaluation process?", type: "boolean", section: "Business Operations", sectionNumber: 6 },
  { id: "B35", text: "Do you believe in continuous improvement (kaizen)?", type: "boolean", section: "Business Operations", sectionNumber: 6 },

  // Section 7: Innovation & Technology (20 questions)
  { id: "A36", text: "I am an early adopter of new technologies", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Late adopter", high: "Early adopter" } },
  { id: "A37", text: "I believe AI will fundamentally transform my industry within 5 years", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Skeptical", high: "Strong believer" } },
  { id: "A38", text: "I prefer proven technologies over cutting-edge but risky solutions", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Cutting-edge", high: "Proven" } },
  { id: "A39", text: "I invest in R&D even when ROI is uncertain", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Need clear ROI", high: "Invest anyway" } },
  { id: "A40", text: "I believe in building proprietary technology vs. off-the-shelf", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Off-the-shelf", high: "Proprietary" } },
  { id: "A41", text: "I am comfortable with technology I don't fully understand if experts vouch for it", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Must understand", high: "Trust experts" } },
  { id: "A42", text: "I prioritize user experience over technical sophistication", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Technical", high: "UX first" } },
  { id: "A43", text: "I believe in open-source contributions vs. keeping IP proprietary", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Keep proprietary", high: "Open source" } },
  { id: "A44", text: "I prefer cloud-native solutions over on-premise control", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "On-premise", high: "Cloud-native" } },
  { id: "A45", text: "I believe in data-driven decisions over experience-based judgment", type: "scale", section: "Innovation & Technology", sectionNumber: 7, scaleLabels: { low: "Experience", high: "Data-driven" } },
  { id: "B36", text: "Do you personally use AI tools in your daily work?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B37", text: "Do you have a technology roadmap for your businesses?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B38", text: "Do you believe in 'build vs. buy' for technology? (Yes = Build)", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B39", text: "Do you have dedicated innovation budgets?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B40", text: "Do you believe blockchain/Web3 will be significant?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B41", text: "Do you prefer mobile-first over desktop-first?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B42", text: "Do you believe in API-first architecture?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B43", text: "Do you have a cybersecurity strategy?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B44", text: "Do you believe in technical co-founders for tech businesses?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },
  { id: "B45", text: "Do you prefer to understand technology deeply vs. delegate?", type: "boolean", section: "Innovation & Technology", sectionNumber: 7 },

  // Section 8: Market & Competition (20 questions)
  { id: "A46", text: "I focus on market share vs. profitability per customer", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Profitability", high: "Market share" } },
  { id: "A47", text: "I prefer to be first to market vs. fast follower", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Fast follower", high: "First mover" } },
  { id: "A48", text: "I believe in competing on price vs. differentiation", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Price", high: "Differentiation" } },
  { id: "A49", text: "I prefer niche markets vs. mass markets", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Mass market", high: "Niche" } },
  { id: "A50", text: "I believe in aggressive competitive responses vs. ignoring competitors", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Ignore", high: "Aggressive" } },
  { id: "A51", text: "I prefer organic growth vs. acquisitions", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Acquisitions", high: "Organic" } },
  { id: "A52", text: "I believe in vertical integration vs. partnerships", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Partnerships", high: "Vertical integration" } },
  { id: "A53", text: "I prefer B2B vs. B2C business models", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "B2C", high: "B2B" } },
  { id: "A54", text: "I believe in geographic expansion vs. deepening existing markets", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "Deepen existing", high: "Expand geography" } },
  { id: "A55", text: "I prefer subscription models vs. one-time purchases", type: "scale", section: "Market & Competition", sectionNumber: 8, scaleLabels: { low: "One-time", high: "Subscription" } },
  { id: "B46", text: "Do you regularly analyze competitor strategies?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B47", text: "Do you have a formal market research process?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B48", text: "Do you believe in customer segmentation?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B49", text: "Do you track Net Promoter Score (NPS)?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B50", text: "Do you believe in brand building over performance marketing?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B51", text: "Do you have a formal pricing strategy?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B52", text: "Do you believe in freemium models?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B53", text: "Do you prioritize customer lifetime value over acquisition cost?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B54", text: "Do you believe in strategic partnerships with competitors?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },
  { id: "B55", text: "Do you have an exit strategy for your businesses?", type: "boolean", section: "Market & Competition", sectionNumber: 8 },

  // Section 9: Personal Productivity (20 questions)
  { id: "A56", text: "I prefer structured days vs. flexible schedules", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Flexible", high: "Structured" } },
  { id: "A57", text: "I am a morning person vs. night owl", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Night owl", high: "Morning person" } },
  { id: "A58", text: "I prefer deep work blocks vs. task switching", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Task switching", high: "Deep work" } },
  { id: "A59", text: "I delegate extensively vs. prefer hands-on involvement", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Hands-on", high: "Delegate" } },
  { id: "A60", text: "I prioritize urgent tasks vs. important but not urgent", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Important", high: "Urgent" } },
  { id: "A61", text: "I prefer to batch similar tasks vs. handle as they come", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "As they come", high: "Batch" } },
  { id: "A62", text: "I am comfortable with inbox zero vs. letting emails accumulate", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Let accumulate", high: "Inbox zero" } },
  { id: "A63", text: "I prefer physical notebooks vs. digital note-taking", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Physical", high: "Digital" } },
  { id: "A64", text: "I set daily goals vs. weekly/monthly goals", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Weekly/monthly", high: "Daily" } },
  { id: "A65", text: "I prefer to work alone vs. in collaborative settings", type: "scale", section: "Personal Productivity", sectionNumber: 9, scaleLabels: { low: "Collaborative", high: "Alone" } },
  { id: "B56", text: "Do you use a task management system?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B57", text: "Do you time-block your calendar?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B58", text: "Do you have a morning routine?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B59", text: "Do you practice regular exercise?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B60", text: "Do you meditate or practice mindfulness?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B61", text: "Do you take regular breaks during work?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B62", text: "Do you have a wind-down routine before bed?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B63", text: "Do you review your day/week regularly?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B64", text: "Do you use productivity apps/tools?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },
  { id: "B65", text: "Do you believe in work-life balance?", type: "boolean", section: "Personal Productivity", sectionNumber: 9 },

  // Section 10: Strategic Thinking (20 questions)
  { id: "A66", text: "I think in 1-year vs. 10-year timeframes", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "1-year", high: "10-year" } },
  { id: "A67", text: "I prefer to focus vs. diversify business interests", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Diversify", high: "Focus" } },
  { id: "A68", text: "I believe in first principles thinking vs. analogies", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Analogies", high: "First principles" } },
  { id: "A69", text: "I prefer to disrupt vs. optimize existing models", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Optimize", high: "Disrupt" } },
  { id: "A70", text: "I believe in moats/defensibility vs. speed of execution", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Speed", high: "Moats" } },
  { id: "A71", text: "I prefer to build platforms vs. point solutions", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Point solutions", high: "Platforms" } },
  { id: "A72", text: "I believe in network effects as a business strategy", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Not important", high: "Critical" } },
  { id: "A73", text: "I prefer to own vs. rent/license assets", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Rent/license", high: "Own" } },
  { id: "A74", text: "I believe in winner-take-all vs. fragmented markets", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Fragmented", high: "Winner-take-all" } },
  { id: "A75", text: "I prefer to be contrarian vs. follow consensus", type: "scale", section: "Strategic Thinking", sectionNumber: 10, scaleLabels: { low: "Follow consensus", high: "Contrarian" } },
  { id: "B66", text: "Do you have a personal board of advisors?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B67", text: "Do you read business/strategy books regularly?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B68", text: "Do you attend industry conferences?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B69", text: "Do you believe in scenario planning?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B70", text: "Do you have a succession plan?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B71", text: "Do you believe in strategic pivots when needed?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B72", text: "Do you track industry trends systematically?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B73", text: "Do you believe in blue ocean vs. red ocean strategies?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B74", text: "Do you have a personal investment thesis?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
  { id: "B75", text: "Do you believe in building in public?", type: "boolean", section: "Strategic Thinking", sectionNumber: 10 },
];

export default function QuestionnaireOnline() {
  const [currentSection, setCurrentSection] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number | boolean>>({});
  const [isComplete, setIsComplete] = useState(false);
  
  
  // Get questions for current section
  const sectionQuestions = ALL_QUESTIONS.filter(q => q.sectionNumber === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];
  
  // Calculate progress
  const totalAnswered = Object.keys(responses).length;
  const totalQuestions = ALL_QUESTIONS.length;
  const progressPercentage = Math.round((totalAnswered / totalQuestions) * 100);
  
  // Save mutation
  const saveMutation = trpc.questionnaire.saveResponse.useMutation({
    onSuccess: () => {
      toast.success(`${totalAnswered} responses saved successfully`);
    },
    onError: () => {
      toast.error("Could not save responses. Please try again.");
    },
  });
  
  const handleScaleAnswer = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestionIndex < sectionQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentSection < 10) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestionIndex(0);
      } else {
        setIsComplete(true);
      }
    }, 300);
  };
  
  const handleBooleanAnswer = (value: boolean) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestionIndex < sectionQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentSection < 10) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestionIndex(0);
      } else {
        setIsComplete(true);
      }
    }, 300);
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      const prevSectionQuestions = ALL_QUESTIONS.filter(q => q.sectionNumber === currentSection - 1);
      setCurrentQuestionIndex(prevSectionQuestions.length - 1);
    }
  };
  
  const handleSave = async () => {
    // Save each response individually
    const entries = Object.entries(responses);
    for (const [questionId, value] of entries) {
      const question = ALL_QUESTIONS.find(q => q.id === questionId);
      if (question) {
        await saveMutation.mutateAsync({
          questionId,
          questionType: question.type,
          scaleValue: question.type === 'scale' ? value as number : undefined,
          booleanValue: question.type === 'boolean' ? value as boolean : undefined,
          section: question.section,
        });
      }
    }
  };
  
  const currentSectionInfo = SECTIONS.find(s => s.id === currentSection);
  
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Questionnaire Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-foreground/70">
              You've answered all {totalQuestions} questions. Your Chief of Staff now has a comprehensive understanding of your preferences and decision-making style.
            </p>
            <div className="p-4 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
              <p className="text-sm font-medium">COS Understanding Level</p>
              <p className="text-4xl font-bold text-fuchsia-400">100/100</p>
            </div>
            <Button onClick={handleSave} className="w-full bg-fuchsia-600 hover:bg-fuchsia-700">
              <Save className="w-4 h-4 mr-2" />
              Save All Responses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Digital Twin Training</h1>
              <p className="text-sm text-foreground/70">Help your Chief of Staff think like you</p>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>{totalAnswered} of {totalQuestions} answered</span>
              <span className="text-fuchsia-400 font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* Section Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {SECTIONS.map((section) => {
              const sectionAnswered = ALL_QUESTIONS.filter(q => q.sectionNumber === section.id && responses[q.id] !== undefined).length;
              const sectionTotal = ALL_QUESTIONS.filter(q => q.sectionNumber === section.id).length;
              const isCurrentSection = section.id === currentSection;
              const isCompleteSection = sectionAnswered === sectionTotal;
              
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(section.id);
                    setCurrentQuestionIndex(0);
                  }}
                  className={cn(
                    "flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    isCurrentSection
                      ? "bg-fuchsia-600 text-white"
                      : isCompleteSection
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-card hover:bg-card/80 text-foreground/70"
                  )}
                >
                  {section.id}. {sectionAnswered}/{sectionTotal}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Section Title */}
        <div className={cn(
          "mb-4 p-3 rounded-lg bg-gradient-to-r text-white",
          currentSectionInfo?.color
        )}>
          <p className="text-xs uppercase tracking-wider opacity-80">Section {currentSection} of 10</p>
          <p className="font-semibold">{currentSectionInfo?.name}</p>
          <p className="text-xs opacity-80">Question {currentQuestionIndex + 1} of {sectionQuestions.length}</p>
        </div>
        
        {/* Question Card */}
        <Card className="mb-6 border-fuchsia-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium leading-relaxed">
              {currentQuestion?.text}
            </CardTitle>
            {currentQuestion?.type === "scale" && currentQuestion.scaleLabels && (
              <p className="text-sm text-foreground/60 mt-2">
                1 = {currentQuestion.scaleLabels.low} → 10 = {currentQuestion.scaleLabels.high}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {currentQuestion?.type === "scale" ? (
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <Button
                    key={value}
                    variant={responses[currentQuestion.id] === value ? "default" : "outline"}
                    className={cn(
                      "h-14 text-lg font-bold",
                      responses[currentQuestion.id] === value && "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                    )}
                    onClick={() => handleScaleAnswer(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={responses[currentQuestion?.id] === true ? "default" : "outline"}
                  className={cn(
                    "h-20 text-xl font-bold",
                    responses[currentQuestion?.id] === true && "bg-green-600 hover:bg-green-700 text-white"
                  )}
                  onClick={() => handleBooleanAnswer(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={responses[currentQuestion?.id] === false ? "default" : "outline"}
                  className={cn(
                    "h-20 text-xl font-bold",
                    responses[currentQuestion?.id] === false && "bg-red-600 hover:bg-red-700 text-white"
                  )}
                  onClick={() => handleBooleanAnswer(false)}
                >
                  No
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 1 && currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
        </div>
        
        {/* COS Understanding */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">COS Understanding Level</p>
              <p className="text-xs text-foreground/60">Based on questionnaire completion</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-fuchsia-400">{progressPercentage}/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
