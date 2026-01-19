// Platform Intelligence Data Layer
// Deep insights into how each social media algorithm works

export interface AlgorithmSignal {
  name: string;
  weight: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  optimization: string;
}

export interface ContentFormat {
  type: string;
  optimalLength: string;
  bestPractices: string[];
  algorithmBoost: boolean;
}

export interface PostingWindow {
  day: string;
  times: string[];
  engagement: 'peak' | 'high' | 'medium' | 'low';
}

export interface PlatformIntelligence {
  id: string;
  name: string;
  icon: string;
  color: string;
  audienceProfile: string;
  primaryGoal: string;
  algorithmName: string;
  algorithmSummary: string;
  keySignals: AlgorithmSignal[];
  contentFormats: ContentFormat[];
  optimalPostingTimes: PostingWindow[];
  hashtagStrategy: {
    optimal: number;
    placement: string;
    tips: string[];
  };
  engagementTactics: string[];
  avoidList: string[];
  growthHacks: string[];
  metrics: {
    name: string;
    target: string;
    importance: string;
  }[];
}

export const PLATFORM_INTELLIGENCE: PlatformIntelligence[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#E4405F',
    audienceProfile: 'Visual-first users aged 18-44, lifestyle and brand discovery',
    primaryGoal: 'Build brand awareness and community through visual storytelling',
    algorithmName: 'Instagram Ranking System',
    algorithmSummary: 'Instagram uses machine learning to predict what content you\'ll find most valuable. It ranks content based on relationship signals, interest signals, and timeliness. Each surface (Feed, Stories, Reels, Explore) has its own ranking algorithm.',
    keySignals: [
      {
        name: 'Relationship',
        weight: 'critical',
        description: 'How close you are to the person - do you message, comment, tag each other?',
        optimization: 'Encourage DMs, reply to every comment within 1 hour, tag collaborators'
      },
      {
        name: 'Interest',
        weight: 'critical',
        description: 'Does the user typically engage with this type of content?',
        optimization: 'Stay consistent with content pillars, use relevant hashtags'
      },
      {
        name: 'Timeliness',
        weight: 'high',
        description: 'How recent is the post? Newer posts get priority',
        optimization: 'Post when your audience is most active, use Stories for real-time'
      },
      {
        name: 'Session Time',
        weight: 'high',
        description: 'How long users spend viewing your content',
        optimization: 'Create carousel posts (average 1.4x more reach), use engaging hooks'
      },
      {
        name: 'Saves',
        weight: 'critical',
        description: 'Saves signal high-value content worth returning to',
        optimization: 'Create educational content, tips, tutorials, reference guides'
      },
      {
        name: 'Shares',
        weight: 'critical',
        description: 'Shares to Stories or DMs indicate viral potential',
        optimization: 'Create relatable, shareable content - memes, quotes, insights'
      }
    ],
    contentFormats: [
      {
        type: 'Reels',
        optimalLength: '15-30 seconds (sweet spot), up to 90 seconds',
        bestPractices: [
          'Hook in first 1-3 seconds',
          'Use trending audio',
          'Add text overlays for silent viewing',
          'End with CTA or loop point',
          'Native editing preferred over external tools'
        ],
        algorithmBoost: true
      },
      {
        type: 'Carousels',
        optimalLength: '5-10 slides',
        bestPractices: [
          'First slide = scroll-stopping hook',
          'Last slide = strong CTA',
          'Educational or storytelling format',
          'Consistent design template',
          'Save-worthy information'
        ],
        algorithmBoost: true
      },
      {
        type: 'Stories',
        optimalLength: '3-7 stories per day',
        bestPractices: [
          'Use interactive stickers (polls, questions, quizzes)',
          'Behind-the-scenes content',
          'Time-sensitive announcements',
          'Link stickers for traffic'
        ],
        algorithmBoost: false
      },
      {
        type: 'Single Image',
        optimalLength: '1080x1350 (4:5 ratio)',
        bestPractices: [
          'High-quality, eye-catching visuals',
          'Faces perform 38% better',
          'Consistent aesthetic/filter',
          'Strong caption with value'
        ],
        algorithmBoost: false
      }
    ],
    optimalPostingTimes: [
      { day: 'Monday', times: ['6am', '10am', '10pm'], engagement: 'medium' },
      { day: 'Tuesday', times: ['2am', '4am', '9am'], engagement: 'high' },
      { day: 'Wednesday', times: ['7am', '8am', '11pm'], engagement: 'peak' },
      { day: 'Thursday', times: ['9am', '12pm', '7pm'], engagement: 'high' },
      { day: 'Friday', times: ['5am', '1pm', '3pm'], engagement: 'high' },
      { day: 'Saturday', times: ['11am', '7pm', '8pm'], engagement: 'medium' },
      { day: 'Sunday', times: ['7am', '8am', '4pm'], engagement: 'peak' }
    ],
    hashtagStrategy: {
      optimal: 5,
      placement: 'In caption (not comments) - Instagram confirmed this in 2021',
      tips: [
        'Mix of sizes: 2 large (1M+), 2 medium (100K-1M), 1 niche (<100K)',
        'Highly relevant to content - avoid banned/spam hashtags',
        'Create branded hashtag for community',
        'Research competitor hashtags',
        'Rotate hashtag sets to avoid shadowban'
      ]
    },
    engagementTactics: [
      'Reply to comments within 60 minutes (algorithm boost)',
      'Engage with followers\' content before posting',
      'Use question stickers in Stories',
      'Go Live weekly (notification to followers)',
      'Collaborate with similar-sized accounts',
      'Pin top 3 comments to guide conversation'
    ],
    avoidList: [
      'Buying followers or engagement',
      'Using banned hashtags',
      'Posting and ghosting (no engagement)',
      'Inconsistent posting schedule',
      'Watermarked TikTok reposts',
      'Engagement pods (detected and penalized)',
      'Too many hashtags (looks spammy)'
    ],
    growthHacks: [
      'Reels with trending audio get 2x reach',
      'Post carousels for 1.4x more engagement',
      'First 30 minutes engagement is crucial',
      'Cross-promote Reels to Stories',
      'Use SEO keywords in bio and captions',
      'Collaborate via Collab feature (shared reach)'
    ],
    metrics: [
      { name: 'Reach', target: '10-20% of followers per post', importance: 'Primary growth indicator' },
      { name: 'Engagement Rate', target: '3-6% (good), 6%+ (excellent)', importance: 'Content quality signal' },
      { name: 'Saves', target: '2-5% of reach', importance: 'Algorithm ranking signal' },
      { name: 'Shares', target: '1-3% of reach', importance: 'Viral potential indicator' },
      { name: 'Profile Visits', target: 'Track weekly growth', importance: 'Conversion funnel metric' }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    audienceProfile: 'Intent-driven viewers seeking education, entertainment, or solutions',
    primaryGoal: 'Build authority and long-term discoverability through searchable video content',
    algorithmName: 'YouTube Recommendation System',
    algorithmSummary: 'YouTube\'s algorithm optimizes for viewer satisfaction, not just clicks. It uses deep neural networks to predict which videos will keep viewers on the platform longest. Watch time, click-through rate, and viewer satisfaction surveys drive recommendations.',
    keySignals: [
      {
        name: 'Watch Time',
        weight: 'critical',
        description: 'Total minutes watched - the #1 ranking factor',
        optimization: 'Create longer content (8-15 min sweet spot), strong hooks, pattern interrupts'
      },
      {
        name: 'Click-Through Rate (CTR)',
        weight: 'critical',
        description: 'Percentage of impressions that result in clicks',
        optimization: 'A/B test thumbnails, use curiosity gaps in titles, faces with emotion'
      },
      {
        name: 'Average View Duration',
        weight: 'critical',
        description: 'How much of your video people watch on average',
        optimization: 'Front-load value, use chapters, avoid slow intros'
      },
      {
        name: 'Session Watch Time',
        weight: 'high',
        description: 'Does your video lead to more YouTube watching?',
        optimization: 'End screens, playlists, series content, suggested video mentions'
      },
      {
        name: 'Engagement',
        weight: 'high',
        description: 'Likes, comments, shares, subscribers gained',
        optimization: 'Ask for engagement verbally, reply to comments, create discussion'
      },
      {
        name: 'Upload Frequency',
        weight: 'medium',
        description: 'Consistent uploading signals active channel',
        optimization: 'Minimum 1x/week, same day/time builds audience habit'
      }
    ],
    contentFormats: [
      {
        type: 'Long-form Video',
        optimalLength: '8-15 minutes (monetization + algorithm)',
        bestPractices: [
          'Hook in first 30 seconds',
          'Pattern interrupts every 30-60 seconds',
          'Chapters for navigation',
          'Strong CTA at 70% mark',
          'End screen in final 20 seconds'
        ],
        algorithmBoost: true
      },
      {
        type: 'YouTube Shorts',
        optimalLength: 'Under 60 seconds',
        bestPractices: [
          'Vertical 9:16 format',
          'Hook in first 1 second',
          'Loop-worthy endings',
          'Trending sounds/topics',
          'Text overlays essential'
        ],
        algorithmBoost: true
      },
      {
        type: 'Live Streams',
        optimalLength: '1-2 hours minimum',
        bestPractices: [
          'Schedule in advance (notifications)',
          'Interactive Q&A format',
          'Super Chat engagement',
          'Repurpose highlights as Shorts'
        ],
        algorithmBoost: false
      },
      {
        type: 'Community Posts',
        optimalLength: 'Daily engagement',
        bestPractices: [
          'Polls for engagement',
          'Behind-the-scenes images',
          'Video teasers',
          'Audience questions'
        ],
        algorithmBoost: false
      }
    ],
    optimalPostingTimes: [
      { day: 'Monday', times: ['2pm', '4pm'], engagement: 'medium' },
      { day: 'Tuesday', times: ['2pm', '4pm'], engagement: 'high' },
      { day: 'Wednesday', times: ['2pm', '4pm'], engagement: 'high' },
      { day: 'Thursday', times: ['12pm', '3pm'], engagement: 'peak' },
      { day: 'Friday', times: ['12pm', '3pm'], engagement: 'peak' },
      { day: 'Saturday', times: ['9am', '11am'], engagement: 'high' },
      { day: 'Sunday', times: ['9am', '11am'], engagement: 'high' }
    ],
    hashtagStrategy: {
      optimal: 3,
      placement: 'In description, not title',
      tips: [
        'Use #Shorts for short-form content',
        'Include 1-2 broad + 1 niche hashtag',
        'Hashtags less important than SEO keywords',
        'Focus on title and description optimization'
      ]
    },
    engagementTactics: [
      'Pin a question as first comment',
      'Reply to comments in first 24 hours',
      'Heart comments to encourage more',
      'Create response videos to comments',
      'Use Community tab for polls and updates',
      'Collaborate with other creators'
    ],
    avoidList: [
      'Clickbait that doesn\'t deliver (hurts retention)',
      'Inconsistent upload schedule',
      'Ignoring SEO (title, description, tags)',
      'Poor audio quality (viewers leave)',
      'Long intros (skip to content)',
      'Asking for subs before providing value'
    ],
    growthHacks: [
      'Shorts can drive subscribers to long-form',
      'Thumbnail A/B testing (change after 48hrs if CTR low)',
      'Evergreen content compounds over time',
      'Playlists increase session time',
      'Collaborate for audience crossover',
      'Repurpose top content annually'
    ],
    metrics: [
      { name: 'CTR', target: '4-10% (varies by niche)', importance: 'Thumbnail/title effectiveness' },
      { name: 'Avg View Duration', target: '50%+ of video length', importance: 'Content quality signal' },
      { name: 'Watch Time', target: '4,000 hours for monetization', importance: 'Primary ranking factor' },
      { name: 'Subscriber Conversion', target: '2-5% of viewers', importance: 'Channel growth indicator' },
      { name: 'Impressions', target: 'Track weekly growth', importance: 'Algorithm reach indicator' }
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    audienceProfile: 'Gen Z and Millennials seeking entertainment, trends, and authentic content',
    primaryGoal: 'Rapid brand awareness and viral reach through trend participation',
    algorithmName: 'For You Page (FYP) Algorithm',
    algorithmSummary: 'TikTok\'s algorithm is the most democratic - follower count matters less than content quality. It tests every video with small audiences and scales based on performance. Completion rate and rewatches are the strongest signals.',
    keySignals: [
      {
        name: 'Completion Rate',
        weight: 'critical',
        description: 'Percentage of viewers who watch to the end',
        optimization: 'Keep videos short (7-15 sec for beginners), strong hooks, no fluff'
      },
      {
        name: 'Rewatch Rate',
        weight: 'critical',
        description: 'How many times users loop your video',
        optimization: 'Create loop-worthy content, surprise endings, hidden details'
      },
      {
        name: 'Shares',
        weight: 'critical',
        description: 'Shares indicate viral potential',
        optimization: 'Relatable content, useful tips, emotional triggers'
      },
      {
        name: 'Comments',
        weight: 'high',
        description: 'Comments signal engagement and controversy',
        optimization: 'Ask questions, create debate, respond to comments with videos'
      },
      {
        name: 'Profile Visits',
        weight: 'high',
        description: 'Users checking your profile after watching',
        optimization: 'Tease series content, create curiosity about who you are'
      },
      {
        name: 'Follows from Video',
        weight: 'high',
        description: 'New followers gained from specific video',
        optimization: 'Consistent niche content, promise more value'
      }
    ],
    contentFormats: [
      {
        type: 'Standard TikTok',
        optimalLength: '15-60 seconds (21-34 sec sweet spot)',
        bestPractices: [
          'Hook in first 1 second',
          'Trending sounds boost reach',
          'Text on screen essential',
          'Native TikTok editing preferred',
          'Vertical 9:16 only'
        ],
        algorithmBoost: true
      },
      {
        type: 'TikTok Stories',
        optimalLength: '15 seconds max',
        bestPractices: [
          'Behind-the-scenes content',
          'Quick updates',
          'Polls and questions',
          'Less polished, more authentic'
        ],
        algorithmBoost: false
      },
      {
        type: 'TikTok LIVE',
        optimalLength: '30+ minutes',
        bestPractices: [
          'Engage with comments constantly',
          'Gift interactions',
          'Q&A format works well',
          'Promote upcoming Lives in videos'
        ],
        algorithmBoost: true
      },
      {
        type: 'Photo Mode',
        optimalLength: '3-10 images',
        bestPractices: [
          'Carousel storytelling',
          'Before/after reveals',
          'Educational slides',
          'Add trending audio'
        ],
        algorithmBoost: false
      }
    ],
    optimalPostingTimes: [
      { day: 'Monday', times: ['6am', '10am', '10pm'], engagement: 'medium' },
      { day: 'Tuesday', times: ['2am', '4am', '9am'], engagement: 'peak' },
      { day: 'Wednesday', times: ['7am', '8am', '11pm'], engagement: 'high' },
      { day: 'Thursday', times: ['9am', '12pm', '7pm'], engagement: 'peak' },
      { day: 'Friday', times: ['5am', '1pm', '3pm'], engagement: 'high' },
      { day: 'Saturday', times: ['11am', '7pm', '8pm'], engagement: 'medium' },
      { day: 'Sunday', times: ['7am', '8am', '4pm'], engagement: 'high' }
    ],
    hashtagStrategy: {
      optimal: 4,
      placement: 'In caption, mix of trending and niche',
      tips: [
        'Use 1-2 trending hashtags',
        'Add 1-2 niche-specific hashtags',
        'Check hashtag views (sweet spot: 1M-100M)',
        'Avoid oversaturated hashtags',
        'Create branded hashtag for challenges'
      ]
    },
    engagementTactics: [
      'Reply to comments with video responses',
      'Duet and Stitch popular content',
      'Jump on trends within 24-48 hours',
      'Go Live to boost algorithm favor',
      'Engage with similar creators',
      'Post 1-3 times daily for growth phase'
    ],
    avoidList: [
      'Watermarks from other platforms',
      'Horizontal video format',
      'Slow intros or buildups',
      'Overly polished/corporate content',
      'Ignoring trends',
      'Inconsistent posting',
      'Buying followers (detected easily)'
    ],
    growthHacks: [
      'First 3 seconds determine 90% of success',
      'Trending sounds = 2-3x reach',
      'Post 3x daily during growth phase',
      'Niche down for faster growth',
      'Video replies create content loops',
      'Series content builds anticipation'
    ],
    metrics: [
      { name: 'Completion Rate', target: '80%+ for short videos', importance: 'Primary FYP signal' },
      { name: 'Shares', target: '1%+ of views', importance: 'Viral potential indicator' },
      { name: 'Comments', target: '0.5%+ of views', importance: 'Engagement quality signal' },
      { name: 'Follower Growth', target: 'Track daily during growth', importance: 'Account momentum' },
      { name: 'Video Views', target: 'Baseline vs viral tracking', importance: 'Content performance' }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    audienceProfile: 'Professionals, B2B decision-makers, job seekers, thought leaders',
    primaryGoal: 'Build professional authority and generate B2B leads through thought leadership',
    algorithmName: 'LinkedIn Feed Algorithm',
    algorithmSummary: 'LinkedIn prioritizes content that sparks professional conversations. It uses a multi-stage ranking system: spam filter → quality scoring → engagement prediction → network boost. Dwell time and meaningful comments are heavily weighted.',
    keySignals: [
      {
        name: 'Dwell Time',
        weight: 'critical',
        description: 'How long users spend reading your post',
        optimization: 'Write longer posts (1,200-1,500 chars), use line breaks, tell stories'
      },
      {
        name: 'Early Engagement',
        weight: 'critical',
        description: 'Engagement in first 60-90 minutes',
        optimization: 'Post when network is active, engage immediately with comments'
      },
      {
        name: 'Comment Quality',
        weight: 'critical',
        description: 'Meaningful comments > reactions',
        optimization: 'Ask questions, create discussion, reply to every comment'
      },
      {
        name: 'Network Relevance',
        weight: 'high',
        description: 'Content shown to 1st connections first',
        optimization: 'Build relevant network, engage with target audience'
      },
      {
        name: 'Content Type',
        weight: 'high',
        description: 'Native content preferred over external links',
        optimization: 'Use document posts, native video, text posts over link posts'
      },
      {
        name: 'Creator Mode',
        weight: 'medium',
        description: 'Signals you\'re a content creator',
        optimization: 'Enable Creator Mode, add hashtags to profile'
      }
    ],
    contentFormats: [
      {
        type: 'Text Post',
        optimalLength: '1,200-1,500 characters',
        bestPractices: [
          'Hook in first 2 lines (before "see more")',
          'Use line breaks for readability',
          'Personal stories perform best',
          'End with question or CTA',
          'No external links in post (add in comments)'
        ],
        algorithmBoost: true
      },
      {
        type: 'Document/Carousel',
        optimalLength: '8-12 slides',
        bestPractices: [
          'Educational content',
          'Step-by-step guides',
          'Data visualizations',
          'Swipe-worthy design',
          'CTA on last slide'
        ],
        algorithmBoost: true
      },
      {
        type: 'Native Video',
        optimalLength: '30-90 seconds',
        bestPractices: [
          'Captions essential (85% watch muted)',
          'Professional but authentic',
          'Talking head performs well',
          'Square or vertical format'
        ],
        algorithmBoost: true
      },
      {
        type: 'Poll',
        optimalLength: '2-4 options',
        bestPractices: [
          'Industry-relevant questions',
          'Controversial but professional',
          'Follow up with results post',
          'Tag relevant people'
        ],
        algorithmBoost: true
      },
      {
        type: 'Newsletter',
        optimalLength: '500-1,000 words',
        bestPractices: [
          'Weekly consistency',
          'Deep-dive topics',
          'Subscriber notifications',
          'Cross-promote in posts'
        ],
        algorithmBoost: false
      }
    ],
    optimalPostingTimes: [
      { day: 'Monday', times: ['7am', '10am', '12pm'], engagement: 'medium' },
      { day: 'Tuesday', times: ['7am', '10am', '12pm'], engagement: 'peak' },
      { day: 'Wednesday', times: ['7am', '10am', '12pm'], engagement: 'peak' },
      { day: 'Thursday', times: ['7am', '10am', '12pm'], engagement: 'high' },
      { day: 'Friday', times: ['7am', '10am'], engagement: 'medium' },
      { day: 'Saturday', times: ['10am'], engagement: 'low' },
      { day: 'Sunday', times: ['10am'], engagement: 'low' }
    ],
    hashtagStrategy: {
      optimal: 3,
      placement: 'At end of post or in first comment',
      tips: [
        'Use 3-5 relevant hashtags max',
        'Mix broad (#leadership) and niche (#B2BSaaS)',
        'Follow hashtags in your niche',
        'Create branded hashtag for campaigns',
        'Check hashtag follower counts'
      ]
    },
    engagementTactics: [
      'Reply to every comment within 2 hours',
      'Engage with others\' posts before posting yours',
      'Tag relevant people (sparingly)',
      'Join and participate in LinkedIn Groups',
      'Send connection requests with personalized notes',
      'Comment thoughtfully on influencer posts'
    ],
    avoidList: [
      'External links in post body (kills reach)',
      'Engagement bait ("Like if you agree")',
      'Too many hashtags (looks spammy)',
      'Posting more than 1-2x per day',
      'Controversial non-professional topics',
      'Auto-posting from other platforms',
      'Tagging people who won\'t engage'
    ],
    growthHacks: [
      'Document posts get 3x more reach than images',
      'First comment with link preserves reach',
      'Engage 15 min before and after posting',
      'Personal stories outperform corporate content',
      'Commenting on big accounts gets visibility',
      'Consistency beats virality (post 3-5x/week)'
    ],
    metrics: [
      { name: 'Impressions', target: '2-5x your follower count', importance: 'Reach indicator' },
      { name: 'Engagement Rate', target: '2-5% (good), 5%+ (excellent)', importance: 'Content quality signal' },
      { name: 'Profile Views', target: 'Track weekly growth', importance: 'Personal brand indicator' },
      { name: 'Connection Growth', target: '50-100/week during growth', importance: 'Network expansion' },
      { name: 'SSI Score', target: '70+ (industry leader)', importance: 'LinkedIn\'s own metric' }
    ]
  }
];

// Content pillar templates
export interface ContentPillar {
  id: string;
  name: string;
  description: string;
  percentage: number;
  examples: string[];
}

export const CONTENT_PILLARS: ContentPillar[] = [
  {
    id: 'education',
    name: 'Education',
    description: 'Teach your audience something valuable',
    percentage: 40,
    examples: ['How-to guides', 'Tips and tricks', 'Industry insights', 'Tutorials', 'Explainers']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Keep your audience engaged and coming back',
    percentage: 25,
    examples: ['Behind-the-scenes', 'Day in the life', 'Trends participation', 'Humor', 'Stories']
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    description: 'Motivate and connect emotionally',
    percentage: 20,
    examples: ['Success stories', 'Milestones', 'Transformations', 'Quotes', 'Case studies']
  },
  {
    id: 'promotion',
    name: 'Promotion',
    description: 'Showcase products, services, offers',
    percentage: 15,
    examples: ['Product launches', 'Testimonials', 'Offers', 'CTAs', 'Announcements']
  }
];

// Optimal posting frequency by platform
export const POSTING_FREQUENCY = {
  instagram: { min: 3, optimal: 5, max: 7, unit: 'posts per week', notes: 'Plus daily Stories' },
  youtube: { min: 1, optimal: 2, max: 3, unit: 'videos per week', notes: 'Consistency > frequency' },
  tiktok: { min: 7, optimal: 14, max: 21, unit: 'posts per week', notes: '1-3 per day during growth' },
  linkedin: { min: 3, optimal: 5, max: 7, unit: 'posts per week', notes: 'Quality > quantity' }
};

// Helper function to get platform by ID
export function getPlatformById(id: string): PlatformIntelligence | undefined {
  return PLATFORM_INTELLIGENCE.find(p => p.id === id);
}

// Helper function to get optimal posting times for a platform
export function getOptimalPostingTimes(platformId: string, day?: string): PostingWindow[] {
  const platform = getPlatformById(platformId);
  if (!platform) return [];
  if (day) {
    return platform.optimalPostingTimes.filter(t => t.day.toLowerCase() === day.toLowerCase());
  }
  return platform.optimalPostingTimes;
}

// Helper function to get content recommendations based on goals
export function getContentRecommendations(platformId: string, goal: 'awareness' | 'engagement' | 'conversion' | 'authority'): ContentFormat[] {
  const platform = getPlatformById(platformId);
  if (!platform) return [];
  
  // Filter formats based on goal
  switch (goal) {
    case 'awareness':
      return platform.contentFormats.filter(f => f.algorithmBoost);
    case 'engagement':
      return platform.contentFormats;
    case 'conversion':
      return platform.contentFormats.filter(f => f.type.toLowerCase().includes('video') || f.type.toLowerCase().includes('carousel'));
    case 'authority':
      return platform.contentFormats.filter(f => f.optimalLength.includes('minute') || f.type.toLowerCase().includes('document'));
    default:
      return platform.contentFormats;
  }
}
