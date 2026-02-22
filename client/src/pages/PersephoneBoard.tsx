import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Brain,
  Briefcase,
  DollarSign,
  Target,
  Shield,
  Lightbulb,
  Globe,
  Heart,
  Zap,
  BookOpen
} from 'lucide-react';

interface BoardMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatar: any;
  color: string;
  status: 'available' | 'in-meeting' | 'offline';
  lastContribution: string;
  keyInsights: number;
}

const BOARD_MEMBERS: BoardMember[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    role: 'Chief Strategy Officer',
    expertise: ['Strategic Planning', 'Market Analysis', 'Growth Strategy'],
    avatar: Target,
    color: 'bg-blue-500',
    status: 'available',
    lastContribution: '2 hours ago',
    keyInsights: 12
  },
  {
    id: '2',
    name: 'Marcus Wellington',
    role: 'Chief Financial Officer',
    expertise: ['Financial Planning', 'Investment Strategy', 'Risk Management'],
    avatar: DollarSign,
    color: 'bg-green-500',
    status: 'available',
    lastContribution: '1 hour ago',
    keyInsights: 8
  },
  {
    id: '3',
    name: 'Dr. Aisha Patel',
    role: 'Chief Technology Officer',
    expertise: ['AI/ML', 'System Architecture', 'Innovation'],
    avatar: Brain,
    color: 'bg-purple-500',
    status: 'in-meeting',
    lastContribution: '30 minutes ago',
    keyInsights: 15
  },
  {
    id: '4',
    name: 'James Rodriguez',
    role: 'Chief Operations Officer',
    expertise: ['Process Optimization', 'Team Management', 'Efficiency'],
    avatar: Briefcase,
    color: 'bg-orange-500',
    status: 'available',
    lastContribution: '3 hours ago',
    keyInsights: 10
  },
  {
    id: '5',
    name: 'Elena Volkov',
    role: 'Chief Legal Officer',
    expertise: ['Corporate Law', 'Compliance', 'Risk Mitigation'],
    avatar: Shield,
    color: 'bg-red-500',
    status: 'available',
    lastContribution: '5 hours ago',
    keyInsights: 6
  },
  {
    id: '6',
    name: 'Dr. Raj Kumar',
    role: 'Chief Innovation Officer',
    expertise: ['R&D', 'Product Development', 'Emerging Tech'],
    avatar: Lightbulb,
    color: 'bg-yellow-500',
    status: 'available',
    lastContribution: '1 hour ago',
    keyInsights: 14
  },
  {
    id: '7',
    name: 'Sophie Martin',
    role: 'Chief Marketing Officer',
    expertise: ['Brand Strategy', 'Customer Acquisition', 'Digital Marketing'],
    avatar: TrendingUp,
    color: 'bg-pink-500',
    status: 'available',
    lastContribution: '4 hours ago',
    keyInsights: 9
  },
  {
    id: '8',
    name: 'David Kim',
    role: 'Chief Product Officer',
    expertise: ['Product Strategy', 'User Experience', 'Roadmapping'],
    avatar: Zap,
    color: 'bg-indigo-500',
    status: 'in-meeting',
    lastContribution: '2 hours ago',
    keyInsights: 11
  },
  {
    id: '9',
    name: 'Dr. Maria Santos',
    role: 'Chief People Officer',
    expertise: ['Talent Management', 'Culture Building', 'Leadership Development'],
    avatar: Heart,
    color: 'bg-rose-500',
    status: 'available',
    lastContribution: '6 hours ago',
    keyInsights: 7
  },
  {
    id: '10',
    name: 'Alexander Wright',
    role: 'Chief Revenue Officer',
    expertise: ['Sales Strategy', 'Revenue Growth', 'Partnerships'],
    avatar: DollarSign,
    color: 'bg-emerald-500',
    status: 'available',
    lastContribution: '1 hour ago',
    keyInsights: 13
  },
  {
    id: '11',
    name: 'Dr. Yuki Tanaka',
    role: 'Chief Data Officer',
    expertise: ['Data Analytics', 'Business Intelligence', 'Predictive Modeling'],
    avatar: TrendingUp,
    color: 'bg-cyan-500',
    status: 'available',
    lastContribution: '3 hours ago',
    keyInsights: 10
  },
  {
    id: '12',
    name: 'Isabella Romano',
    role: 'Chief Customer Officer',
    expertise: ['Customer Success', 'Experience Design', 'Retention'],
    avatar: Heart,
    color: 'bg-fuchsia-500',
    status: 'available',
    lastContribution: '2 hours ago',
    keyInsights: 8
  },
  {
    id: '13',
    name: 'Dr. Ahmed Hassan',
    role: 'Chief Sustainability Officer',
    expertise: ['ESG Strategy', 'Impact Measurement', 'Sustainable Growth'],
    avatar: Globe,
    color: 'bg-teal-500',
    status: 'offline',
    lastContribution: '1 day ago',
    keyInsights: 5
  },
  {
    id: '14',
    name: 'Victoria Sterling',
    role: 'Chief Knowledge Officer',
    expertise: ['Knowledge Management', 'Learning Systems', 'Information Architecture'],
    avatar: BookOpen,
    color: 'bg-violet-500',
    status: 'available',
    lastContribution: '30 minutes ago',
    keyInsights: 16
  }
];

export default function PersephoneBoard() {
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);
  const [meetingMode, setMeetingMode] = useState<'individual' | 'full-board' | null>(null);

  const availableMembers = BOARD_MEMBERS.filter(m => m.status === 'available').length;
  const totalInsights = BOARD_MEMBERS.reduce((sum, m) => sum + m.keyInsights, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in-meeting': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-10 w-10 text-purple-500" />
              Persephone Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your AI-powered board of 14 world-class advisors providing strategic oversight
            </p>
          </div>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setMeetingMode('full-board')}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Convene Full Board Meeting
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Board Members</p>
                <p className="text-2xl font-bold">{BOARD_MEMBERS.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Now</p>
                <p className="text-2xl font-bold text-green-600">{availableMembers}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Insights</p>
                <p className="text-2xl font-bold">{totalInsights}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next Meeting</p>
                <p className="text-sm font-semibold">Tomorrow 10 AM</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Board Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {BOARD_MEMBERS.map((member) => {
          const Icon = member.avatar;
          return (
            <Card 
              key={member.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`${member.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(member.status)}`} />
                </div>
                <CardTitle className="mt-4">{member.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.slice(0, 2).map((exp, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {member.expertise.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.expertise.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Key Insights</span>
                    <span className="font-bold">{member.keyInsights}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last active: {member.lastContribution}
                  </div>
                  <Button 
                    className="w-full mt-2"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMeetingMode('individual');
                      setSelectedMember(member);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Consult
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Meeting Modal (placeholder for future implementation) */}
      {meetingMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>
                {meetingMode === 'full-board' 
                  ? 'Full Board Meeting' 
                  : `Consultation with ${selectedMember?.name}`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {meetingMode === 'full-board'
                  ? 'Convene all 14 board members for strategic discussion and decision-making.'
                  : `One-on-one consultation with ${selectedMember?.name}, ${selectedMember?.role}.`
                }
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Coming Soon:</strong> Interactive board meetings with real-time AI-powered insights, 
                  strategic recommendations, and collaborative decision-making.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setMeetingMode(null);
                  setSelectedMember(null);
                }}>
                  Close
                </Button>
                <Button disabled>
                  Start Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
