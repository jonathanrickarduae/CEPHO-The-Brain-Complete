import { 
  X, Star, TrendingUp, Brain, Target, AlertTriangle, 
  Lightbulb, CheckCircle2, Clock, BarChart3, MessageSquare,
  Sparkles, Award, Activity, Calendar, Users, Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AIExpert } from '@/data/ai-experts.data';

interface ExpertDetailModalProps {
  expert: AIExpert | null;
  isOpen: boolean;
  onClose: () => void;
  onConsult?: (expertId: string) => void;
}

export function ExpertDetailModal({ expert, isOpen, onClose, onConsult }: ExpertDetailModalProps) {
  if (!expert) return null;

  const handleConsult = () => {
    if (onConsult) {
      onConsult(expert.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{expert.avatar}</div>
              <div>
                <DialogTitle className="text-2xl">{expert.name}</DialogTitle>
                <p className="text-muted-foreground mt-1">{expert.specialty}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{expert.category}</Badge>
                  <Badge 
                    variant={
                      expert.status === 'active' ? 'default' : 
                      expert.status === 'training' ? 'secondary' : 
                      'outline'
                    }
                  >
                    {expert.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">Thinking Style</TabsTrigger>
              <TabsTrigger value="composition">Composition</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{expert.bio}</p>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expert.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expert.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Target className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* AI Backend Preference */}
              {expert.preferredBackend && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      AI Backend Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {expert.preferredBackend.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Recommended</span>
                    </div>
                    {expert.backendRationale && (
                      <p className="text-sm text-muted-foreground">{expert.backendRationale}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              {/* Performance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Performance Score
                  </CardTitle>
                  <CardDescription>
                    Overall effectiveness and reliability rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{expert.performanceScore}%</span>
                    <Badge variant={expert.performanceScore >= 90 ? 'default' : 'secondary'}>
                      {expert.performanceScore >= 95 ? 'Exceptional' :
                       expert.performanceScore >= 90 ? 'Excellent' :
                       expert.performanceScore >= 80 ? 'Very Good' :
                       expert.performanceScore >= 70 ? 'Good' : 'Developing'}
                    </Badge>
                  </div>
                  <Progress value={expert.performanceScore} className="h-3" />
                </CardContent>
              </Card>

              {/* Activity Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projects</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{expert.projectsCompleted}</div>
                    <p className="text-xs text-muted-foreground">
                      Completed successfully
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Insights</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{expert.insightsGenerated}</div>
                    <p className="text-xs text-muted-foreground">
                      Generated to date
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Date(expert.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Most recent activity
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">{Math.min(expert.performanceScore + 2, 100)}%</span>
                    </div>
                    <Progress value={Math.min(expert.performanceScore + 2, 100)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Insight Quality</span>
                      <span className="font-medium">{Math.min(expert.performanceScore + 4, 100)}%</span>
                    </div>
                    <Progress value={Math.min(expert.performanceScore + 4, 100)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">{Math.max(expert.performanceScore - 5, 70)}%</span>
                    </div>
                    <Progress value={Math.max(expert.performanceScore - 5, 70)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>User Satisfaction</span>
                      <span className="font-medium">{expert.performanceScore}%</span>
                    </div>
                    <Progress value={expert.performanceScore} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Thinking Style Tab */}
            <TabsContent value="insights" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Thinking Style
                  </CardTitle>
                  <CardDescription>
                    How this expert approaches problems and generates insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{expert.thinkingStyle}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Best Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Strategic Planning</p>
                        <p className="text-sm text-muted-foreground">
                          Leverage their expertise for long-term strategic decisions
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Problem Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          Deep dive into complex challenges in their domain
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Decision Support</p>
                        <p className="text-sm text-muted-foreground">
                          Get expert perspective on critical business decisions
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Composition Tab */}
            <TabsContent value="composition" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Expert Composition
                  </CardTitle>
                  <CardDescription>
                    This AI expert is a composite of the following thought leaders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expert.compositeOf.map((person, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{person}</p>
                          <p className="text-xs text-muted-foreground">
                            Contributing expertise and perspective
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Synthesis Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This expert combines the unique perspectives, methodologies, and insights 
                    of {expert.compositeOf.length} renowned thought leaders to provide 
                    comprehensive, multi-faceted analysis. Each consultation draws on their 
                    collective wisdom while maintaining a cohesive, actionable perspective.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleConsult}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Consult Expert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
