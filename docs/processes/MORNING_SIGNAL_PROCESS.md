# Morning Signal Process

## Overview

The Morning Signal is the daily briefing delivered by the Chief of Staff to start each day. It synthesizes overnight activity, priorities, and intelligence into actionable insights.

## Delivery Formats

### 1. Voice Note (Audio)
- Generated via ElevenLabs TTS API
- Duration: 2-3 minutes
- Voice: Rachel (default) or user-selected
- Stored in S3: `signals/voice/morning-signal-{timestamp}.mp3`

### 2. Video Presentation
- AI Avatar presentation (HeyGen/Synthesia integration pending)
- Duration: 3-5 minutes
- Includes visual data overlays
- Status: Placeholder implemented, awaiting video service configuration

### 3. PDF Document
- Follows CEPHO Brand Guidelines
- Black text (#000000), Pink accents (#E91E8C)
- 2-page A4 format
- Stored in S3: `signals/pdf/morning-signal-{timestamp}.pdf`

## Content Structure

### Section 1: Greeting
- Time-appropriate greeting (Good Morning/Afternoon/Evening)
- Wellness score reference
- Date and day context

### Section 2: Top Priorities
- Maximum 3 priorities
- Each includes: Title, Description, Urgency level, Category
- Sourced from: Evening Review accepted items, Calendar deadlines, System alerts

### Section 3: Calendar Overview
- Today's meetings and events
- Time, duration, attendees
- Preparation notes if available

### Section 4: Overnight Activity
- What the Digital Twin completed overnight
- Items ready for review
- Blocked items requiring attention

### Section 5: Intelligence Feed
- Market updates (if configured)
- Competitor activity
- Industry news relevant to active projects

### Section 6: Insights
- AI-generated insights based on patterns
- Recommendations for the day
- Wellness suggestions

### Section 7: Closing
- Motivational close
- Quick action summary

## Generation Trigger

- **Automatic**: 6:00 AM local time (configurable)
- **Manual**: User-initiated via Morning Signal page
- **On-demand**: Voice command "Generate my morning signal"

## Quality Gate

All Morning Signals pass through Chief of Staff QA:
1. Content accuracy check
2. Tone and style validation
3. Priority alignment verification
4. Data freshness confirmation

## Data Sources

| Source | Data Type |
|--------|-----------|
| Evening Review | Accepted/deferred tasks |
| Calendar Integration | Today's schedule |
| Task System | Active priorities |
| Market APIs | Financial updates |
| News APIs | Industry intelligence |
| Mood History | Wellness context |

## Technical Implementation

```
server/dailySignalGenerator.ts - Main generation service
server/services/voiceService.ts - ElevenLabs integration
client/src/pages/MorningSignal.tsx - UI component
```

## Future Enhancements

- [ ] Video avatar integration (HeyGen/Synthesia)
- [ ] Personalized voice cloning
- [ ] Multi-language support
- [ ] Calendar-aware timing adjustments
- [ ] Integration with wearable wellness data

---

*CEPHO.Ai | Where Intelligence Begins*
