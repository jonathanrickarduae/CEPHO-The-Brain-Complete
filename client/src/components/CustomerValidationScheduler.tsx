import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Plus,
  Trash2,
  MessageSquare,
  Target,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface Interview {
  id: string;
  contactName: string;
  company: string;
  email: string;
  phone?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  interviewType: 'discovery' | 'validation' | 'feedback' | 'case_study';
  notes?: string;
  insights?: string[];
}

const interviewTypes = [
  { value: 'discovery', label: 'Discovery Call', description: 'Understand customer needs and pain points' },
  { value: 'validation', label: 'Product Validation', description: 'Validate product-market fit assumptions' },
  { value: 'feedback', label: 'Feature Feedback', description: 'Get feedback on specific features' },
  { value: 'case_study', label: 'Case Study', description: 'Document success story for marketing' },
];

const discoveryQuestions = [
  "What's your biggest challenge in managing your business operations?",
  "How do you currently handle [specific problem area]?",
  "What tools or solutions have you tried before?",
  "What would an ideal solution look like for you?",
  "How much time/money does this problem cost you?",
  "Who else in your organization deals with this problem?",
  "What would success look like if this problem was solved?",
  "How urgent is solving this problem for you?",
  "What's your budget for a solution like this?",
  "What would prevent you from adopting a new solution?",
];

export function CustomerValidationScheduler() {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: '1',
      contactName: 'Sample Contact',
      company: 'Example Corp',
      email: 'contact@example.com',
      status: 'pending',
      interviewType: 'discovery',
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    status: 'pending',
    interviewType: 'discovery',
  });
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const addInterview = () => {
    if (!newInterview.contactName || !newInterview.email) {
      toast.error('Please fill in contact name and email');
      return;
    }

    const interview: Interview = {
      id: Date.now().toString(),
      contactName: newInterview.contactName || '',
      company: newInterview.company || '',
      email: newInterview.email || '',
      phone: newInterview.phone,
      scheduledDate: newInterview.scheduledDate,
      scheduledTime: newInterview.scheduledTime,
      status: newInterview.scheduledDate ? 'scheduled' : 'pending',
      interviewType: (newInterview.interviewType as Interview['interviewType']) || 'discovery',
      notes: newInterview.notes,
    };

    setInterviews([...interviews, interview]);
    setNewInterview({ status: 'pending', interviewType: 'discovery' });
    setShowAddForm(false);
    toast.success('Interview added successfully');
  };

  const updateStatus = (id: string, status: Interview['status']) => {
    setInterviews(interviews.map(i => 
      i.id === id ? { ...i, status } : i
    ));
    toast.success(`Interview marked as ${status}`);
  };

  const deleteInterview = (id: string) => {
    setInterviews(interviews.filter(i => i.id !== id));
    toast.success('Interview removed');
  };

  const addInsight = (id: string, insight: string) => {
    setInterviews(interviews.map(i => 
      i.id === id ? { ...i, insights: [...(i.insights || []), insight] } : i
    ));
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    }
  };

  const stats = {
    total: interviews.length,
    completed: interviews.filter(i => i.status === 'completed').length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    pending: interviews.filter(i => i.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Interviews</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.scheduled}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress toward goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#E91E8C]" />
            Interview Goal Progress
          </CardTitle>
          <CardDescription>Target: 10 customer validation interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stats.completed} of 10 completed</span>
              <span>{Math.round((stats.completed / 10) * 100)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#E91E8C] to-purple-500 transition-all"
                style={{ width: `${Math.min((stats.completed / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Interview Form */}
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Interview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={newInterview.contactName || ''}
                  onChange={e => setNewInterview({ ...newInterview, contactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Acme Inc"
                  value={newInterview.company || ''}
                  onChange={e => setNewInterview({ ...newInterview, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@acme.com"
                  value={newInterview.email || ''}
                  onChange={e => setNewInterview({ ...newInterview, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={newInterview.phone || ''}
                  onChange={e => setNewInterview({ ...newInterview, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select
                  value={newInterview.interviewType}
                  onValueChange={v => setNewInterview({ ...newInterview, interviewType: v as Interview['interviewType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={newInterview.scheduledDate || ''}
                  onChange={e => setNewInterview({ ...newInterview, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any notes about this contact or interview..."
                value={newInterview.notes || ''}
                onChange={e => setNewInterview({ ...newInterview, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addInterview} className="bg-[#E91E8C] hover:bg-[#E91E8C]/90">
                Add Interview
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90">
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Interview
        </Button>
      )}

      {/* Interview List */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No interviews scheduled yet. Add your first customer interview above.
              </p>
            ) : (
              interviews.map(interview => (
                <div
                  key={interview.id}
                  className="p-4 border rounded-lg hover:border-[#E91E8C]/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{interview.contactName}</div>
                        {interview.company && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {interview.company}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {interview.email}
                        </div>
                        {interview.scheduledDate && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {interview.scheduledDate}
                            {interview.scheduledTime && ` at ${interview.scheduledTime}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(interview.status)}>
                        {interview.status}
                      </Badge>
                      <Badge variant="secondary">
                        {interviewTypes.find(t => t.value === interview.interviewType)?.label}
                      </Badge>
                    </div>
                  </div>
                  
                  {interview.notes && (
                    <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                      {interview.notes}
                    </div>
                  )}

                  {interview.insights && interview.insights.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium flex items-center gap-1">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Key Insights
                      </div>
                      {interview.insights.map((insight, i) => (
                        <div key={i} className="text-sm p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {interview.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(interview.id, 'scheduled')}>
                        Mark Scheduled
                      </Button>
                    )}
                    {interview.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(interview.id, 'completed')}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Completed
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSelectedInterview(interview)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Add Insight
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteInterview(interview.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discovery Questions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discovery Questions Reference
          </CardTitle>
          <CardDescription>Use these questions during customer validation interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {discoveryQuestions.map((question, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E91E8C]/20 text-[#E91E8C] flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <span className="text-sm">{question}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerValidationScheduler;
