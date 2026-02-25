# CEPHO.ai - The Brain

**Your AI Chief of Staff for Executive Decision Making**

CEPHO (from the Greek *κεφαλή* for "brain") is an AI-powered executive assistant designed to help business leaders operate at peak performance. The platform combines a Digital Twin that learns your decision-making patterns with a team of 273+ AI Subject Matter Experts to handle everything from daily briefings to complex strategic analysis.

🌐 **Production:** https://cepho.ai  
📦 **Status:** ✅ Fully Operational  
🚀 **Platform:** Render.com

---

## Core Philosophy

**The 0-100 System**: Every metric, score, and progress indicator in CEPHO operates on a 0-100 scale. This creates consistency across all features and makes it easy to understand your optimization level at a glance.

---

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

---

## Technical Architecture

### Frontend
- **React 19.0.0** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** with custom design system
- **tRPC** for type-safe API calls
- **Wouter** for routing
- **Lucide React** for icons
- **Shadcn/UI** component library

### Backend
- **Node.js 22.13.0** with Express
- **tRPC** API framework
- **TiDB Serverless** database (libSQL)
- **Drizzle ORM** for type-safe queries
- **Manus OAuth** authentication

### AI Integration
- LLM-powered expert consultations
- Voice transcription (Whisper API)
- Text-to-speech (ElevenLabs)
- Image generation capabilities

---

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

---

## API Routes

### Authentication
- `auth.login` - Email/password login via Manus OAuth
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

---

## Development

### Prerequisites
- Node.js 22+
- pnpm package manager
- TiDB Serverless database

### Getting Started

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm drizzle-kit push

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=libsql://[instance].turso.io
DATABASE_AUTH_TOKEN=[auth-token]

# OAuth
OAUTH_SERVER_URL=https://oauth.manus.im
OAUTH_CLIENT_ID=[client-id]
OAUTH_CLIENT_SECRET=[client-secret]

# Application
NODE_ENV=production
PORT=10000
```

---

## Testing

The project includes comprehensive test coverage:
- 36 test files
- 628+ test cases
- Unit tests for all major features
- Service integration tests

```bash
# Run all tests
pnpm test:unit

# Run specific test file
pnpm test:unit server/questionnaire.test.ts
```

---

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

---

## Deployment

### Production Environment

**Platform:** Render.com  
**URL:** https://cepho.ai  
**Repository:** https://github.com/jonathanrickarduae/CEPHO-The-Brain-Complete  
**Branch:** main

### Deployment Configuration

```yaml
Build Command:  npm run build
Start Command:  node dist/index.js
Node Version:   22.13.0
Auto Deploy:    Enabled (on push to main)
```

### Health Monitoring

Health check endpoint: https://cepho.ai/health

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-25T...",
  "env": "production",
  "port": "10000"
}
```

### Database

**Provider:** TiDB Serverless (libSQL)  
**Connection:** Secure TLS connection  
**ORM:** Drizzle with TypeScript types

---

## Progressive Web App (PWA)

CEPHO.ai is a fully functional PWA with:
- Installable on desktop and mobile
- Service worker for offline capability
- App manifest with proper icons
- Mobile-optimized navigation
- Responsive design for all screen sizes

---

## Navigation Structure

The application includes the following main sections:

1. **Home (Nexus Dashboard)** - `/nexus` - Central command center
2. **Signal (Daily Brief)** - `/the-signal` - Morning intelligence briefing
3. **Chief of Staff** - `/chief-of-staff` - AI executive assistant
4. **AI SMEs** - `/ai-experts` - Specialized AI agents
5. **Workflow** - `/workflow` - Process automation
6. **Project Genesis** - `/project-genesis` - New project initiation
7. **Library** - `/library` - Knowledge repository
8. **Vault** - `/vault` - Secure storage

---

## Documentation

Comprehensive documentation is available in the repository:

- **[COMPLETE_DEPLOYMENT_DOCUMENTATION.md](./COMPLETE_DEPLOYMENT_DOCUMENTATION.md)** - Full deployment guide
- **[DEPLOYMENT_SUCCESS_REPORT.md](./DEPLOYMENT_SUCCESS_REPORT.md)** - Deployment status report

Word format versions are also available:
- `COMPLETE_DEPLOYMENT_DOCUMENTATION.docx`
- `DEPLOYMENT_SUCCESS_REPORT.docx`

---

## Troubleshooting

### Common Issues

**Site not loading:**
1. Check health endpoint: `curl https://cepho.ai/health`
2. Review Render logs in dashboard
3. Verify environment variables are set

**Build failures:**
1. Check for TypeScript errors
2. Test build locally: `npm run build`
3. Review Render build logs

**Database connection errors:**
1. Verify DATABASE_URL and DATABASE_AUTH_TOKEN
2. Check TiDB Serverless instance status
3. Review connection limits

For detailed troubleshooting, see [COMPLETE_DEPLOYMENT_DOCUMENTATION.md](./COMPLETE_DEPLOYMENT_DOCUMENTATION.md).

---

## Recent Updates

### February 25, 2026
- ✅ Fixed missing icon imports in BrainLayout component
- ✅ Resolved React rendering issues
- ✅ Updated PWA manifest (removed missing screenshots/shortcuts)
- ✅ Added mobile-web-app-capable meta tag
- ✅ Deployed to production successfully

---

## License

MIT License

---

## Support

For support inquiries, please contact the development team through the Manus platform or create an issue in the GitHub repository.

**Repository:** https://github.com/jonathanrickarduae/CEPHO-The-Brain-Complete
