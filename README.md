# CEPHO.ai - The Brain

**Your AI Chief of Staff for Executive Decision Making**

CEPHO (from the Greek *κεφαλή* for "brain") is an AI-powered executive assistant designed to help business leaders operate at peak performance. The platform combines a Digital Twin that learns your decision-making patterns with a team of 273+ AI Subject Matter Experts to handle everything from daily briefings to complex strategic analysis.

## Core Philosophy

**The 0-100 System**: Every metric, score, and progress indicator in CEPHO operates on a 0-100 scale. This creates consistency across all features and makes it easy to understand your optimization level at a glance.

## Key Features

### The Signal (Daily Brief)
Your personalized morning briefing that prepares you for the day ahead:
- Executive Summary with key priorities
- Today's Schedule integration
- Intelligence Feed (market, competitors, industry)
- Action Engine with Got it/Defer/Delegate/Digital Twin options
- Available as PDF, video, or audio podcast

### AI Subject Matter Experts
Access to 273+ specialized AI experts across domains:
- Strategy & Business Development
- Finance & Investment
- Legal & Compliance
- Marketing & Communications
- Technology & Innovation
- Operations & Supply Chain
- Human Resources
- And many more...

### Chief of Staff (Digital Twin)
Your AI learns your preferences through:
- 200-question comprehensive questionnaire
- Daily interaction patterns
- Decision history analysis
- Communication style learning

### Workflow Management
Track all active projects with:
- Real-time progress updates
- QA review phases
- Task delegation to AI teams
- Deliverable tracking

### Evening Review
End-of-day reflection system:
- Task completion review
- Tomorrow's priorities
- Pattern analysis
- Continuous improvement

## Technical Architecture

### Frontend
- React 19 with TypeScript
- Tailwind CSS 4 with custom design system
- tRPC for type-safe API calls
- Shadcn/ui component library

### Backend
- Express 4 with tRPC
- PostgreSQL database (Supabase)
- Drizzle ORM for type-safe queries
- **Simple Email/Password Authentication** (OAuth temporarily disabled)

### AI Integration
- LLM-powered expert consultations
- Voice transcription (Whisper API)
- Text-to-speech (ElevenLabs)
- Image generation capabilities

## Database Schema

The application uses a comprehensive schema including:
- User management and authentication
- Mood tracking and history
- Training conversations
- Decision patterns
- Expert consultations
- Project management
- Digital Twin profile
- Questionnaire responses
- And 40+ additional tables

## API Routes

### Authentication
- `auth.login` - Simple email/password login
- `auth.me` - Get current user
- `auth.logout` - End session

### Mood Tracking
- `mood.create` - Log mood entry
- `mood.history` - Get mood history
- `mood.trends` - Analyze mood patterns

### Expert System
- `experts.chat` - Consult with AI expert
- `experts.list` - Get available experts
- `experts.recommend` - Get personalized recommendations

### Digital Twin
- `questionnaire.saveResponse` - Save questionnaire answer
- `questionnaire.getCompletion` - Get completion percentage
- `questionnaire.getProfile` - Get calculated profile
- `questionnaire.calculateProfile` - Recalculate from responses

### Workflow
- `tasks.create` - Create new task
- `tasks.list` - Get all tasks
- `tasks.update` - Update task status

## Development

### Prerequisites
- Node.js 22+
- pnpm package manager
- PostgreSQL database (Supabase)

### Getting Started

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Environment Variables
The following environment variables are automatically configured:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `ELEVENLABS_API_KEY` - Voice synthesis
- `STRIPE_SECRET_KEY` - Payment processing

## Testing

The project includes comprehensive test coverage:
- 36 test files
- 628+ test cases
- Unit tests for all major features
- Service integration tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/questionnaire.test.ts
```

## Design System

### Colors
- Primary: Magenta (#FF10F0)
- Background: Deep black with subtle gradients
- Accent: Cyan, Purple, Amber for different contexts

### Typography
- Display: Orbitron (futuristic headings)
- Body: Inter (readable content)

### Components
- Neon Brain animation for loading states
- Glassmorphic cards with subtle borders
- Gradient progress indicators
- Voice input with visual feedback

## Deployment

The application is deployed on Render with:
- Automatic SSL certificates
- Custom domain support (cepho.ai)
- Continuous deployment from GitHub
- PostgreSQL database (Supabase)
- Environment variable management

### Deployment Configuration

**Platform:** Render  
**Repository:** GitHub - jonathanrickarduae/CEPHO-The-Brain-Complete  
**Branch:** main  
**Build Command:** `pnpm install && pnpm build`  
**Start Command:** `pnpm start`  

**Database:** Supabase PostgreSQL  
**Connection:** Direct connection (port 5432) for server, pgBouncer (port 6543) for pooling

## License

Proprietary - CEPHO.ai

## Support

For support inquiries, please contact the development team through the Manus platform.
