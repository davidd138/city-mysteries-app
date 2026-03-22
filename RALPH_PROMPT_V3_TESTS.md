# Ralph Loop Prompt V3 - Functional E2E Tests for City Mysteries App

You are tasked with creating **real functional E2E tests** for the City Mysteries app that test actual user flows against the **deployed app**. The current tests are superficial — they only check HTTP status codes and static HTML. You need tests that actually register users, log in, browse mysteries, interact with the app, and verify everything works end-to-end.

## CRITICAL RULES

1. **Read PROGRESS_V3.md** at the start of EACH iteration to know where you are
2. Do ONE step per iteration. Mark it done `[x]` in PROGRESS_V3.md when complete
3. **NEVER skip verification.** If a test fails, fix it before moving on
4. Tests must run against the REAL deployed app at https://d16xm6j7hdyytg.cloudfront.net
5. Git commit and push after each completed step
6. **Every test must PASS before marking complete** — no skipping broken tests

## Working Directory
`/Users/davidperezmartinez/Documents/claude_code/city-mysteries-app`

## AWS Context
- Region: eu-west-1
- CloudFront URL: https://d16xm6j7hdyytg.cloudfront.net
- Distribution ID: E3HF8JNRJ5PUW6
- S3 Bucket: dev-cm-frontend-890742600627
- Cognito User Pool ID: eu-west-1_GmQzkNtro
- Cognito App Client ID: 5gkum44rc048qftbovgssnsjod
- AppSync GraphQL: https://s2gfaytqlbgmndcmfhfvwmj36y.appsync-api.eu-west-1.amazonaws.com/graphql

## Test Architecture

### Two Test Modes
1. **Local tests** (`npm run test:e2e`): Run against local built static site (`npx serve out -l 3000`). These test UI rendering, navigation, responsive design. NO backend needed.
2. **Integration tests** (`npm run test:e2e:live`): Run against the DEPLOYED CloudFront URL. These test real auth flows, real API calls, real data.

### Test User for Integration Tests
Create a dedicated test user in Cognito for automated testing:
```bash
aws cognito-idp admin-create-user \
  --user-pool-id eu-west-1_GmQzkNtro \
  --username test-e2e@citymysteries.com \
  --temporary-password TempPass123! \
  --user-attributes Name=email,Value=test-e2e@citymysteries.com Name=name,Value="Detective E2E" \
  --message-action SUPPRESS \
  --region eu-west-1

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id eu-west-1_GmQzkNtro \
  --username test-e2e@citymysteries.com \
  --password TestDetective123! \
  --permanent \
  --region eu-west-1

# Confirm the user
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-west-1_GmQzkNtro \
  --username test-e2e@citymysteries.com \
  --region eu-west-1
```

Store credentials in a `.env.test` file (gitignored):
```
E2E_BASE_URL=https://d16xm6j7hdyytg.cloudfront.net
E2E_TEST_EMAIL=test-e2e@citymysteries.com
E2E_TEST_PASSWORD=TestDetective123!
```

---

## PHASE 10: Test Infrastructure Setup

### Step 10.1: Create test user in Cognito
- Run the AWS CLI commands above to create a test user
- Verify the user can authenticate by invoking syncUser Lambda with the test user sub
- Create `.env.test` with credentials
- Add `.env.test` to `.gitignore`

### Step 10.2: Update Playwright configuration
- Update `playwright.config.ts` to support TWO projects:
  - `local`: baseURL http://localhost:3000, runs tests in `e2e/` folder
  - `live`: baseURL from E2E_BASE_URL env var, runs tests in `e2e-live/` folder
- Add `test:e2e:live` script to package.json: `playwright test --project=live`
- Keep existing `test:e2e` for local tests
- Configure longer timeouts for live tests (network latency)
- Load `.env.test` in playwright config

### Step 10.3: Create auth helper for live tests
- Create `e2e-live/helpers/auth.ts` with:
  - `loginAsTestUser(page)`: Navigate to login, fill email/password, submit, wait for dashboard
  - `ensureLoggedIn(page)`: Check if already logged in, login if not
  - `logout(page)`: Click logout button
- This helper will be used by all live tests that need authentication

---

## PHASE 11: Live Functional E2E Tests

Each test file below tests REAL functionality against the deployed app. Every test must interact with the actual UI, make real API calls, and verify real results.

### Step 11.1: Auth flow tests (`e2e-live/auth-flow.spec.ts`)
Tests:
- Login page loads with detective theme
- Can fill email and password fields
- Login with WRONG credentials shows error message
- Login with CORRECT credentials redirects to dashboard
- After login, topbar shows user email
- Logout redirects to login page
- After logout, dashboard redirects to login
- Login persistence: after login, refresh page stays on dashboard

### Step 11.2: Dashboard tests (`e2e-live/dashboard.spec.ts`)
Tests:
- After login, dashboard shows "Casos Abiertos" heading
- Dashboard displays at least 2 mystery cards (Madrid + Barcelona)
- Each mystery card shows: title, description, city, difficulty, character count
- Madrid mystery card shows "Quien asesino a Cervantes?"
- Barcelona mystery card shows "El Fantasma de la Opera del Liceu"
- Each mystery card has "Ver Expediente" button
- Clicking "Ver Expediente" navigates to mystery detail page

### Step 11.3: Mystery detail tests (`e2e-live/mystery-detail.spec.ts`)
Tests:
- Mystery detail page loads with case file dossier design
- Shows mystery title, city, difficulty
- Shows "Briefing Confidencial" section with narrative text
- Shows suspect count without revealing names
- Has "Aceptar el Caso" button
- Has "Volver al Archivo" button that goes back to dashboard
- Clicking "Aceptar el Caso" navigates to play page with session ID in URL

### Step 11.4: Play page tests (`e2e-live/play-page.spec.ts`)
Tests:
- Play page loads with mystery title in header
- Shows timer counting up (00:00 -> 00:01 -> ...)
- Shows hint button with "0/3" counter
- Shows "Resolver Caso" button
- Has character gallery toggle button
- Clicking gallery toggle shows suspect panel with "???" entries
- Play page shows "Cargando mapa..." or map container (Mapbox may error without token, that's OK — test the container exists)

### Step 11.5: Solution submission tests (`e2e-live/solution.spec.ts`)
Tests:
- Clicking "Resolver Caso" opens solution modal
- Solution modal has "Presentar Solucion" heading
- Solution modal has "Tu veredicto" input field
- Submitting WRONG solution shows "Veredicto Incorrecto" result
- After wrong solution, game is marked as completed
- Start a NEW game, submit CORRECT solution ("Lope de Vega" for Madrid), shows "Caso Resuelto"
- Score is displayed after correct solution

### Step 11.6: Profile page tests (`e2e-live/profile.spec.ts`)
Tests:
- Profile page loads with "Credencial de Agente" heading
- Shows user email
- Shows statistics: Casos Totales, Casos Resueltos, Tasa de Exito
- Shows "Rango de Detective" section
- Shows "Insignias" section with badge grid
- Total games count matches actual games played in this test run
- After solving a case, profile reflects updated stats

### Step 11.7: History page tests (`e2e-live/history.spec.ts`)
Tests:
- History page loads with "Archivo de Casos" heading
- Shows list of past game sessions
- Each session shows: mystery title, date, status badge
- Completed sessions show "Caso Resuelto" or "Caso Cerrado" stamp
- Sessions are ordered by date (most recent first)

### Step 11.8: Leaderboard tests (`e2e-live/leaderboard.spec.ts`)
Tests:
- Leaderboard page loads with "Salon de la Fama" heading
- After solving a case with correct answer, test user appears in leaderboard
- Leaderboard shows: rank, name, score, time
- Entries are ordered by score (highest first)

### Step 11.9: Navigation & sidebar tests (`e2e-live/navigation.spec.ts`)
Tests:
- Sidebar shows 3 navigation items: Casos, Archivo, Ranking
- Active item is highlighted with brass color
- Clicking each nav item navigates to correct page
- Topbar shows user email with link to profile
- Clicking email navigates to profile
- Sound toggle button exists in topbar
- Mobile: bottom nav appears on small viewport
- Mobile: sidebar hidden on small viewport

### Step 11.10: Cross-feature integration tests (`e2e-live/integration.spec.ts`)
Full user journey test:
1. Login
2. Verify dashboard shows 2 mysteries
3. Click on Madrid mystery -> verify detail page
4. Accept case -> verify play page loads
5. Verify timer is running
6. Open solution modal
7. Submit correct solution "Lope de Vega"
8. Verify "Caso Resuelto" with score
9. Navigate to history -> verify completed case appears
10. Navigate to profile -> verify stats updated
11. Navigate to leaderboard -> verify entry appears
12. Logout -> verify redirect to login

---

## PHASE 12: Fix Any Issues Found

### Step 12.1: Triage and fix
- For every test that FAILS because of a genuine bug (not a test issue):
  - Fix the bug in the source code
  - Rebuild frontend: `npm run build`
  - Redeploy: `aws s3 sync out/ s3://dev-cm-frontend-890742600627 --delete --region eu-west-1 && aws cloudfront create-invalidation --distribution-id E3HF8JNRJ5PUW6 --paths "/*"`
  - If backend change needed: `cd infrastructure && cdk deploy "CityMysteriesPipeline/CityMysteriesDev/BackendStack" --require-approval never`
  - Re-run the failing test to confirm fix
  - ALSO redeploy via pipeline for CI/CD: push to git

### Step 12.2: Final verification
- Run ALL local tests: `npx playwright test --project=local`
- Run ALL live tests: `npx playwright test --project=live`
- ALL tests must pass
- Git commit and push final state

---

## Iteration Settings
- **Maximum iterations: 150**
- If stuck on a step for more than 3 attempts, add a BLOCKED note and move on
- After fixing a bug, re-run the specific test before moving on
- Always run the full test suite after fixing bugs to check for regressions

## Verification Checklist (run after fixing any bug)
```bash
# 1. Build
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm run build

# 2. Local E2E Tests
npx playwright test --project=local

# 3. Deploy if needed
aws s3 sync out/ s3://dev-cm-frontend-890742600627 --delete --region eu-west-1
aws cloudfront create-invalidation --distribution-id E3HF8JNRJ5PUW6 --paths "/*"

# 4. Live E2E Tests
npx playwright test --project=live

# 5. Git
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app
git add -A
git commit -m "fix/test: <description>"
git push
```
