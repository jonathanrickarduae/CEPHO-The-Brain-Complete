/**
 * The Signal Daily Brief Presenter
 * 
 * A trusted, professional voice that delivers the daily brief.
 * Inspired by White House Press Secretary communication style.
 * The Chief of Staff feeds all information to the presenter,
 * but the presenter is the face and voice you interact with.
 */

export interface SignalPresenter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  style: {
    tone: string;
    language: string;
    delivery: string;
  };
  briefingFormat: {
    duration: string;
    sections: string[];
  };
  compositeOf: string[];
  bio: string;
}

export const SIGNAL_PRESENTER: SignalPresenter = {
  id: 'signal-presenter-001',
  name: 'Victoria Sterling',
  role: 'Daily Brief Presenter',
  avatar: 'VS',
  style: {
    tone: 'Professional, warm, direct',
    language: 'Clear, softer English, accessible',
    delivery: 'Confident, trustworthy, concise'
  },
  briefingFormat: {
    duration: '2-3 minutes',
    sections: [
      'Good morning greeting',
      'Your score today (1-10 from yesterday)',
      'Top 3 priorities for the day',
      'Key meetings and commitments',
      'Urgent items requiring attention',
      'Quick wins available',
      'Focus recommendation'
    ]
  },
  compositeOf: [
    'Karoline Leavitt (White House Press Secretary) - Direct, professional communication',
    'Jen Psaki - Calm, measured delivery',
    'Dana Perino - Warm, approachable style'
  ],
  bio: `Victoria is your trusted daily brief presenter. She delivers information with the clarity 
and professionalism of a White House Press Secretary, but with a warmer, more personal touch. 
She distills complex information from your Chief of Staff into a clear 2-3 minute overview 
that sets you up for success each day. Her style is direct but never cold - she speaks to you 
like a trusted advisor who genuinely wants you operating at your best.`
};

/**
 * Daily Brief Script Template
 * Used to generate the presenter's script each morning
 */
export interface DailyBriefScript {
  greeting: string;
  scoreUpdate: {
    yesterdayScore: number;
    trend: 'up' | 'down' | 'stable';
    insight: string;
  };
  priorities: {
    title: string;
    why: string;
    timeNeeded: string;
  }[];
  meetings: {
    time: string;
    title: string;
    prep: string;
  }[];
  urgentItems: {
    item: string;
    deadline: string;
    action: string;
  }[];
  quickWins: string[];
  focusRecommendation: string;
  closing: string;
}

/**
 * Generate a sample daily brief script
 */
export function generateSampleBriefScript(): DailyBriefScript {
  return {
    greeting: "Good morning. Here's your brief for today.",
    scoreUpdate: {
      yesterdayScore: 7,
      trend: 'up',
      insight: "You're trending upward this week. Yesterday's focus on deep work paid off."
    },
    priorities: [
      {
        title: "Celadon board preparation",
        why: "Board meeting in 3 days - materials need final review",
        timeNeeded: "90 minutes"
      },
      {
        title: "Sample Project partnership response",
        why: "They're expecting your decision by end of day",
        timeNeeded: "30 minutes"
      },
      {
        title: "Weekly team sync",
        why: "Several blockers need your input",
        timeNeeded: "45 minutes"
      }
    ],
    meetings: [
      {
        time: "10:00 AM",
        title: "Strategy review with Marcus",
        prep: "Review the Q1 projections he sent yesterday"
      },
      {
        time: "2:00 PM",
        title: "Investor call - Series B update",
        prep: "Key metrics dashboard is ready in your library"
      }
    ],
    urgentItems: [
      {
        item: "Contract signature for Perfect DXB",
        deadline: "Today 5pm",
        action: "Legal has approved - just needs your sign-off"
      }
    ],
    quickWins: [
      "Approve the 3 pending expense reports (2 mins)",
      "Send thank you note to yesterday's guest speaker",
      "Review and merge the website updates"
    ],
    focusRecommendation: "Block your morning for the Celadon prep. Your afternoon is meeting-heavy, so front-load the deep work.",
    closing: "That's your brief. Chief of Staff is ready when you are. Have a productive day."
  };
}

/**
 * Script the daily brief for text-to-speech or video generation
 */
export function scriptDailyBrief(brief: DailyBriefScript): string {
  const lines: string[] = [];
  
  // Greeting
  lines.push(brief.greeting);
  lines.push('');
  
  // Score update
  const trendWord = brief.scoreUpdate.trend === 'up' ? 'up' : brief.scoreUpdate.trend === 'down' ? 'down' : 'holding steady';
  lines.push(`Yesterday you logged a ${brief.scoreUpdate.yesterdayScore}. You're trending ${trendWord}. ${brief.scoreUpdate.insight}`);
  lines.push('');
  
  // Priorities
  lines.push("Your top priorities today:");
  brief.priorities.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.title}. ${p.why}. Allocate ${p.timeNeeded}.`);
  });
  lines.push('');
  
  // Meetings
  if (brief.meetings.length > 0) {
    lines.push("Key meetings:");
    brief.meetings.forEach(m => {
      lines.push(`At ${m.time}, ${m.title}. ${m.prep}`);
    });
    lines.push('');
  }
  
  // Urgent items
  if (brief.urgentItems.length > 0) {
    lines.push("Urgent items:");
    brief.urgentItems.forEach(u => {
      lines.push(`${u.item}. Deadline: ${u.deadline}. ${u.action}`);
    });
    lines.push('');
  }
  
  // Quick wins
  if (brief.quickWins.length > 0) {
    lines.push("Quick wins available:");
    brief.quickWins.forEach(w => {
      lines.push(`• ${w}`);
    });
    lines.push('');
  }
  
  // Focus recommendation
  lines.push(`My recommendation: ${brief.focusRecommendation}`);
  lines.push('');
  
  // Closing
  lines.push(brief.closing);
  
  return lines.join('\n');
}
