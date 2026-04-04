# Class Wars — Competition Platform

## Architecture

- **Backend**: NestJS (TypeScript) + MongoDB (Mongoose) + Passport JWT auth
- **Frontend**: React (Vite, TypeScript) + Tailwind CSS + Framer Motion
- **External**: Piston API (`https://emkc.org/api/v2/piston/execute`) for C++ compilation

## Project Structure

```
backend/src/
  admin/            Admin management
  auth/             JWT authentication
  teams/            Team CRUD + login
  schemas/          Mongoose schemas (game-session, game-config, team, question)
  rounds/
    round1/
      questions/    Level-based MCQ questions
      game/         Session + scoring for Round 1
    round2/
      compiler/     C++ compilation via Piston API + behavioral profiling
      game/         Session + scoring for Round 2

frontend/src/
  pages/            TeamLogin, CompetitionLobby, admin/*
  rounds/
    round1/Round1.tsx   MCQ gameplay
    round2/Round2.tsx   Tank warfare game
  api/axios.ts      Axios instance with auth interceptors
  components/       Shared UI components
```

## Round 2: Tank Warfare

### How It Works

1. Player writes C++ code (`class MyTank : public Tank`) with `move()`, `attack()`, `defend()` overrides
2. Code is sent to backend, wrapped in a test harness, compiled via Piston API
3. Test harness runs multiple scenarios per level and outputs `PROFILE:move:fire:shield`
4. Frontend parses PROFILE line and sets tank behavioral strategy
5. Client-side `requestAnimationFrame` game loop uses strategy to control tank

### PROFILE Line Format

```
PROFILE:<track|up|down|idle>:<align|always|none>:<smart|none>
```

- **move**: `track` (follows targets), `up`, `down`, or `idle`
- **fire**: `align` (fires when aligned), `always`, or `none`
- **shield**: `smart` (auto-activates on incoming projectiles) or `none`

### Level Design

| Level | Mechanic | Objective | Test Harness |
|-------|----------|-----------|-------------|
| 1 | Movement | Visit checkpoints Y: 20→50→80 | 5 position scenarios (S80, S20, S50, S50B, S30) |
| 2 | Movement + Firing | Destroy 3 moving targets | 4 scenarios (ABOVE, BELOW, ALIGNED, FAR) |
| 3 | Full Combat | Defeat enemy tank (Makarov) | 6 scenarios (ABOVE, BELOW, ALIGNED, FIRING, QUIET, LOWHP) |

### C++ Test Harness Output Format

```
LEVEL<N>:<SCENARIO>:<action>
PROFILE:move:fire:shield
```

Example Level 1 output:
```
LEVEL1:S80:up
LEVEL1:S20:down
LEVEL1:S50:down
LEVEL1:S50B:up
LEVEL1:S30:up
PROFILE:track:none:none
```

### Scoring (per level)

- Base: 100 points
- HP bonus: `floor(hpRemaining / 100 * 50)` — max 50
- Time bonus: `max(0, 50 - floor(seconds / 10))` — max 50
- **Max per level: 200 pts, max Round 2 total: 600 pts**

### Player Shield Mechanics (Level 3)

- Auto-activates when enemy projectile is within 35 x-units and 15 y-units
- Max 2 activations per level
- Lasts 3 seconds (frame-based countdown)
- Enemy projectiles are blocked by active player shield

### API Endpoints (Round 2)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/compile` | POST | Compile C++ code (body: `{ code, level }`) |
| `/api/round2/session` | POST | Create/resume session (body: `{ teamName }`) |
| `/api/round2/session/:id` | GET | Get session state |
| `/api/round2/session/:id/level-complete` | POST | Report level result |
| `/api/round2/session/:id/end` | POST | Finalize session |
| `/api/round2/leaderboard` | GET | Round 2 leaderboard |
| `/api/round2/config` | GET | Get Round 2 config |

## Running Locally

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

Backend needs MongoDB running locally (`mongodb://localhost:27017/classwars`) or set `MONGODB_URI` in `.env`.
