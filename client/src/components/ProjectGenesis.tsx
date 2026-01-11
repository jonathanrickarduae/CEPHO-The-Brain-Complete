import React, { useState, useCallback } from 'react';

// Project Genesis - New Opportunity Engine
// Questionnaire-driven project setup with auto-generated documents

interface ProjectData {
  // Phase 1: Basic Info
  companyName: string;
  oneLineDescription: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'revenue' | 'growth';
  
  // Phase 2: People
  founders: Array<{
    name: string;
    role: string;
    email: string;
    shareholding: number;
  }>;
  advisors: string[];
  
  // Phase 3: Business
  targetMarket: string;
  revenueModel: string;
  currentRevenue: string;
  fundingTarget: string;
  useOfFunds: string;
  
  // Phase 4: Legal
  jurisdiction: string;
  existingCompany: boolean;
  existingContracts: string[];
  
  // Phase 5: Due Diligence
  knownRisks: string[];
  supplierDependencies: string[];
  regulatoryRequirements: string[];
}

interface GeneratedDocument {
  id: string;
  name: string;
  type: 'nda' | 'teaser' | 'deck' | 'financial' | 'legal' | 'checklist';
  status: 'pending' | 'generating' | 'ready' | 'signed';
  url?: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: string;
  assignee?: string;
  link?: string;
}

const INDUSTRIES = [
  'Technology', 'Telecommunications', 'Healthcare', 'Fintech', 'Energy',
  'Real Estate', 'Manufacturing', 'Retail', 'Media', 'Education', 'Other'
];

const JURISDICTIONS = [
  'United Kingdom', 'Cayman Islands', 'BVI', 'Delaware (US)', 'Jersey',
  'Guernsey', 'Singapore', 'Ireland', 'Netherlands', 'Other'
];

const REVENUE_MODELS = [
  'SaaS/Subscription', 'Transaction fees', 'Licensing', 'Hardware sales',
  'Advertising', 'Marketplace', 'Consulting', 'Hybrid', 'Other'
];

export function ProjectGenesis() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [projectData, setProjectData] = useState<Partial<ProjectData>>({
    founders: [{ name: '', role: '', email: '', shareholding: 100 }],
    advisors: [],
    knownRisks: [],
    supplierDependencies: [],
    regulatoryRequirements: [],
    existingContracts: [],
  });
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const phases = [
    { id: 0, title: 'Basic Info', icon: '📋' },
    { id: 1, title: 'People', icon: '👥' },
    { id: 2, title: 'Business', icon: '💼' },
    { id: 3, title: 'Legal', icon: '⚖️' },
    { id: 4, title: 'Due Diligence', icon: '🔍' },
    { id: 5, title: 'Generate', icon: '⚡' },
  ];
  
  const updateField = useCallback((field: keyof ProjectData, value: any) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const addFounder = useCallback(() => {
    setProjectData(prev => ({
      ...prev,
      founders: [...(prev.founders || []), { name: '', role: '', email: '', shareholding: 0 }]
    }));
  }, []);
  
  const updateFounder = useCallback((index: number, field: string, value: any) => {
    setProjectData(prev => {
      const founders = [...(prev.founders || [])];
      founders[index] = { ...founders[index], [field]: value };
      return { ...prev, founders };
    });
  }, []);
  
  const removeFounder = useCallback((index: number) => {
    setProjectData(prev => ({
      ...prev,
      founders: (prev.founders || []).filter((_, i) => i !== index)
    }));
  }, []);
  
  const generateDocuments = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate document generation
    const docs: GeneratedDocument[] = [
      { id: '1', name: 'Non-Disclosure Agreement', type: 'nda', status: 'generating' },
      { id: '2', name: 'One-Page Teaser', type: 'teaser', status: 'pending' },
      { id: '3', name: 'Two-Pager Summary', type: 'teaser', status: 'pending' },
      { id: '4', name: 'Investment Deck (Draft)', type: 'deck', status: 'pending' },
      { id: '5', name: 'Financial Model Template', type: 'financial', status: 'pending' },
      { id: '6', name: 'DCF Valuation Model', type: 'financial', status: 'pending' },
      { id: '7', name: 'Data Room Checklist', type: 'checklist', status: 'pending' },
      { id: '8', name: 'Risk Register Template', type: 'checklist', status: 'pending' },
    ];
    
    // Add jurisdiction-specific docs
    if (projectData.jurisdiction === 'United Kingdom') {
      docs.push(
        { id: '9', name: 'Articles of Association (Draft)', type: 'legal', status: 'pending' },
        { id: '10', name: 'Shareholder Agreement (Draft)', type: 'legal', status: 'pending' },
      );
    }
    
    setGeneratedDocs(docs);
    
    // Generate action items
    const actions: ActionItem[] = [
      { id: 'a1', title: 'Register at Companies House', description: 'File incorporation documents', status: 'pending', link: 'https://www.gov.uk/limited-company-formation' },
      { id: 'a2', title: 'Send NDA for signature', description: `Send to ${projectData.founders?.[0]?.name || 'founders'}`, status: 'pending' },
      { id: 'a3', title: 'Schedule founder call', description: 'Initial alignment meeting', status: 'pending' },
      { id: 'a4', title: 'Complete KYC checklist', description: 'Verify founder identities', status: 'pending' },
      { id: 'a5', title: 'Set up data room', description: 'Create folder structure', status: 'pending' },
      { id: 'a6', title: 'Upload logo', description: 'Add to all documents when ready', status: 'pending' },
      { id: 'a7', title: 'Open business bank account', description: 'Required for operations', status: 'pending' },
      { id: 'a8', title: 'Register for VAT', description: 'If applicable', status: 'pending' },
    ];
    
    setActionItems(actions);
    
    // Simulate generation progress
    for (let i = 0; i < docs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGeneratedDocs(prev => prev.map((doc, idx) => 
        idx === i ? { ...doc, status: 'generating' } : 
        idx < i ? { ...doc, status: 'ready' } : doc
      ));
    }
    
    // Mark all as ready
    await new Promise(resolve => setTimeout(resolve, 500));
    setGeneratedDocs(prev => prev.map(doc => ({ ...doc, status: 'ready' })));
    setIsGenerating(false);
  }, [projectData]);
  
  const canProceed = useCallback(() => {
    switch (currentPhase) {
      case 0:
        return projectData.companyName && projectData.oneLineDescription && projectData.industry;
      case 1:
        return projectData.founders && projectData.founders.length > 0 && projectData.founders[0].name;
      case 2:
        return projectData.targetMarket && projectData.revenueModel;
      case 3:
        return projectData.jurisdiction;
      case 4:
        return true; // Due diligence is optional
      default:
        return true;
    }
  }, [currentPhase, projectData]);
  
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company/Project Name *</label>
              <input
                type="text"
                value={projectData.companyName || ''}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., WasteGen Technologies"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">One-Line Description *</label>
              <input
                type="text"
                value={projectData.oneLineDescription || ''}
                onChange={(e) => updateField('oneLineDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Converting organic waste into renewable energy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry/Sector *</label>
              <select
                value={projectData.industry || ''}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <div className="grid grid-cols-4 gap-3">
                {(['idea', 'mvp', 'revenue', 'growth'] as const).map(stage => (
                  <button
                    key={stage}
                    onClick={() => updateField('stage', stage)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      projectData.stage === stage
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Founders *</label>
              <button
                onClick={addFounder}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add founder
              </button>
            </div>
            
            {projectData.founders?.map((founder, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Founder {index + 1}</span>
                  {index > 0 && (
                    <button
                      onClick={() => removeFounder(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={founder.name}
                    onChange={(e) => updateFounder(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Full name"
                  />
                  <input
                    type="text"
                    value={founder.role}
                    onChange={(e) => updateFounder(index, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Role (e.g., CEO)"
                  />
                  <input
                    type="email"
                    value={founder.email}
                    onChange={(e) => updateFounder(index, 'email', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Email"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={founder.shareholding}
                      onChange={(e) => updateFounder(index, 'shareholding', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Shareholding %"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Advisors (optional)</label>
              <textarea
                value={projectData.advisors?.join('\n') || ''}
                onChange={(e) => updateField('advisors', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="One advisor per line"
                rows={3}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Market *</label>
              <textarea
                value={projectData.targetMarket || ''}
                onChange={(e) => updateField('targetMarket', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Describe your target customers and market size"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Model *</label>
              <select
                value={projectData.revenueModel || ''}
                onChange={(e) => updateField('revenueModel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select revenue model</option>
                {REVENUE_MODELS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Revenue (if any)</label>
              <input
                type="text"
                value={projectData.currentRevenue || ''}
                onChange={(e) => updateField('currentRevenue', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="e.g., £50k ARR or Pre-revenue"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Target</label>
                <input
                  type="text"
                  value={projectData.fundingTarget || ''}
                  onChange={(e) => updateField('fundingTarget', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., £500k"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Use of Funds</label>
                <input
                  type="text"
                  value={projectData.useOfFunds || ''}
                  onChange={(e) => updateField('useOfFunds', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., Product development, hiring"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction *</label>
              <select
                value={projectData.jurisdiction || ''}
                onChange={(e) => updateField('jurisdiction', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select jurisdiction</option>
                {JURISDICTIONS.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Existing Company Registered?</label>
              <div className="flex gap-4">
                <button
                  onClick={() => updateField('existingCompany', true)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    projectData.existingCompany === true
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => updateField('existingCompany', false)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    projectData.existingCompany === false
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Existing Contracts/Agreements</label>
              <textarea
                value={projectData.existingContracts?.join('\n') || ''}
                onChange={(e) => updateField('existingContracts', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="List any existing contracts (one per line)"
                rows={3}
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Known Risks/Concerns</label>
              <textarea
                value={projectData.knownRisks?.join('\n') || ''}
                onChange={(e) => updateField('knownRisks', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Any red flags or concerns (one per line)"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Supplier Dependencies</label>
              <textarea
                value={projectData.supplierDependencies?.join('\n') || ''}
                onChange={(e) => updateField('supplierDependencies', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Critical suppliers or partners (one per line)"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Regulatory Requirements</label>
              <textarea
                value={projectData.regulatoryRequirements?.join('\n') || ''}
                onChange={(e) => updateField('regulatoryRequirements', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Licenses, certifications needed (one per line)"
                rows={3}
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Project Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Company:</span>
                  <span className="ml-2 font-medium">{projectData.companyName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Industry:</span>
                  <span className="ml-2 font-medium">{projectData.industry}</span>
                </div>
                <div>
                  <span className="text-gray-500">Jurisdiction:</span>
                  <span className="ml-2 font-medium">{projectData.jurisdiction}</span>
                </div>
                <div>
                  <span className="text-gray-500">Founders:</span>
                  <span className="ml-2 font-medium">{projectData.founders?.length || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Generate Button */}
            {generatedDocs.length === 0 && (
              <button
                onClick={generateDocuments}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? 'Generating...' : 'Generate Project Genesis Documents'}
              </button>
            )}
            
            {/* Generated Documents */}
            {generatedDocs.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Generated Documents</h4>
                <div className="space-y-2">
                  {generatedDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {doc.type === 'nda' ? '📝' : 
                           doc.type === 'deck' ? '📊' : 
                           doc.type === 'financial' ? '💰' :
                           doc.type === 'legal' ? '⚖️' : '📋'}
                        </span>
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'generating' && (
                          <span className="text-sm text-blue-600">Generating...</span>
                        )}
                        {doc.status === 'ready' && (
                          <>
                            <span className="text-sm text-green-600">Ready</span>
                            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                              View
                            </button>
                          </>
                        )}
                        {doc.status === 'pending' && (
                          <span className="text-sm text-gray-400">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Items */}
            {actionItems.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Next Actions</h4>
                <div className="space-y-2">
                  {actionItems.map(action => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={action.status === 'completed'}
                          onChange={() => {
                            setActionItems(prev => prev.map(a => 
                              a.id === action.id 
                                ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' }
                                : a
                            ));
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <div>
                          <span className={`font-medium ${action.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {action.title}
                          </span>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                      {action.link && (
                        <a
                          href={action.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Open →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Project Genesis</h2>
        <p className="text-gray-600 mt-1">New opportunity engine - answer questions to generate all standard documents</p>
      </div>
      
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {phases.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <button
                onClick={() => index <= currentPhase && setCurrentPhase(index)}
                className={`flex flex-col items-center ${
                  index <= currentPhase ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  index < currentPhase ? 'bg-green-500 text-white' :
                  index === currentPhase ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentPhase ? '✓' : phase.icon}
                </div>
                <span className={`text-xs mt-1 ${
                  index === currentPhase ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {phase.title}
                </span>
              </button>
              {index < phases.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < currentPhase ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {renderPhaseContent()}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentPhase(prev => Math.max(0, prev - 1))}
          disabled={currentPhase === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        {currentPhase < phases.length - 1 ? (
          <button
            onClick={() => setCurrentPhase(prev => prev + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default ProjectGenesis;
