import { useState } from 'react';
import { 
  Calendar, Users, FileText, Clock, MapPin, 
  Video, Phone, Building2, Sparkles, ChevronRight,
  ExternalLink, Download, RefreshCw, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Attendee {
  name: string;
  role: string;
  company: string;
  relationship: 'internal' | 'external' | 'new';
  notes: string[];
  linkedinUrl?: string;
}

interface MeetingBrief {
  id: string;
  title: string;
  time: string;
  duration: string;
  location: string;
  type: 'video' | 'phone' | 'in-person';
  attendees: Attendee[];
  context: string;
  objectives: string[];
  talkingPoints: string[];
  questionsToAsk: string[];
  documentsToReview: { name: string; url: string }[];
  previousInteractions: { date: string; summary: string }[];
  riskFactors: string[];
  successMetrics: string[];
  prepStatus: 'not-started' | 'in-progress' | 'ready';
}

// Mock meeting data
const MOCK_MEETINGS: MeetingBrief[] = [
  {
    id: '1',
    title: 'Investor Lunch - Series B Discussion',
    time: '12:00 PM',
    duration: '1h',
    location: 'The Capital Grille',
    type: 'in-person',
    attendees: [
      {
        name: 'James K.',
        role: 'Managing Partner',
        company: 'VC Partners',
        relationship: 'external',
        notes: ['Led our Seed round', 'Interested in AI/ML companies', 'Prefers data-driven pitches'],
        linkedinUrl: '#'
      }
    ],
    context: 'Follow-up meeting to discuss Series B funding. James expressed interest in leading the round during our last call.',
    objectives: [
      'Present updated growth metrics and ARR trajectory',
      'Discuss valuation expectations',
      'Gauge timeline for term sheet'
    ],
    talkingPoints: [
      'Q3 revenue exceeded projections by 23%',
      'Customer acquisition cost reduced by 15%',
      'New enterprise clients: 3 Fortune 500 companies',
      'Product roadmap for AI features'
    ],
    questionsToAsk: [
      'What valuation range are you considering?',
      'Who else would you want on the cap table?',
      'What milestones would you want to see before close?'
    ],
    documentsToReview: [
      { name: 'Q3 Financial Summary', url: '#' },
      { name: 'Series B Deck v3', url: '#' },
      { name: 'Cap Table Model', url: '#' }
    ],
    previousInteractions: [
      { date: '2 weeks ago', summary: 'Initial Series B interest call - positive reception' },
      { date: '3 months ago', summary: 'Quarterly update - impressed with growth metrics' }
    ],
    riskFactors: [
      'Market conditions affecting valuations',
      'Competitor X recent funding announcement'
    ],
    successMetrics: [
      'Verbal commitment to proceed',
      'Agreement on valuation range',
      'Clear next steps defined'
    ],
    prepStatus: 'ready'
  },
  {
    id: '2',
    title: 'Product Roadmap Discussion',
    time: '3:30 PM',
    duration: '45m',
    location: 'Teams',
    type: 'video',
    attendees: [
      {
        name: 'Sarah L.',
        role: 'Head of Product',
        company: 'Internal',
        relationship: 'internal',
        notes: ['Key stakeholder', 'Prefers visual presentations']
      },
      {
        name: 'Marcus T.',
        role: 'Engineering Lead',
        company: 'Internal',
        relationship: 'internal',
        notes: ['Technical decision maker', 'Concerned about timeline']
      }
    ],
    context: 'Weekly sync to align on Q4 product priorities and resource allocation.',
    objectives: [
      'Finalize Q4 feature priorities',
      'Address engineering capacity concerns',
      'Align on AI feature timeline'
    ],
    talkingPoints: [
      'Customer feedback from enterprise pilots',
      'Competitive analysis findings',
      'Resource allocation proposal'
    ],
    questionsToAsk: [
      'What are the biggest technical blockers?',
      'Can we parallelize any workstreams?'
    ],
    documentsToReview: [
      { name: 'Q4 Roadmap Draft', url: '#' },
      { name: 'Engineering Capacity Plan', url: '#' }
    ],
    previousInteractions: [
      { date: 'Last week', summary: 'Discussed AI feature scope - need to narrow down' }
    ],
    riskFactors: [
      'Engineering bandwidth constraints',
      'Dependency on third-party API'
    ],
    successMetrics: [
      'Agreed priority list',
      'Clear ownership assignments',
      'Timeline commitments'
    ],
    prepStatus: 'in-progress'
  }
];

interface MeetingPrepProps {
  meetingId?: string;
}

export function MeetingPrep({ meetingId }: MeetingPrepProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingBrief | null>(
    meetingId ? MOCK_MEETINGS.find(m => m.id === meetingId) || null : null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBrief = async (meeting: MeetingBrief) => {
    setIsGenerating(true);
    toast.info('Generating meeting brief with AI...');
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast.success('Meeting brief generated!');
    setSelectedMeeting({ ...meeting, prepStatus: 'ready' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in-person': return Building2;
      default: return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  if (selectedMeeting) {
    const TypeIcon = getTypeIcon(selectedMeeting.type);
    
    return (
      <div className="space-y-4">
        {/* Meeting Header */}
        <Card className="bg-card/60 border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedMeeting.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedMeeting.time} ({selectedMeeting.duration})
                  </span>
                  <span className="flex items-center gap-1">
                    <TypeIcon className="w-4 h-4" />
                    {selectedMeeting.location}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(selectedMeeting.prepStatus)}>
                {selectedMeeting.prepStatus === 'ready' ? 'Prep Complete' : 
                 selectedMeeting.prepStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Users className="w-4 h-4 text-primary" />
              Attendees ({selectedMeeting.attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedMeeting.attendees.map((attendee, i) => (
              <div key={i} className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{attendee.name}</div>
                    <div className="text-sm text-muted-foreground">{attendee.role} • {attendee.company}</div>
                  </div>
                  {attendee.linkedinUrl && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {attendee.notes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attendee.notes.map((note, j) => (
                      <div key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Context & Objectives */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Generated Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Context</h4>
              <p className="text-sm text-muted-foreground">{selectedMeeting.context}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Objectives</h4>
              <ul className="space-y-1">
                {selectedMeeting.objectives.map((obj, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Talking Points</h4>
              <ul className="space-y-1">
                {selectedMeeting.talkingPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">→</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Questions to Ask</h4>
              <ul className="space-y-1">
                {selectedMeeting.questionsToAsk.map((q, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-yellow-400">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <FileText className="w-4 h-4 text-primary" />
              Documents to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedMeeting.documentsToReview.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                  <span className="text-sm text-foreground">{doc.name}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setSelectedMeeting(null)}
            className="flex-1"
          >
            Back to Meetings
          </Button>
          <Button 
            onClick={() => handleGenerateBrief(selectedMeeting)}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate Brief
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="w-5 h-5 text-primary" />
          Meeting Prep
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {MOCK_MEETINGS.map((meeting) => {
            const TypeIcon = getTypeIcon(meeting.type);
            return (
              <div 
                key={meeting.id}
                onClick={() => setSelectedMeeting(meeting)}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{meeting.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {meeting.time} • {meeting.duration} • {meeting.attendees.length} attendees
                  </div>
                </div>
                <Badge variant="outline" className={`${getStatusColor(meeting.prepStatus)} text-xs`}>
                  {meeting.prepStatus === 'ready' ? 'Ready' : 
                   meeting.prepStatus === 'in-progress' ? 'Preparing' : 'Prep'}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default MeetingPrep;
