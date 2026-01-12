import React, { useState } from 'react';
import { 
  Video, FileText, Users, BarChart3, Rocket, Plus, Settings,
  Play, Eye, Share2, Download, Copy, ExternalLink, Trash2,
  ChevronRight, Clock, CheckCircle, AlertCircle, Sparkles,
  Wand2, Edit3, Save, X, Link2, Lock, Globe, TrendingUp
} from 'lucide-react';
import InvestorAnalyticsDashboard from '@/components/InvestorAnalyticsDashboard';
import {
  generateOverviewScript,
  generateProductScript,
  generateTeamScript,
  generateTractionScript,
  generateFullPitchPack,
  exportProductionBrief,
  formatForTeleprompter,
  type BusinessData,
  type GeneratedScript,
  type ScriptOptions
} from '@/lib/videoScriptGenerator';

// ============================================================================
// TYPES
// ============================================================================

interface PitchPackDraft {
  id: string;
  name: string;
  companyName: string;
  status: 'draft' | 'scripts_ready' | 'in_production' | 'complete';
  createdAt: Date;
  scripts: {
    overview?: GeneratedScript;
    product?: GeneratedScript;
    team?: GeneratedScript;
    traction?: GeneratedScript;
  };
  businessData?: BusinessData;
}

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_BUSINESS_DATA: BusinessData = {
  companyName: 'TechVenture AI',
  tagline: 'Intelligent automation for enterprise',
  industry: 'Enterprise Software',
  stage: 'growth',
  problem: 'Enterprises waste 40% of employee time on repetitive tasks that could be automated',
  solution: 'provides AI agents that autonomously handle complex business processes',
  uniqueValue: 'Our agents learn from your existing workflows and improve over time, requiring zero coding',
  targetMarket: 'Mid-market and enterprise companies with 500+ employees',
  marketSize: '$50 billion by 2025',
  competitors: ['UiPath', 'Automation Anywhere'],
  competitiveAdvantage: 'We\'re the only solution that requires no technical setup and learns autonomously',
  currentRevenue: '$2.5M ARR',
  customers: '45 enterprise customers',
  growthRate: '25% month-over-month',
  keyMetrics: ['95% customer retention', 'NPS of 72', '60% cost reduction for clients'],
  founders: [
    { name: 'Sarah Chen', role: 'CEO', background: '10 years at Google leading AI initiatives' },
    { name: 'Marcus Johnson', role: 'CTO', background: 'Former VP Engineering at Salesforce' }
  ],
  teamSize: 35,
  keyHires: ['Head of Sales from Slack', 'VP Product from Notion'],
  fundingTarget: '$15M Series A',
  useOfFunds: 'expand sales team and accelerate product development',
  previousFunding: '$3M seed round',
  vision: 'Every knowledge worker will have an AI assistant handling their routine work',
  milestones: ['100 customers', '$10M ARR', 'European expansion', 'IPO-ready']
};

// ============================================================================
// SCRIPT CARD COMPONENT
// ============================================================================

function ScriptCard({ 
  type, 
  script, 
  onGenerate, 
  onView, 
  onExport,
  isGenerating 
}: { 
  type: 'overview' | 'product' | 'team' | 'traction';
  script?: GeneratedScript;
  onGenerate: () => void;
  onView: () => void;
  onExport: () => void;
  isGenerating: boolean;
}) {
  const icons = {
    overview: <Rocket className="w-6 h-6" />,
    product: <BarChart3 className="w-6 h-6" />,
    team: <Users className="w-6 h-6" />,
    traction: <BarChart3 className="w-6 h-6" />
  };
  
  const titles = {
    overview: 'Company Overview',
    product: 'Product Deep Dive',
    team: 'Team & Vision',
    traction: 'Traction & Metrics'
  };
  
  const descriptions = {
    overview: '2-minute introduction covering problem, solution, market, and ask',
    product: 'Detailed walkthrough of how your product works and key features',
    team: 'Meet the founders, team, and long-term vision',
    traction: 'Key metrics, growth, customers, and milestones'
  };
  
  return (
    <div className={`bg-gray-800/50 rounded-xl border ${script ? 'border-green-500/30' : 'border-gray-700/50'} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          script ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
        }`}>
          {icons[type]}
        </div>
        {script && (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Ready
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">{titles[type]}</h3>
      <p className="text-sm text-gray-400 mb-4">{descriptions[type]}</p>
      
      {script ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(script.estimatedDuration / 60)}:{(script.estimatedDuration % 60).toString().padStart(2, '0')}
            </span>
            <span>{script.totalWords} words</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={onExport}
              className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Script
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SCRIPT VIEWER MODAL
// ============================================================================

function ScriptViewerModal({ 
  script, 
  onClose 
}: { 
  script: GeneratedScript; 
  onClose: () => void;
}) {
  const [view, setView] = useState<'script' | 'teleprompter' | 'brief'>('script');
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{script.title}</h2>
            <p className="text-sm text-gray-400">
              {Math.floor(script.estimatedDuration / 60)}:{(script.estimatedDuration % 60).toString().padStart(2, '0')} • {script.totalWords} words • {script.tone} tone
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* View Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-800">
          {(['script', 'teleprompter', 'brief'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === v 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {v === 'script' ? 'Full Script' : v === 'teleprompter' ? 'Teleprompter' : 'Production Brief'}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {view === 'script' && (
            <div className="space-y-6">
              {/* Key Messages */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-300 mb-2">Key Messages</h3>
                <ul className="space-y-1">
                  {script.keyMessages.map((msg, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Hook */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Hook ({script.hook.duration}s)
                </h3>
                <p className="text-gray-200 leading-relaxed">{script.hook.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {script.hook.visualSuggestions.map((v, i) => (
                    <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      📹 {v}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Sections */}
              {script.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {section.name} ({section.duration}s)
                  </h3>
                  <p className="text-gray-200 leading-relaxed">{section.content}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {section.visualSuggestions.map((v, j) => (
                      <span key={j} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        📹 {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* CTA */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Call to Action ({script.callToAction.duration}s)
                </h3>
                <p className="text-gray-200 leading-relaxed">{script.callToAction.content}</p>
              </div>
            </div>
          )}
          
          {view === 'teleprompter' && (
            <pre className="text-gray-200 whitespace-pre-wrap font-mono text-lg leading-loose">
              {formatForTeleprompter(script)}
            </pre>
          )}
          
          {view === 'brief' && (
            <pre className="text-gray-200 whitespace-pre-wrap text-sm">
              {exportProductionBrief(script)}
            </pre>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
          <button
            onClick={() => {
              const content = view === 'brief' 
                ? exportProductionBrief(script) 
                : view === 'teleprompter'
                ? formatForTeleprompter(script)
                : script.fullScript;
              navigator.clipboard.writeText(content);
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={() => {
              const content = view === 'brief' 
                ? exportProductionBrief(script) 
                : view === 'teleprompter'
                ? formatForTeleprompter(script)
                : script.fullScript;
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${script.title.replace(/\s+/g, '_')}_${view}.txt`;
              a.click();
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN VIDEO PITCH STUDIO PAGE
// ============================================================================

export default function VideoPitchStudio() {
  const [activeTab, setActiveTab] = useState<'studio' | 'analytics'>('studio');
  const [scripts, setScripts] = useState<{
    overview?: GeneratedScript;
    product?: GeneratedScript;
    team?: GeneratedScript;
    traction?: GeneratedScript;
  }>({});
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [viewingScript, setViewingScript] = useState<GeneratedScript | null>(null);
  const [businessData] = useState<BusinessData>(DEMO_BUSINESS_DATA);
  
  const handleGenerateScript = async (type: 'overview' | 'product' | 'team' | 'traction') => {
    setIsGenerating(type);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generators = {
      overview: generateOverviewScript,
      product: generateProductScript,
      team: generateTeamScript,
      traction: generateTractionScript
    };
    
    const script = generators[type](businessData);
    setScripts(prev => ({ ...prev, [type]: script }));
    setIsGenerating(null);
  };
  
  const handleGenerateAll = async () => {
    setIsGenerating('all');
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const allScripts = generateFullPitchPack(businessData);
    setScripts(allScripts);
    setIsGenerating(null);
  };
  
  const handleExportScript = (script: GeneratedScript) => {
    const content = exportProductionBrief(script);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}_production_brief.md`;
    a.click();
  };
  
  const scriptsReady = Object.keys(scripts).length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Video Pitch Studio</h1>
            <p className="text-gray-400">
              Generate compelling 2-minute video scripts for investor outreach
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'studio'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Video className="w-4 h-4" />
              Studio
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <InvestorAnalyticsDashboard />
        )}
        
        {/* Studio Tab */}
        {activeTab === 'studio' && (
          <>
        {/* Generate All Button */}
        <div className="flex justify-end mb-6">
          
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating !== null}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating === 'all' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating All...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate All Scripts
              </>
            )}
          </button>
        </div>
        
        {/* Business Data Summary */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Business Data Source</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              <Edit3 className="w-4 h-4" />
              Edit Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Company</p>
              <p className="text-white font-medium">{businessData.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Industry</p>
              <p className="text-white font-medium">{businessData.industry}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Stage</p>
              <p className="text-white font-medium capitalize">{businessData.stage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Revenue</p>
              <p className="text-white font-medium">{businessData.currentRevenue || 'Pre-revenue'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Funding Target</p>
              <p className="text-white font-medium">{businessData.fundingTarget || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Team Size</p>
              <p className="text-white font-medium">{businessData.teamSize || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${(scriptsReady / 4) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">{scriptsReady}/4 scripts ready</span>
        </div>
        
        {/* Script Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ScriptCard
            type="overview"
            script={scripts.overview}
            onGenerate={() => handleGenerateScript('overview')}
            onView={() => scripts.overview && setViewingScript(scripts.overview)}
            onExport={() => scripts.overview && handleExportScript(scripts.overview)}
            isGenerating={isGenerating === 'overview' || isGenerating === 'all'}
          />
          <ScriptCard
            type="product"
            script={scripts.product}
            onGenerate={() => handleGenerateScript('product')}
            onView={() => scripts.product && setViewingScript(scripts.product)}
            onExport={() => scripts.product && handleExportScript(scripts.product)}
            isGenerating={isGenerating === 'product' || isGenerating === 'all'}
          />
          <ScriptCard
            type="team"
            script={scripts.team}
            onGenerate={() => handleGenerateScript('team')}
            onView={() => scripts.team && setViewingScript(scripts.team)}
            onExport={() => scripts.team && handleExportScript(scripts.team)}
            isGenerating={isGenerating === 'team' || isGenerating === 'all'}
          />
          <ScriptCard
            type="traction"
            script={scripts.traction}
            onGenerate={() => handleGenerateScript('traction')}
            onView={() => scripts.traction && setViewingScript(scripts.traction)}
            onExport={() => scripts.traction && handleExportScript(scripts.traction)}
            isGenerating={isGenerating === 'traction' || isGenerating === 'all'}
          />
        </div>
        
        {/* Next Steps */}
        {scriptsReady === 4 && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">All Scripts Ready!</h3>
                <p className="text-gray-400 mb-4">
                  Your video pitch pack scripts are complete. Next steps:
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export All Scripts
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Start Production
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Create Landing Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
      
      {/* Script Viewer Modal */}
      {viewingScript && (
        <ScriptViewerModal
          script={viewingScript}
          onClose={() => setViewingScript(null)}
        />
      )}
    </div>
  );
}
