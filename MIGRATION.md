# MIGRATION.md

Documentation for migrating CEPHO.Ai (The Brain) to Cursor, OpenAI, or other AI development tools.

---

## 1. APP STRUCTURE

```
the-brain/
├── client/                 # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── pages/          # 51 page components (route targets)
│   │   ├── components/     # 215 reusable UI components
│   │   ├── data/           # Static data files (experts, blueprints)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React context providers
│   │   ├── lib/            # Utilities (trpc client, utils)
│   │   ├── _core/          # Template core (auth hooks)
│   │   ├── App.tsx         # Route definitions
│   │   ├── main.tsx        # Entry point + providers
│   │   └── index.css       # Global styles + Tailwind
│   └── public/             # Static assets
├── server/                 # Backend (Express + tRPC)
│   ├── _core/              # TEMPLATE CODE (do not modify)
│   │   ├── index.ts        # Server entry point
│   │   ├── context.ts      # tRPC context + auth
│   │   ├── trpc.ts         # tRPC setup
│   │   ├── oauth.ts        # OAuth flow
│   │   ├── llm.ts          # LLM integration helper
│   │   ├── textToSpeech.ts # ElevenLabs TTS helper
│   │   └── env.ts          # Environment variables
│   ├── services/           # Business logic services
│   ├── routers/            # Split routers (favorites, etc.)
│   ├── routers.ts          # Main tRPC router (all procedures)
│   ├── db.ts               # Database query helpers
│   └── storage.ts          # S3 storage helpers
├── drizzle/                # Database schema
│   ├── schema.ts           # Table definitions
│   └── relations.ts        # Table relationships
├── corporate/              # Business documents (not code)
├── shared/                 # Shared types and constants
└── todo.md                 # Development task tracking
```

---

## 2. WHERE APIs LIVE

### tRPC Procedures (Main API)

All API endpoints are defined in `server/routers.ts` as tRPC procedures.

**Access pattern:** `trpc.<router>.<procedure>`

**Key routers:**
- `auth` - Login/logout, user session
- `mood` - Mood tracking
- `conversation` - Chat history
- `project` - Project management
- `projectGenesis` - Business setup wizard
- `expert` - AI SME consultations
- `expertChat` - Expert chat sessions
- `voiceNotes` - Voice recordings
- `textToSpeech` - Victoria voice synthesis
- `businessPlanReview` - Document review workflow
- `library` - Document library
- `inbox` - Task inbox
- `notifications` - User notifications
- `settings` - User preferences
- `analytics` - Feature usage tracking

**Example procedure:**
```typescript
// server/routers.ts
textToSpeech: router({
  synthesize: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      // Implementation
    }),
}),
```

**Frontend usage:**
```typescript
// Any component
const mutation = trpc.textToSpeech.synthesize.useMutation();
await mutation.mutateAsync({ text: "Hello" });
```

### REST Endpoints

Only used for special cases:
- `/api/oauth/callback` - OAuth redirect handler
- `/api/stripe/webhook` - Stripe webhooks (if enabled)

---

## 3. WHERE DATA IS STORED

### Database (MySQL/TiDB)

Schema defined in `drizzle/schema.ts`. Key tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (from OAuth) |
| `moodHistory` | Mood tracking entries |
| `trainingConversations` | Chat logs with Digital Twin |
| `decisionPatterns` | User decision tracking |
| `userPreferences` | Learned preferences |
| `projects` | User projects |
| `projectGenesis` | Business setup records |
| `expertConversations` | SME consultation logs |
| `expertChatSessions` | Active chat sessions |
| `expertChatMessages` | Chat message history |
| `voiceNotes` | Voice recordings metadata |
| `libraryDocuments` | Document library |
| `inboxItems` | Task inbox |
| `notifications` | User notifications |
| `tasks` | Task management |
| `eveningReviewSessions` | Daily review logs |
| `signalItems` | Morning signal items |

**Query helpers:** All in `server/db.ts`

**Schema changes:**
```bash
# Edit drizzle/schema.ts, then:
pnpm db:push
```

### File Storage (S3)

Files stored via `server/storage.ts`:
```typescript
import { storagePut } from "./storage";
const { url } = await storagePut("path/file.mp3", buffer, "audio/mpeg");
```

Used for:
- Voice recordings
- Generated audio (Victoria TTS)
- Uploaded documents
- Generated images

---

## 4. HOW AUTH WORKS

### Flow

1. User clicks login → redirected to Manus OAuth portal
2. OAuth completes → callback to `/api/oauth/callback`
3. Server creates/updates user in `users` table
4. JWT session cookie set (`__session`)
5. All subsequent requests include cookie
6. tRPC context extracts user from cookie

### Key Files

- `server/_core/oauth.ts` - OAuth flow handling
- `server/_core/context.ts` - Request context + user extraction
- `server/_core/cookies.ts` - Cookie configuration
- `client/src/_core/hooks/useAuth.ts` - Frontend auth hook

### Protected vs Public Procedures

```typescript
// Anyone can call
publicProcedure.query(() => { ... })

// Requires logged-in user
protectedProcedure.query(({ ctx }) => {
  const user = ctx.user; // Guaranteed to exist
})
```

### Frontend Auth

```typescript
import { useAuth } from "@/_core/hooks/useAuth";

function Component() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
  }
}
```

---

## 5. CODE OWNERSHIP MAP

### TEMPLATE CODE (Do Not Modify)

These files came with the template and should not be changed:

```
server/_core/           # All files in this folder
client/src/_core/       # Auth hooks
client/src/lib/trpc.ts  # tRPC client setup
drizzle.config.ts       # Drizzle config
vitest.config.ts        # Test config
```

### AI-GENERATED CODE (Custom for CEPHO.Ai)

**Pages (51 total):** All in `client/src/pages/`
- Every page was AI-generated for this project

**Components (215 total):** All in `client/src/components/`
- Most are AI-generated
- Exceptions: `DashboardLayout.tsx`, `AIChatBox.tsx`, `Map.tsx` (template provided)

**Server code:**
- `server/routers.ts` - Heavily extended with custom procedures
- `server/db.ts` - All query helpers AI-generated
- `server/services/` - All services AI-generated
- `server/storage.ts` - Template provided, minor modifications

**Data files:**
- `client/src/data/aiExperts.ts` - AI SME definitions
- `client/src/data/genesisBlueprint.ts` - Project Genesis wizard

**Schema:**
- `drizzle/schema.ts` - Heavily extended beyond template

### CORPORATE DOCUMENTS (Not Code)

```
corporate/              # Business strategy documents
├── frameworks/         # Process frameworks
├── strategy/           # Strategic plans
├── persephone-ai/      # AI Advisory Board docs
└── operations/         # Operational docs
```

---

## 6. KEY PATTERNS FOR CURSOR/OPENAI

### Adding a New Page

1. Create `client/src/pages/NewPage.tsx`
2. Add import in `client/src/App.tsx`
3. Add route: `<Route path="/new-page"><WithLayout><NewPage /></WithLayout></Route>`

### Adding a New API Endpoint

1. Add procedure in `server/routers.ts`:
```typescript
newFeature: router({
  getData: protectedProcedure.query(async ({ ctx }) => {
    // Implementation
  }),
}),
```

2. Call from frontend:
```typescript
const { data } = trpc.newFeature.getData.useQuery();
```

### Adding a Database Table

1. Add table in `drizzle/schema.ts`
2. Run `pnpm db:push`
3. Add query helpers in `server/db.ts`

### Environment Variables

Defined in `server/_core/env.ts`. Access via:
```typescript
import { ENV } from "./_core/env";
const key = ENV.elevenLabsApiKey;
```

---

## 7. TESTING

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test server/victoria-voice.test.ts
```

Test files follow pattern: `*.test.ts`

---

## 8. DEPLOYMENT

The app is deployed via Manus platform:
1. Save checkpoint: `webdev_save_checkpoint`
2. Click Publish in Management UI

For external hosting, export the codebase and configure:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing
- OAuth credentials
- S3 credentials (for storage)
- ElevenLabs API key (for voice)

---

## 9. QUICK REFERENCE

| Task | Location |
|------|----------|
| Add page | `client/src/pages/` + `App.tsx` |
| Add component | `client/src/components/` |
| Add API | `server/routers.ts` |
| Add DB table | `drizzle/schema.ts` |
| Add DB query | `server/db.ts` |
| Add service | `server/services/` |
| Static data | `client/src/data/` |
| Styles | `client/src/index.css` |
| Tests | `server/*.test.ts` |

---

*Document created: 19 January 2026*
*For CEPHO.Ai migration to Cursor/OpenAI*
