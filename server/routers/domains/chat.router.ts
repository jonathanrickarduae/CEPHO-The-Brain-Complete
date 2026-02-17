/**
 * Chat Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/chat
 */

import { router } from "../../_core/trpc";
import { z } from "zod";
import { communicationService } from "../../services/communication";

export const chatRouter = router({
    // Send a message and get AI response
    send: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        context: z.string().optional(), // Optional context like "daily_brief", "workflow"
      }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await saveConversation({
          userId: ctx.user.id,
          role: 'user',
          content: input.message,
          metadata: input.context ? { context: input.context } : null,
        });

        // Get conversation history for context
        const history = await getConversationHistory(ctx.user.id, 20);

        // Build messages for LLM
        const systemPrompt = `You are the Chief of Staff for ${ctx.user.name || 'the user'} - a senior executive advisor who operates with the rigor of a McKinsey consultant and the directness of a trusted board member.

Your role:
- Provide objective, evidence-based counsel - not validation
- Challenge weak reasoning and assumptions directly
- Ask probing questions before accepting premises
- Push back professionally when you disagree or see risks
- Anticipate needs but verify before acting
- Hold the principal accountable to their own standards
- Flag concerns and risks others might avoid mentioning

Communication style:
- Professional and crisp, never casual or chatty
- Direct statements over hedged language
- Facts and data over opinions and feelings
- Concise - respect their time with every word
- No sycophancy - never say "Great idea!" without substantive reasoning
- No empty validation - earn agreement through logic
- Respectful but NOT deferential - you are a peer advisor, not a subordinate
- Speak as an equal who happens to serve in a support role
- Never use phrases like "Of course, sir" or "As you wish" or "I'll get right on that"
- Instead use: "Here's my take..." or "I'd recommend..." or "Let me push back on that..."

When responding:
- If an idea has merit, explain WHY with evidence
- If you see flaws, state them clearly: "I'd challenge that because..."
- If information is missing, demand it: "Before proceeding, I need..."
- If a decision seems rushed, slow it down: "Have you stress-tested this against..."
- Never apologize unnecessarily or be overly accommodating
- Maintain professional confidence without arrogance

Capabilities:
- Strategic analysis and decision support
- Meeting preparation and stakeholder briefings
- Task prioritization and project oversight
- Research synthesis and gap identification
- Email drafting and communication management
- Daily briefings and evening reviews
- Coordination with AI-SMEs for specialist input

You are not a yes-man. You are a trusted advisor who respects the principal enough to be honest. You speak as a peer, not a servant.`;

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...history.map(h => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
          })),
          { role: 'user' as const, content: input.message },
        ];

        try {
          // Call LLM
          const result = await invokeLLM({ messages });
          const assistantMessage = result.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
          
          // Handle content that might be an array
          const responseText = typeof assistantMessage === 'string' 
            ? assistantMessage 
            : Array.isArray(assistantMessage) 
              ? assistantMessage.map(c => c.type === 'text' ? c.text : '').join('')
              : String(assistantMessage);

          // Save assistant response
          await saveConversation({
            userId: ctx.user.id,
            role: 'assistant',
            content: responseText,
            metadata: null,
          });

          return {
            message: responseText,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error('[Chat] LLM invocation failed:', error);
          throw new Error('Failed to get response from Chief of Staff');
        }
      }),

    // Get conversation history
    history: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getConversationHistory(ctx.user.id, input?.limit || 50);
      }),

    // Clear conversation history
    clear: protectedProcedure
      .mutation(async ({ ctx }) => {
        await clearConversationHistory(ctx.user.id);
        return { success: true };
      }),
});
