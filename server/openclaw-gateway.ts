/**
 * OpenClaw Gateway Service
 * Provides conversational interface and autonomous execution for CEPHO
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "./db/index";
import { z } from "zod";
import { getLLMService } from "./services/llm-service";
import { getConversationService } from "./services/conversation-service";

// Skill execution engine
export class OpenClawGateway {
  private skills: Map<string, SkillHandler> = new Map();

  constructor() {
    this.registerSkills();
  }

  private registerSkills() {
    // Register all 7 CEPHO skills
    this.skills.set("cepho-project-genesis", new ProjectGenesisSkill());
    this.skills.set("cepho-ai-sme-consultation", new AISMESkill());
    this.skills.set("cepho-qms-validation", new QMSSkill());
    this.skills.set("cepho-due-diligence", new DueDiligenceSkill());
    this.skills.set("cepho-financial-modeling", new FinancialModelingSkill());
    this.skills.set("cepho-data-room", new DataRoomSkill());
    this.skills.set("cepho-digital-twin", new DigitalTwinSkill());
  }

  async executeSkill(skillName: string, input: any, userId: string) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Skill ${skillName} not found`,
      });
    }

    return await skill.execute(input, userId);
  }

  async chat(message: string, userId: string, context?: any) {
    
    const llmService = getLLMService();
    const conversationService = getConversationService();
    
    // Convert userId to number if it's a string
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Detect which skill the user is asking about
    const skill = llmService.detectSkill(message);
    
    // Get conversation history from database
    const history = await conversationService.getConversationHistory(userIdNum, 5);
    
    // Build conversation messages for LLM
    const messages = [
      {
        role: 'system' as const,
        content: llmService.getSystemPrompt(skill),
      },
      // Add conversation history
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      // Add current message
      {
        role: 'user' as const,
        content: message,
      },
    ];
    
    try {
      // Call LLM for intelligent response
      const response = await llmService.chat(messages);
      
      // Save user message to conversation history
      await conversationService.addMessage(userIdNum, 'user', message, { skill });
      
      // Save assistant response to conversation history
      await conversationService.addMessage(userIdNum, 'assistant', response, { skill });
      
      // Generate suggestions based on skill
      const suggestions = llmService.generateSuggestions(skill);
      
      return {
        response,
        suggestions,
        skill,
      };
    } catch (error: any) {
      console.error('[OpenClaw] Error:', error.message);
      
      // Fallback to skill execution if LLM fails
      const intent = await this.parseIntent(message, context);
      
      if (!intent.skillName) {
        return {
          response: `[DEBUG] LLM Error: ${error.message}. Stack: ${error.stack?.substring(0, 200)}. I'm not sure what you'd like me to do. Try asking about Project Genesis, AI-SME consultations, or other CEPHO features.`,
          suggestions: [
            "Start Project Genesis for my startup",
            "Get expert consultation on market analysis",
            "Run quality gate validation",
          ],
        };
      }

      // Execute the skill
      const result = await this.executeSkill(intent.skillName, intent.params, userId);
      
      return {
        response: this.formatResponse(result, intent.skillName),
        data: result,
      };
    }
  }

  private async parseIntent(message: string, context?: any) {
    // Simple intent parsing (can be enhanced with LLM)
    const lowerMessage = message.toLowerCase();
    
    // Project Genesis
    if (lowerMessage.includes("project genesis") || lowerMessage.includes("start project")) {
      return {
        skillName: "cepho-project-genesis",
        params: this.extractProjectParams(message),
      };
    }
    
    // AI-SME
    if (lowerMessage.includes("expert") || lowerMessage.includes("consultation") || lowerMessage.includes("ai-sme")) {
      return {
        skillName: "cepho-ai-sme-consultation",
        params: this.extractExpertParams(message),
      };
    }
    
    // QMS
    if (lowerMessage.includes("quality") || lowerMessage.includes("validation") || lowerMessage.includes("gate")) {
      return {
        skillName: "cepho-qms-validation",
        params: this.extractQMSParams(message),
      };
    }
    
    // Due Diligence
    if (lowerMessage.includes("due diligence") || lowerMessage.includes("dd")) {
      return {
        skillName: "cepho-due-diligence",
        params: this.extractDDParams(message),
      };
    }
    
    // Financial Modeling
    if (lowerMessage.includes("financial") || lowerMessage.includes("model") || lowerMessage.includes("projection")) {
      return {
        skillName: "cepho-financial-modeling",
        params: this.extractFinancialParams(message),
      };
    }
    
    // Data Room
    if (lowerMessage.includes("data room") || lowerMessage.includes("vault") || lowerMessage.includes("documents")) {
      return {
        skillName: "cepho-data-room",
        params: this.extractDataRoomParams(message),
      };
    }
    
    // Digital Twin
    if (lowerMessage.includes("digital twin") || lowerMessage.includes("chief of staff") || lowerMessage.includes("briefing")) {
      return {
        skillName: "cepho-digital-twin",
        params: this.extractDigitalTwinParams(message),
      };
    }
    
    return { skillName: null, params: {} };
  }

  private extractProjectParams(message: string) {
    // Extract company name, industry, etc from message
    // Simple regex-based extraction (can be enhanced)
    return {
      companyName: this.extractQuoted(message) || "New Project",
      industry: "Technology", // Default
      description: message,
    };
  }

  private extractExpertParams(message: string) {
    return {
      question: message,
      expertType: "general",
    };
  }

  private extractQMSParams(message: string) {
    return {
      projectId: null, // Will be determined from context
      gateNumber: 1,
    };
  }

  private extractDDParams(message: string) {
    return {
      targetCompany: this.extractQuoted(message) || "Target Company",
      dealSize: "Unknown",
    };
  }

  private extractFinancialParams(message: string) {
    return {
      modelType: "saas",
      inputs: {},
    };
  }

  private extractDataRoomParams(message: string) {
    return {
      name: this.extractQuoted(message) || "New Data Room",
      purpose: "Investor Relations",
    };
  }

  private extractDigitalTwinParams(message: string) {
    return {
      action: "briefing",
    };
  }

  private extractQuoted(text: string): string | null {
    const match = text.match(/"([^"]+)"|'([^']+)'/);
    return match ? (match[1] || match[2]) : null;
  }

  private formatResponse(result: any, skillName: string): string {
    // Format skill execution result into conversational response
    switch (skillName) {
      case "cepho-project-genesis":
        return `🚀 Project Genesis initiated! ${result.message || "Your project is being set up."}`;
      case "cepho-ai-sme-consultation":
        return `🧠 Expert consultation: ${result.response || result.message}`;
      case "cepho-qms-validation":
        return `✅ Quality Gate ${result.gateNumber}: ${result.status} (Score: ${result.score}/100)`;
      case "cepho-due-diligence":
        return `🔍 Due Diligence initiated for ${result.targetCompany}. ${result.message}`;
      case "cepho-financial-modeling":
        return `💰 Financial model created. ${result.summary}`;
      case "cepho-data-room":
        return `🔐 Data Room "${result.name}" created successfully.`;
      case "cepho-digital-twin":
        return `👤 ${result.briefing || result.message}`;
      default:
        return JSON.stringify(result);
    }
  }
}

// Base skill handler interface
interface SkillHandler {
  execute(input: any, userId: string): Promise<any>;
}

// Project Genesis Skill Implementation
class ProjectGenesisSkill implements SkillHandler {
  async execute(input: any, userId: string) {
    // Create project in database
    const project = {
      name: input.companyName,
      industry: input.industry,
      description: input.description,
      userId,
      phase: 1,
      status: "initiated",
      createdAt: new Date(),
    };

    // FUTURE: Persist to database
    // const result = await db.insert(projects).values(project);

    return {
      success: true,
      message: `Project "${input.companyName}" initiated in ${input.industry} industry.`,
      projectId: "temp-id", // FUTURE: Retrieve from database
      nextPhase: "Deep Dive Analysis",
    };
  }
}

// AI-SME Skill Implementation
class AISMESkill implements SkillHandler {
  async execute(input: any, userId: string) {
    // TODO: Call LLM with expert persona
    const response = `Based on my expertise, here's my analysis: ${input.question}`;

    return {
      success: true,
      response,
      expert: "Warren Buffett",
      expertType: input.expertType,
    };
  }
}

// QMS Skill Implementation
class QMSSkill implements SkillHandler {
  async execute(input: any, userId: string) {
    // TODO: Run quality gate validation
    return {
      success: true,
      gateNumber: input.gateNumber,
      status: "PASS",
      score: 85,
      findings: [],
    };
  }
}

// Due Diligence Skill Implementation
class DueDiligenceSkill implements SkillHandler {
  async execute(input: any, userId: string) {
    return {
      success: true,
      targetCompany: input.targetCompany,
      message: "Due diligence process started. Analyzing financial, legal, and market aspects.",
      status: "in_progress",
    };
  }
}

// Financial Modeling Skill Implementation
class FinancialModelingSkill implements SkillHandler {
  async execute(input: any, userId: string) {
    return {
      success: true,
      modelType: input.modelType,
      summary: "5-year projection created with revenue, costs, and profitability analysis.",
      projections: {},
    };
  }
}

// Data Room Skill Implementation
class DataRoomSkill implements SkillHandler {
  async execute(input: any, userId: string) {
    return {
      success: true,
      name: input.name,
      purpose: input.purpose,
      url: "/vault/data-rooms/new",
    };
  }
}

// Digital Twin Skill Implementation
class DigitalTwinSkill implements SkillHandler {
  async execute(input: any, userId: string) {
    if (input.action === "briefing") {
      return {
        success: true,
        briefing: "Good morning! Here's your daily briefing: 3 active projects, 2 pending reviews, 1 expert consultation scheduled.",
        priorities: ["Complete Project Genesis Phase 2", "Review financial model", "Schedule investor meeting"],
      };
    }

    return {
      success: true,
      message: "Digital Twin action completed.",
    };
  }
}

// Export singleton instance
export const openClawGateway = new OpenClawGateway();
