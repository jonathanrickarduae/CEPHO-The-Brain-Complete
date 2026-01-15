# ElevenLabs Voice Briefing Workflow

**Document ID:** INT-003  
**Version:** 1.0  
**Date:** January 15, 2026  
**Purpose:** Standard process for creating voice briefings using ElevenLabs within CEPHO

---

## Overview

ElevenLabs provides AI-powered voice synthesis for creating audio briefings and summaries. This document defines how ElevenLabs integrates with the CEPHO/Project Genesis workflow to deliver voice-based content.

---

## When to Use Voice Briefings

| Use Case | Trigger | Output |
|----------|---------|--------|
| Daily Brief | Morning update needed | 2-5 minute audio summary |
| Opportunity Summary | New opportunity assessed | 3-5 minute overview |
| Decision Brief | Before key meeting | 5-10 minute detailed brief |
| Progress Update | Milestone reached | 2-3 minute status update |

---

## Workflow Process

### Step 1: Prepare Script

Before generating voice, prepare a clear script:

1. Create script in `/home/ubuntu/the-brain/[PROJECT]_VOICE_SCRIPT.md`
2. Follow the standard structure:
   - Opening (context setting)
   - Key points (3-5 main items)
   - Implications (what it means)
   - Next steps (actions required)
   - Closing

3. Script guidelines:
   - Write for spoken delivery (conversational)
   - Use short sentences
   - Avoid jargon unless necessary
   - Include natural pauses (use "..." or paragraph breaks)
   - Target word count: 150 words per minute of audio

### Step 2: Access ElevenLabs

1. Navigate to [elevenlabs.io](https://elevenlabs.io)
2. Log in with CEPHO credentials
3. Select "Speech Synthesis" or "Text to Speech"

### Step 3: Configure Voice

Select appropriate voice for context:

| Context | Recommended Voice | Tone |
|---------|-------------------|------|
| Executive Brief | Professional male/female | Authoritative, clear |
| Daily Update | Neutral, friendly | Conversational |
| Training | Clear, measured | Instructional |
| Investor Summary | Confident, professional | Persuasive |

Settings:
- Stability: 50-70% (balance between consistency and expression)
- Clarity: 75-90% (clear articulation)
- Style: 0-30% (subtle expression)

### Step 4: Generate Audio

1. Paste prepared script
2. Preview generation
3. Adjust settings if needed
4. Generate final audio
5. Download as MP3

### Step 5: Store and Distribute

1. Save to:
   - `/home/ubuntu/the-brain/offline_package/audio/`
   - Name: `[DATE]_[TYPE]_[PROJECT].mp3`

2. Distribution options:
   - Direct file share
   - Embed in The Brain platform
   - Email attachment
   - Integration with notification system

---

## Integration with Project Genesis

```
PROJECT GENESIS WORKFLOW
         │
         ▼
┌─────────────────┐
│ Any Phase       │
│ Complete        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Summary         │
│ Generated       │
│ (Text)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Voice Script    │
│ Preparation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ELEVENLABS      │
│ Voice           │
│ Generation      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Audio Briefing  │
│ Delivered       │
└─────────────────┘
```

---

## Script Templates

### Daily Brief Template

```
Good morning. Here's your CEPHO brief for [DATE].

[PAUSE]

Today's priorities:
First, [PRIORITY 1].
Second, [PRIORITY 2].
Third, [PRIORITY 3].

[PAUSE]

Key updates:
[UPDATE 1 - one sentence]
[UPDATE 2 - one sentence]

[PAUSE]

Actions required:
[ACTION 1]
[ACTION 2]

That's your brief for today. Have a productive day.
```

### Opportunity Summary Template

```
This is a summary of [OPPORTUNITY NAME].

[PAUSE]

The opportunity:
[2-3 sentences describing the opportunity]

[PAUSE]

Key strengths:
[STRENGTH 1]
[STRENGTH 2]
[STRENGTH 3]

[PAUSE]

Key risks:
[RISK 1]
[RISK 2]

[PAUSE]

Current status:
[STATUS SUMMARY]

[PAUSE]

Recommended next steps:
[NEXT STEP 1]
[NEXT STEP 2]

End of summary.
```

---

## Quality Standards

### Audio Quality

| Criterion | Standard |
|-----------|----------|
| Clarity | All words clearly audible |
| Pacing | Natural, not rushed |
| Pronunciation | Technical terms correct |
| Length | Appropriate for content |
| Format | MP3, 128kbps minimum |

### Content Standards

| Criterion | Standard |
|-----------|----------|
| Accuracy | All facts verified |
| Completeness | Key points covered |
| Relevance | Focused on audience needs |
| Actionability | Clear next steps |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Pronunciation errors | Use phonetic spelling or SSML |
| Unnatural pacing | Add punctuation and pauses |
| Wrong tone | Adjust stability/style settings |
| Audio too long | Edit script for conciseness |
| Audio too short | Add context or detail |

---

## Future Integration

When The Brain platform is fully integrated:

1. **Automated generation** - Voice briefings generated automatically from text summaries
2. **Scheduled delivery** - Daily briefs sent at configured times
3. **On-demand access** - Generate voice summary of any document
4. **Multi-language** - Support for multiple languages

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 15, 2026 | Initial workflow document | Project Genesis |
