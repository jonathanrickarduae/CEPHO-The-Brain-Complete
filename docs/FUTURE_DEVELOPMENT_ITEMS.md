# Future Development Items
**Date:** February 22, 2026

---

## Not Implemented Yet

### 1. Persephone Board ⭐ HIGH PRIORITY
**Status:** Planned but not built  
**Estimated Time:** 8 hours  
**Description:** Virtual NED/Steering Committee of 14 AI leaders providing strategic oversight

**Requirements:**
- Create `/persephone` page
- Design 14 AI board members with personas
- Implement board meeting interface
- Add strategic oversight features
- Enable voting/consensus mechanisms

**Dependencies:**
- AI agent infrastructure
- Meeting scheduling system
- Decision tracking

---

### 2. AI Agents Data Loading ⭐ HIGH PRIORITY
**Status:** Page exists but stuck loading  
**Estimated Time:** 2 hours  
**Description:** Connect AI Agents page to backend

**Requirements:**
- Connect `/agents` to backend API
- Implement data fetching
- Add error handling
- Add empty state
- Show agent status and metrics

**Dependencies:**
- AI Agents Monitoring backend (created)
- Agent data in database

---

### 3. OAuth Configuration ⭐ HIGH PRIORITY
**Status:** Partially implemented  
**Estimated Time:** 4 hours  
**Description:** Complete Gmail and Calendar OAuth integration

**Requirements:**
- Fix Google OAuth flow
- Add Gmail API integration
- Add Calendar API integration
- Test end-to-end
- Handle token refresh

**Dependencies:**
- Google Cloud Console setup
- OAuth credentials
- Redirect URLs configured

---

### 4. Email Accounts Page ⭐ MEDIUM PRIORITY
**Status:** 404 error  
**Estimated Time:** 2 hours  
**Description:** Create page for managing email accounts

**Requirements:**
- Create `/accounts` page
- Show connected email accounts
- Add/remove account functionality
- Test email sync
- Show sync status

**Dependencies:**
- Email integration backend (created)
- OAuth working

---

### 5. Populate Empty Pages ⭐ MEDIUM PRIORITY
**Status:** 9 pages empty  
**Estimated Time:** 8 hours total  
**Description:** Add real data or remove empty pages

**Pages:**
1. QA Dashboard
2. Agents Monitoring
3. AI Team
4. Business Model
5. Due Diligence
6. Growth
7. Revenue
8. Strategic Framework
9. Social Media Blueprint

**Options:**
- Populate with real data
- Remove from navigation
- Add "Coming Soon" with timeline
- Merge similar pages

---

### 6. API Key Configuration ⭐ HIGH PRIORITY
**Status:** Not configured  
**Estimated Time:** 1 hour  
**Description:** Add API keys for external services

**Services:**
- Synthesia (video generation)
- ElevenLabs (audio generation)
- OpenAI (AI features)
- Gmail API
- Calendar API

**Requirements:**
- Add to environment variables
- Test each integration
- Handle errors gracefully

---

### 7. Backend API Connections ⭐ CRITICAL
**Status:** 90% not connected  
**Estimated Time:** 8 hours  
**Description:** Connect all frontend pages to backend APIs

**Pages to connect:**
- Dashboard Insights
- AI Agents
- Command Centre (remove mock data)
- Email Integration
- Document Management
- QA Dashboard
- Agents Monitoring
- AI Team
- Business pages

**Requirements:**
- Use tRPC mutations
- Add loading states
- Add error handling
- Remove mock data

---

### 8. Authentication Fix ⭐ CRITICAL
**Status:** Broken  
**Estimated Time:** 4 hours  
**Description:** Fix OAuth login flow

**Issues:**
- Cookie not persisting
- Session not maintained
- Login loop occurs

**Requirements:**
- Debug cookie settings
- Fix session management
- Test end-to-end
- Handle edge cases

---

### 9. Remove Console Statements 🔧 CLEANUP
**Status:** 93 remaining  
**Estimated Time:** 2 hours  
**Description:** Remove debug console statements

**Requirements:**
- Find all console.log
- Remove or replace with proper logging
- Keep console.error for critical errors
- Add logging library (Winston/Pino)

---

### 10. Address TODO Comments 🔧 CLEANUP
**Status:** 28 remaining  
**Estimated Time:** 4 hours  
**Description:** Complete or remove TODO comments

**Breakdown:**
- Backend integration: 12 TODOs
- Feature completion: 8 TODOs
- Optimization: 5 TODOs
- Documentation: 3 TODOs

**Requirements:**
- Review each TODO
- Complete important ones
- Remove outdated ones
- Create tickets for future work

---

### 11. Split Large Components 🔧 REFACTOR
**Status:** 3 large files  
**Estimated Time:** 6 hours  
**Description:** Break down large component files

**Files:**
- DailyBrief.tsx (800+ lines)
- ChiefOfStaff.tsx (600+ lines)
- ProjectGenesisPage.tsx (700+ lines)

**Requirements:**
- Extract sub-components
- Improve readability
- Maintain functionality
- Add tests

---

### 12. Add Automated Tests 🧪 TESTING
**Status:** Not run/updated  
**Estimated Time:** 10 hours  
**Description:** Update and run test suite

**Requirements:**
- Update existing tests
- Add new tests for new features
- Run test suite
- Fix failing tests
- Add CI/CD testing

---

### 13. Add Monitoring 📊 INFRASTRUCTURE
**Status:** Not implemented  
**Estimated Time:** 3 hours  
**Description:** Add error and performance monitoring

**Services:**
- Sentry (error monitoring)
- LogRocket (session replay)
- Vercel Analytics (performance)

**Requirements:**
- Set up accounts
- Add SDK to codebase
- Configure alerts
- Test monitoring

---

### 14. Improve Documentation 📚 DOCUMENTATION
**Status:** Partial  
**Estimated Time:** 4 hours  
**Description:** Add comprehensive documentation

**Needed:**
- API documentation
- Component documentation (JSDoc)
- Setup guide
- Deployment guide
- Contributing guidelines

---

### 15. Performance Optimization ⚡ OPTIMIZATION
**Status:** Not done  
**Estimated Time:** 8 hours  
**Description:** Optimize bundle size and performance

**Tasks:**
- Analyze bundle size
- Implement code splitting
- Add caching layer (Redis)
- Optimize images
- Add CDN
- Lazy load components

---

### 16. Security Hardening 🔒 SECURITY
**Status:** Basic security only  
**Estimated Time:** 6 hours  
**Description:** Improve security posture

**Tasks:**
- Add rate limiting
- Implement CSRF protection
- Add input validation
- Security audit
- Add security headers
- Penetration testing

---

### 17. Mobile Optimization 📱 UX
**Status:** Mostly responsive  
**Estimated Time:** 4 hours  
**Description:** Improve mobile experience

**Tasks:**
- Test all pages on mobile
- Fix layout issues
- Optimize touch targets
- Improve navigation
- Test on real devices

---

### 18. Accessibility Improvements ♿ ACCESSIBILITY
**Status:** Partial support  
**Estimated Time:** 6 hours  
**Description:** Improve accessibility

**Tasks:**
- Add ARIA labels
- Improve keyboard navigation
- Test with screen readers
- Add skip links
- Improve focus management
- WCAG 2.1 AA compliance

---

## Priority Matrix

### Critical (Do Immediately)
1. Backend API Connections (8h)
2. Authentication Fix (4h)
3. API Key Configuration (1h)

**Total: 13 hours**

---

### High Priority (This Week)
4. Persephone Board (8h)
5. AI Agents Loading (2h)
6. OAuth Configuration (4h)
7. Remove Console Statements (2h)

**Total: 16 hours**

---

### Medium Priority (Next Week)
8. Email Accounts Page (2h)
9. Populate Empty Pages (8h)
10. Address TODOs (4h)
11. Split Large Components (6h)

**Total: 20 hours**

---

### Low Priority (Future)
12. Add Automated Tests (10h)
13. Add Monitoring (3h)
14. Improve Documentation (4h)
15. Performance Optimization (8h)
16. Security Hardening (6h)
17. Mobile Optimization (4h)
18. Accessibility Improvements (6h)

**Total: 41 hours**

---

## Total Estimated Work

**Critical + High:** 29 hours (1 week)  
**+ Medium:** 49 hours (2 weeks)  
**+ Low:** 90 hours (3 weeks)

**To 100% complete:** ~90 hours (3 weeks full-time)

---

## Recommended Approach

### Week 1: Critical Items
- Connect backend APIs
- Fix authentication
- Configure API keys
- Remove console statements

**Goal:** Core functionality working

---

### Week 2: High Priority
- Build Persephone Board
- Fix AI Agents
- Complete OAuth
- Address TODOs

**Goal:** All features functional

---

### Week 3: Polish & Optimization
- Populate empty pages
- Split large components
- Add monitoring
- Optimize performance

**Goal:** Production-ready platform

---

**Document created:** February 22, 2026
