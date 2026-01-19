import React, { useState } from 'react';
import { QAAccuracyDashboard } from '@/components/QAAccuracyDashboard';
import { JimShortExpert } from '@/components/JimShortExpert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  UserCheck, 
  BarChart3, 
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface PendingReview {
  id: string;
  title: string;
  type: string;
  submittedAt: Date;
  status: 'pending_jim' | 'pending_user' | 'approved' | 'revision_needed';
  jimFeedback?: string;
  jimScore?: number;
}

// Sample pending reviews for Jim Short
const SAMPLE_PENDING_REVIEWS: PendingReview[] = [
  {
    id: '1',
    title: 'Q1 2026 Financial Projections',
    type: 'Financial Model',
    submittedAt: new Date('2026-01-18T09:30:00'),
    status: 'pending_jim'
  },
  {
    id: '2',
    title: 'Series A Investment Deck v3',
    type: 'Investment Deck',
    submittedAt: new Date('2026-01-17T14:00:00'),
    status: 'pending_user',
    jimFeedback: 'The market sizing needs more rigorous bottom-up analysis. The TAM figure of $50B seems inflated without proper segmentation. Also, the competitive moat section is weak - what specifically prevents a well-funded competitor from replicating this in 18 months?',
    jimScore: 65
  },
  {
    id: '3',
    title: 'Shareholder Agreement - Celadon',
    type: 'Legal Document',
    submittedAt: new Date('2026-01-16T11:00:00'),
    status: 'revision_needed',
    jimFeedback: 'The drag-along provisions are too aggressive for minority shareholders. This will scare off sophisticated angels. Recommend 75% threshold instead of 51%. The vesting cliff should be 12 months, not 6 - you want committed founders.',
    jimScore: 45
  }
];

export default function QADashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [pendingReviews] = useState<PendingReview[]>(SAMPLE_PENDING_REVIEWS);

  const getStatusBadge = (status: PendingReview['status']) => {
    switch (status) {
      case 'pending_jim':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Awaiting Jim's Review</Badge>;
      case 'pending_user':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Needs Your Decision</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'revision_needed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Revision Needed</Badge>;
    }
  };

  const pendingJimCount = pendingReviews.filter(r => r.status === 'pending_jim').length;
  const pendingUserCount = pendingReviews.filter(r => r.status === 'pending_user' || r.status === 'revision_needed').length;

  return (
    <div className="h-full overflow-auto p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              QA Dashboard
            </TabsTrigger>
            <TabsTrigger value="jim-review" className="data-[state=active]:bg-primary relative">
              <UserCheck className="w-4 h-4 mr-2" />
              Jim Short Review
              {pendingUserCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingUserCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <QAAccuracyDashboard />
        </TabsContent>

        <TabsContent value="jim-review" className="space-y-6">
          {/* Jim Short Expert Component */}
          <JimShortExpert 
            context="You're reviewing documents prepared by the Chief of Staff AI. Be direct and constructive."
            onFeedback={(feedback) => console.log('Jim feedback:', feedback)}
          />

          {/* Pending Reviews Queue */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Review Queue
                  </CardTitle>
                  <CardDescription>
                    Documents awaiting Jim's tough-love review
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {pendingJimCount} awaiting Jim
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {pendingUserCount} need your action
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReviews.map(review => (
                  <div 
                    key={review.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedReview?.id === review.id 
                        ? 'bg-purple-500/10 border-purple-500/30' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{review.title}</h4>
                          {getStatusBadge(review.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.type} • Submitted {review.submittedAt.toLocaleDateString()}
                        </p>
                      </div>
                      {review.jimScore !== undefined && (
                        <div className={`text-2xl font-bold ${
                          review.jimScore >= 70 ? 'text-green-400' :
                          review.jimScore >= 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {review.jimScore}
                        </div>
                      )}
                    </div>

                    {/* Jim's Feedback */}
                    {review.jimFeedback && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                            JS
                          </div>
                          <span className="text-sm font-medium text-amber-400">Jim's Feedback</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {review.jimFeedback}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {(review.status === 'pending_user' || review.status === 'revision_needed') && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-400 border-green-500/30 hover:bg-green-500/10">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accept & Proceed
                        </Button>
                        <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Discuss with Jim
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                          Send for Revision
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Jim's Review Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">47</p>
                  <p className="text-sm text-muted-foreground">Total Reviews by Jim</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">62%</p>
                  <p className="text-sm text-muted-foreground">Sent Back for Revision</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">94%</p>
                  <p className="text-sm text-muted-foreground">Improved After Jim's Input</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
