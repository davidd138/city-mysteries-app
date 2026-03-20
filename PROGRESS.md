# City Mysteries App - Progress Tracker

## Current Phase: 2
## Current Step: 2.1
## Status: IN_PROGRESS

## Phases

### Phase 1: Infrastructure Base
- [x] 1.1 Create CDK cdk.json and requirements.txt
- [x] 1.2 Create infrastructure/app.py
- [x] 1.3 Create infrastructure/stages/app_stage.py
- [x] 1.4 Create infrastructure/stacks/pipeline_stack.py
- [x] 1.5 Create infrastructure/stacks/backend_stack.py (DynamoDB + Cognito + AppSync + Lambda)
- [x] 1.6 Create infrastructure/stacks/frontend_stack.py (S3 + CloudFront)
- [x] 1.7 Create backend/schema/schema.graphql
- [x] 1.8 Create backend/lambdas/triggers/pre_signup.py
- [x] 1.9 Create all Lambda resolvers (sync_user, list_mysteries, get_mystery, get_realtime_token, start_game, get_game_session, list_game_sessions, record_interaction, submit_solution)
- [x] 1.10 Create backend/lambdas/resolvers/auth_helpers.py
- [x] 1.11 VERIFY: pip install -r requirements.txt && cd infrastructure && cdk synth ✅
- [x] 1.12 Create GitHub repo and push initial code ✅

### Phase 2: Frontend Base
- [ ] 2.1 Create frontend/package.json with dependencies
- [ ] 2.2 Create frontend/next.config.ts (static export)
- [ ] 2.3 Create frontend/tsconfig.json
- [ ] 2.4 Create frontend/postcss.config.mjs and tailwind setup
- [ ] 2.5 Create frontend/src/types/index.ts
- [ ] 2.6 Create frontend/src/lib/amplify-config.ts (placeholders)
- [ ] 2.7 Create frontend/src/lib/graphql/queries.ts and mutations.ts
- [ ] 2.8 Create frontend/src/hooks/useAuth.ts
- [ ] 2.9 Create frontend/src/hooks/useGraphQL.ts
- [ ] 2.10 Create frontend/src/components/AuthGuard.tsx
- [ ] 2.11 Create frontend/src/components/Sidebar.tsx and Topbar.tsx
- [ ] 2.12 Create frontend/src/app/layout.tsx and page.tsx
- [ ] 2.13 Create frontend/src/app/(auth)/layout.tsx, login/page.tsx, register/page.tsx
- [ ] 2.14 Create frontend/src/app/(app)/layout.tsx, dashboard/page.tsx
- [ ] 2.15 Create frontend/src/app/(app)/history/page.tsx
- [ ] 2.16 VERIFY: cd frontend && npm ci && npm run build (must succeed with 0 errors)
- [ ] 2.17 VERIFY: cd infrastructure && cdk synth (still works)
- [ ] 2.18 Git commit and push

### Phase 3: Map + OpenAI Realtime
- [ ] 3.1 Create frontend/src/components/Map.tsx (Mapbox GL JS)
- [ ] 3.2 Create frontend/src/components/CharacterModal.tsx
- [ ] 3.3 Create frontend/src/hooks/useRealtimeConversation.ts
- [ ] 3.4 Create frontend/src/app/(app)/play/[mysteryId]/page.tsx
- [ ] 3.5 VERIFY: cd frontend && npm run build (must succeed)
- [ ] 3.6 Git commit and push

### Phase 4: E2E Tests
- [ ] 4.1 Create frontend/e2e/playwright.config.ts
- [ ] 4.2 Create frontend/e2e/smoke.spec.ts
- [ ] 4.3 Create frontend/e2e/auth.spec.ts
- [ ] 4.4 Create frontend/e2e/game.spec.ts
- [ ] 4.5 Install playwright and dependencies
- [ ] 4.6 VERIFY: npx playwright test (smoke tests pass locally)
- [ ] 4.7 Git commit and push

### Phase 5: Seed Data + Final Verification
- [ ] 5.1 Create backend/lambdas/scripts/seed_mysteries.py
- [ ] 5.2 VERIFY: Full cdk synth
- [ ] 5.3 VERIFY: Full npm run build
- [ ] 5.4 VERIFY: All E2E tests pass
- [ ] 5.5 Final git commit and push
