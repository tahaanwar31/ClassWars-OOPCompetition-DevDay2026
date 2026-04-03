# Round 2: Tank Warfare — Solution Guide & Acceptance Criteria

## Overview

Round 2 is a C++ tank warfare simulation where teams write code to control a tank through 3 progressive levels. Each level introduces a new mechanic:

| Level | Mechanic | Objective | Max Score |
|-------|----------|-----------|-----------|
| 1 | Movement | Navigate through 3 checkpoints | 200 pts |
| 2 | Movement + Firing | Destroy 3 moving targets | 200 pts |
| 3 | Full Combat | Defeat enemy tank (MAKAROV) | 200 pts |

**Maximum Round 2 Score: 600 points**

---

## Scoring Formula (per level)

```
Score = Base Points + HP Bonus + Time Bonus
```

| Component | Calculation | Max |
|-----------|-------------|-----|
| Base Points | Fixed | 100 |
| HP Bonus | `floor(hpRemaining / 100 * 50)` | 50 |
| Time Bonus | `max(0, 50 - floor(seconds / 10))` | 50 |

---

## Level 1: Checkpoint Navigation

### Acceptance Criteria

- [ ] Tank must visit all 3 checkpoints at **Y: 20 → 50 → 80** in order
- [ ] Tank starts at Y = 50
- [ ] Checkpoint is "visited" when tank is within **4 units** of checkpoint Y
- [ ] Tank movement speed: 60 units/second
- [ ] Player HP stays at 100% (no combat)
- [ ] Level completes when all 3 checkpoints are visited

### Test Harness Scenarios

The backend compiles your code with 5 test scenarios:

| Scenario | Tank Y | Checkpoint Target | Expected Action |
|----------|--------|-------------------|-----------------|
| S80 | 80 | Y=20 | `up` |
| S20 | 20 | Y=50 | `down` |
| S50 | 50 | Y=80 | `down` |
| S50B | 50 | Y=20 | `up` |
| S30 | 30 | Y=50 | `down` |

**Required PROFILE output: `PROFILE:track:none:none`** (moves both up and down based on position)

### Solution

```cpp
#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
private:
    int checkpointIndex = 0;
    const int checkpoints[3] = {20, 50, 80};

public:
    void move() override {
        int targetY = checkpoints[checkpointIndex];

        // Move toward checkpoint
        if (this->y < targetY - 2) {
            moveDown();   // Tank is above target, go down
        } else if (this->y > targetY + 2) {
            moveUp();     // Tank is below target, go up
        }

        // Check if reached checkpoint
        if (abs(this->y - targetY) <= 2) {
            checkpointIndex++;
            if (checkpointIndex >= 3) checkpointIndex = 0;
        }
    }

    void attack() override { }
    void defend() override { }
};
```

### Key Concepts

- `this->y` — Current tank Y position (0-100)
- `moveUp()` — Decreases Y (moves toward top)
- `moveDown()` — Increases Y (moves toward bottom)
- Checkpoints must be visited **in order** (20 → 50 → 80)

---

## Level 2: Target Destruction

### Acceptance Criteria

- [ ] 3 moving targets oscillate with sine-wave motion
- [ ] Tank must track and align with the closest active target
- [ ] Tank fires projectiles when aligned (within 10 units Y-distance)
- [ ] Projectile collision range: X ∈ [65, 75], Y-distance < 8
- [ ] Each target takes 1 hit to destroy
- [ ] Level completes when all 3 targets are destroyed
- [ ] Tank has 100 HP (no damage in this level)

### Test Harness Scenarios

| Scenario | Tank Y | Enemy Y | Expected Action |
|----------|--------|---------|-----------------|
| ABOVE | 50 | 20 | `up` |
| BELOW | 50 | 80 | `down` |
| ALIGNED | 50 | 50 | `fire` (attack) |
| FAR | 90 | 10 | `up` |

**Required PROFILE output: `PROFILE:track:align:none`**

### Solution

```cpp
#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
public:
    void move() override {
        // Track the enemy/target position
        if (this->y < enemy.y - 2) {
            moveDown();   // Target is below, move down
        } else if (this->y > enemy.y + 2) {
            moveUp();     // Target is above, move up
        }
    }

    void attack() override {
        // Fire when aligned with target
        if (abs(this->y - enemy.y) < 10) {
            fire();
        }
    }

    void defend() override { }
};
```

### Key Concepts

- `enemy.y` — Target's current Y position
- `fire()` — Shoots a projectile from the tank
- Player projectiles travel right at 85 units/second
- Targets oscillate with sine-wave: `y + sin(time * 0.8 + id) * 0.5`
- Fire cooldown: 0.8 seconds between shots

---

## Level 3: Full Combat vs MAKAROV

### Acceptance Criteria

- [ ] Enemy tank (MAKAROV) moves erratically (dual sine-wave)
- [ ] Player must track, fire, and defend
- [ ] Enemy fires when aligned (within 16 units Y-distance), cooldown 0.7s
- [ ] Enemy activates shield when HP < 40 (up to 2 times, lasts 3 seconds)
- [ ] Player shield auto-activates when enemy projectile is close (x ≤ 35, y-distance < 15)
- [ ] Player gets max 2 shield activations
- [ ] Shield blocks all damage for 3 seconds
- [ ] Each hit deals 10 HP damage
- [ ] Player starts with 100 HP, enemy starts with 100 HP
- [ ] Level completes when enemy HP ≤ 0
- [ ] Game over if player HP ≤ 0

### Test Harness Scenarios

| Scenario | Tank Y | Enemy Y | Context | Expected Action |
|----------|--------|---------|---------|-----------------|
| ABOVE | 50 | 20 | — | `up` |
| BELOW | 50 | 80 | — | `down` |
| ALIGNED | 50 | 50 | — | `fire` |
| FIRING | 50 | 50 | enemy.firing=true | `shield` |
| QUIET | 50 | 50 | enemy.firing=false | `none` or `shield` |
| LOWHP | 50 | 50 | hp=30, enemy.firing=true | `shield` |

**Required PROFILE output: `PROFILE:track:align:smart`**

### Solution

```cpp
#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
public:
    void move() override {
        // Track enemy position
        if (this->y < enemy.y - 2) {
            moveDown();
        } else if (this->y > enemy.y + 2) {
            moveUp();
        }
    }

    void attack() override {
        // Fire when aligned with enemy
        if (abs(this->y - enemy.y) < 14) {
            fire();
        }
    }

    void defend() override {
        // Activate shield when enemy is firing or when low HP
        if (enemy.isFiring() || this->hp < 40) {
            activateShield();
        }
    }
};
```

### Key Concepts

- `enemy.isFiring()` — Returns true when enemy is actively firing
- `this->hp` — Current tank health (starts at 100)
- `activateShield()` — Activates defensive shield
- Enemy movement: `50 + sin(t*1.5)*30 + sin(t*2.3)*15`
- Enemy fire threshold: 16 units Y-distance
- Player shield activates when enemy projectile is within 35 x-units
- Shield lasts 3 seconds (frame-based countdown)
- Enemy shield activates at HP < 40, max 2 uses

---

## Testing Checklist

### Backend Compilation Tests

```bash
# Test Level 1 - Checkpoint code
curl -X POST http://localhost:3002/api/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"#include <iostream>\n#include \"Tank.h\"\nclass MyTank : public Tank {\nprivate:\n    int checkpointIndex = 0;\n    const int checkpoints[3] = {20, 50, 80};\npublic:\n    void move() override {\n        int targetY = checkpoints[checkpointIndex];\n        if (this->y < targetY - 2) moveDown();\n        else if (this->y > targetY + 2) moveUp();\n        if (abs(this->y - targetY) <= 2) { checkpointIndex++; if (checkpointIndex >= 3) checkpointIndex = 0; }\n    }\n    void attack() override { }\n    void defend() override { }\n};","level":1}'
# Expected: PROFILE:track:none:none

# Test Level 2 - Target code
curl -X POST http://localhost:3002/api/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"#include <iostream>\n#include \"Tank.h\"\nclass MyTank : public Tank {\npublic:\n    void move() override {\n        if (this->y < enemy.y - 2) moveDown();\n        else if (this->y > enemy.y + 2) moveUp();\n    }\n    void attack() override { if (abs(this->y - enemy.y) < 10) fire(); }\n    void defend() override { }\n};","level":2}'
# Expected: PROFILE:track:align:none

# Test Level 3 - Full combat code
curl -X POST http://localhost:3002/api/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"#include <iostream>\n#include \"Tank.h\"\nclass MyTank : public Tank {\npublic:\n    void move() override {\n        if (this->y < enemy.y - 2) moveDown();\n        else if (this->y > enemy.y + 2) moveUp();\n    }\n    void attack() override { if (abs(this->y - enemy.y) < 14) fire(); }\n    void defend() override { if (enemy.isFiring() || this->hp < 40) activateShield(); }\n};","level":3}'
# Expected: PROFILE:track:align:smart

# Test broken code
curl -X POST http://localhost:3002/api/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"class MyTank { };","level":1}'
# Expected: success: false, error contains compilation errors
```

### Frontend Playtest Checklist

- [ ] **Briefing**: Shows on first visit, [SKIP] works, "DEPLOY BATTLE SYSTEM" starts game
- [ ] **Code Editor**: Textarea editable, syntax highlighting (green text), no spell check
- [ ] **Compile & Run**: Shows compilation overlay, updates status messages
- [ ] **Level 1 Gameplay**:
  - [ ] Tank starts at Y=50
  - [ ] Tank moves toward checkpoint 1 (Y=20) after successful compile
  - [ ] Checkpoint 1 turns green when visited
  - [ ] Tank moves to checkpoint 2 (Y=50), then checkpoint 3 (Y=80)
  - [ ] "LEVEL COMPLETE" overlay appears after all 3 visited
- [ ] **Level 2 Gameplay**:
  - [ ] 3 moving targets visible on right side
  - [ ] Tank tracks closest target
  - [ ] Projectiles fire when aligned
  - [ ] Targets disappear when hit
  - [ ] Counter shows hits (e.g., "2/3")
  - [ ] Level completes when all 3 destroyed
- [ ] **Level 3 Gameplay**:
  - [ ] Enemy tank (red) visible on right side, moving erratically
  - [ ] Both tanks fire at each other
  - [ ] Player HP bar visible
  - [ ] Enemy HP bar visible
  - [ ] Shield activates on incoming projectiles (cyan glow)
  - [ ] Enemy shield activates at low HP
  - [ ] "MISSION FAILED" if player HP ≤ 0
  - [ ] "ENEMY DEFEATED" if enemy HP ≤ 0
- [ ] **Navigation**:
  - [ ] "RETURN TO LOBBY" button works
  - [ ] Level progression works (1 → 2 → 3)
  - [ ] After all levels: "RETURN TO LOBBY" navigates to competition lobby

### API Endpoint Tests

```bash
# Create session
curl -X POST http://localhost:3002/api/round2/session \
  -H "Content-Type: application/json" \
  -d '{"teamName":"test-team"}'

# Get session (replace SESSION_ID)
curl http://localhost:3002/api/round2/session/SESSION_ID

# Submit level result
curl -X POST http://localhost:3002/api/round2/session/SESSION_ID/level-complete \
  -H "Content-Type: application/json" \
  -d '{"level":1,"success":true,"timeTakenMs":15000,"hpRemaining":100,"codeSubmitted":"..."}'

# End session
curl -X POST http://localhost:3002/api/round2/session/SESSION_ID/end

# Leaderboard
curl http://localhost:3002/api/round2/leaderboard

# Config
curl http://localhost:3002/api/round2/config
```

---

## Architecture

```
User writes C++ code (MyTank class)
    ↓
Frontend sends POST /api/compile { code, level }
    ↓
Backend wraps code in test harness (5-6 scenarios)
    ↓
JDoodle API compiles and runs C++ code
    ↓
Backend parses output → derives PROFILE:move:fire:shield
    ↓
Frontend parses PROFILE → sets tank strategy
    ↓
Client-side game loop executes strategy via requestAnimationFrame
```

### PROFILE Line Format

```
PROFILE:<move>:<fire>:<shield>
```

| Field | Values | Meaning |
|-------|--------|---------|
| move | `track`, `up`, `down`, `idle` | How the tank moves |
| fire | `align`, `always`, `none` | When the tank fires |
| shield | `smart`, `none` | Whether tank uses shield |

### Game Loop Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Player move speed | 60 units/s | How fast player tank moves |
| Player fire cooldown | 0.8s | Time between shots |
| Player projectile speed | 85 units/s | Projectile velocity (rightward) |
| Enemy projectile speed | 60 units/s | Projectile velocity (leftward) |
| Checkpoint visit range | 4 units | Distance to count as "visited" |
| Movement stop range | 2 units | Distance to stop moving toward target |
| Fire align range (L2) | 10 units | Y-distance to fire at targets |
| Fire align range (L3) | 14 units | Y-distance to fire at enemy |
| Hit detection (targets) | X:65-75, Y:<8 | Projectile collision with targets |
| Hit detection (enemy) | X:80-100, Y:<14 | Projectile collision with enemy |
| Hit detection (player) | X:0-20, Y:<12 | Projectile collision with player |
| Damage per hit | 10 HP | Both player and enemy |
| Shield duration | 3 seconds | Active shield time |
| Max shield uses | 2 | Per level, both player and enemy |
| Enemy shield trigger | HP < 40 | Auto-activates shield |
| Enemy fire threshold | Y-distance < 16 | When enemy decides to fire |
