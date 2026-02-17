import { getOpenAIClient, ChatMessage as OpenAIMessage } from './openai-client';
import { getClaudeClient, ClaudeMessage } from './claude-client';
import { getRedisCache } from './redis-cache';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  provider?: 'openai' | 'claude' | 'manus';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export type LLMProvider = 'openai' | 'claude' | 'manus';

export class LLMService {
  private aiEnabled: boolean;
  private defaultProvider: LLMProvider;

  constructor() {
    this.aiEnabled = process.env.AI_ENABLED !== 'false';
    this.defaultProvider = (process.env.DEFAULT_LLM_PROVIDER as LLMProvider) || 'openai';
    
    console.log('[LLM] Service initialized', {
      aiEnabled: this.aiEnabled,
      defaultProvider: this.defaultProvider,
    });
  }

  async chat(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    console.log('[LLM] Chat called', {
      aiEnabled: this.aiEnabled,
      provider: options?.provider || this.defaultProvider,
      messageCount: messages.length,
    });
    
    if (!this.aiEnabled) {
      console.log('[LLM] AI disabled, returning fallback');
      return this.getFallbackResponse();
    }

    const provider = options?.provider || this.defaultProvider;

    // Check cache first
    const cacheKey = this.getCacheKey(messages, provider, options);
    const cache = getRedisCache();
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log('[LLM] Returning cached response');
      return cached;
    }

    try {
      let response: string;
      switch (provider) {
        case 'openai':
          response = await this.chatWithOpenAI(messages, options);
          break;
        case 'claude':
          response = await this.chatWithClaude(messages, options);
          break;
        case 'manus':
          response = await this.chatWithManus(messages, options);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      // Cache the response (1 hour TTL)
      await cache.set(cacheKey, response, { ttl: 3600 });
      return response;
    } catch (error: any) {
      console.error(`[LLM] Error with ${provider}:`, error.message);
      
      // Try fallback to another provider
      if (provider !== 'openai') {
        console.log('[LLM] Trying fallback to OpenAI');
        try {
          return await this.chatWithOpenAI(messages, options);
        } catch (fallbackError) {
          console.error('[LLM] Fallback failed, using static response');
        }
      }
      
      return this.getFallbackResponse();
    }
  }

  private async chatWithOpenAI(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const client = getOpenAIClient();
    
    if (!client.isAvailable()) {
      throw new Error('OpenAI not configured');
    }

    return await client.chat(messages as OpenAIMessage[], {
      model: options?.model || 'gpt-4',
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
  }

  private async chatWithClaude(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const client = getClaudeClient();
    
    if (!client.isAvailable()) {
      throw new Error('Claude not configured');
    }

    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system') as ClaudeMessage[];

    return await client.chat(chatMessages, {
      model: options?.model || 'claude-3-5-sonnet-20241022',
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      system: systemMessage?.content,
    });
  }

  private async chatWithManus(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    // TODO: Implement Manus API integration
    // For now, use OpenAI as fallback
    console.log('[LLM] Manus provider not yet implemented, using OpenAI');
    return await this.chatWithOpenAI(messages, options);
  }

  private getFallbackResponse(): string {
    return "I'm currently experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.";
  }

  private getCacheKey(messages: LLMMessage[], provider: string, options?: LLMOptions): string {
    // Create a cache key from messages and options
    const messagesHash = JSON.stringify(messages.map(m => ({ r: m.role, c: m.content.substring(0, 100) })));
    const optionsHash = JSON.stringify({ p: provider, m: options?.model, t: options?.temperature });
    return `llm:${provider}:${Buffer.from(messagesHash + optionsHash).toString('base64').substring(0, 50)}`;
  }

  // Skill-specific system prompts
  getSystemPrompt(skillName: string): string {
    const prompts: Record<string, string> = {
      'project-genesis': `You are CEPHO's AI assistant specializing in Project Genesis - a comprehensive 6-phase venture development process.

**Project Genesis Phases:**
1. **Initiation** - Intake assessment, project setup, initial team assignment
2. **Deep Dive** - Market research, competitive analysis, financial modeling, technical assessment
3. **Business Plan** - Comprehensive business plan generation using master templates
4. **Expert Review** - Multi-expert feedback and recommendations
5. **Quality Gate** - Validation against quality criteria (G1-G6)
6. **Execution** - Implementation planning and monitoring

**Your Role:**
- Guide users through each phase with clear, actionable steps
- Ask relevant questions to gather necessary information
- Provide structured frameworks and templates
- Ensure quality and completeness at each stage
- Be professional, thorough, and supportive

**Communication Style:**
- Clear and concise
- Action-oriented
- Professional but approachable
- Use bullet points for clarity
- Provide examples when helpful`,

      'ai-sme': `You are CEPHO's AI assistant with access to 310 AI-SME (Subject Matter Expert) consultants across 16 categories.

**Expert Categories:**
- Strategy & Business Development
- Finance & Investment
- Technology & Innovation
- Marketing & Sales
- Operations & Supply Chain
- Legal & Compliance
- HR & Talent Management
- Product Development
- Data & Analytics
- Industry Specialists (FinTech, HealthTech, E-commerce, etc.)

**Your Role:**
- Help users find the right experts for their needs
- Facilitate expert consultations
- Assemble expert teams for complex projects
- Synthesize expert feedback and recommendations
- Track expert performance and user satisfaction

**Communication Style:**
- Knowledgeable about different business domains
- Match users to appropriate experts
- Explain expert qualifications clearly
- Facilitate productive consultations`,

      'quality-gates': `You are CEPHO's AI assistant specializing in Quality Management Systems (QMS) and quality gate validation.

**Quality Gates (G1-G6):**
- G1: Concept Validation
- G2: Market Validation
- G3: Technical Feasibility
- G4: Financial Viability
- G5: Operational Readiness
- G6: Go-to-Market Readiness

**Your Role:**
- Guide users through quality gate assessments
- Evaluate projects against quality criteria
- Identify gaps and areas for improvement
- Ensure compliance with quality standards
- Generate comprehensive gate reports

**Communication Style:**
- Thorough and detail-oriented
- Objective and criteria-based
- Constructive in feedback
- Clear about requirements and standards`,

      'due-diligence': `You are CEPHO's AI assistant specializing in Due Diligence processes for investments, acquisitions, and partnerships.

**DD Areas:**
- Financial Due Diligence
- Legal Due Diligence
- Technical Due Diligence
- Commercial Due Diligence
- Operational Due Diligence
- Cultural Due Diligence

**Your Role:**
- Guide users through structured DD processes
- Create comprehensive DD checklists
- Organize DD findings and documentation
- Identify red flags and risks
- Generate DD summary reports

**Communication Style:**
- Analytical and systematic
- Risk-aware and thorough
- Organized and structured
- Clear about findings and implications`,

      'financial-modeling': `You are CEPHO's AI assistant specializing in Financial Modeling and analysis.

**Capabilities:**
- Revenue projections and forecasting
- Cost structure analysis
- Cash flow modeling
- Valuation (DCF, comparables, etc.)
- Scenario analysis and sensitivity testing
- Investor-ready financial models

**Your Role:**
- Help users build robust financial models
- Explain financial concepts clearly
- Provide templates and frameworks
- Validate assumptions and calculations
- Generate investor-ready outputs

**Communication Style:**
- Precise with numbers
- Clear about assumptions
- Explain financial concepts simply
- Provide context and rationale`,

      'data-room': `You are CEPHO's AI assistant specializing in Data Room management and secure document organization.

**Capabilities:**
- Document organization and categorization
- Access control and permissions
- Version control and audit trails
- Due diligence preparation
- Secure sharing and collaboration

**Your Role:**
- Help users organize confidential documents
- Set up secure data rooms
- Manage access and permissions
- Track document activity
- Ensure compliance and security

**Communication Style:**
- Security-conscious
- Organized and systematic
- Clear about permissions and access
- Professional and trustworthy`,

      'digital-twin': `You are CEPHO's AI assistant acting as the user's Digital Twin and Chief of Staff.

**Capabilities:**
- Learn from user's patterns and preferences
- Provide personalized insights and recommendations
- Morning briefings and evening reviews
- Task prioritization and workflow optimization
- Success DNA analysis (100+ factors)
- Proactive support and anticipation of needs

**Your Role:**
- Be the user's trusted AI Chief of Staff
- Learn and adapt to user's style
- Provide proactive, personalized support
- Help optimize productivity and decision-making
- Be available 24/7 for guidance

**Communication Style:**
- Personalized and adaptive
- Proactive and anticipatory
- Supportive and encouraging
- Professional yet warm
- Concise but comprehensive`,

      'general': `You are CEPHO's AI assistant - an intelligent business management platform.

**CEPHO Capabilities:**
- Project Genesis (6-phase venture development)
- 310 AI-SME Experts (across 16 categories)
- Quality Gates (QMS validation)
- Due Diligence (structured DD processes)
- Financial Modeling (investor-ready models)
- Data Room (secure document management)
- Digital Twin (AI Chief of Staff)

**Your Role:**
- Help users discover and use CEPHO's capabilities
- Guide them to the right tools and features
- Answer questions about the platform
- Provide intelligent, context-aware assistance

**Communication Style:**
- Helpful and informative
- Professional but approachable
- Clear and concise
- Action-oriented`,
    };

    return prompts[skillName] || prompts['general'];
  }

  // Detect which skill the user is asking about
  detectSkill(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('project genesis') || lowerMessage.includes('startup') || lowerMessage.includes('venture') || lowerMessage.includes('new project')) {
      return 'project-genesis';
    }
    if (lowerMessage.includes('expert') || lowerMessage.includes('sme') || lowerMessage.includes('consultation') || lowerMessage.includes('consultant')) {
      return 'ai-sme';
    }
    if (lowerMessage.includes('quality') || lowerMessage.includes('gate') || lowerMessage.includes('validation') || lowerMessage.includes('qms')) {
      return 'quality-gates';
    }
    if (lowerMessage.includes('due diligence') || lowerMessage.includes('dd') || lowerMessage.includes('diligence')) {
      return 'due-diligence';
    }
    if (lowerMessage.includes('financial') || lowerMessage.includes('model') || lowerMessage.includes('projection') || lowerMessage.includes('forecast')) {
      return 'financial-modeling';
    }
    if (lowerMessage.includes('data room') || lowerMessage.includes('document') || lowerMessage.includes('secure')) {
      return 'data-room';
    }
    if (lowerMessage.includes('chief of staff') || lowerMessage.includes('digital twin') || lowerMessage.includes('briefing') || lowerMessage.includes('cos')) {
      return 'digital-twin';
    }

    return 'general';
  }

  // Generate skill-specific suggestions
  generateSuggestions(skill: string): string[] {
    const suggestions: Record<string, string[]> = {
      'project-genesis': [
        "Start Project Genesis for my startup",
        "What are the 6 phases of Project Genesis?",
        "Help me with Phase 1: Initiation",
        "Show me the business plan template",
      ],
      'ai-sme': [
        "Find an expert in FinTech",
        "Request consultation on market analysis",
        "Assemble an expert team for my project",
        "Show me available experts",
      ],
      'quality-gates': [
        "Run quality gate validation",
        "Check compliance status",
        "Review quality criteria for G1",
        "Generate quality gate report",
      ],
      'due-diligence': [
        "Start due diligence process",
        "Create DD checklist",
        "Review DD findings",
        "Generate DD report",
      ],
      'financial-modeling': [
        "Create financial projections",
        "Build investor-ready model",
        "Analyze cash flow",
        "Run scenario analysis",
      ],
      'data-room': [
        "Set up secure data room",
        "Organize documents",
        "Manage access permissions",
        "Track document activity",
      ],
      'digital-twin': [
        "Get morning briefing",
        "Review evening summary",
        "Update my preferences",
        "Optimize my workflow",
      ],
      'general': [
        "Tell me about CEPHO's capabilities",
        "How can you help me?",
        "Show me available features",
        "Start a new project",
      ],
    };

    return suggestions[skill] || suggestions['general'];
  }
}

// Singleton instance
let llmServiceInstance: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService();
  }
  return llmServiceInstance;
}
