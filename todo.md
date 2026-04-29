# CEPHO — Agent1 Phase 2-5 Integration TODO

## Phase 2 — Elevate Agent1 to Chief of Staff

- [x] Wire decision log context into Agent1 chat.send (last 5 decisions injected into system prompt)
- [x] Wire evening review feedback into Agent1 context (last review mood/notes injected)
- [ ] Wire idea capture (Innovation Hub) to notify Agent1 when new idea is captured
- [x] Add Agent1 "assess idea" endpoint that uses Council to evaluate new ideas
- [ ] Redirect /tasks (ChiefOfStaff page) to /agent1 with a notice
- [ ] Scope Victoria to daily brief only — remove orchestration duties from victoria.router.ts
- [x] Add "Chief of Staff" label to Agent1 in sidebar (renamed to "Chief of Staff — Agent1")
- [x] Add decision context to Agent1 buildSystemPrompt — recent decisions section
- [x] Add evening review context to Agent1 buildSystemPrompt — last signal/mood section

## Phase 3 — Wire 51 Agents to Agent1

- [x] Add agent1Router.orchestrate endpoint — routes task to specialist agent and returns synthesis
- [ ] Wire Agent Monitoring page to show agents reporting to Agent1
- [x] Add "Delegate to Agent" button in Agent1 chat UI (amber Zap button in toolbar)

## Phase 4 — Fix Remaining Broken Features

- [ ] Voice notes end-to-end flow (record → transcribe → save → playback) — router exists, needs DB migration verification
- [ ] Decision log integration with Agent1 responses (show relevant decisions in chat)
- [x] Training regime — toggle and saveNotes endpoints added (dayKey format supported)
- [x] Reflection loop — approve/reject aliases added to reflectionRouter
- [x] Daily Brief — all BRIEF_DATA mock sections replaced with live data (tasks, projects, liveBrief)
- [ ] Evening Review — verify moodScore and notes are saved to DB (router exists, needs live test)

## Completed

- [x] Agent1 tables created in Supabase (031-agent1-personal-ai.sql)
- [x] agentEngine.ts — Constitutional Articles, Thinking Stack, Council, 7 modes, 3 levels
- [x] agent1.router.ts — chat, identity, decisions, training, reflections, settings, ideas, orchestrate
- [x] 6 Agent1 frontend pages built
- [x] Agent1 routes added to App.tsx
- [x] Agent1 section renamed to "Chief of Staff — Agent1" in BrainLayout sidebar
- [x] PR #47 merged — Agent1 live on main branch
- [x] PR #48 open — Phase 2-5 Chief of Staff integration (3 commits)
