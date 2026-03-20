# Ralph Loop Prompt - City Mysteries App

You are building a serverless escape room web app called "City Mysteries". Work through the PROGRESS.md file step by step. After EACH step, update PROGRESS.md marking the step as done [x] and advancing Current Step. After EACH phase, run the verification step. If verification fails, FIX the issue before moving on. NEVER skip verification.

## CRITICAL RULES
1. Read PROGRESS.md at the start of each iteration to know where you are
2. Do ONE step per iteration, verify it, then mark it done
3. If a verification step fails, debug and fix it in the same iteration
4. NEVER add features not in the plan - keep it minimal and working
5. After each phase completion, run ALL previous verifications too (regression check)
6. Use the sales-training-app in the same repo as reference for patterns

## Working Directory
/Users/davidperezmartinez/Documents/claude_code/city-mysteries-app

## Reference Project
/Users/davidperezmartinez/Documents/claude_code/sales-training-app (copy patterns exactly, adapt names)

## AWS Config
- Account: 890742600627
- Region: eu-west-1
- CodeStar Connection ARN: arn:aws:codestar-connections:eu-west-1:890742600627:connection/e879a2a6-c2f1-4128-9bfb-996a0a5b3c7d
- GitHub repo: davidd138/city-mysteries-app
- Prefix: cm (city-mysteries), e.g. dev-cm-users, dev-cm-api

## PHASE 1: Infrastructure Base

### Step 1.1: CDK config files
Create `infrastructure/cdk.json`:
```json
{
  "app": "python3 app.py",
  "context": {
    "@aws-cdk/core:stackRelativeExports": true
  }
}
```

Create `infrastructure/requirements.txt`:
```
aws-cdk-lib>=2.100.0
constructs>=10.0.0
```

### Step 1.2: infrastructure/app.py
```python
#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.pipeline_stack import PipelineStack

app = cdk.App()

PipelineStack(
    app,
    "CityMysteriesPipeline",
    env=cdk.Environment(
        account="890742600627",
        region="eu-west-1",
    ),
)

app.synth()
```

### Step 1.3: infrastructure/stages/app_stage.py
```python
import aws_cdk as cdk
from constructs import Construct
from stacks.backend_stack import BackendStack
from stacks.frontend_stack import FrontendStack

class AppStage(cdk.Stage):
    def __init__(self, scope: Construct, construct_id: str, env_name: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)
        BackendStack(self, "BackendStack", env_name=env_name)
        FrontendStack(self, "FrontendStack", env_name=env_name)
```

### Step 1.4: infrastructure/stacks/pipeline_stack.py
Same pattern as sales-training-app but with:
- repo: "davidd138/city-mysteries-app"
- pipeline_name: "city-mysteries-pipeline"
- stage name: "CityMysteriesDev"
- S3 bucket: dev-cm-frontend-890742600627
- Stack name for CF: CityMysteriesDev-FrontendStack

### Step 1.5: infrastructure/stacks/backend_stack.py
5 DynamoDB tables:
- `{env}-cm-users` (PK: userId, GSI: email-index)
- `{env}-cm-mysteries` (PK: id)
- `{env}-cm-characters` (PK: mysteryId, SK: characterId)
- `{env}-cm-game-sessions` (PK: id, GSI: userId-createdAt-index with sort key startedAt)
- `{env}-cm-interactions` (PK: sessionId, SK: characterId)

Cognito: same pattern as sales-training-app (pre_signup trigger, email verification, hardened password policy)

AppSync: Cognito-only auth, WAF rate limiting

Secrets Manager: `{env}/openai-api-key` (reuse same secret as sales-training-app) AND `{env}/mapbox-api-key`

Lambda resolvers (all Python 3.11, 256MB default):
- sync_user (Mutation syncUser) - write users, cognito access
- list_mysteries (Query listMysteries) - read mysteries, characters, users
- get_mystery (Query getMystery) - read mysteries, characters, users
- start_game (Mutation startGame) - read mysteries+users, write game-sessions
- get_game_session (Query getGameSession) - read game-sessions, interactions, users
- list_game_sessions (Query listGameSessions) - read game-sessions, users
- record_interaction (Mutation recordInteraction) - read game-sessions+users, write interactions
- submit_solution (Mutation submitSolution) - read game-sessions+mysteries+users, write game-sessions
- get_realtime_token (Query getRealtimeToken) - read users, secrets manager access

Use the SAME `create_resolver` helper pattern as sales-training-app for least-privilege IAM.

Common env vars: USERS_TABLE, MYSTERIES_TABLE, CHARACTERS_TABLE, GAME_SESSIONS_TABLE, INTERACTIONS_TABLE, ENV_NAME

### Step 1.6: infrastructure/stacks/frontend_stack.py
Exact same pattern as sales-training-app but with:
- Bucket: `{env}-cm-frontend-{account}`
- Names: cm instead of st
- CSP: add `https://api.mapbox.com https://*.tiles.mapbox.com` to connect-src and `https://api.mapbox.com` to script-src

### Step 1.7: backend/schema/schema.graphql
```graphql
type User @aws_cognito_user_pools {
  userId: String!
  email: String!
  name: String
  status: String!
  createdAt: String
}

type Location @aws_cognito_user_pools {
  lat: Float!
  lng: Float!
}

type StatueLocation @aws_cognito_user_pools {
  lat: Float!
  lng: Float!
  name: String!
}

type Character @aws_cognito_user_pools {
  characterId: String!
  mysteryId: String!
  name: String!
  historicalPeriod: String!
  description: String!
  statue: StatueLocation!
  clues: [String!]!
  voice: String
  persona: String!
}

type Mystery @aws_cognito_user_pools {
  id: String!
  title: String!
  description: String!
  city: String!
  location: Location!
  radius: Int!
  difficulty: String!
  characters: [Character!]
  solution: String!
  active: Boolean!
  imageUrl: String
  createdAt: String
}

type Interaction @aws_cognito_user_pools {
  sessionId: String!
  characterId: String!
  characterName: String
  transcript: String
  cluesRevealed: [String!]
  timestamp: String!
}

type GameSession @aws_cognito_user_pools {
  id: String!
  mysteryId: String!
  mysteryTitle: String
  userId: String!
  status: String!
  interactions: [Interaction!]
  startedAt: String!
  completedAt: String
  solved: Boolean
}

type GameSessionList @aws_cognito_user_pools {
  items: [GameSession!]!
  nextToken: String
}

type GameResult @aws_cognito_user_pools {
  correct: Boolean!
  message: String!
  session: GameSession!
}

type RealtimeToken @aws_cognito_user_pools {
  token: String!
  expiresAt: Int!
}

input StartGameInput {
  mysteryId: String!
}

input RecordInteractionInput {
  sessionId: String!
  characterId: String!
  transcript: String
  cluesRevealed: [String!]
}

input SubmitSolutionInput {
  sessionId: String!
  solution: String!
}

type Query {
  listMysteries: [Mystery!]! @aws_cognito_user_pools
  getMystery(id: String!): Mystery @aws_cognito_user_pools
  getGameSession(id: String!): GameSession @aws_cognito_user_pools
  listGameSessions(limit: Int, nextToken: String): GameSessionList! @aws_cognito_user_pools
  getRealtimeToken(characterId: String!, mysteryId: String!): RealtimeToken! @aws_cognito_user_pools
}

type Mutation {
  syncUser: User! @aws_cognito_user_pools
  startGame(input: StartGameInput!): GameSession! @aws_cognito_user_pools
  recordInteraction(input: RecordInteractionInput!): Interaction! @aws_cognito_user_pools
  submitSolution(input: SubmitSolutionInput!): GameResult! @aws_cognito_user_pools
}
```

### Step 1.8: backend/lambdas/triggers/pre_signup.py
```python
def handler(event, context):
    event["response"]["autoConfirmUser"] = False
    event["response"]["autoVerifyEmail"] = False
    return event
```

### Step 1.9: Lambda Resolvers
Create each resolver following the exact pattern of sales-training-app resolvers.

**auth_helpers.py**: Simplified version - no admin checks, no time windows. Just check user exists and status is active.

**sync_user.py**: Same as sales-training-app but simpler (no admin groups, just create/update user with status "active" directly since this is a public game app).

**list_mysteries.py**: Scan mysteries table, for each mystery query characters table, return list.

**get_mystery.py**: Get mystery by id, query its characters, return.

**get_realtime_token.py**: Same pattern as sales-training-app. Get OpenAI ephemeral token. Accept characterId and mysteryId to build the system prompt for that character's persona.

**start_game.py**: Create a new game session (id=uuid, mysteryId, userId, status="active", startedAt=now).

**get_game_session.py**: Get session by id, query interactions for that session, return combined.

**list_game_sessions.py**: Query userId-createdAt-index, support pagination.

**record_interaction.py**: Put interaction item (sessionId, characterId, transcript, cluesRevealed, timestamp).

**submit_solution.py**: Get session's mystery, compare solution (case-insensitive contains check), update session status to "completed", set solved=true/false.

### Step 1.10: Verify
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/infrastructure
pip install -r requirements.txt
npx cdk synth
```
Must produce CloudFormation without errors. If it fails, read the error, fix the file, and re-run.

### Step 1.11: Create GitHub repo and push
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app
git init
git add -A
git commit -m "feat: initial infrastructure - CDK pipeline, backend, frontend stacks"
gh repo create davidd138/city-mysteries-app --public --source=. --push
```

## PHASE 2: Frontend Base

### Step 2.1: frontend/package.json
```json
{
  "name": "city-mysteries-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "aws-amplify": "^6.14.0",
    "mapbox-gl": "^3.9.0",
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.0",
    "@types/mapbox-gl": "^3.4.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@playwright/test": "^1.52.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.8.0"
  }
}
```

### Step 2.2-2.5: Config files
- next.config.ts: same as sales-training-app (static export, trailing slash, unoptimized images)
- tsconfig.json: same as sales-training-app
- postcss.config.mjs: same as sales-training-app
- Create src/types/index.ts with TypeScript types matching the GraphQL schema

### Step 2.6: src/lib/amplify-config.ts
Placeholder values - will be updated after first deploy:
```typescript
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_PLACEHOLDER',
      userPoolClientId: 'PLACEHOLDER',
    },
  },
  API: {
    GraphQL: {
      endpoint: 'https://PLACEHOLDER.appsync-api.eu-west-1.amazonaws.com/graphql',
      defaultAuthMode: 'userPool' as const,
    },
  },
};
```

### Step 2.7: GraphQL queries and mutations
Create src/lib/graphql/queries.ts and mutations.ts with all GraphQL operations.

### Step 2.8-2.9: Hooks
- useAuth.ts: Same pattern as sales-training-app (signIn, signUp, confirmAccount, signOut, syncUser)
- useGraphQL.ts: Same pattern as sales-training-app

### Step 2.10-2.11: Components
- AuthGuard.tsx: Redirect to /login if not authenticated
- Sidebar.tsx: Navigation (Dashboard, History)
- Topbar.tsx: User info, logout button

### Step 2.12-2.15: Pages
- app/layout.tsx: Root layout with AuthProvider
- app/page.tsx: Redirect to /dashboard or /login
- (auth)/layout.tsx, login/page.tsx, register/page.tsx: Auth flow pages
- (app)/layout.tsx: Protected layout with AuthGuard, Sidebar, Topbar
- (app)/dashboard/page.tsx: List mysteries, start game button
- (app)/history/page.tsx: List past game sessions

IMPORTANT: For the app/layout.tsx, you MUST add the global CSS import. Create src/app/globals.css with:
```css
@import "tailwindcss";
```

### Step 2.16: Verify frontend
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm ci
npm run build
```
Must succeed with 0 errors.

### Step 2.17: Verify infra still works
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/infrastructure
npx cdk synth
```

### Step 2.18: Git commit and push
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app
git add -A
git commit -m "feat: add Next.js frontend with auth flow, dashboard, and history pages"
git push
```

## PHASE 3: Map + OpenAI Realtime

### Step 3.1: Map component
Create src/components/Map.tsx using Mapbox GL JS:
- Show user's current location (navigator.geolocation)
- Show character markers with custom icons (pin with character name)
- When clicking a marker, emit event with characterId
- Center map on mystery location
- Show mystery radius as a circle overlay
- Mapbox CSS must be imported

### Step 3.2: CharacterModal
Create src/components/CharacterModal.tsx:
- Shows character name, historical period, description
- "Talk to [name]" button to start voice conversation
- Shows conversation transcript as it happens
- "End conversation" button
- Shows clues revealed so far

### Step 3.3: useRealtimeConversation hook
COPY the pattern from sales-training-app's useRealtimeTraining.ts and adapt:
- Fetch ephemeral token via getRealtimeToken query (pass characterId, mysteryId)
- WebSocket to wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview
- System prompt: "You are [character name], a historical figure from [period]. You are standing as a statue in [city]. A detective has come to ask you questions about [mystery]. You know these clues: [clues]. Stay in character. Speak in Spanish. Be mysterious and give hints, don't reveal clues directly. If they ask the right questions, gradually reveal your clues."
- PCM16 audio format, 24kHz
- Server-side VAD
- Track transcript
- Return: connect, disconnect, isConnected, isListening, isSpeaking, transcript

### Step 3.4: Play page
Create src/app/(app)/play/[mysteryId]/page.tsx:
- Fetch mystery data on mount
- Show Map component with characters
- When marker clicked, open CharacterModal
- Show "Submit Solution" button at bottom
- Solution input modal
- Call submitSolution mutation
- Show result (correct/incorrect)

### Step 3.5: Verify
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm run build
```

### Step 3.6: Git commit and push

## PHASE 4: E2E Tests

### Step 4.1: Playwright config
Create frontend/e2e/playwright.config.ts:
- baseURL from env var or http://localhost:3000
- Chromium only
- Screenshot on failure
- Retries: 1

Create frontend/playwright.config.ts that imports from e2e/

### Step 4.2-4.4: Test files
- smoke.spec.ts: Page loads, title visible, login form exists
- auth.spec.ts: Can navigate to register, can navigate to login, form validation works
- game.spec.ts: After login, dashboard shows, can navigate to history

For tests that need auth, use a setup file that stores auth state.

NOTE: These are OFFLINE tests that work against the built static site (npx serve out/) or dev server. They do NOT need a real AWS backend - just verify the UI renders and navigates correctly.

### Step 4.5: Install and verify
```bash
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npx playwright install chromium
npx playwright test
```

### Step 4.6-4.7: Git commit and push

## PHASE 5: Seed Data

### Step 5.1: Create seed script
Create backend/lambdas/scripts/seed_mysteries.py:
- Inserts "¿Quién asesinó a Cervantes?" mystery for Madrid
- Characters with REAL statue coordinates:
  - Velázquez: 40.4145, -3.6946 (Museo del Prado area)
  - Goya: 40.4141, -3.6927 (Puerta del Prado)
  - Felipe IV: 40.4180, -3.7138 (Plaza de Oriente)
  - Colón: 40.4256, -3.6901 (Plaza de Colón)
- Each character has a persona prompt and clues
- Solution: "Lope de Vega" (fictional, it's a game)

### Step 5.2-5.5: Final verification
Run ALL verifications:
```bash
# CDK
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/infrastructure
npx cdk synth

# Frontend
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app/frontend
npm run build

# E2E tests
npx playwright test

# Final commit
cd /Users/davidperezmartinez/Documents/claude_code/city-mysteries-app
git add -A
git commit -m "feat: add seed data for Madrid mystery"
git push
```
