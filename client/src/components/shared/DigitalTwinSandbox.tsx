import { useState } from 'react';
import {
  FlaskConical, Play, RotateCcw, CheckCircle, XCircle,
  ThumbsUp, ThumbsDown, MessageSquare, Settings, Sliders,
  BarChart3, Clock, Zap, AlertCircle, ChevronRight
} from 'lucide-react';

interface TestScenario {
  id: string;
  category: string;
  prompt: string;
  expectedBehavior: string;
}

interface TestResult {
  scenarioId: string;
  response: string;
  confidence: number;
  timestamp: Date;
  feedback?: 'approved' | 'rejected';
  notes?: string;
}

export function DigitalTwinSandbox() {
  const [activeTab, setActiveTab] = useState<'test' | 'scenarios' | 'results' | 'tuning'>('test');
  const [testInput, setTestInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const testScenarios: TestScenario[] = [
    { id: 's1', category: 'Email', prompt: 'Draft response to meeting reschedule request', expectedBehavior: 'Professional, confirms new time, brief' },
    { id: 's2', category: 'Decision', prompt: 'Should I accept this speaking engagement?', expectedBehavior: 'Weighs calendar, relevance, provides recommendation' },
    { id: 's3', category: 'Summary', prompt: 'Summarise the Celadon project status', expectedBehavior: 'Key metrics, blockers, next actions' },
    { id: 's4', category: 'Task', prompt: 'Prioritise my tasks for today', expectedBehavior: 'Ordered list based on urgency and importance' },
    { id: 's5', category: 'Research', prompt: 'What do I need to know about competitor X?', expectedBehavior: 'Factual summary from available data' },
  ];

  const [testResults, setTestResults] = useState<TestResult[]>([
    { scenarioId: 's1', response: 'Confirmed. Meeting moved to Thursday 14:00. Calendar updated.', confidence: 89, timestamp: new Date(Date.now() - 86400000), feedback: 'approved' },
    { scenarioId: 's2', response: 'Recommendation: Decline. Calendar conflict with board meeting. Topic outside current focus areas.', confidence: 76, timestamp: new Date(Date.now() - 172800000), feedback: 'approved' },
    { scenarioId: 's3', response: 'Celadon: 67% complete. 3 tasks overdue. Blocker: awaiting legal review. Next: follow up with legal team.', confidence: 92, timestamp: new Date(Date.now() - 259200000), feedback: 'approved' },
  ]);

  const runTest = () => {
    if (!testInput.trim()) return;
    
    setIsProcessing(true);
    setCurrentResponse(null);
    setConfidence(null);

    // Simulate processing
    setTimeout(() => {
      // Mock response - in production this would call the actual Chief of Staff
      const mockResponses: Record<string, { response: string; confidence: number }> = {
        'email': { response: 'Draft prepared. Subject: Re: Meeting Request. Body: Confirmed for proposed time. Location details required.', confidence: 85 },
        'meeting': { response: '2 meetings today. 10:00 Board review (prep notes ready). 14:30 Team sync (agenda pending).', confidence: 94 },
        'task': { response: 'Priority order: 1. Legal review follow-up (overdue). 2. Board presentation finalise. 3. Celadon status update.', confidence: 88 },
        'default': { response: 'Query processed. Insufficient context for specific action. Clarification recommended.', confidence: 62 }
      };

      const key = testInput.toLowerCase().includes('email') ? 'email' :
                  testInput.toLowerCase().includes('meeting') ? 'meeting' :
                  testInput.toLowerCase().includes('task') || testInput.toLowerCase().includes('priorit') ? 'task' : 'default';
      
      const result = mockResponses[key];
      setCurrentResponse(result.response);
      setConfidence(result.confidence);
      setIsProcessing(false);
    }, 1500);
  };

  const submitFeedback = (approved: boolean) => {
    if (!currentResponse || confidence === null) return;

    const newResult: TestResult = {
      scenarioId: `custom-${Date.now()}`,
      response: currentResponse,
      confidence: confidence,
      timestamp: new Date(),
      feedback: approved ? 'approved' : 'rejected'
    };

    setTestResults([newResult, ...testResults]);
    setCurrentResponse(null);
    setConfidence(null);
    setTestInput('');
  };

  const approvalRate = testResults.length > 0 
    ? Math.round((testResults.filter(r => r.feedback === 'approved').length / testResults.length) * 100)
    : 0;

  const avgConfidence = testResults.length > 0
    ? Math.round(testResults.reduce((sum, r) => sum + r.confidence, 0) / testResults.length)
    : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Testing Sandbox</h1>
            <p className="text-sm text-muted-foreground">Test Chief of Staff responses without affecting live data</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Tests Run</span>
            </div>
            <p className="text-xl font-bold text-foreground">{testResults.length}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs">Approval Rate</span>
            </div>
            <p className="text-xl font-bold text-green-400">{approvalRate}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs">Avg Confidence</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">{avgConfidence}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Last Test</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {testResults.length > 0 ? 'Today' : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'test', label: 'Run Test', icon: Play },
          { id: 'scenarios', label: 'Scenarios', icon: MessageSquare },
          { id: 'results', label: 'Results', icon: BarChart3 },
          { id: 'tuning', label: 'Tuning', icon: Sliders },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'test' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Test Input */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Test Query</h3>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter a test query for your Chief of Staff..."
                className="w-full h-24 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Sandbox mode: No actions will be executed
                </p>
                <button
                  onClick={runTest}
                  disabled={!testInput.trim() || isProcessing}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Response */}
            {currentResponse && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Response</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span className={`text-sm font-bold ${
                      confidence! >= 80 ? 'text-green-400' :
                      confidence! >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {confidence}%
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg mb-4">
                  <p className="text-foreground">{currentResponse}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Rate this response to improve accuracy
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => submitFeedback(false)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => submitFeedback(true)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Scenarios */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Test Scenarios</h3>
              <div className="space-y-2">
                {testScenarios.slice(0, 3).map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setTestInput(scenario.prompt)}
                    className="w-full p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-primary">{scenario.category}</span>
                      <p className="text-sm text-foreground">{scenario.prompt}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Test Scenarios</h2>
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                Add Scenario
              </button>
            </div>
            
            {testScenarios.map(scenario => (
              <div key={scenario.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-primary">{scenario.category}</span>
                    <h3 className="font-medium text-foreground mt-1">{scenario.prompt}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Expected: {scenario.expectedBehavior}
                    </p>
                  </div>
                  <button
                    onClick={() => { setTestInput(scenario.prompt); setActiveTab('test'); }}
                    className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Test History</h2>
            
            {testResults.map((result, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {result.feedback === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : result.feedback === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {result.timestamp.toLocaleDateString('en-GB')} {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    result.confidence >= 80 ? 'text-green-400' :
                    result.confidence >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.confidence}% confidence
                  </span>
                </div>
                <p className="text-foreground">{result.response}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tuning' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Response Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-foreground">Response Length</label>
                    <span className="text-sm text-muted-foreground">Concise</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="25"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Brief</span>
                    <span>Detailed</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-foreground">Confidence Threshold</label>
                    <span className="text-sm text-muted-foreground">70%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Actions below this threshold require manual approval
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-foreground">Autonomy Level</label>
                    <span className="text-sm text-muted-foreground">Supervised</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="40"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Manual</span>
                    <span>Autonomous</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Sandbox Only</h4>
                  <p className="text-sm text-muted-foreground">
                    Changes here only affect sandbox testing. Production settings are managed separately in Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
