# Ralph Loop Prompt V2 - City Mysteries App (Deploy + Evolve)

You are continuing work on "City Mysteries", a serverless urban escape room web app. Phases 1-5 are DONE (infra, frontend, map, tests, seed data). Now you must **deploy to AWS, verify everything works end-to-end, redesign the UI to be unique and atmospheric, and add new features incrementally — each one fully tested and operational before moving to the next**.

## CRITICAL RULES

1. **Read PROGRESS_V2.md** at the start of EACH iteration to know where you are
2. Do ONE step per iteration. Mark it done `[x]` in PROGRESS_V2.md when complete
3. **NEVER skip verification.** If something fails, fix it in the same iteration
4. After EACH feature: run `npm run build` + `npx playwright test` + push + verify deployed site
5. **After EACH deploy**, wait 60s then check the CloudFront URL loads correctly. Use `curl -s -o /dev/null -w "%{http_code}" <URL>` to verify
6. **E2E tests are MANDATORY** for every new feature. Write them BEFORE marking the feature as done
7. Keep everything in Spanish (UI text, mysteries, characters)
8. Git commit and push after each completed step

## Working Directory
`/Users/davidperezmartinez/Documents/claude_code/city-mysteries-app`

## AWS Context
- Account: 890742600627
- Region: eu-west-1
- The dev admin role credentials are already configured in the environment
- OpenAI API key secret: `dev/openai-api-key` (ALREADY EXISTS in Secrets Manager — same one used by sales-training-app)
- CodeStar Connection ARN: `arn:aws:codestar-connections:eu-west-1:890742600627:connection/e879a2a6-c2f1-4128-9bfb-996a0a5b3c7d`
- GitHub repo: `davidd138/city-mysteries-app`

## Reference Project
`/Users/davidperezmartinez/Documents/claude_code/sales-training-app` (for deployment patterns)

---

## PHASE 6: Deploy to AWS & Wire Up Real Values

### Step 6.1: Bootstrap CDK (if needed)
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/infrastructure
pip install -r requirements.txt
npx cdk bootstrap aws://890742600627/eu-west-1
```

### Step 6.2: Deploy the pipeline stack
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/infrastructure
npx cdk deploy CityMysteriesPipeline --require-approval never
```
Wait for it to complete. If it fails, read the error and fix the CDK code.

### Step 6.3: Trigger the pipeline
Push to main to trigger CodePipeline. Monitor with:
```bash
aws codepipeline get-pipeline-state --name city-mysteries-pipeline --region eu-west-1 --query 'stageStates[*].{Stage:stageName,Status:latestExecution.status}'
```
Wait until ALL stages are "Succeeded". If any stage fails, check CloudWatch logs:
```bash
aws codebuild list-builds-for-project --project-name <project-name> --region eu-west-1
aws codebuild batch-get-builds --ids <build-id> --region eu-west-1 --query 'builds[0].logs.deepLink'
```

### Step 6.4: Get real resource values from CloudFormation outputs
```bash
# Get Cognito values
aws cloudformation describe-stacks --stack-name CityMysteriesDev-BackendStack --region eu-west-1 --query 'Stacks[0].Outputs'

# Get CloudFront URL
aws cloudformation describe-stacks --stack-name CityMysteriesDev-FrontendStack --region eu-west-1 --query 'Stacks[0].Outputs'
```
Update `frontend/src/lib/amplify-config.ts` with the REAL values:
- userPoolId
- userPoolClientId
- GraphQL endpoint

### Step 6.5: Rebuild and redeploy frontend with real values
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm run build
# Upload to S3
aws s3 sync out/ s3://dev-cm-frontend-890742600627 --delete --region eu-west-1
# Invalidate CloudFront cache
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='dev-cm-distribution'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### Step 6.6: Seed DynamoDB with mystery data
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/backend/lambdas
python scripts/seed_mysteries.py
```

### Step 6.7: Verify deployed site
- curl the CloudFront URL — must return 200
- Verify the login page renders (check HTML contains "City Mysteries")
- Git commit and push the updated amplify-config

---

## PHASE 7: UI Redesign — Make It Unique & Atmospheric

**DESIGN DIRECTION**: This is a mystery/detective game set in historic European cities. The UI must feel like opening a detective's case file or an ancient map. NO generic dark theme with amber accents. Think:

- **Color palette**: Deep midnight blue (#0a0e1a, #111827) as base, with aged gold/brass (#c5a55a, #8b7355) for accents, muted crimson (#8b2252) for danger/alerts, dusty teal (#2d6a6a) for success/active states, and parchment (#f5e6c8) for highlighted text
- **Typography**: Use a serif font (e.g., Google Fonts "Playfair Display") for headings to evoke old-world mystery. Keep sans-serif for body text but use "Inter" or similar, not system defaults
- **Visual elements**:
  - Subtle paper/parchment texture overlays (CSS gradients, no images needed)
  - Borders that look like aged photo edges or torn paper effects (CSS only)
  - Mystery-themed decorative elements: magnifying glass icons, compass roses, old key silhouettes
  - Cards should look like case file folders or old photographs
  - Login page should feel like opening a detective agency door
- **Animations**: Subtle fog/mist effect on backgrounds (CSS keyframes), cards that "flip open" like files, text that "types" in like a typewriter for important reveals
- **Map page**: Dark atmospheric map style (Mapbox dark-v11), character markers as glowing pin drops with subtle pulse animation
- **NO** stone-800/stone-900 generic dark. NO amber-400/amber-600 generic accent. Be CREATIVE.

### Step 7.1: Create new globals.css with custom design system
Replace the current globals.css with the new color palette, custom fonts (Google Fonts import), texture overlays, and custom scrollbar styling. Add CSS custom properties and keyframe animations.

### Step 7.2: Redesign login page
Full redesign: atmospheric background, detective-themed branding, stylized form inputs, creative "enter" button. Must feel like stepping into a noir detective story.

### Step 7.3: Redesign register page
Match the login page style. Add visual flourishes.

### Step 7.4: Redesign sidebar & topbar
Navigation should feel like a case file index. Active items should glow subtly. User area in topbar should have a detective badge feel.

### Step 7.5: Redesign dashboard page
Mystery cards should look like case files or wanted posters. Each mystery card should have visual weight and intrigue. The "Jugar" button should feel like "opening the case".

### Step 7.6: Redesign history page
Game history should look like a detective's logbook. Completed cases vs open cases with distinct visual treatment.

### Step 7.7: Redesign play page & character modal
The play page is the heart of the app. The map should be immersive. Character modal should feel like you're looking at a historical portrait with voice interface below. Make the voice conversation UI unique — not just a chat bubble.

### Step 7.8: VERIFY full redesign
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm run build
npx playwright test
```
All existing tests must still pass. If any fail due to changed selectors/text, update the tests.

### Step 7.9: Deploy redesigned frontend
```bash
aws s3 sync out/ s3://dev-cm-frontend-890742600627 --delete --region eu-west-1
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```
Verify the CloudFront URL shows the new design. Git commit and push.

---

## PHASE 8: New Features — Incremental & Fully Tested

Each feature below follows this cycle:
1. Implement backend (if needed: Lambda + DynamoDB + GraphQL schema + CDK)
2. Implement frontend
3. Write E2E tests for the feature
4. `npm run build` — must pass
5. `npx playwright test` — ALL tests must pass (old + new)
6. `npx cdk synth` — must pass (if backend changed)
7. Git commit, push, wait for pipeline, verify deployed site
8. Mark step done in PROGRESS_V2.md

### Feature 8.1: User Profile Page
- New page `/profile` accessible from topbar
- Shows: email, name, total games played, games solved, success rate
- Aggregate data from game sessions (query DynamoDB)
- New Lambda resolver: `get_user_profile` (Query.getUserProfile)
- Update GraphQL schema with `UserProfile` type
- **E2E tests**: Profile page loads, shows user info, stats display correctly
- **UI**: Detective ID card design with stats as "case statistics"

### Feature 8.2: Mystery Detail Page (pre-game briefing)
- New page `/mystery/[id]` shown BEFORE starting a game
- Shows: full mystery description, city info, difficulty, number of characters (WITHOUT revealing names/locations)
- Shows a "Briefing" narrative text (add `briefing` field to Mystery type and seed data)
- "Aceptar el caso" button starts the game
- **E2E tests**: Detail page loads, briefing shows, start button works
- **UI**: Case file dossier design — stamped "CLASIFICADO", redacted text effects for hidden info

### Feature 8.3: Character Gallery During Play
- In the play page, add a side panel showing characters the player has talked to
- Each talked-to character shows: name, thumbnail silhouette, clues revealed so far
- Characters not yet visited show as "???" with locked icon
- **E2E tests**: Gallery panel shows, updates after interaction mock
- **UI**: Polaroid-style character cards, revealed vs unrevealed visual states

### Feature 8.4: Hint System
- Players can request hints (max 3 per game session)
- Each hint is progressively more revealing
- Add `hintsUsed` field to GameSession
- New mutation: `useHint(sessionId: String!): Hint!`
- New Lambda resolver: `use_hint` — returns a hint based on which characters haven't been visited yet
- Frontend: Floating "hint" button on play page, shows hint in a dramatic reveal animation
- **E2E tests**: Hint button visible, hint counter shows, can request hint
- **UI**: Hint appears like a mysterious note sliding under a door

### Feature 8.5: Game Timer & Score System
- Track elapsed time during game (frontend timer, save to backend on completion)
- Score = f(time, hints_used, characters_visited, correct_solution)
- Show score on game completion screen
- Add `score`, `elapsedSeconds` fields to GameSession
- Update `submit_solution` Lambda to calculate and save score
- **E2E tests**: Timer visible during play, score shows on completion
- **UI**: Vintage clock/stopwatch design for timer, score shown as "Case Rating" with stars

### Feature 8.6: Leaderboard
- New page `/leaderboard`
- Shows top 20 players by score across all mysteries
- Shows: rank, player name (from Cognito), best score, mystery solved
- New Lambda resolver: `get_leaderboard` — scans game-sessions for solved=true, aggregates by userId
- Add navigation link in sidebar
- **E2E tests**: Leaderboard page loads, table/list renders
- **UI**: Old-fashioned detective agency "Hall of Fame" board, brass nameplate style entries

### Feature 8.7: Sound Effects & Ambient Audio
- Add atmospheric background audio on play page (subtle, auto-play muted, user can unmute)
- Use Web Audio API for sound effects: clue revealed, hint used, solution correct/incorrect
- Sound toggle button in topbar
- Generate sounds using simple Web Audio API oscillators (no external audio files needed)
- **E2E tests**: Sound toggle button present, toggles state
- **UI**: Vintage radio/gramophone icon for sound control

### Feature 8.8: Multi-city Support — Add Barcelona Mystery
- Seed a second mystery: "El Fantasma de la Ópera del Liceu" set in Barcelona
- 4 new characters with real Barcelona statue coordinates:
  - Colón (at the port): 41.3758, 2.1779
  - Ramon Llull: 41.3870, 2.1700
  - Joan Miró (near Fundació Miró): 41.3685, 2.1527
  - Pablo Picasso (near Museu Picasso): 41.3854, 2.1808
- Each with unique personas and clues in Spanish
- Dashboard should now show 2 mystery cards
- **E2E tests**: Dashboard shows multiple mysteries, can select either
- **UI**: Each city has a distinct color accent (Madrid=gold, Barcelona=deep red)

### Feature 8.9: Achievement / Badge System
- Unlock badges for milestones: first game, first solved, 3 solved, all cities, no hints used, speed run (<5min)
- New DynamoDB table: `{env}-cm-achievements` (PK: userId, SK: achievementId)
- New Lambda resolvers: `get_achievements`, `check_achievements` (called after game completion)
- Show badges on profile page and a toast notification when unlocked
- **E2E tests**: Badges section on profile, badge display works
- **UI**: Detective medals/insignias design, locked badges shown as silhouettes

### Feature 8.10: Progressive Web App (PWA) Support
- Add manifest.json with app name, icons, theme colors
- Add service worker for offline caching of static assets
- App installable on mobile home screen
- Custom splash screen matching the detective theme
- **E2E tests**: Manifest exists, service worker registers
- **UI**: App icon should be a magnifying glass over a city silhouette (SVG)

---

## PHASE 9: Robustness & Polish

### Step 9.1: Error boundaries & fallback UI
- Add React error boundaries around major sections
- Graceful fallback UI when API calls fail (detective-themed "case file corrupted" message)
- Retry buttons where appropriate
- **E2E tests**: Error states render correctly (mock API failures)

### Step 9.2: Loading states & skeletons
- Replace all spinners with skeleton loaders matching the design
- Case file card skeletons, map loading overlay, profile skeleton
- **E2E tests**: Loading states appear before content

### Step 9.3: Mobile responsiveness
- Full responsive audit of all pages
- Sidebar collapses to bottom nav on mobile
- Character modal is full-screen on mobile
- Map controls optimized for touch
- **E2E tests**: Test viewport sizes (mobile, tablet, desktop)

### Step 9.4: Accessibility audit
- ARIA labels on all interactive elements
- Keyboard navigation through all flows
- Color contrast meets WCAG AA
- Screen reader friendly voice conversation UI
- **E2E tests**: Axe accessibility checks on all pages

### Step 9.5: Performance optimization
- Lazy load Map and CharacterModal components
- Optimize Mapbox initialization
- Add suspense boundaries
- **Verify**: Lighthouse score > 80 on all categories

### Step 9.6: Final E2E test suite
- Add comprehensive E2E tests covering:
  - Full user journey: register → login → browse mysteries → start game → visit characters → submit solution → view score → check leaderboard → view profile
  - Edge cases: wrong solution, max hints, back navigation
  - Multi-mystery flow
- Target: 40+ E2E tests, ALL passing
- **Verify**: `npx playwright test` — ALL green

### Step 9.7: Final deploy & smoke test
- Full rebuild and deploy
- Manual verification checklist via curl/automated:
  - [ ] CloudFront returns 200
  - [ ] Login page loads with new design
  - [ ] Static assets load (fonts, CSS)
  - [ ] No console errors in built output

---

## Iteration Settings
- **Maximum iterations: 200**
- **Do NOT stop** until PROGRESS_V2.md shows all phases complete or you hit the iteration limit
- If you get stuck on a step for more than 3 attempts, add a `⚠️ BLOCKED` note in PROGRESS_V2.md explaining why, skip to the next step, and come back later
- Prioritize working software over perfect software — ship each feature, then polish later

## Verification Checklist (run after EVERY feature)
```bash
# 1. Build
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm run build

# 2. E2E Tests
npx playwright test

# 3. CDK (if backend changed)
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/infrastructure
npx cdk synth

# 4. Git
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app
git add -A
git commit -m "feat: <description>"
git push

# 5. Check deployed site (after pipeline finishes)
curl -s -o /dev/null -w "%{http_code}" https://<CLOUDFRONT_URL>
```
