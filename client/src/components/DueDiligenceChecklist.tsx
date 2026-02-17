import { useState } from 'react';
import { 
  ClipboardCheck, FileText, AlertTriangle, CheckCircle2,
  Clock, User, Building2, Scale, DollarSign, Shield,
  ChevronDown, ChevronUp, Plus, Trash2, Edit2, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type ChecklistCategory = 'financial' | 'legal' | 'operational' | 'commercial' | 'technical' | 'hr';
type RiskLevel = 'high' | 'medium' | 'low' | 'none';
type ItemStatus = 'pending' | 'in-progress' | 'completed' | 'blocked' | 'na';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  status: ItemStatus;
  riskLevel: RiskLevel;
  assignee?: string;
  dueDate?: string;
  documents: string[];
  notes?: string;
  required: boolean;
}

interface DueDiligenceProject {
  id: string;
  name: string;
  company: string;
  stage: 'initial' | 'detailed' | 'final' | 'completed';
  startDate: string;
  targetClose: string;
  items: ChecklistItem[];
}

// Mock data
const MOCK_PROJECT: DueDiligenceProject = {
  id: 'dd1',
  name: 'Celadon Capital Acquisition',
  company: 'Celadon Capital Ltd',
  stage: 'detailed',
  startDate: '2024-01-15',
  targetClose: '2024-03-30',
  items: [
    {
      id: 'i1',
      title: 'Financial Statements (3 years)',
      description: 'Audited financial statements for the last 3 fiscal years',
      category: 'financial',
      status: 'completed',
      riskLevel: 'none',
      assignee: 'Sarah L.',
      documents: ['FY2021_Audit.pdf', 'FY2022_Audit.pdf', 'FY2023_Audit.pdf'],
      required: true
    },
    {
      id: 'i2',
      title: 'Tax Returns & Compliance',
      description: 'Corporate tax returns and compliance certificates',
      category: 'financial',
      status: 'in-progress',
      riskLevel: 'medium',
      assignee: 'Marcus T.',
      dueDate: '2024-02-15',
      documents: ['Tax_2022.pdf'],
      notes: 'Awaiting 2023 returns from accountant',
      required: true
    },
    {
      id: 'i3',
      title: 'Articles of Incorporation',
      description: 'Company formation documents and amendments',
      category: 'legal',
      status: 'completed',
      riskLevel: 'none',
      documents: ['Articles_of_Inc.pdf', 'Amendments.pdf'],
      required: true
    },
    {
      id: 'i4',
      title: 'Material Contracts Review',
      description: 'All contracts with value >£100k or strategic importance',
      category: 'legal',
      status: 'in-progress',
      riskLevel: 'high',
      assignee: 'Legal Team',
      dueDate: '2024-02-20',
      documents: ['Contract_List.xlsx'],
      notes: 'Found potential issue with supplier agreement - needs review',
      required: true
    },
    {
      id: 'i5',
      title: 'IP Portfolio Assessment',
      description: 'Patents, trademarks, and intellectual property review',
      category: 'legal',
      status: 'pending',
      riskLevel: 'medium',
      dueDate: '2024-02-25',
      documents: [],
      required: true
    },
    {
      id: 'i6',
      title: 'Employee Census',
      description: 'Complete list of employees with compensation details',
      category: 'hr',
      status: 'completed',
      riskLevel: 'low',
      documents: ['Employee_Census.xlsx'],
      required: true
    },
    {
      id: 'i7',
      title: 'Customer Concentration Analysis',
      description: 'Top 20 customers by revenue with contract terms',
      category: 'commercial',
      status: 'in-progress',
      riskLevel: 'high',
      assignee: 'Jonathan',
      documents: ['Top_Customers.xlsx'],
      notes: 'Top 3 customers = 45% of revenue - concentration risk',
      required: true
    },
    {
      id: 'i8',
      title: 'IT Systems & Security Audit',
      description: 'Technical infrastructure and cybersecurity assessment',
      category: 'technical',
      status: 'pending',
      riskLevel: 'medium',
      dueDate: '2024-03-01',
      documents: [],
      required: false
    },
    {
      id: 'i9',
      title: 'Environmental Compliance',
      description: 'Environmental permits and compliance history',
      category: 'operational',
      status: 'na',
      riskLevel: 'none',
      documents: [],
      notes: 'N/A - Service business with no environmental impact',
      required: false
    }
  ]
};

interface DueDiligenceChecklistProps {
  projectId?: string;
}

export function DueDiligenceChecklist({ projectId }: DueDiligenceChecklistProps) {
  const [project] = useState<DueDiligenceProject>(MOCK_PROJECT);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<ChecklistCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ItemStatus | 'all'>('all');

  const getCategoryIcon = (category: ChecklistCategory) => {
    switch (category) {
      case 'financial': return DollarSign;
      case 'legal': return Scale;
      case 'operational': return Building2;
      case 'commercial': return User;
      case 'technical': return Shield;
      case 'hr': return User;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: ChecklistCategory) => {
    switch (category) {
      case 'financial': return 'bg-green-500/20 text-green-400';
      case 'legal': return 'bg-purple-500/20 text-purple-400';
      case 'operational': return 'bg-blue-500/20 text-blue-400';
      case 'commercial': return 'bg-orange-500/20 text-orange-400';
      case 'technical': return 'bg-cyan-500/20 text-cyan-400';
      case 'hr': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-foreground/70';
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'blocked': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'na': return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredItems = project.items.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const completedCount = project.items.filter(i => i.status === 'completed' || i.status === 'na').length;
  const totalRequired = project.items.filter(i => i.required).length;
  const completedRequired = project.items.filter(i => i.required && (i.status === 'completed' || i.status === 'na')).length;
  const progress = (completedCount / project.items.length) * 100;
  const highRiskCount = project.items.filter(i => i.riskLevel === 'high' && i.status !== 'completed').length;

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
              <p className="text-sm text-muted-foreground">{project.company}</p>
            </div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {project.stage} stage
            </Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{completedCount}/{project.items.length}</div>
              <div className="text-xs text-muted-foreground">Items Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{completedRequired}/{totalRequired}</div>
              <div className="text-xs text-muted-foreground">Required Done</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${highRiskCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {highRiskCount}
              </div>
              <div className="text-xs text-muted-foreground">High Risk Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Started: {project.startDate}</span>
            <span>Target Close: {project.targetClose}</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ChecklistCategory | 'all')}
          className="bg-background border border-border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="financial">Financial</option>
          <option value="legal">Legal</option>
          <option value="operational">Operational</option>
          <option value="commercial">Commercial</option>
          <option value="technical">Technical</option>
          <option value="hr">HR</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ItemStatus | 'all')}
          className="bg-background border border-border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
          <option value="na">N/A</option>
        </select>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const CategoryIcon = getCategoryIcon(item.category);
          const isExpanded = expandedItems.includes(item.id);
          
          return (
            <Card key={item.id} className="bg-card/60 border-border">
              <CardContent className="p-0">
                <div 
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(item.category)}`}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{item.title}</span>
                      {item.required && (
                        <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{item.category}</span>
                      {item.assignee && <span>• {item.assignee}</span>}
                      {item.dueDate && <span>• Due: {item.dueDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.riskLevel !== 'none' && (
                      <AlertTriangle className={`w-4 h-4 ${getRiskColor(item.riskLevel)}`} />
                    )}
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    
                    {item.documents.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-foreground mb-1">Documents:</h5>
                        <div className="flex flex-wrap gap-2">
                          {item.documents.map((doc, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="p-2 bg-yellow-500/10 rounded text-sm text-yellow-400">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        {item.notes}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Document
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-1" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Item Button */}
      <Button variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Checklist Item
      </Button>
    </div>
  );
}

export default DueDiligenceChecklist;
