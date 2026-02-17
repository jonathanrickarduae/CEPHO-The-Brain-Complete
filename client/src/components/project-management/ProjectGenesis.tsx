import React, { useState, useCallback } from 'react';
import { 
  Rocket, Target, FileText, Users, Scale, Search, Zap, 
  CheckCircle2, Clock, AlertTriangle, ChevronRight, ChevronDown,
  Eye, ThumbsUp, ThumbsDown, MessageSquare, Download, Share2,
  Lightbulb, Shield, TrendingUp, Palette, Globe, Building2,
  FileCheck, GitBranch, LayoutDashboard, Sparkles
} from 'lucide-react';

// ==================== TYPES ====================

type EngagementType = 
  | 'full_genesis'      // Complete new opportunity flow
  | 'financial_review'  // Financial analysis only
  | 'due_diligence'     // DD package
  | 'legal_docs'        // Legal documentation
  | 'strategic_review'  // Strategy and positioning
  | 'go_to_market'      // Brand building & market launch
  | 'custom';           // User selects specific deliverables

type ProjectStage = 'scoping' | 'questionnaire' | 'blueprint' | 'generation' | 'qa_review' | 'complete';

interface ScopingAnswers {
  engagementType: EngagementType;
  urgency: 'standard' | 'urgent' | 'critical';
  existingMaterials: boolean;
  counterpartyInvolved: boolean;
  regulatoryConsiderations: boolean;
  crossBorderElements: boolean;
  customDeliverables?: string[];
}

interface BestPracticeItem {
  id: string;
  category: 'legal' | 'financial' | 'operational' | 'brand' | 'compliance' | 'governance' | 'risk' | 'technical';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  included: boolean;
  aiSuggested: boolean;
  rationale?: string;
}

interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'visual' | 'checklist' | 'model' | 'blueprint';
  category: string;
  status: 'pending' | 'generating' | 'qa_review' | 'approved' | 'revision_needed';
  qaStatus?: {
    twinReviewed: boolean;
    twinApproved: boolean;
    twinNotes?: string;
    userApproved: boolean;
    userFeedback?: string;
    revisionCount: number;
  };
  estimatedTime: string;
  dependencies?: string[];
}

interface ProjectData {
  // Basic Info
  projectName: string;
  oneLineDescription: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'revenue' | 'growth' | 'mature';
  
  // People
  founders: Array<{
    name: string;
    role: string;
    email: string;
    shareholding: number;
  }>;
  keyStakeholders: string[];
  
  // Business
  targetMarket: string;
  revenueModel: string;
  currentRevenue: string;
  fundingTarget: string;
  useOfFunds: string;
  competitiveAdvantage: string;
  
  // Legal & Structure
  jurisdiction: string;
  existingCompany: boolean;
  corporateStructure: string;
  existingContracts: string[];
  ipStatus: string;
  
  // Due Diligence
  knownRisks: string[];
  supplierDependencies: string[];
  regulatoryRequirements: string[];
  
  // Brand
  brandGuidelines: boolean;
  logoStatus: 'none' | 'draft' | 'final';
  colorPalette: boolean;
  websiteStatus: 'none' | 'planned' | 'live';
}

// ==================== CONSTANTS ====================

const ENGAGEMENT_TYPES: Array<{
  type: EngagementType;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  deliverableCount: string;
}> = [
  {
    type: 'full_genesis',
    title: 'Full Project Genesis',
    description: 'Complete new opportunity setup with all documents, models, and architecture',
    icon: <Rocket className="w-6 h-6" />,
    estimatedTime: '2-3 hours',
    deliverableCount: '15-20 deliverables'
  },
  {
    type: 'financial_review',
    title: 'Financial Review',
    description: 'Financial model, valuation analysis, key metrics, and projections',
    icon: <TrendingUp className="w-6 h-6" />,
    estimatedTime: '45-60 mins',
    deliverableCount: '4-6 deliverables'
  },
  {
    type: 'due_diligence',
    title: 'Due Diligence Package',
    description: 'Comprehensive DD checklist, risk assessment, and document requests',
    icon: <Search className="w-6 h-6" />,
    estimatedTime: '1-2 hours',
    deliverableCount: '8-12 deliverables'
  },
  {
    type: 'legal_docs',
    title: 'Legal Documentation',
    description: 'NDA, term sheets, shareholder agreements, and corporate documents',
    icon: <Scale className="w-6 h-6" />,
    estimatedTime: '1-1.5 hours',
    deliverableCount: '6-10 deliverables'
  },
  {
    type: 'strategic_review',
    title: 'Strategic Review',
    description: 'Market positioning, competitive analysis, and strategic recommendations',
    icon: <Target className="w-6 h-6" />,
    estimatedTime: '1-2 hours',
    deliverableCount: '5-8 deliverables'
  },
  {
    type: 'go_to_market',
    title: 'Go-To-Market Launch',
    description: 'Brand building, social media setup, content strategy, and market launch plan',
    icon: <Globe className="w-6 h-6" />,
    estimatedTime: '2-4 hours',
    deliverableCount: '12-18 deliverables'
  },
  {
    type: 'custom',
    title: 'Custom Selection',
    description: 'Choose specific deliverables based on your needs',
    icon: <Sparkles className="w-6 h-6" />,
    estimatedTime: 'Varies',
    deliverableCount: 'You choose'
  }
];

const INDUSTRIES = [
  'Technology', 'Telecommunications', 'Healthcare', 'Pharmaceuticals', 'Fintech', 
  'Energy', 'Renewable Energy', 'Real Estate', 'Manufacturing', 'Retail', 
  'Media & Entertainment', 'Education', 'Agriculture', 'Transportation', 'Other'
];

const JURISDICTIONS = [
  'United Kingdom', 'Cayman Islands', 'BVI', 'Delaware (US)', 'Jersey',
  'Guernsey', 'Singapore', 'Ireland', 'Netherlands', 'UAE (DIFC)', 
  'UAE (ADGM)', 'Hong Kong', 'Luxembourg', 'Other'
];

// Best practices that AI proactively suggests
const PROACTIVE_BEST_PRACTICES: BestPracticeItem[] = [
  // Legal
  { id: 'bp1', category: 'legal', title: 'NDA with mutual confidentiality', description: 'Protect both parties with bilateral NDA terms', priority: 'critical', included: true, aiSuggested: true },
  { id: 'bp2', category: 'legal', title: 'IP assignment agreements', description: 'Ensure all IP is properly assigned to the company', priority: 'critical', included: true, aiSuggested: true },
  { id: 'bp3', category: 'legal', title: 'Founder vesting schedules', description: '4-year vesting with 1-year cliff is standard', priority: 'high', included: true, aiSuggested: true },
  { id: 'bp4', category: 'legal', title: 'Employment contracts review', description: 'Ensure key employees have proper contracts', priority: 'high', included: false, aiSuggested: true },
  
  // Financial
  { id: 'bp5', category: 'financial', title: 'Three-statement financial model', description: 'P&L, Balance Sheet, Cash Flow projections', priority: 'critical', included: true, aiSuggested: true },
  { id: 'bp6', category: 'financial', title: 'DCF valuation analysis', description: 'Discounted cash flow with sensitivity analysis', priority: 'high', included: true, aiSuggested: true },
  { id: 'bp7', category: 'financial', title: 'Cap table management', description: 'Clean cap table with all equity holders', priority: 'critical', included: true, aiSuggested: true },
  { id: 'bp8', category: 'financial', title: 'Unit economics breakdown', description: 'CAC, LTV, payback period analysis', priority: 'high', included: false, aiSuggested: true },
  
  // Operational
  { id: 'bp9', category: 'operational', title: 'Organizational chart', description: 'Clear reporting structure and roles', priority: 'medium', included: true, aiSuggested: true },
  { id: 'bp10', category: 'operational', title: 'Key processes documentation', description: 'Document critical business processes', priority: 'medium', included: false, aiSuggested: true },
  { id: 'bp11', category: 'operational', title: 'Supplier/vendor agreements', description: 'Review key supplier contracts', priority: 'high', included: false, aiSuggested: true },
  
  // Brand
  { id: 'bp12', category: 'brand', title: 'Logo quality check', description: 'Ensure logo is high-res and properly formatted', priority: 'medium', included: true, aiSuggested: true, rationale: 'Logo color and format often needs reviewing for professional documents' },
  { id: 'bp13', category: 'brand', title: 'Brand guidelines document', description: 'Colors, fonts, usage rules', priority: 'low', included: false, aiSuggested: true },
  { id: 'bp14', category: 'brand', title: 'Consistent naming convention', description: 'Company name used consistently across all materials', priority: 'medium', included: true, aiSuggested: true },
  
  // Compliance
  { id: 'bp15', category: 'compliance', title: 'Data protection compliance', description: 'GDPR/CCPA readiness assessment', priority: 'high', included: true, aiSuggested: true },
  { id: 'bp16', category: 'compliance', title: 'Industry-specific regulations', description: 'Identify applicable regulatory requirements', priority: 'high', included: true, aiSuggested: true },
  { id: 'bp17', category: 'compliance', title: 'AML/KYC procedures', description: 'Anti-money laundering compliance', priority: 'critical', included: true, aiSuggested: true },
  
  // Governance
  { id: 'bp18', category: 'governance', title: 'Board composition plan', description: 'Independent directors, observer rights', priority: 'medium', included: false, aiSuggested: true },
  { id: 'bp19', category: 'governance', title: 'Shareholder rights', description: 'Voting rights, information rights, consent matters', priority: 'high', included: true, aiSuggested: true },
  { id: 'bp20', category: 'governance', title: 'Conflict of interest policy', description: 'Clear policy for related party transactions', priority: 'medium', included: false, aiSuggested: true },
  
  // Risk
  { id: 'bp21', category: 'risk', title: 'Risk register', description: 'Comprehensive risk identification and mitigation', priority: 'high', included: true, aiSuggested: true },
  { id: 'bp22', category: 'risk', title: 'Insurance coverage review', description: 'D&O, E&O, cyber insurance assessment', priority: 'medium', included: false, aiSuggested: true },
  { id: 'bp23', category: 'risk', title: 'Business continuity plan', description: 'Key person risk and continuity planning', priority: 'medium', included: false, aiSuggested: true },
  
  // Technical
  { id: 'bp24', category: 'technical', title: 'Technology stack review', description: 'Scalability and technical debt assessment', priority: 'medium', included: false, aiSuggested: true },
  { id: 'bp25', category: 'technical', title: 'Security audit status', description: 'Penetration testing and security review', priority: 'high', included: false, aiSuggested: true },
];

// ==================== COMPONENT ====================

export function ProjectGenesis() {
  const [stage, setStage] = useState<ProjectStage>('scoping');
  const [scopingAnswers, setScopingAnswers] = useState<Partial<ScopingAnswers>>({});
  const [bestPractices, setBestPractices] = useState<BestPracticeItem[]>(PROACTIVE_BEST_PRACTICES);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projectData, setProjectData] = useState<Partial<ProjectData>>({
    founders: [{ name: '', role: '', email: '', shareholding: 100 }],
    keyStakeholders: [],
    knownRisks: [],
    supplierDependencies: [],
    regulatoryRequirements: [],
    existingContracts: [],
  });
  const [currentQuestionPhase, setCurrentQuestionPhase] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['legal', 'financial']);
  const [qaFeedback, setQaFeedback] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // ==================== HANDLERS ====================

  const handleEngagementSelect = (type: EngagementType) => {
    setScopingAnswers(prev => ({ ...prev, engagementType: type }));
  };

  const toggleBestPractice = (id: string) => {
    setBestPractices(prev => prev.map(bp => 
      bp.id === id ? { ...bp, included: !bp.included } : bp
    ));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const proceedToQuestionnaire = () => {
    // Generate deliverables based on engagement type and best practices
    const selectedDeliverables = generateDeliverables(
      scopingAnswers.engagementType || 'full_genesis',
      bestPractices.filter(bp => bp.included)
    );
    setDeliverables(selectedDeliverables);
    setStage('questionnaire');
  };

  const generateDeliverables = (type: EngagementType, practices: BestPracticeItem[]): Deliverable[] => {
    const base: Deliverable[] = [];
    
    // Always include visual blueprint
    base.push({
      id: 'blueprint',
      name: 'Visual Project Blueprint',
      type: 'blueprint',
      category: 'Architecture',
      status: 'pending',
      estimatedTime: '15 mins',
      qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 }
    });

    if (type === 'full_genesis' || type === 'legal_docs') {
      base.push(
        { id: 'nda', name: 'Non-Disclosure Agreement', type: 'document', category: 'Legal', status: 'pending', estimatedTime: '10 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'sha', name: 'Shareholder Agreement (Draft)', type: 'document', category: 'Legal', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    if (type === 'full_genesis' || type === 'financial_review') {
      base.push(
        { id: 'fin_model', name: 'Three-Statement Financial Model', type: 'model', category: 'Financial', status: 'pending', estimatedTime: '30 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'dcf', name: 'DCF Valuation Analysis', type: 'model', category: 'Financial', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'cap_table', name: 'Cap Table', type: 'model', category: 'Financial', status: 'pending', estimatedTime: '10 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    if (type === 'full_genesis' || type === 'due_diligence') {
      base.push(
        { id: 'dd_checklist', name: 'Due Diligence Checklist', type: 'checklist', category: 'Due Diligence', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'risk_register', name: 'Risk Register', type: 'document', category: 'Due Diligence', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'data_room', name: 'Data Room Structure', type: 'checklist', category: 'Due Diligence', status: 'pending', estimatedTime: '10 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    if (type === 'full_genesis' || type === 'strategic_review') {
      base.push(
        { id: 'teaser', name: 'One-Page Teaser', type: 'document', category: 'Marketing', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'deck', name: 'Investment Deck', type: 'document', category: 'Marketing', status: 'pending', estimatedTime: '30 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'competitive', name: 'Competitive Analysis', type: 'document', category: 'Strategy', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    if (type === 'full_genesis') {
      base.push(
        { id: 'qms', name: 'Quality Management Framework', type: 'document', category: 'Governance', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'org_chart', name: 'Organizational Chart', type: 'visual', category: 'Operations', status: 'pending', estimatedTime: '10 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'action_plan', name: 'Next 90 Days Action Plan', type: 'checklist', category: 'Operations', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    // Go-To-Market deliverables
    if (type === 'go_to_market' || type === 'full_genesis') {
      base.push(
        { id: 'brand_audit', name: 'Brand & Social Media Audit', type: 'document', category: 'Brand', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'brand_identity', name: 'Brand Identity Guidelines', type: 'document', category: 'Brand', status: 'pending', estimatedTime: '25 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'messaging', name: 'Brand Voice & Messaging Framework', type: 'document', category: 'Brand', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    if (type === 'go_to_market') {
      base.push(
        { id: 'social_strategy', name: 'Social Media Strategy', type: 'document', category: 'Social', status: 'pending', estimatedTime: '30 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'content_calendar', name: 'Content Calendar (90 Days)', type: 'checklist', category: 'Social', status: 'pending', estimatedTime: '25 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'platform_setup', name: 'Platform Optimization Guide', type: 'checklist', category: 'Social', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'bio_copy', name: 'Bio & Profile Copy (All Platforms)', type: 'document', category: 'Social', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'hashtag_strategy', name: 'Hashtag & SEO Strategy', type: 'document', category: 'Social', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'growth_playbook', name: 'Follower Growth Playbook', type: 'document', category: 'Growth', status: 'pending', estimatedTime: '25 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'launch_plan', name: 'Launch Campaign Plan', type: 'document', category: 'Launch', status: 'pending', estimatedTime: '30 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'pr_outreach', name: 'PR & Media Outreach List', type: 'checklist', category: 'Launch', status: 'pending', estimatedTime: '20 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'influencer_list', name: 'Influencer & Partner Targets', type: 'checklist', category: 'Growth', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'kpi_dashboard', name: 'KPI & Analytics Dashboard Setup', type: 'checklist', category: 'Analytics', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
        { id: 'automation', name: 'Posting & Automation Setup Guide', type: 'checklist', category: 'Operations', status: 'pending', estimatedTime: '15 mins', qaStatus: { twinReviewed: false, twinApproved: false, userApproved: false, revisionCount: 0 } },
      );
    }

    return base;
  };

  const startGeneration = async () => {
    setStage('generation');
    setIsGenerating(true);

    // Simulate generation with QA review
    for (let i = 0; i < deliverables.length; i++) {
      // Update to generating
      setDeliverables(prev => prev.map((d, idx) => 
        idx === i ? { ...d, status: 'generating' } : d
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Move to QA review (Chief of Staff reviews first)
      setDeliverables(prev => prev.map((d, idx) => 
        idx === i ? { 
          ...d, 
          status: 'qa_review',
          qaStatus: { 
            ...d.qaStatus!,
            twinReviewed: true, 
            twinApproved: Math.random() > 0.2, // 80% approval rate
            twinNotes: Math.random() > 0.5 ? 'Looks good, minor formatting suggestions applied.' : 'Reviewed and approved. All sections complete.'
          }
        } : d
      ));
    }

    setIsGenerating(false);
    setStage('qa_review');
  };

  const handleQAAction = (deliverableId: string, action: 'approve' | 'revise', feedback?: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id !== deliverableId) return d;
      
      if (action === 'approve') {
        return {
          ...d,
          status: 'approved',
          qaStatus: { ...d.qaStatus!, userApproved: true, userFeedback: feedback }
        };
      } else {
        return {
          ...d,
          status: 'revision_needed',
          qaStatus: { 
            ...d.qaStatus!, 
            userApproved: false, 
            userFeedback: feedback,
            revisionCount: (d.qaStatus?.revisionCount || 0) + 1
          }
        };
      }
    }));
   };

  const allDeliverablesApproved = deliverables.every(d => d.status === 'approved');

  // ==================== RENDER FUNCTIONS ====================

  const renderScoping = () => (
    <div className="space-y-8">
      {/* Engagement Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          What type of engagement is this?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGAGEMENT_TYPES.map(eng => (
            <button
              key={eng.type}
              onClick={() => handleEngagementSelect(eng.type)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                scopingAnswers.engagementType === eng.type
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
            >
              <div className={`p-2 w-fit rounded-lg mb-3 ${
                scopingAnswers.engagementType === eng.type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {eng.icon}
              </div>
              <h4 className="font-semibold text-foreground">{eng.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{eng.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {eng.estimatedTime}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {eng.deliverableCount}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Scoping Questions */}
      {scopingAnswers.engagementType && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Quick Scoping Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={scopingAnswers.existingMaterials || false}
                onChange={(e) => setScopingAnswers(prev => ({ ...prev, existingMaterials: e.target.checked }))}
                className="w-4 h-4 rounded border-border"
              />
              <div>
                <span className="font-medium text-foreground">Existing materials available</span>
                <p className="text-xs text-muted-foreground">Prior documents, models, or presentations</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={scopingAnswers.counterpartyInvolved || false}
                onChange={(e) => setScopingAnswers(prev => ({ ...prev, counterpartyInvolved: e.target.checked }))}
                className="w-4 h-4 rounded border-border"
              />
              <div>
                <span className="font-medium text-foreground">Counterparty involved</span>
                <p className="text-xs text-muted-foreground">Investor, partner, or acquirer identified</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={scopingAnswers.regulatoryConsiderations || false}
                onChange={(e) => setScopingAnswers(prev => ({ ...prev, regulatoryConsiderations: e.target.checked }))}
                className="w-4 h-4 rounded border-border"
              />
              <div>
                <span className="font-medium text-foreground">Regulatory considerations</span>
                <p className="text-xs text-muted-foreground">Industry-specific compliance requirements</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                checked={scopingAnswers.crossBorderElements || false}
                onChange={(e) => setScopingAnswers(prev => ({ ...prev, crossBorderElements: e.target.checked }))}
                className="w-4 h-4 rounded border-border"
              />
              <div>
                <span className="font-medium text-foreground">Cross-border elements</span>
                <p className="text-xs text-muted-foreground">Multiple jurisdictions involved</p>
              </div>
            </label>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Timeline</label>
            <div className="flex gap-3">
              {(['standard', 'urgent', 'critical'] as const).map(urgency => (
                <button
                  key={urgency}
                  onClick={() => setScopingAnswers(prev => ({ ...prev, urgency }))}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    scopingAnswers.urgency === urgency
                      ? urgency === 'critical' 
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : urgency === 'urgent'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Proactive Best Practices */}
      {scopingAnswers.engagementType && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              AI-Suggested Best Practices
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (We've identified {bestPractices.filter(bp => bp.aiSuggested).length} items you should consider)
              </span>
            </h3>
            <div className="text-sm text-muted-foreground">
              {bestPractices.filter(bp => bp.included).length} selected
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong>Proactive Analysis:</strong> Based on your engagement type, we've identified best practices 
              from legal, financial, operational, brand, compliance, governance, risk, and technical perspectives. 
              Toggle items to include or exclude from your deliverables.
            </p>
          </div>

          <div className="space-y-2">
            {(['legal', 'financial', 'operational', 'brand', 'compliance', 'governance', 'risk', 'technical'] as const).map(category => {
              const categoryItems = bestPractices.filter(bp => bp.category === category);
              const includedCount = categoryItems.filter(bp => bp.included).length;
              const isExpanded = expandedCategories.includes(category);
              
              const categoryIcons: Record<string, React.ReactNode> = {
                legal: <Scale className="w-4 h-4" />,
                financial: <TrendingUp className="w-4 h-4" />,
                operational: <Building2 className="w-4 h-4" />,
                brand: <Palette className="w-4 h-4" />,
                compliance: <Shield className="w-4 h-4" />,
                governance: <Users className="w-4 h-4" />,
                risk: <AlertTriangle className="w-4 h-4" />,
                technical: <GitBranch className="w-4 h-4" />,
              };

              return (
                <div key={category} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{categoryIcons[category]}</span>
                      <span className="font-medium text-foreground capitalize">{category}</span>
                      <span className="text-xs text-muted-foreground">
                        ({includedCount}/{categoryItems.length} included)
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-border divide-y divide-border">
                      {categoryItems.map(bp => (
                        <label
                          key={bp.id}
                          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={bp.included}
                            onChange={() => toggleBestPractice(bp.id)}
                            className="w-4 h-4 mt-0.5 rounded border-border"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground text-sm">{bp.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                bp.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                bp.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                bp.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-foreground/70'
                              }`}>
                                {bp.priority}
                              </span>
                              {bp.aiSuggested && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                  AI suggested
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{bp.description}</p>
                            {bp.rationale && (
                              <p className="text-xs text-amber-400/80 mt-1 italic">💡 {bp.rationale}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proceed Button */}
      {scopingAnswers.engagementType && (
        <div className="flex justify-end">
          <button
            onClick={proceedToQuestionnaire}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Continue to Questionnaire
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  const renderQuestionnaire = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Project Details</h3>
        <div className="text-sm text-muted-foreground">
          {deliverables.length} deliverables queued
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Basic Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Project/Company Name *</label>
            <input
              type="text"
              value={projectData.projectName || ''}
              onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., WasteGen Technologies"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Industry *</label>
            <select
              value={projectData.industry || ''}
              onChange={(e) => setProjectData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">One-Line Description *</label>
          <input
            type="text"
            value={projectData.oneLineDescription || ''}
            onChange={(e) => setProjectData(prev => ({ ...prev, oneLineDescription: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Converting organic waste into renewable energy through proprietary biogas technology"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Jurisdiction *</label>
          <select
            value={projectData.jurisdiction || ''}
            onChange={(e) => setProjectData(prev => ({ ...prev, jurisdiction: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select jurisdiction</option>
            {JURISDICTIONS.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliverables Preview */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          Deliverables to Generate
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deliverables.map(d => (
            <div key={d.id} className="p-3 border border-border rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2">
                {d.type === 'blueprint' ? <GitBranch className="w-4 h-4 text-purple-500" /> :
                 d.type === 'visual' ? <Eye className="w-4 h-4 text-cyan-500" /> :
                 d.type === 'model' ? <TrendingUp className="w-4 h-4 text-green-500" /> :
                 d.type === 'checklist' ? <FileCheck className="w-4 h-4 text-amber-500" /> :
                 <FileText className="w-4 h-4 text-blue-500" />}
                <span className="text-sm font-medium text-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{d.category}</span>
                <span>•</span>
                <span>{d.estimatedTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-between">
        <button
          onClick={() => setStage('scoping')}
          className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary/50 transition-colors"
        >
          Back to Scoping
        </button>
        <button
          onClick={startGeneration}
          disabled={!projectData.projectName || !projectData.industry || !projectData.jurisdiction}
          className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Generate All Deliverables
        </button>
      </div>
    </div>
  );

  const renderQAReview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          Quality Assurance Review
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-500">
            {deliverables.filter(d => d.status === 'approved').length} approved
          </span>
          <span className="text-amber-500">
            {deliverables.filter(d => d.status === 'qa_review').length} pending review
          </span>
          <span className="text-red-500">
            {deliverables.filter(d => d.status === 'revision_needed').length} needs revision
          </span>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          <strong>QA Workflow:</strong> Your Chief of Staff has reviewed each deliverable first. 
          Review the Twin's notes, then approve or request revisions. Your feedback trains the Twin 
          to improve future quality assessments.
        </p>
      </div>

      <div className="space-y-4">
        {deliverables.map(d => (
          <div 
            key={d.id} 
            className={`p-4 border rounded-lg transition-all ${
              d.status === 'approved' ? 'border-green-500/50 bg-green-500/5' :
              d.status === 'revision_needed' ? 'border-red-500/50 bg-red-500/5' :
              'border-border bg-card'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {d.type === 'blueprint' ? <GitBranch className="w-5 h-5 text-purple-500" /> :
                 d.type === 'visual' ? <Eye className="w-5 h-5 text-cyan-500" /> :
                 d.type === 'model' ? <TrendingUp className="w-5 h-5 text-green-500" /> :
                 d.type === 'checklist' ? <FileCheck className="w-5 h-5 text-amber-500" /> :
                 <FileText className="w-5 h-5 text-blue-500" />}
                <div>
                  <h4 className="font-medium text-foreground">{d.name}</h4>
                  <p className="text-xs text-muted-foreground">{d.category}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {d.status === 'approved' && (
                  <span className="flex items-center gap-1 text-sm text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    Approved
                  </span>
                )}
                {d.status === 'revision_needed' && (
                  <span className="flex items-center gap-1 text-sm text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    Revision #{d.qaStatus?.revisionCount}
                  </span>
                )}
                <button className="px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
                <button className="px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80 flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>

            {/* Chief of Staff Review */}
            {d.qaStatus?.twinReviewed && (
              <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-xs">🧠</span>
                  </div>
                  <span className="text-sm font-medium text-purple-300">Chief of Staff Review</span>
                  {d.qaStatus.twinApproved ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Approved</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Suggestions</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{d.qaStatus.twinNotes}</p>
              </div>
            )}

            {/* User Review Actions */}
            {d.status === 'qa_review' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Your feedback (optional - helps train the Chief of Staff)
                  </label>
                  <textarea
                    value={qaFeedback[d.id] || ''}
                    onChange={(e) => setQaFeedback(prev => ({ ...prev, [d.id]: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
                    rows={2}
                    placeholder="Any corrections or improvements needed..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQAAction(d.id, 'approve', qaFeedback[d.id])}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleQAAction(d.id, 'revise', qaFeedback[d.id])}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Revision
                  </button>
                </div>
              </div>
            )}

            {/* User Feedback Display */}
            {d.qaStatus?.userFeedback && d.status !== 'qa_review' && (
              <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                <span className="text-xs text-muted-foreground">Your feedback:</span>
                <p className="text-sm text-foreground mt-1">{d.qaStatus.userFeedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complete Button */}
      {allDeliverablesApproved && (
        <div className="flex justify-center">
          <button
            onClick={() => setStage('complete')}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Complete Project Genesis
          </button>
        </div>
      )}
    </div>
  );

  const renderGeneration = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Generating Deliverables</h3>
        <p className="text-muted-foreground mt-2">
          AI Experts are creating your documents. Chief of Staff will review each one.
        </p>
      </div>

      <div className="space-y-3">
        {deliverables.map(d => (
          <div key={d.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-3">
              {d.status === 'generating' ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : d.status === 'qa_review' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">{d.name}</span>
            </div>
            <span className={`text-sm ${
              d.status === 'generating' ? 'text-primary' :
              d.status === 'qa_review' ? 'text-green-500' :
              'text-muted-foreground'
            }`}>
              {d.status === 'generating' ? 'Generating...' :
               d.status === 'qa_review' ? 'Ready for review' :
               'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground">Project Genesis Complete!</h3>
        <p className="text-muted-foreground mt-2">
          All {deliverables.length} deliverables have been generated and approved.
        </p>
      </div>
      
      <div className="flex justify-center gap-4">
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download All
        </button>
        <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary/50 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Package
        </button>
        <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary/50 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          View Blueprint
        </button>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Project Genesis</h2>
        </div>
        <p className="text-muted-foreground">
          New opportunity engine with AI-powered document generation, visual blueprints, and quality assurance
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {(['scoping', 'questionnaire', 'generation', 'qa_review', 'complete'] as ProjectStage[]).map((s, index) => {
            const stages = ['scoping', 'questionnaire', 'generation', 'qa_review', 'complete'];
            const currentIndex = stages.indexOf(stage);
            const stepIndex = stages.indexOf(s);
            const isComplete = stepIndex < currentIndex;
            const isCurrent = s === stage;
            
            const labels: Record<ProjectStage, string> = {
              scoping: 'Scope',
              questionnaire: 'Details',
              blueprint: 'Blueprint',
              generation: 'Generate',
              qa_review: 'QA Review',
              complete: 'Complete'
            };
            
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isComplete ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-primary text-primary-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {labels[s]}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    stepIndex < currentIndex ? 'bg-green-500' : 'bg-secondary'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card/50 border border-border rounded-xl p-6">
        {stage === 'scoping' && renderScoping()}
        {stage === 'questionnaire' && renderQuestionnaire()}
        {stage === 'generation' && renderGeneration()}
        {stage === 'qa_review' && renderQAReview()}
        {stage === 'complete' && renderComplete()}
      </div>
    </div>
  );
}

export default ProjectGenesis;
