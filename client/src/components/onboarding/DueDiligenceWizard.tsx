import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Lock, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Building2,
  Globe,
  Users,
  DollarSign,
  Scale,
  FileSearch,
  Brain,
  ChevronRight,
  ChevronLeft,
  Camera,
  FolderOpen,
  Shield,
  TrendingUp,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface DDProject {
  companyName: string;
  parentProject: string;
  ddType: 'acquisition' | 'investment' | 'partnership' | 'other';
  confidentialityLevel: 'standard' | 'high' | 'restricted';
  dataRoomUrl?: string;
  dataRoomCredentials?: { username: string; password: string };
  companyWebsite?: string;
  sector?: string;
  documents: File[];
  analysisStatus: 'not_started' | 'in_progress' | 'review' | 'complete';
}

interface DDSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'complete' | 'flagged';
  findings: string[];
  risks: { level: 'high' | 'medium' | 'low'; description: string }[];
  questions: string[];
}

const PARENT_PROJECTS = [
  'Celadon',
  'Boundless AI',
  'Perfect DXB',
  'Ampora',
  'Project 5',
  'Project 6',
  'Standalone'
];

const DD_SECTIONS: DDSection[] = [
  { id: 'financial', title: 'Financial Analysis', icon: <DollarSign className="w-5 h-5" />, status: 'pending', findings: [], risks: [], questions: [] },
  { id: 'legal', title: 'Legal & Compliance', icon: <Scale className="w-5 h-5" />, status: 'pending', findings: [], risks: [], questions: [] },
  { id: 'operational', title: 'Operational Review', icon: <Building2 className="w-5 h-5" />, status: 'pending', findings: [], risks: [], questions: [] },
  { id: 'commercial', title: 'Commercial & Market', icon: <TrendingUp className="w-5 h-5" />, status: 'pending', findings: [], risks: [], questions: [] },
  { id: 'team', title: 'Management & Team', icon: <Users className="w-5 h-5" />, status: 'pending', findings: [], risks: [], questions: [] },
  { id: 'technology', title: 'Technology & IP', icon: <Shield className="w-5 h-5" />, status: 'pending', findings: [], risks: [], questions: [] },
];

export function DueDiligenceWizard() {
  const [step, setStep] = useState(1);
  const [pathway, setPathway] = useState<'dataroom' | 'upload' | null>(null);
  const [project, setProject] = useState<Partial<DDProject>>({
    confidentialityLevel: 'high',
    ddType: 'investment',
    documents: [],
    analysisStatus: 'not_started'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sections, setSections] = useState<DDSection[]>(DD_SECTIONS);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setProject(prev => ({
        ...prev,
        documents: [...(prev.documents || []), ...newFiles]
      }));
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis progress
    for (let i = 0; i < sections.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSections(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'in_progress' } : s
      ));
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSections(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: Math.random() > 0.7 ? 'flagged' : 'complete',
          findings: ['Sample finding 1', 'Sample finding 2'],
          risks: [{ level: 'medium', description: 'Sample risk identified' }],
          questions: ['Question for management']
        } : s
      ));
    }
    setIsAnalyzing(false);
    setProject(prev => ({ ...prev, analysisStatus: 'review' }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileSearch className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Due Diligence Review</h2>
              <p className="text-foreground/70">Comprehensive M&A analysis powered by AI-SMEs</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={project.companyName || ''}
                  onChange={(e) => setProject(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g., Empower Farmer"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Parent Project *</label>
                <select
                  value={project.parentProject || ''}
                  onChange={(e) => setProject(prev => ({ ...prev, parentProject: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select parent project...</option>
                  {PARENT_PROJECTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">DD Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'acquisition', label: 'Acquisition' },
                    { value: 'investment', label: 'Investment' },
                    { value: 'partnership', label: 'Partnership' },
                    { value: 'other', label: 'Other' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setProject(prev => ({ ...prev, ddType: opt.value as DDProject['ddType'] }))}
                      className={`px-4 py-3 rounded-lg border transition-all ${
                        project.ddType === opt.value
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-foreground/80 hover:border-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Confidentiality Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'standard', label: 'Standard', icon: <Shield className="w-4 h-4" /> },
                    { value: 'high', label: 'High', icon: <Lock className="w-4 h-4" /> },
                    { value: 'restricted', label: 'Restricted', icon: <AlertTriangle className="w-4 h-4" /> }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setProject(prev => ({ ...prev, confidentialityLevel: opt.value as DDProject['confidentialityLevel'] }))}
                      className={`px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        project.confidentialityLevel === opt.value
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-foreground/80 hover:border-gray-600'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
              <p className="text-foreground/70">Help us gather additional context for thorough analysis</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Company Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60" />
                  <input
                    type="url"
                    value={project.companyWebsite || ''}
                    onChange={(e) => setProject(prev => ({ ...prev, companyWebsite: e.target.value }))}
                    placeholder="https://www.company.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-1">We'll research public information to supplement data room findings</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Industry / Sector</label>
                <select
                  value={project.sector || ''}
                  onChange={(e) => setProject(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select sector...</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="fintech">Fintech</option>
                  <option value="energy">Energy & Sustainability</option>
                  <option value="agriculture">Agriculture / AgTech</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail / E-commerce</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="media">Media & Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Open Source Intelligence</h4>
                    <p className="text-sm text-foreground/70 mt-1">
                      Our AI-SMEs will automatically research public information including news, 
                      regulatory filings, social media, and industry reports to identify potential 
                      risks not visible in the data room.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Document Access</h2>
              <p className="text-foreground/70">How would you like to provide the due diligence documents?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPathway('dataroom')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  pathway === 'dataroom'
                    ? 'bg-purple-600/20 border-purple-500'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Room Access</h3>
                <p className="text-sm text-foreground/70">
                  Provide login credentials and our AI will browse the data room like a human analyst, 
                  reading and extracting information systematically.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Credentials encrypted, not stored</span>
                </div>
              </button>

              <button
                onClick={() => setPathway('upload')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  pathway === 'upload'
                    ? 'bg-purple-600/20 border-purple-500'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Manual Upload</h3>
                <p className="text-sm text-foreground/70">
                  Upload documents directly, take photos of screens, or drag & drop files. 
                  Supports PDF, Word, Excel, images, and more.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Most secure option</span>
                </div>
              </button>
            </div>

            {pathway === 'dataroom' && (
              <div className="mt-6 space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Data Room URL</label>
                  <input
                    type="url"
                    value={project.dataRoomUrl || ''}
                    onChange={(e) => setProject(prev => ({ ...prev, dataRoomUrl: e.target.value }))}
                    placeholder="https://dataroom.example.com/..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Username / Email</label>
                    <input
                      type="text"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-foreground/70">
                  <Shield className="w-4 h-4 mt-0.5 text-purple-400" />
                  <span>Credentials are encrypted in transit and used only for this session. They are never stored.</span>
                </div>
              </div>
            )}

            {pathway === 'upload' && (
              <div className="mt-6 space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  />
                  <FolderOpen className="w-12 h-12 text-foreground/60 mx-auto mb-4" />
                  <p className="text-white font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-foreground/70 mt-1">PDF, Word, Excel, PowerPoint, Images</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-foreground/60 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span>Take Photos of Documents</span>
                </button>

                {project.documents && project.documents.length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">{project.documents.length} files uploaded</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {project.documents.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <FileText className="w-4 h-4 text-foreground/70" />
                          <span className="text-foreground/80 truncate">{file.name}</span>
                          <span className="text-foreground/60 ml-auto">{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">AI-SME Expert Team</h2>
              <p className="text-foreground/70">Select specialists to review this due diligence</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Auto-Selected Based on Sector</h4>
                  <p className="text-sm text-foreground/70 mt-1">
                    Based on {project.sector || 'the selected sector'}, we've recommended relevant experts. 
                    You can adjust the team as needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'pe_partner', name: 'PE Partner', specialty: 'Deal Structure' },
                { id: 'cfo', name: 'CFO Expert', specialty: 'Financial Analysis' },
                { id: 'legal', name: 'M&A Lawyer', specialty: 'Legal Review' },
                { id: 'tax', name: 'Tax Advisor', specialty: 'Tax Implications' },
                { id: 'ops', name: 'Operations Expert', specialty: 'Operational DD' },
                { id: 'tech', name: 'CTO', specialty: 'Technology Review' },
                { id: 'hr', name: 'HR Director', specialty: 'Team Assessment' },
                { id: 'market', name: 'Market Analyst', specialty: 'Market Research' },
                { id: 'esg', name: 'ESG Specialist', specialty: 'Sustainability' },
              ].map(expert => (
                <button
                  key={expert.id}
                  onClick={() => {
                    setSelectedExperts(prev => 
                      prev.includes(expert.id) 
                        ? prev.filter(e => e !== expert.id)
                        : [...prev, expert.id]
                    );
                  }}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedExperts.includes(expert.id)
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${selectedExperts.includes(expert.id) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-white font-medium text-sm">{expert.name}</span>
                  </div>
                  <span className="text-xs text-foreground/70">{expert.specialty}</span>
                </button>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-amber-400 font-medium">Questions for Management</h4>
                  <p className="text-sm text-foreground/80 mt-1">
                    As the team reviews documents, they'll compile questions that need answers 
                    from the target company's management team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Analysis in Progress</h2>
              <p className="text-foreground/70">AI-SMEs are reviewing all documents and gathering intelligence</p>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 relative">
                  <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                  <div className="absolute inset-0 w-8 h-8 border-2 border-purple-400 rounded-full animate-ping opacity-30" />
                </div>
                <span className="text-purple-400">Analyzing documents...</span>
              </div>
            )}

            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div 
                  key={section.id}
                  className={`p-4 rounded-lg border transition-all ${
                    section.status === 'complete' ? 'bg-green-500/10 border-green-500/30' :
                    section.status === 'flagged' ? 'bg-red-500/10 border-red-500/30' :
                    section.status === 'in_progress' ? 'bg-purple-500/10 border-purple-500/30' :
                    'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        section.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                        section.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                        section.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-700 text-foreground/70'
                      }`}>
                        {section.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{section.title}</h4>
                        {section.status === 'in_progress' && (
                          <p className="text-xs text-purple-400">Analyzing...</p>
                        )}
                        {section.status === 'complete' && (
                          <p className="text-xs text-green-400">{section.findings.length} findings, {section.risks.length} risks</p>
                        )}
                        {section.status === 'flagged' && (
                          <p className="text-xs text-red-400">Issues identified - requires attention</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {section.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {section.status === 'flagged' && <AlertCircle className="w-5 h-5 text-red-400" />}
                      {section.status === 'in_progress' && (
                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isAnalyzing && project.analysisStatus === 'not_started' && (
              <button
                onClick={startAnalysis}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Start Due Diligence Analysis
              </button>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analysis Complete</h2>
              <p className="text-foreground/70">Review the findings and generate your DD report</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">47</div>
                <div className="text-sm text-foreground/70">Documents Reviewed</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">8</div>
                <div className="text-sm text-foreground/70">Risks Identified</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">12</div>
                <div className="text-sm text-foreground/70">Questions for Mgmt</div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Report Output</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500" />
                  <span className="text-foreground/80">Executive Summary (1-page)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500" />
                  <span className="text-foreground/80">Full DD Report (Big 4 format)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500" />
                  <span className="text-foreground/80">Risk Register</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500" />
                  <span className="text-foreground/80">Questions for Management</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500" />
                  <span className="text-foreground/80">Valuation Analysis</span>
                </label>
              </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Generate DD Report
            </button>

            <p className="text-center text-sm text-foreground/60">
              Report will be reviewed by Chief of Staff before final sign-off
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-foreground/70 mb-2">
          <span>Due Diligence Wizard</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 text-foreground/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {step < totalSteps && (
          <button
            onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DueDiligenceWizard;
