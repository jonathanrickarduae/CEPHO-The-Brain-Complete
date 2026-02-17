/**
 * OpenClaw tRPC Router
 * Exposes OpenClaw gateway functionality via tRPC API
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { openClawGateway } from "./openclaw-gateway";

export const openClawRouter = router({
  // Chat interface
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        context: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await openClawGateway.chat(input.message, ctx.user.id, input.context);
    }),

  // Execute specific skill
  executeSkill: protectedProcedure
    .input(
      z.object({
        skillName: z.string(),
        params: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await openClawGateway.executeSkill(input.skillName, input.params, ctx.user.id);
    }),

  // Project Genesis skill
  projectGenesis: router({
    initiate: protectedProcedure
      .input(
        z.object({
          companyName: z.string(),
          industry: z.string(),
          description: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill("cepho-project-genesis", input, ctx.user.id);
      }),
  }),

  // AI-SME skill
  aiSME: router({
    consult: protectedProcedure
      .input(
        z.object({
          question: z.string(),
          expertType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill("cepho-ai-sme-consultation", input, ctx.user.id);
      }),
  }),

  // QMS skill
  qms: router({
    validate: protectedProcedure
      .input(
        z.object({
          projectId: z.string().optional(),
          gateNumber: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill("cepho-qms-validation", input, ctx.user.id);
      }),
  }),

  // Due Diligence skill
  dueDiligence: router({
    start: protectedProcedure
      .input(
        z.object({
          targetCompany: z.string(),
          dealSize: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill("cepho-due-diligence", input, ctx.user.id);
      }),
  }),

  // Financial Modeling skill
  financialModeling: router({
    create: protectedProcedure
      .input(
        z.object({
          modelType: z.string(),
          inputs: z.any(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill("cepho-financial-modeling", input, ctx.user.id);
      }),
  }),

  // Data Room skill
  dataRoom: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          purpose: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill("cepho-data-room", input, ctx.user.id);
      }),
  }),

  // Digital Twin skill
  digitalTwin: router({
    getBriefing: protectedProcedure
      .input(z.object({ action: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        return await openClawGateway.executeSkill(
          "cepho-digital-twin",
          { action: input.action || "briefing" },
          ctx.user.id
        );
      }),
  }),
});
