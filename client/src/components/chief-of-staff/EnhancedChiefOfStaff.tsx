import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Mail,
  CheckSquare,
  TrendingUp,
  FileText,
  Calendar,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export function EnhancedChiefOfStaff() {
  const { data: briefing, isLoading: briefingLoading, refetch: refetchBriefing } = 
    trpc.chiefOfStaff.getMorningBriefing.useQuery();
  
  const { data: context, isLoading: contextLoading } = 
    trpc.chiefOfStaff.getContext.useQuery();

  const [selectedFocus, setSelectedFocus] = useState<number | null>(null);

  if (briefingLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            Chief of Staff Command Center
          </h1>
          <p className="text-gray-400 mt-1">
            Your AI-powered executive assistant with complete visibility into your work
          </p>
        </div>
        <Button onClick={() => refetchBriefing()} variant="outline" className="border-gray-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Real-time Context Overview */}
      {context && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{context.emails.unread}</p>
                  <p className="text-sm text-blue-200">Unread Emails</p>
                  {context.emails.highPriority > 0 && (
                    <Badge className="bg-red-600 mt-1 text-xs">
                      {context.emails.highPriority} urgent
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-8 w-8 text-green-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{context.tasks.dueToday}</p>
                  <p className="text-sm text-green-200">Tasks Due Today</p>
                  {context.tasks.overdue > 0 && (
                    <Badge className="bg-red-600 mt-1 text-xs">
                      {context.tasks.overdue} overdue
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{context.projects.active}</p>
                  <p className="text-sm text-purple-200">Active Projects</p>
                  {context.projects.atRisk > 0 && (
                    <Badge className="bg-yellow-600 mt-1 text-xs">
                      {context.projects.atRisk} at risk
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{context.articles.new}</p>
                  <p className="text-sm text-yellow-200">New Articles</p>
                  {context.articles.trending > 0 && (
                    <Badge className="bg-orange-600 mt-1 text-xs">
                      {context.articles.trending} trending
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-indigo-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{context.documents.total}</p>
                  <p className="text-sm text-indigo-200">Documents</p>
                  {context.documents.recent > 0 && (
                    <Badge className="bg-blue-600 mt-1 text-xs">
                      {context.documents.recent} new
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Focus - Top 3 Priorities */}
      {briefing && (
        <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Today's Focus - Top 3 Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.topPriorities.map((priority, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedFocus === index
                    ? 'bg-purple-700 border-2 border-purple-400'
                    : 'bg-purple-800/50 hover:bg-purple-800'
                }`}
                onClick={() => setSelectedFocus(selectedFocus === index ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <Badge className="bg-yellow-600 text-lg px-3 py-1">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{priority.title}</h3>
                    <p className="text-purple-200 text-sm">{priority.description}</p>
                    {selectedFocus === index && priority.details && (
                      <div className="mt-3 p-3 bg-purple-900 rounded">
                        <p className="text-purple-100 text-sm">{priority.details}</p>
                      </div>
                    )}
                  </div>
                  <Badge className={`
                    ${priority.urgency === 'high' ? 'bg-red-600' : ''}
                    ${priority.urgency === 'medium' ? 'bg-yellow-600' : ''}
                    ${priority.urgency === 'low' ? 'bg-green-600' : ''}
                  `}>
                    {priority.urgency}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Intelligent Recommendations */}
      {briefing && briefing.recommendations && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Intelligent Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-750 rounded-lg">
                <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">{rec.title}</p>
                  <p className="text-gray-400 text-sm">{rec.description}</p>
                  {rec.action && (
                    <Button
                      size="sm"
                      className="mt-2 bg-purple-600 hover:bg-purple-700"
                    >
                      {rec.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alerts and Blockers */}
      {context && context.alerts && context.alerts.length > 0 && (
        <Card className="bg-red-900/20 border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Alerts & Blockers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {context.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium">{alert.title}</p>
                  <p className="text-red-200 text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
