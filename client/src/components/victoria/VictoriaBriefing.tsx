import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Calendar,
  Mail,
  CheckSquare,
  TrendingUp,
  FileText,
  Video
} from 'lucide-react';

export function VictoriaBriefing() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: briefing, isLoading, refetch } = trpc.victoriaBriefing.getDailyBriefing.useQuery();
  const generateAudioMutation = trpc.victoriaBriefing.generateAudio.useMutation();

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      await generateAudioMutation.mutateAsync();
      refetch();
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!briefing) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Briefing Available</h3>
          <p className="text-gray-400 text-center mb-6">
            Victoria's daily briefing will be generated automatically each morning
          </p>
          <Button onClick={() => refetch()} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Briefing Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Good Morning, Jonathan</h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-gray-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Audio Player */}
      {briefing.audioUrl && (
        <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Volume2 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Victoria's Voice Briefing</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    className="bg-white text-purple-900 hover:bg-gray-100"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleMuteToggle}
                    size="sm"
                    variant="outline"
                    className="border-white text-white hover:bg-purple-800"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm text-purple-200">
                    {briefing.audioDuration || '2:30'}
                  </span>
                </div>
                <audio
                  ref={audioRef}
                  src={briefing.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!briefing.audioUrl && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Audio Briefing</h3>
                <p className="text-sm text-gray-400">Generate Victoria's voice briefing</p>
              </div>
              <Button
                onClick={handleGenerateAudio}
                disabled={generateAudioMutation.isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generateAudioMutation.isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Volume2 className="h-4 w-4 mr-2" />
                )}
                Generate Audio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{briefing.stats.unreadEmails}</p>
                <p className="text-sm text-gray-400">Unread Emails</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{briefing.stats.tasksDueToday}</p>
                <p className="text-sm text-gray-400">Tasks Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">{briefing.stats.activeProjects}</p>
                <p className="text-sm text-gray-400">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">{briefing.stats.newArticles}</p>
                <p className="text-sm text-gray-400">New Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Briefing Content */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Today's Briefing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Priorities */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-purple-500" />
              Top Priorities
            </h3>
            <div className="space-y-2">
              {briefing.priorities.map((priority, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-750 rounded-lg">
                  <Badge className="bg-purple-600">{index + 1}</Badge>
                  <p className="text-gray-300">{priority}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Emails */}
          {briefing.importantEmails && briefing.importantEmails.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Important Emails
              </h3>
              <div className="space-y-2">
                {briefing.importantEmails.map((email, index) => (
                  <div key={index} className="p-3 bg-gray-750 rounded-lg">
                    <p className="text-white font-medium">{email.subject}</p>
                    <p className="text-sm text-gray-400">{email.from}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {briefing.upcomingTasks && briefing.upcomingTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-green-500" />
                Upcoming Tasks
              </h3>
              <div className="space-y-2">
                {briefing.upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg">
                    <CheckSquare className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-300">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {briefing.insights && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                Insights & Recommendations
              </h3>
              <div className="p-4 bg-gray-750 rounded-lg">
                <p className="text-gray-300 whitespace-pre-line">{briefing.insights}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
