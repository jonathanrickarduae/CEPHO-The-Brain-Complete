/**
 * PlatformIntelligence.ts
 * Data layer with algorithm insights for each social media platform
 */

export interface AlgorithmInsight {
  factor: string;
  weight: 'high' | 'medium' | 'low';
  description: string;
  tips: string[];
}

export interface PlatformData {
  name: string;
  icon: string;
  color: string;
  optimalPostTimes: { day: string; times: string[] }[];
  contentTypes: { type: string; priority: number; description: string }[];
  algorithmFactors: AlgorithmInsight[];
  bestPractices: string[];
  audienceInsights: string[];
}

export const platformIntelligence: Record<string, PlatformData> = {
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: '#E4405F',
    optimalPostTimes: [
      { day: 'Monday', times: ['11:00 AM', '2:00 PM'] },
      { day: 'Tuesday', times: ['10:00 AM', '4:00 PM'] },
      { day: 'Wednesday', times: ['11:00 AM', '2:00 PM'] },
      { day: 'Thursday', times: ['12:00 PM', '7:00 PM'] },
      { day: 'Friday', times: ['10:00 AM', '2:00 PM'] },
      { day: 'Saturday', times: ['9:00 AM', '11:00 AM'] },
      { day: 'Sunday', times: ['10:00 AM', '2:00 PM'] },
    ],
    contentTypes: [
      { type: 'Reels', priority: 1, description: 'Short form video content, highest reach potential' },
      { type: 'Carousels', priority: 2, description: 'Multiple images/slides, high engagement' },
      { type: 'Stories', priority: 3, description: 'Ephemeral content, great for engagement' },
      { type: 'Static Posts', priority: 4, description: 'Single image posts, lower reach but still valuable' },
    ],
    algorithmFactors: [
      { factor: 'Engagement Rate', weight: 'high', description: 'Likes, comments, shares, and saves within first hour', tips: ['Post when audience is most active', 'Use engaging captions with questions', 'Respond to comments quickly'] },
      { factor: 'Watch Time', weight: 'high', description: 'How long users watch your Reels', tips: ['Hook viewers in first 3 seconds', 'Keep Reels under 30 seconds for completion', 'Use trending audio'] },
      { factor: 'Saves & Shares', weight: 'high', description: 'Content saved or shared to stories/DMs', tips: ['Create educational or valuable content', 'Use carousel posts for tutorials', 'Include shareable quotes'] },
      { factor: 'Hashtag Relevance', weight: 'medium', description: 'Using relevant, not banned hashtags', tips: ['Use 3 to 5 highly relevant hashtags', 'Mix popular and niche hashtags', 'Avoid banned or overused hashtags'] },
      { factor: 'Posting Consistency', weight: 'medium', description: 'Regular posting schedule', tips: ['Post at least once daily', 'Maintain consistent posting times', 'Use scheduling tools'] },
    ],
    bestPractices: [
      'Use Reels for maximum reach, algorithm heavily favors video',
      'Post carousels for educational content, they get saved more',
      'Engage with your audience within the first 30 minutes of posting',
      'Use Stories daily to stay top of mind',
      'Collaborate with other creators for cross promotion',
    ],
    audienceInsights: [
      'Peak activity between 11 AM and 2 PM local time',
      'Younger demographic (18 to 34) most active',
      'Visual quality matters significantly',
      'Authenticity outperforms polished content',
    ],
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    optimalPostTimes: [
      { day: 'Monday', times: ['2:00 PM', '4:00 PM'] },
      { day: 'Tuesday', times: ['2:00 PM', '4:00 PM'] },
      { day: 'Wednesday', times: ['2:00 PM', '4:00 PM'] },
      { day: 'Thursday', times: ['12:00 PM', '3:00 PM'] },
      { day: 'Friday', times: ['12:00 PM', '3:00 PM'] },
      { day: 'Saturday', times: ['9:00 AM', '11:00 AM'] },
      { day: 'Sunday', times: ['9:00 AM', '11:00 AM'] },
    ],
    contentTypes: [
      { type: 'Shorts', priority: 1, description: 'Vertical short form videos, massive reach' },
      { type: 'Long Form', priority: 2, description: 'Traditional YouTube videos, best for monetization' },
      { type: 'Live Streams', priority: 3, description: 'Real time engagement, builds community' },
      { type: 'Community Posts', priority: 4, description: 'Text and image posts for engagement' },
    ],
    algorithmFactors: [
      { factor: 'Watch Time', weight: 'high', description: 'Total minutes watched on your videos', tips: ['Create compelling intros', 'Use pattern interrupts every 30 seconds', 'Deliver on your title promise'] },
      { factor: 'Click Through Rate', weight: 'high', description: 'Percentage of impressions that become views', tips: ['A/B test thumbnails', 'Use curiosity gaps in titles', 'Avoid clickbait that disappoints'] },
      { factor: 'Audience Retention', weight: 'high', description: 'How much of your video viewers watch', tips: ['Front load value', 'Use chapters for navigation', 'Cut ruthlessly, remove fluff'] },
      { factor: 'Session Time', weight: 'medium', description: 'How long viewers stay on YouTube after your video', tips: ['Create playlists', 'Use end screens effectively', 'Suggest related content'] },
      { factor: 'Engagement', weight: 'medium', description: 'Likes, comments, and subscriptions', tips: ['Ask questions in videos', 'Pin top comments', 'Create community posts'] },
    ],
    bestPractices: [
      'First 30 seconds are critical, hook viewers immediately',
      'Thumbnails should be readable on mobile',
      'Consistency in posting schedule builds subscriber loyalty',
      'Shorts can drive subscribers to long form content',
      'SEO matters: optimize titles, descriptions, and tags',
    ],
    audienceInsights: [
      'Viewers prefer videos 10 to 20 minutes for educational content',
      'Shorts audience skews younger',
      'Weekend mornings see high engagement',
      'Tutorials and how to content performs consistently',
    ],
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    optimalPostTimes: [
      { day: 'Monday', times: ['6:00 AM', '10:00 AM', '10:00 PM'] },
      { day: 'Tuesday', times: ['2:00 AM', '4:00 AM', '9:00 AM'] },
      { day: 'Wednesday', times: ['7:00 AM', '8:00 AM', '11:00 PM'] },
      { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '7:00 PM'] },
      { day: 'Friday', times: ['5:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Saturday', times: ['11:00 AM', '7:00 PM', '8:00 PM'] },
      { day: 'Sunday', times: ['7:00 AM', '8:00 AM', '4:00 PM'] },
    ],
    contentTypes: [
      { type: 'Trending Sounds', priority: 1, description: 'Videos using viral audio' },
      { type: 'Duets/Stitches', priority: 2, description: 'Collaborative content with other creators' },
      { type: 'Original Content', priority: 3, description: 'Unique creative videos' },
      { type: 'Educational', priority: 4, description: 'Quick tips and tutorials' },
    ],
    algorithmFactors: [
      { factor: 'Completion Rate', weight: 'high', description: 'Percentage of viewers who watch to the end', tips: ['Keep videos under 15 seconds initially', 'Use loops that encourage rewatches', 'Front load the hook'] },
      { factor: 'Rewatch Rate', weight: 'high', description: 'How often viewers replay your video', tips: ['Create satisfying loops', 'Include hidden details', 'Use text that requires pause'] },
      { factor: 'Shares', weight: 'high', description: 'Videos shared to other platforms or DMs', tips: ['Create relatable content', 'Use humor effectively', 'Make content people want to tag friends in'] },
      { factor: 'Trending Audio', weight: 'medium', description: 'Using sounds that are currently viral', tips: ['Check trending sounds daily', 'Put your spin on trends', 'Act fast on new trends'] },
      { factor: 'Comments', weight: 'medium', description: 'Number and quality of comments', tips: ['Ask controversial questions', 'Leave things slightly unfinished', 'Respond to comments with videos'] },
    ],
    bestPractices: [
      'Hook viewers in the first 1 second',
      'Use trending sounds but add unique value',
      'Post 3 to 5 times per day for growth',
      'Engage with comments to boost visibility',
      'Test different content styles to find your niche',
    ],
    audienceInsights: [
      'Gen Z dominant but growing older demographics',
      'Entertainment and education perform equally well',
      'Authenticity beats production quality',
      'Niche content can go viral unexpectedly',
    ],
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    optimalPostTimes: [
      { day: 'Monday', times: ['8:00 AM', '10:00 AM'] },
      { day: 'Tuesday', times: ['8:00 AM', '10:00 AM', '12:00 PM'] },
      { day: 'Wednesday', times: ['8:00 AM', '10:00 AM', '12:00 PM'] },
      { day: 'Thursday', times: ['8:00 AM', '10:00 AM', '1:00 PM'] },
      { day: 'Friday', times: ['8:00 AM', '10:00 AM'] },
      { day: 'Saturday', times: ['10:00 AM'] },
      { day: 'Sunday', times: ['10:00 AM'] },
    ],
    contentTypes: [
      { type: 'Text Posts', priority: 1, description: 'Native text posts with line breaks' },
      { type: 'Document Posts', priority: 2, description: 'PDF carousels and slideshows' },
      { type: 'Video', priority: 3, description: 'Native video content' },
      { type: 'Articles', priority: 4, description: 'Long form written content' },
    ],
    algorithmFactors: [
      { factor: 'Dwell Time', weight: 'high', description: 'How long users spend reading your post', tips: ['Use line breaks for readability', 'Tell stories that hook readers', 'Use the see more effectively'] },
      { factor: 'Comment Quality', weight: 'high', description: 'Meaningful comments, not just emojis', tips: ['Ask thought provoking questions', 'Share controversial opinions', 'Respond to every comment'] },
      { factor: 'Native Content', weight: 'high', description: 'Content created directly on LinkedIn', tips: ['Avoid external links in posts', 'Use LinkedIn native video', 'Create document posts instead of linking'] },
      { factor: 'Early Engagement', weight: 'medium', description: 'Engagement in first 90 minutes', tips: ['Post when network is active', 'Engage with others before posting', 'Notify key connections'] },
      { factor: 'Profile Strength', weight: 'medium', description: 'Complete and optimized profile', tips: ['Use keywords in headline', 'Get recommendations', 'Post consistently'] },
    ],
    bestPractices: [
      'First line is your hook, make it count',
      'Use white space and line breaks liberally',
      'Personal stories outperform corporate content',
      'Engage with others posts before and after posting',
      'Document posts (carousels) get high engagement',
    ],
    audienceInsights: [
      'B2B decision makers are highly active',
      'Tuesday through Thursday are peak days',
      'Morning posts perform best (before work starts)',
      'Thought leadership content builds authority',
    ],
  },
};

export function getOptimalPostTime(platform: string, day: string): string[] {
  const data = platformIntelligence[platform.toLowerCase()];
  if (!data) return [];
  const dayData = data.optimalPostTimes.find(d => d.day.toLowerCase() === day.toLowerCase());
  return dayData?.times || [];
}

export function getTopAlgorithmFactors(platform: string, count: number = 3): AlgorithmInsight[] {
  const data = platformIntelligence[platform.toLowerCase()];
  if (!data) return [];
  return data.algorithmFactors
    .filter(f => f.weight === 'high')
    .slice(0, count);
}

export function getAllPlatforms(): string[] {
  return Object.keys(platformIntelligence);
}

export function getPlatformData(platform: string): PlatformData | undefined {
  return platformIntelligence[platform.toLowerCase()];
}
