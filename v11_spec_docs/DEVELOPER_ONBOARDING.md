# Developer Onboarding Process

**CEPHO.AI Platform**

*Version: 1.0*
*Status: Draft*
*Last Updated: 2026-03-01*

---

## 1. Welcome to the Team!

This guide will walk you through getting your development environment set up and making your first contribution.

---

## 2. Day 1: Setup

### Step 1: Access

- [ ] Accept your invitation to the `cepho-ai` GitHub organization.
- [ ] Accept your invitation to our Slack workspace.
- [ ] Accept your invitation to our Jira project.
- [ ] Request access to the Render dashboard from your manager.
- [ ] Request access to the Supabase dashboard from your manager.
- [ ] Request access to the OpenAI dashboard from your manager.

### Step 2: Local Environment Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:cepho-ai/the-brain.git
   ```
2. **Install Node.js:** We use Node.js v22. Use `nvm` to manage versions:
   ```bash
   nvm install 22
   nvm use 22
   ```
3. **Install pnpm:**
   ```bash
   npm install -g pnpm
   ```
4. **Install dependencies:**
   ```bash
   pnpm install
   ```
5. **Set up environment variables:**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Ask your manager for the development values for the secrets in the `.env` file (e.g., `DATABASE_URL`, `SUPABASE_JWT_SECRET`).

### Step 3: Run the Application

1. **Start the development server:**
   ```bash
   pnpm dev
   ```
2. This will start the Vite frontend and the NestJS backend concurrently.
3. Open your browser to `http://localhost:5173`.

### Step 4: Run the Database Seed Script

To populate your local database with mock data:

```bash
npx tsx scripts/seed.ts
```

You should now be able to log in with the credentials provided by the seed script.

---

## 3. Your First Week

### Reading List

- [ ] Read the `GRAND_MASTER_PLAN.md` to understand the project roadmap.
- [ ] Read the `docs/PRD.md` to understand what the product does.
- [ ] Read the `docs/processes/RELEASE_PROCESS.md` to understand how we ship code.

### Your First Ticket

1. Your manager will assign you a "good first issue" from the Jira backlog.
2. Create a feature branch from `develop`.
3. Make the code changes.
4. Run the tests and validation script.
5. Open a Pull Request.
6. Welcome aboard!
