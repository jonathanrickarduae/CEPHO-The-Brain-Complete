import { useState } from 'react';
import { Podcast, Play, Pause, Clock, Star, Search, Sparkles, Headphones, TrendingUp, Brain, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * AI Podcast Hub
 * Curated audio content tailored to your interests
 * Inspired by Amporah's podcast feature
 */

type Category = 'all' | 'business' | 'technology' | 'leadership' | 'wellness';

interface PodcastEpisode {
  id: string;
  title: string;
  source: string;
  category: Category;
  duration: string;
  matchScore: number;
  description: string;
  thumbnail?: string;
}

const MOCK_EPISODES: PodcastEpisode[] = [
  {
    id: '1',
    title: 'The Future of AI in Business',
    source: 'Tech Insights Weekly',
    category: 'technology',
    duration: '45 min',
    matchScore: 98,
    description: 'Deep dive into how AI is transforming business operations and decision-making.',
  },
  {
    id: '2',
    title: 'Building High-Performance Teams',
    source: 'Leadership Lab',
    category: 'leadership',
    duration: '32 min',
    matchScore: 94,
    description: 'Strategies for creating and managing teams that deliver exceptional results.',
  },
  {
    id: '3',
    title: 'Investment Strategies for 2026',
    source: 'Money Matters',
    category: 'business',
    duration: '28 min',
    matchScore: 91,
    description: 'Expert analysis on market trends and investment opportunities.',
  },
  {
    id: '4',
    title: 'Mindful Leadership',
    source: 'The Wellness Executive',
    category: 'wellness',
    duration: '22 min',
    matchScore: 87,
    description: 'How mindfulness practices can enhance your leadership effectiveness.',
  },
];

const CATEGORY_ICONS = {
  all: Podcast,
  business: Briefcase,
  technology: Brain,
  leadership: TrendingUp,
  wellness: Sparkles,
};

const CATEGORY_COUNTS = {
  all: 24,
  business: 8,
  technology: 6,
  leadership: 5,
  wellness: 5,
};

export function AIPodcastHub() {
  const [activeTab, setActiveTab] = useState<'discover' | 'foryou' | 'create' | 'library'>('discover');
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredEpisodes = MOCK_EPISODES.filter(ep => 
    category === 'all' || ep.category === category
  ).filter(ep =>
    !searchQuery || ep.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
          <Podcast className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Podcast Hub</h2>
          <p className="text-sm text-muted-foreground">Curated podcasts & AI-generated audio content tailored to your interests</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI Curated
        </span>
        <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs flex items-center gap-1">
          <Headphones className="w-3 h-3" /> 6 Episodes
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['discover', 'foryou', 'create', 'library'] as const).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab === 'foryou' ? 'For You' : tab === 'create' ? 'Create Podcast' : tab === 'library' ? 'My Library' : 'Discover'}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search podcasts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? 'default' : 'outline'}
              onClick={() => setCategory(cat)}
              className="capitalize flex items-center gap-1"
            >
              <Icon className="w-4 h-4" />
              {cat}
              <span className="ml-1 text-xs opacity-70">{CATEGORY_COUNTS[cat]}</span>
            </Button>
          );
        })}
      </div>

      {/* Episodes List */}
      <div className="space-y-3">
        {filteredEpisodes.map((episode) => (
          <div 
            key={episode.id}
            className="bg-card/50 rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail/Play */}
              <div 
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => togglePlay(episode.id)}
              >
                {playingId === episode.id ? (
                  <Pause className="w-6 h-6 text-primary" />
                ) : (
                  <Play className="w-6 h-6 text-primary ml-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-secondary/50 rounded text-xs capitalize">{episode.category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {episode.duration}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{episode.title}</h3>
                <p className="text-sm text-muted-foreground">{episode.source}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{episode.description}</p>
                
                {/* Match Score */}
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">{episode.matchScore}% match</span>
                </div>
              </div>

              {/* Play Button */}
              <Button 
                size="sm"
                onClick={() => togglePlay(episode.id)}
              >
                {playingId === episode.id ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact widget for dashboard
export function PodcastWidget() {
  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
          <Podcast className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm">AI Podcast Hub</h4>
          <p className="text-xs text-muted-foreground">3 new for you</p>
        </div>
      </div>
      
      {/* Quick episode */}
      <div className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
        <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
          <Play className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">The Future of AI</p>
          <p className="text-xs text-muted-foreground">45 min • 98% match</p>
        </div>
      </div>
    </div>
  );
}
