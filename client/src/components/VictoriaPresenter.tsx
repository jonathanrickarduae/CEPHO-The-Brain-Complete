import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, Video, Loader2 } from 'lucide-react';

interface VictoriaPresenterProps {
  onPlayAudio: () => void;
  onPlayVideo?: () => void;
  isPlaying: boolean;
  isGenerating: boolean;
  briefTitle?: string;
}

export function VictoriaPresenter({
  onPlayAudio,
  onPlayVideo,
  isPlaying,
  isGenerating,
  briefTitle = "Daily Brief"
}: VictoriaPresenterProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-pink-500/30 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          {/* Victoria Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-pink-400/50">
              {/* Placeholder avatar - can be replaced with actual image */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="victoriaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="35" r="20" fill="#fcd5ce" />
                <ellipse cx="50" cy="85" rx="30" ry="25" fill="#fcd5ce" />
                <path d="M30 25 Q50 5 70 25 Q75 40 70 50 Q50 55 30 50 Q25 40 30 25" fill="#1a1a2e" />
                <circle cx="42" cy="35" r="3" fill="#1a1a2e" />
                <circle cx="58" cy="35" r="3" fill="#1a1a2e" />
                <path d="M45 45 Q50 48 55 45" stroke="#1a1a2e" strokeWidth="2" fill="none" />
              </svg>
            </div>
            {isPlaying && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Volume2 className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Victoria</h3>
            <p className="text-sm text-pink-300/80">Head of Briefings</p>
            <p className="text-xs text-foreground/60 mt-1">{briefTitle}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayAudio}
              disabled={isGenerating}
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Brief
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listen to Brief
                </>
              )}
            </Button>
            
            {onPlayVideo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPlayVideo}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 min-w-[140px]"
              >
                <Video className="h-4 w-4 mr-2" />
                Watch the Brief
              </Button>
            )}
          </div>
        </div>

        {/* Voice Wave Animation when playing */}
        {isPlaying && (
          <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse" />
        )}
      </CardContent>
    </Card>
  );
}

export default VictoriaPresenter;
