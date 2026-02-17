# CEPHO.AI - API Documentation

**Version**: 2.0  
**Last Updated**: February 17, 2026  
**Protocol**: tRPC (Type-Safe RPC)

---

## Overview

CEPHO.AI uses tRPC for end-to-end type-safe API communication. All API endpoints are automatically typed, eliminating the need for manual type definitions or API documentation generation.

---

## Authentication

### OAuth Flow

**Endpoint**: `GET /auth/google`  
**Description**: Initiates Google OAuth flow  
**Response**: Redirects to Google OAuth consent screen

**Endpoint**: `GET /auth/google/callback`  
**Description**: OAuth callback endpoint  
**Response**: Sets session cookie and redirects to dashboard

**Endpoint**: `POST /auth/logout`  
**Description**: Logs out current user  
**Response**: Clears session cookie

---

## Core API Routers

### Authentication Router (`auth`)

#### `auth.me`
**Type**: Query  
**Auth**: Required  
**Description**: Get current user information

**Response**:
```typescript
{
  id: number;
  email: string;
  name: string;
  googleId: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}
```

---

### Mood Router (`mood`)

#### `mood.create`
**Type**: Mutation  
**Auth**: Required  
**Description**: Create a new mood entry

**Input**:
```typescript
{
  score: number;        // 0-100
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  note?: string;
}
```

**Response**: Created mood entry

#### `mood.history`
**Type**: Query  
**Auth**: Required  
**Description**: Get mood history

**Input**:
```typescript
{
  limit?: number;
  days?: number;
}
```

**Response**: Array of mood entries

#### `mood.trends`
**Type**: Query  
**Auth**: Required  
**Description**: Get mood trends and analytics

**Input**:
```typescript
{
  days?: number;  // Default: 30
}
```

**Response**: Mood analytics data

---

### Projects Router (`projects`)

#### `projects.list`
**Type**: Query  
**Auth**: Required  
**Description**: List all projects for current user

**Input**:
```typescript
{
  status?: 'active' | 'completed' | 'archived';
  limit?: number;
}
```

**Response**: Array of projects

#### `projects.create`
**Type**: Mutation  
**Auth**: Required  
**Description**: Create a new project

**Input**:
```typescript
{
  name: string;
  description?: string;
  status?: string;
  metadata?: any;
}
```

**Response**: Created project

#### `projects.update`
**Type**: Mutation  
**Auth**: Required  
**Description**: Update a project

**Input**:
```typescript
{
  id: number;
  name?: string;
  description?: string;
  status?: string;
  metadata?: any;
}
```

**Response**: Updated project

---

### Expert Evolution Router (`expertEvolution`)

#### `expertEvolution.storeConversation`
**Type**: Mutation  
**Auth**: Required  
**Description**: Store a conversation with an AI expert

**Input**:
```typescript
{
  expertId: string;
  role: 'user' | 'expert' | 'system';
  content: string;
  projectId?: number;
  taskId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  qualityScore?: number;  // 1-10
  metadata?: any;
}
```

**Response**: Created conversation record

#### `expertEvolution.getConversations`
**Type**: Query  
**Auth**: Required  
**Description**: Get conversation history with an expert

**Input**:
```typescript
{
  expertId: string;
  projectId?: number;
  limit?: number;
}
```

**Response**: Array of conversations

#### `expertEvolution.storeMemory`
**Type**: Mutation  
**Auth**: Required  
**Description**: Store a memory/learning about the user

**Input**:
```typescript
{
  expertId: string;
  memoryType: 'preference' | 'fact' | 'style' | 'context' | 'correction';
  key: string;
  value: string;
  confidence?: number;  // 0-1
  source?: string;
}
```

**Response**: Created memory record

#### `expertEvolution.createInsight`
**Type**: Mutation  
**Auth**: Required  
**Description**: Create an insight from an expert

**Input**:
```typescript
{
  expertId: string;
  category: string;
  title: string;
  insight: string;
  evidence?: string;
  confidence?: number;  // 0-1
  tags?: string[];
  projectId?: number;
  relatedExpertIds?: string[];
}
```

**Response**: Created insight

---

### Genesis Router (`genesis`)

#### `genesis.listProjects`
**Type**: Query  
**Auth**: Required  
**Description**: List Project Genesis entries

**Input**:
```typescript
{
  status?: string;
  limit?: number;
}
```

**Response**: Array of genesis projects

#### `genesis.create`
**Type**: Mutation  
**Auth**: Required  
**Description**: Create a new Project Genesis entry

**Input**:
```typescript
{
  projectName: string;
  description?: string;
  targetMarket?: string;
  competitors?: string[];
  uniqueValue?: string;
  // ... additional fields
}
```

**Response**: Created genesis project

---

### Chat Router (`chat`)

#### `chat.send`
**Type**: Mutation  
**Auth**: Required  
**Description**: Send a message to AI expert

**Input**:
```typescript
{
  expertId: string;
  message: string;
  projectId?: number;
  context?: any;
}
```

**Response**: AI expert response

#### `chat.history`
**Type**: Query  
**Auth**: Required  
**Description**: Get chat history

**Input**:
```typescript
{
  expertId: string;
  limit?: number;
}
```

**Response**: Array of chat messages

---

### Documents Router (`documentLibrary`)

#### `documentLibrary.list`
**Type**: Query  
**Auth**: Required  
**Description**: List documents

**Input**:
```typescript
{
  category?: string;
  tags?: string[];
  limit?: number;
}
```

**Response**: Array of documents

#### `documentLibrary.upload`
**Type**: Mutation  
**Auth**: Required  
**Description**: Upload a new document

**Input**:
```typescript
{
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: any;
}
```

**Response**: Created document

---

### Integrations Router (`integrations`)

#### `integrations.list`
**Type**: Query  
**Auth**: Required  
**Description**: List all integrations

**Response**: Array of available integrations

#### `integrations.connect`
**Type**: Mutation  
**Auth**: Required  
**Description**: Connect an integration

**Input**:
```typescript
{
  provider: 'gmail' | 'asana' | 'notion' | 'slack';
  credentials: {
    apiKey?: string;
    accessToken?: string;
    // ... provider-specific fields
  };
}
```

**Response**: Integration status

#### `integrations.disconnect`
**Type**: Mutation  
**Auth**: Required  
**Description**: Disconnect an integration

**Input**:
```typescript
{
  provider: string;
}
```

**Response**: Success confirmation

---

### Settings Router (`settings`)

#### `settings.get`
**Type**: Query  
**Auth**: Required  
**Description**: Get user settings

**Response**: User settings object

#### `settings.update`
**Type**: Mutation  
**Auth**: Required  
**Description**: Update user settings

**Input**:
```typescript
{
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailDigest?: 'daily' | 'weekly' | 'never';
  // ... other settings
}
```

**Response**: Updated settings

---

## Error Handling

All API errors follow a consistent format:

```typescript
{
  code: string;           // Error code (e.g., 'UNAUTHORIZED', 'NOT_FOUND')
  message: string;        // Human-readable error message
  details?: any;          // Additional error details
}
```

### Common Error Codes

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. Future versions will include:

- 100 requests per minute per user
- 1000 requests per hour per user
- Burst allowance for short spikes

---

## Webhooks

### Supported Events

- `project.created`
- `project.updated`
- `document.uploaded`
- `expert.insight.created`
- `integration.connected`

### Webhook Payload

```typescript
{
  event: string;
  timestamp: Date;
  userId: number;
  data: any;
}
```

---

## Client Usage

### TypeScript Client

```typescript
import { trpc } from './lib/trpc';

// Query example
const { data: user } = trpc.auth.me.useQuery();

// Mutation example
const createMood = trpc.mood.create.useMutation();
await createMood.mutateAsync({
  score: 75,
  timeOfDay: 'morning',
  note: 'Feeling productive!'
});

// With options
const { data: projects } = trpc.projects.list.useQuery(
  { status: 'active', limit: 10 },
  { refetchOnWindowFocus: false }
);
```

---

## Best Practices

### Input Validation

All inputs are validated using Zod schemas. Always provide complete type information:

```typescript
// Good
const result = await trpc.projects.create.mutate({
  name: "My Project",
  description: "Project description"
});

// Bad - Missing required fields will cause TypeScript error
const result = await trpc.projects.create.mutate({
  name: "My Project"
  // description is optional, but type-checked
});
```

### Error Handling

Always handle errors in mutations:

```typescript
try {
  await createProject.mutateAsync({ name: "New Project" });
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Handle auth error
  } else {
    // Handle other errors
  }
}
```

### Optimistic Updates

Use optimistic updates for better UX:

```typescript
const utils = trpc.useContext();

const createMood = trpc.mood.create.useMutation({
  onMutate: async (newMood) => {
    // Cancel outgoing refetches
    await utils.mood.history.cancel();
    
    // Snapshot previous value
    const previous = utils.mood.history.getData();
    
    // Optimistically update
    utils.mood.history.setData(undefined, (old) => [...old, newMood]);
    
    return { previous };
  },
  onError: (err, newMood, context) => {
    // Rollback on error
    utils.mood.history.setData(undefined, context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.mood.history.invalidate();
  },
});
```

---

## Support

For API support and questions:
- Documentation: https://docs.cepho.ai
- Support: https://help.manus.im
- GitHub Issues: https://github.com/jonathanrickarduae/CEPHO-The-Brain-Complete

---

**Document Version**: 2.0  
**Last Updated**: February 17, 2026  
**Maintained By**: CEPHO.AI Development Team
