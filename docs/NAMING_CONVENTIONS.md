# Naming Conventions Guide

**Priority 2 - CODE-03: Standardize Naming Conventions**

This document defines the naming conventions for the CEPHO.AI codebase to ensure consistency, readability, and maintainability.

---

## General Principles

1. **Be Descriptive:** Names should clearly indicate purpose
2. **Be Consistent:** Follow the same patterns throughout
3. **Be Concise:** Avoid unnecessary verbosity
4. **Avoid Abbreviations:** Unless widely understood (e.g., API, URL, ID)
5. **Use English:** All names in English

---

## Files and Directories

### Files

**React Components:**
- PascalCase with `.tsx` extension
- Example: `BusinessPlanReview.tsx`, `ExpertChatMessage.tsx`

**Utilities:**
- camelCase with `.ts` extension
- Example: `pagination.ts`, `documentHelpers.ts`

**Types/Interfaces:**
- camelCase with `.types.ts` or `.d.ts` extension
- Example: `user.types.ts`, `api.types.ts`

**Tests:**
- Same name as file being tested with `.test.ts` or `.spec.ts`
- Example: `pagination.test.ts`, `Button.test.tsx`

**Styles:**
- kebab-case with `.css` extension
- Example: `mobile-responsive.css`, `button-styles.css`

### Directories

**All directories:** kebab-case
```
client/src/
├── components/
│   ├── business-plan/
│   ├── ai-agents/
│   └── shared/
├── hooks/
├── utils/
└── pages/
```

---

## TypeScript/JavaScript

### Variables

**Constants:** SCREAMING_SNAKE_CASE
```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;
```

**Regular variables:** camelCase
```typescript
const userName = 'John';
const isAuthenticated = true;
const totalCount = 100;
```

**Boolean variables:** Prefix with `is`, `has`, `should`, `can`
```typescript
const isLoading = false;
const hasError = true;
const shouldRetry = false;
const canEdit = true;
```

### Functions

**Regular functions:** camelCase, verb-first
```typescript
function fetchUserData() { }
function calculateTotal() { }
function validateEmail() { }
function formatDate() { }
```

**Event handlers:** Prefix with `handle` or `on`
```typescript
function handleClick() { }
function handleSubmit() { }
function onUserLogin() { }
function onDataLoad() { }
```

**Async functions:** Can prefix with `fetch`, `load`, `save`
```typescript
async function fetchProjects() { }
async function loadUserProfile() { }
async function saveDocument() { }
```

### React Components

**Components:** PascalCase
```typescript
function BusinessPlanReview() { }
function ExpertChatMessage() { }
function UserProfileCard() { }
```

**Component props:** camelCase interface with `Props` suffix
```typescript
interface BusinessPlanReviewProps {
  planId: string;
  onSave: () => void;
  isEditable: boolean;
}
```

**Custom Hooks:** camelCase with `use` prefix
```typescript
function useAuth() { }
function useBusinessPlan() { }
function useExpertChat() { }
function useDocuments() { }
```

### Types and Interfaces

**Interfaces:** PascalCase, descriptive noun
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface BusinessPlan {
  id: string;
  title: string;
  status: string;
}
```

**Type Aliases:** PascalCase
```typescript
type UserId = string;
type Status = 'pending' | 'approved' | 'rejected';
type ApiResponse<T> = {
  data: T;
  error?: string;
};
```

**Enums:** PascalCase for enum, SCREAMING_SNAKE_CASE for values
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED'
}
```

### Classes

**Classes:** PascalCase
```typescript
class UserService {
  constructor() { }
  
  async getUser(id: string) { }
  async updateUser(id: string, data: any) { }
}

class CacheManager {
  private cache: Map<string, any>;
  
  get(key: string) { }
  set(key: string, value: any) { }
}
```

**Private members:** Prefix with underscore (optional)
```typescript
class ApiClient {
  private _apiKey: string;
  private _baseUrl: string;
  
  private _makeRequest() { }
}
```

---

## Backend (Server)

### Routes

**Route files:** kebab-case with `.router.ts` suffix
```
server/routers/
├── health.router.ts
├── document-library.router.ts
└── ai-agents-monitoring.router.ts
```

**Route handlers:** camelCase, action-first
```typescript
async function getDocuments(req, res) { }
async function createDocument(req, res) { }
async function updateDocument(req, res) { }
async function deleteDocument(req, res) { }
```

### Services

**Service files:** kebab-case with `.service.ts` suffix
```
server/services/
├── cache/
│   └── redis-cache.service.ts
├── monitoring/
│   ├── logger.service.ts
│   └── apm.service.ts
└── media/
    └── image-optimizer.service.ts
```

**Service classes:** PascalCase with `Service` suffix
```typescript
class RedisCache Service {
  async get(key: string) { }
  async set(key: string, value: any) { }
}

class LoggerService {
  info(message: string) { }
  error(message: string, error: Error) { }
}
```

### Middleware

**Middleware files:** kebab-case with `.ts` suffix
```
server/middleware/
├── rate-limiter.ts
├── csrf-protection.ts
└── api-versioning.ts
```

**Middleware functions:** camelCase
```typescript
export function rateLimiter() { }
export function csrfProtection() { }
export function apiVersioning() { }
```

### Database

**Table names:** snake_case (PostgreSQL convention)
```sql
users
business_plans
generated_documents
library_documents
```

**Column names:** snake_case (PostgreSQL convention)
```sql
user_id
created_at
updated_at
qa_approved_by
```

**Drizzle schema:** camelCase for TypeScript, snake_case for SQL
```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow()
});
```

---

## Frontend (Client)

### Pages

**Page components:** PascalCase with `Page` suffix (optional)
```typescript
function NexusDashboard() { }
function DocumentLibrary() { }
function AIAgentsPage() { }
```

### Components

**Component organization:**
```
components/
├── business-plan/
│   ├── BusinessPlanReview.tsx (main)
│   ├── sections/
│   │   ├── Header.tsx
│   │   ├── Sections.tsx
│   │   └── Actions.tsx
│   └── hooks/
│       └── useBusinessPlan.ts
```

**Sub-components:** PascalCase, specific names
```typescript
// Good
function BusinessPlanHeader() { }
function BusinessPlanSections() { }
function ExpertChatMessage() { }

// Bad
function Header() { }  // Too generic
function Sections() { }  // Too generic
function Message() { }  // Too generic
```

### Hooks

**Custom hooks:** camelCase with `use` prefix
```typescript
// Data fetching
function useUser(id: string) { }
function useDocuments(filters: any) { }
function useBusinessPlan(planId: string) { }

// UI state
function useModal() { }
function useToast() { }
function useTheme() { }

// Business logic
function useAuth() { }
function usePermissions() { }
function useValidation() { }
```

### Utilities

**Utility files:** camelCase with descriptive names
```
utils/
├── dateHelpers.ts
├── stringHelpers.ts
├── documentHelpers.ts
└── validationHelpers.ts
```

**Utility functions:** camelCase, verb-first
```typescript
// Date utilities
export function formatDate(date: Date): string { }
export function parseDate(str: string): Date { }
export function isValidDate(date: any): boolean { }

// String utilities
export function capitalize(str: string): string { }
export function truncate(str: string, length: number): string { }
export function slugify(str: string): string { }

// Document utilities
export function formatDocumentTitle(title: string): string { }
export function calculateDocumentStats(docs: Document[]): Stats { }
export function filterDocumentsByType(docs: Document[], type: string): Document[] { }
```

---

## CSS/Styling

### Class Names

**Utility classes:** kebab-case
```css
.mobile-responsive { }
.text-center { }
.flex-column { }
```

**Component classes:** kebab-case with component prefix
```css
.business-plan-header { }
.expert-chat-message { }
.document-card { }
```

**State classes:** Prefix with `is-` or `has-`
```css
.is-active { }
.is-loading { }
.has-error { }
```

### CSS Variables

**CSS custom properties:** kebab-case with `--` prefix
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 16px;
  --spacing-unit: 8px;
}
```

---

## API Endpoints

### REST API

**Endpoints:** kebab-case, resource-first
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/business-plans
POST   /api/v1/business-plans
GET    /api/v1/business-plans/:id

GET    /api/v1/document-library
POST   /api/v1/document-library
```

### tRPC Procedures

**Procedures:** camelCase, action-first
```typescript
export const userRouter = router({
  getUser: publicProcedure.query(),
  createUser: publicProcedure.mutation(),
  updateUser: publicProcedure.mutation(),
  deleteUser: publicProcedure.mutation(),
  
  listUsers: publicProcedure.query(),
  searchUsers: publicProcedure.query(),
});
```

---

## Environment Variables

**All environment variables:** SCREAMING_SNAKE_CASE
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SENTRY_DSN=https://...
LOG_LEVEL=info
API_KEY=...
JWT_SECRET=...
```

---

## Git

### Branch Names

**Branches:** kebab-case with type prefix
```
feature/api-versioning
feature/component-refactoring
fix/document-library-error
fix/mobile-responsive-layout
chore/update-dependencies
docs/naming-conventions
```

### Commit Messages

**Format:** `type: description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat: add API versioning middleware
fix: resolve document library database error
docs: create naming conventions guide
refactor: extract BusinessPlanReview sub-components
test: add pagination utility tests
chore: update dependencies
```

---

## Examples

### Good Examples

```typescript
// ✅ Component
interface UserProfileCardProps {
  userId: string;
  isEditable: boolean;
  onSave: (data: any) => void;
}

function UserProfileCard({ userId, isEditable, onSave }: UserProfileCardProps) {
  const { user, isLoading, error } = useUser(userId);
  
  const handleSubmit = async (data: any) => {
    await saveUserProfile(userId, data);
    onSave(data);
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div className="user-profile-card">...</div>;
}

// ✅ Hook
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchUser();
  }, [userId]);
  
  async function fetchUser() {
    setIsLoading(true);
    try {
      const data = await api.getUser(userId);
      setUser(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return { user, isLoading, error, refetch: fetchUser };
}

// ✅ Utility
export function formatDocumentDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function calculateDocumentStats(documents: Document[]): DocumentStats {
  return {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length
  };
}
```

### Bad Examples

```typescript
// ❌ Component (too generic, inconsistent naming)
function Card({ id, edit, save }) {  // Props not typed
  const data = useData(id);  // Unclear what data
  
  function submit(d) {  // Unclear parameter name
    saveData(id, d);  // Unclear function name
    save(d);
  }
  
  return <div className="card">...</div>;  // Generic class name
}

// ❌ Hook (inconsistent naming)
function getData(id) {  // Should be "useData"
  const [d, setD] = useState(null);  // Too short
  const [loading, setLoading] = useState(false);  // Should be "isLoading"
  
  // ...
}

// ❌ Utility (inconsistent naming)
export function FmtDate(d) {  // Should be camelCase, unclear param
  return d.toString();
}

export function calc_stats(docs) {  // Should be camelCase
  return {
    t: docs.length,  // Too short
    a: docs.filter(d => d.s === 'a').length  // Unclear
  };
}
```

---

## Migration Strategy

### Phase 1: New Code (Immediate)
- All new code follows these conventions
- Code reviews enforce conventions

### Phase 2: Refactoring (Ongoing)
- Rename files/functions during refactoring
- Update imports and references
- Test after each rename

### Phase 3: Bulk Rename (Optional)
- Use IDE refactoring tools
- Rename in batches by module
- Comprehensive testing after each batch

---

## Tools

### ESLint Rules
```json
{
  "rules": {
    "camelcase": ["error", { "properties": "never" }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Checklist

When creating new code:

- [ ] File name follows conventions
- [ ] Variables use camelCase
- [ ] Constants use SCREAMING_SNAKE_CASE
- [ ] Functions use camelCase, verb-first
- [ ] Components use PascalCase
- [ ] Hooks use camelCase with `use` prefix
- [ ] Types/Interfaces use PascalCase
- [ ] Boolean variables have `is/has/should/can` prefix
- [ ] Event handlers have `handle/on` prefix
- [ ] CSS classes use kebab-case
- [ ] API endpoints use kebab-case
- [ ] Environment variables use SCREAMING_SNAKE_CASE

---

**Last Updated:** 2026-02-25  
**Status:** Active  
**Enforcement:** Code reviews + ESLint
