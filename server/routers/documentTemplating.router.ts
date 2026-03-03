import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  formatDocument,
  DocumentTemplate,
} from "../services/documentTemplating";

const DocumentSectionSchema = z.object({
  heading: z.string().optional(),
  content: z.string(),
  type: z.enum(["paragraph", "bullets", "table", "metrics"]).optional(),
  data: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const documentTemplatingRouter = router({
  format: protectedProcedure
    .input(
      z.object({
        template: z.enum([
          "executive_report",
          "board_report",
          "project_brief",
          "strategic_memo",
          "innovation_proposal",
          "risk_assessment",
          "weekly_digest",
          "morning_briefing",
        ]),
        title: z.string(),
        subtitle: z.string().optional(),
        author: z.string().optional(),
        date: z.string().optional(),
        sections: z.array(DocumentSectionSchema),
        confidentiality: z
          .enum(["public", "internal", "confidential", "strictly_confidential"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = formatDocument({
        ...input,
        template: input.template as DocumentTemplate,
      });
      return { success: true, ...result };
    }),

  getTemplates: protectedProcedure.query(async () => {
    return {
      templates: [
        {
          id: "executive_report",
          label: "Executive Report",
          description:
            "Formal executive-level report with professional branding",
        },
        {
          id: "board_report",
          label: "Board Report",
          description: "Formal board-level report for governance and oversight",
        },
        {
          id: "project_brief",
          label: "Project Brief",
          description: "Concise project overview and status update",
        },
        {
          id: "strategic_memo",
          label: "Strategic Memorandum",
          description: "Internal strategic communication",
        },
        {
          id: "innovation_proposal",
          label: "Innovation Proposal",
          description: "Structured proposal for new ideas and initiatives",
        },
        {
          id: "risk_assessment",
          label: "Risk Assessment",
          description: "Formal risk identification and mitigation plan",
        },
        {
          id: "weekly_digest",
          label: "Weekly Digest",
          description: "Weekly summary of key activities and metrics",
        },
        {
          id: "morning_briefing",
          label: "Morning Briefing",
          description: "Daily executive briefing document",
        },
      ],
    };
  }),
});
