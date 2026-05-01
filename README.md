<div align="center">

# CLASS WARS

### A Competitive Coding & Strategy Platform

**Developed for Developers Day 2026 — ACM NUCES Chapter**
**FAST NUCES Karachi | April 30, 2026**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)

</div>

---

## At a Glance

Class Wars is a **two-round competitive programming and strategy platform** built for a live university coding competition. Teams compete through a multi-level trivia round covering OOP, data structures, and algorithms, followed by a unique **Tank Warfare** coding challenge where players write C++ code to navigate, fight, and defeat a boss — all compiled server-side in real time. The platform features a full admin dashboard, combined leaderboards, time-based round access, and server-side C++ compilation via the OneCompiler API — all designed and deployed within a tight competition timeline.

---

## Key Features

### Competition Engine
- **Two-round format** — Round 1 (Trivia Gauntlet) + Round 2 (Tank Warfare Coding Challenge)
- **Time-based access control** — Countdown timers and configurable play windows restrict when each round goes live
- **Real-time combined leaderboard** — Merges scores from both rounds into unified team rankings
- **Team-based authentication** — Teams register and compete as units, not individuals

### Round 1: Trivia Gauntlet
- **10 progressive difficulty levels** with 50 questions per level (500 total)
- **3 question types:**
  - **MCQ** — Multiple choice with 4 options
  - **One-Word** — Free-text single-word answers (case-insensitive matching)
  - **Output Prediction** — Predict the output of a given code snippet
- **Level-up rule:** Clear Level N by answering N questions correctly (Level 1 = 1 correct, Level 2 = 2 correct, ... Level 10 = 10 correct)
- **Demotion mechanic:** 2 consecutive wrong answers or timeouts drops you back one level — stay sharp
- **Scoring:** 5 points per correct answer; rankings determined by highest level reached, then speed of progression

### Round 2: Tank Warfare (The Signature Feature)
- Players write **real C++ code** using OOP concepts — classes, inheritance, polymorphism, abstraction, composition, and memory management
- Code is **compiled and executed server-side** via the OneCompiler API, then the output drives the game
- **3 progressive levels testing different OOP concepts:**
  - **Level 1 — Checkpoint Run (Inheritance):** Navigate a tank through 9 checkpoints in sequence on a 10x10 grid. Override `move()`, `attack()`, and `defend()` from a `Tank` base class. Print `STEP:<row>,<col>` commands to move the tank cell-by-cell
  - **Level 2 — Combat Purge (Inheritance + Game Loop):** Destroy 8 enemy tanks on a 10x10 grid. Use a built-in `fire(row, col)` function with strict 2-cell lock range — must be on the same row, exactly 2 cells to the left of the target. Combines movement logic with tactical positioning
  - **Level 3 — Operation Square One (Boss Fight):** Defeat General Makarov (10 HP) who patrols a square perimeter. The player has only 2 HP. Tests **abstraction** (`Weapon` base class), **polymorphism** (`LaserGun` vs `Cannon` — laser penetrates shields, cannon deals damage to unshielded boss), **aggregation** (`Radar*` pointer), **composition** (owning and deleting `Weapon*`), and **memory management** (`new`/`delete` lifecycle)
- **Scoring:** 10 points per level completed (30 max for Round 2)

### Admin Dashboard
- **Real-time competition statistics** — Active sessions, completion rates, top performers, average scores
- **Question bank management** — Full CRUD across all levels and question types
- **Team management** — Create, monitor, and manage competing teams
- **Game configuration** — Enable/disable rounds, set play windows, define competition rules
- **Session monitoring** — Track live game sessions and player progress

### Developer Experience
- **CodeMirror C++ editor** — In-browser IDE with syntax highlighting, dark tactical theme, and smart indentation
- **Responsive UI** — Tailwind CSS + Framer Motion animations for a polished competition experience
- **Automated seeding** — Scripts to populate question banks, configure levels, and set up the competition

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | SPA with Vite bundler |
| **Styling** | Tailwind CSS 4 + Framer Motion | Utility-first CSS + animations |
| **Code Editor** | CodeMirror (via @uiw/react-codemirror) | In-browser C++ editor with syntax highlighting |
| **Backend** | NestJS + TypeScript | REST API with modular architecture |
| **Database** | MongoDB + Mongoose | Document storage for sessions, teams, questions |
| **Auth** | Passport.js + JWT | Team and admin authentication with protected routes |
| **Code Execution** | OneCompiler API (RapidAPI) | Server-side C++ compilation and sandboxed execution |
| **Hosting** | Heroku / Render | Cloud deployment with MongoDB Atlas |

---

## Architecture

```
classwars/
├── backend/                    # NestJS API Server
│   └── src/
│       ├── auth/               # JWT authentication (Passport strategy)
│       ├── admin/              # Admin dashboard controllers & services
│       ├── teams/              # Team CRUD, login, leaderboard queries
│       ├── questions/          # Question bank management
│       ├── compile/            # C++ compilation via OneCompiler API
│       ├── rounds/round1/      # Trivia session & scoring engine
│       ├── rounds/round2/      # Tank warfare session & scoring
│       ├── schemas/            # Mongoose schemas (team, session, config, question)
│       └── scripts/            # Database seeding & admin setup
├── frontend/                   # React SPA
│   └── src/
│       ├── pages/              # Login, Lobby, Admin (Dashboard, Leaderboard, etc.)
│       ├── rounds/round1/      # Trivia gameplay UI
│       ├── rounds/round2/      # Tank warfare game + C++ editor + canvas engine
│       ├── api/                # Axios instance with auth interceptors
│       └── components/         # Shared UI components
└── package.json                # Root build & deploy scripts
```

---

## How It Works — Tank Warfare (Round 2)

This is the standout feature of Class Wars. Here's the full pipeline:

```
Player writes C++ code (class MyTank, LaserGun, Cannon, etc.)
        │
        ▼
Code sent to backend ──► Prepended with game harness ──► Compiled via OneCompiler API
        │
        ▼
Compiler returns stdout (STEP, FIRE, SHIELD, FINISH_REACHED commands)
        │
        ▼
Frontend parses output line-by-line ──► Animates tank on 10x10 grid
        │
        ▼
Win/loss determined client-side (checkpoints visited, enemies destroyed, boss HP)
        │
        ▼
Score reported to backend on level completion
```

### Level 3: Boss Fight in Detail

The most technically demanding level tests five OOP concepts simultaneously:

| OOP Concept | How It's Tested |
|-------------|----------------|
| **Inheritance** | `MyTank : public Tank` with pure virtual overrides |
| **Abstraction** | `Weapon` abstract base class with virtual `fire()` |
| **Polymorphism** | `LaserGun::fire()` prints `FIRE:LASER`, `Cannon::fire()` prints `FIRE:CANNON` |
| **Aggregation** | `Radar*` pointer — used but not owned/deleted |
| **Composition + Memory Management** | `Weapon*` — allocated with `new`, must be `delete`d each turn |

The boss patrols a square path and cycles through 4 states:
- **Facing right (shielded):** Only `LASER` penetrates — `CANNON` deals 0 damage
- **Facing down (open):** `CANNON` deals 1 HP damage
- **Facing left (fires at player):** Player must print `SHIELD` or take 1 HP damage
- **Facing up (open):** `CANNON` deals 1 HP damage

---

## Scoring System

### Round 1 — Trivia Gauntlet
- **5 points** per correct answer
- **Rankings by:** Highest level reached (primary) > Speed of progression (tiebreak)

### Round 2 — Tank Warfare
- **10 points** per level completed
- **Max Round 2 score:** 30 points (3 levels)

### Combined Leaderboard
Merges Round 1 and Round 2 scores into unified team rankings.

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- OneCompiler RapidAPI key (for C++ compilation)

### Installation

```bash
# Clone the repository
git clone https://github.com/tahaanwar31/ClassWars.git
cd ClassWars

# Install and build
npm run build

# Set up environment variables (backend)
# Create backend/.env with:
#   MONGODB_URI=mongodb://localhost:27017/classwars
#   JWT_SECRET=your-secret-key
#   ONECOMPILER_RAPIDAPI_KEY=your-rapidapi-key

# Seed the database
cd backend
npm run seed:all-levels
npm run create-admin

# Start development servers
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

---

## About

Built for **Developers Day 2026**, organized by the **ACM NUCES Student Chapter** at **FAST NUCES Karachi** on **April 30, 2026**. The platform was designed, developed, and deployed to host a live OOP coding competition featuring 10 levels of OOP trivia and a unique 3-level C++ tank warfare challenge testing inheritance, polymorphism, abstraction, composition, and memory management.

**~40+ teams** of 3 members each participated from universities across Karachi including **FAST NUCES**, **NED University**, **IOBM**, and **Bahria University**. The event was a resounding success.

---

<div align="center">

**Built with passion for Developers Day 2026 — ACM NUCES**

</div>
