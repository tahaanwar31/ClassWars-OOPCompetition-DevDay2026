import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Shield, Target, Zap, AlertTriangle, Code2, Cpu, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TacticalBackground from '../../components/TacticalBackground';
import TankCodeEditor from '../../components/TankCodeEditor';
import api from '../../api/axios';

interface Checkpoint {
  y: number;
  visited: boolean;
}

interface Target {
  y: number;
  x: number;
  active: boolean;
  id: number;
}

interface GameState {
  level: number;
  maxLevel: number;
  running: boolean;
  deployed: boolean;
  player: {
    x: number;
    y: number;
    hp: number;
    shield: number;
    maxHp: number;
    maxShield: number;
    cooldown: number;
    shieldActive: boolean;
    shieldCount: number;
    shieldTimer: number;
  };
  enemy: {
    y: number;
    hp: number;
    shield: number;
    maxHp: number;
    maxShield: number;
    dir: number;
    cooldown: number;
    shieldActive: boolean;
    shieldCount: number;
    shieldTimer: number;
  };
  projectiles: Array<{
    x: number;
    y: number;
    isPlayer: boolean;
  }>;
  playerStrategy: {
    moveMode: 'idle' | 'track' | 'up' | 'down';
    fireMode: 'none' | 'align' | 'always';
    shieldMode: 'none' | 'smart';
  };
  checkpoints?: Checkpoint[];
  currentCheckpoint?: number;
  targets?: Target[];
  targetsDestroyed?: number;
}

const getLevelCode = (level: number): string => {
  if (level === 1) {
    return `#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
private:
    int checkpointIndex = 0;
    const int checkpoints[3] = {20, 50, 80};

public:
    void move() override {
        int targetY = checkpoints[checkpointIndex];

        // WRITE YOUR CODE HERE
        // Use this->y to get your current position
        // Call moveUp() to decrease Y (move up)
        // Call moveDown() to increase Y (move down)
        // Navigate to all 3 checkpoints at Y: 20, 50, 80

        if (this->y < targetY - 2) {
            moveDown();
        } else if (this->y > targetY + 2) {
            moveUp();
        }

        // Don't modify below - checkpoint tracking
        if (abs(this->y - targetY) <= 2) {
            checkpointIndex++;
            if (checkpointIndex >= 3) checkpointIndex = 0;
        }
    }

    void attack() override {
        // No firing in Level 1
    }

    void defend() override {
        // No defense in Level 1
    }
};`;
  } else if (level === 2) {
    return `#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
public:
    void move() override {
        // WRITE YOUR CODE HERE
        // enemy.y gives you the target's position
        // Move your tank to align with the target

        if (this->y < enemy.y - 2) {
            moveDown();
        } else if (this->y > enemy.y + 2) {
            moveUp();
        }
    }

    void attack() override {
        // WRITE YOUR CODE HERE
        // Call fire() to shoot when aligned with target
        // abs(this->y - enemy.y) gives distance to target

        if (abs(this->y - enemy.y) < 10) {
            fire();
        }
    }

    void defend() override {
        // No defense in Level 2
    }
};`;
  } else {
    return `#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
public:
    void move() override {
        // Tanks don't move in Level 3
        // Focus on defense only!
    }

    void attack() override {
        // No firing in Level 3
        // Your shield is your only weapon!
    }

    void defend() override {
        // WRITE YOUR CODE HERE
        // Call activateShield() to block enemy fire
        // enemy.isFiring() tells you if enemy is shooting
        // You have exactly 2 shield uses - time them wisely!
        // Enemy fires at: ~2 seconds and ~5 seconds

        if (enemy.isFiring()) {
            activateShield();
        }
    }
};`;
  }
};

// Decorative HUD Corners Component
const HudCorners = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  const b = size === 'sm' ? 'border-2' : 'border-[3px]';
  return (
    <>
      <div className={`absolute top-0 left-0 ${s} ${b} border-t border-l border-[#39ff14] opacity-70`} />
      <div className={`absolute top-0 right-0 ${s} ${b} border-t border-r border-[#39ff14] opacity-70`} />
      <div className={`absolute bottom-0 left-0 ${s} ${b} border-b border-l border-[#39ff14] opacity-70`} />
      <div className={`absolute bottom-0 right-0 ${s} ${b} border-b border-r border-[#39ff14] opacity-70`} />
    </>
  );
};

// Level badge with animation
const LevelBadge = ({ level, maxLevel }: { level: number; maxLevel: number }) => (
  <motion.div
    key={level}
    initial={{ scale: 1.3, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex items-center gap-2"
  >
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-[#39ff14]/20 blur-sm animate-pulse" />
      <Cpu className="w-6 h-6 text-[#39ff14] animate-spin" style={{ animationDuration: '3s' }} />
    </div>
    <div>
      <div className="text-2xl font-black text-[#39ff14] text-glow tabular-nums">{level}</div>
      <div className="text-[10px] text-[#39ff14]/60">/ {maxLevel}</div>
    </div>
  </motion.div>
);

// Briefing screen for Round 2
const BriefingScreen = ({ onStart }: { onStart: () => void }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  const briefingLines = [
    { text: '>>> INITIALIZING ROUND 2 PROTOCOLS...', type: 'init' },
    { text: '[✓] TANK WARFARE MODULE LOADED', type: 'ok' },
    { text: '[✓] C++ COMPILATION ENGINE ONLINE', type: 'ok' },
    { text: '[✓] PISTON API CONNECTED', type: 'ok' },
    { text: '', type: 'blank' },
    { text: '══ MISSION: MASTER TANK COMBAT ══', type: 'header' },
    { text: '  You will learn through 3 progressive levels.', type: 'rule' },
    { text: '  Then face MAKAROV — the ultimate tank AI challenge.', type: 'rule' },
    { text: '', type: 'blank' },
    { text: '══ YOUR PROGRESSION ══', type: 'header' },
    { text: '  LEVEL 1 ›  MOVEMENT      [Learn moveUp() / moveDown()]', type: 'rule' },
    { text: '  LEVEL 2 ›  FIRING        [Learn fire() / targeting]', type: 'rule' },
    { text: '  LEVEL 3 ›  DEFENSE       [Learn activateShield() - Block 2 enemy shots!]', type: 'rule' },
    { text: '', type: 'blank' },
    { text: '══ ROUND 2 STRUCTURE ══', type: 'header' },
    { text: '  Each level teaches one core mechanic.', type: 'rule' },
    { text: '  Level 3: Both tanks fixed. Block 2 enemy shots with shield.', type: 'rule' },
    { text: '  Write code that controls move(), attack(), defend().', type: 'rule' },
    { text: '', type: 'blank' },
    { text: '  "May your code be swift and your defenses strong."', type: 'quote' },
    { text: '', type: 'blank' },
    { text: '[✓] BRIEFING COMPLETE — ENTER ROUND 2', type: 'ok' },
  ];

  const skip = useCallback(() => {
    setVisibleCount(briefingLines.length);
    setDone(true);
  }, [briefingLines.length]);

  useEffect(() => {
    if (visibleCount >= briefingLines.length) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [visibleCount, briefingLines.length]);

  const getLineClass = (type: string): string => {
    switch (type) {
      case 'init':   return 'text-yellow-400 font-bold';
      case 'ok':     return 'text-[#39ff14] font-bold';
      case 'header': return 'text-cyan-400 font-bold tracking-wider mt-2';
      case 'quote':  return 'text-gray-300 italic';
      case 'rule':   return 'text-[#a0f0a0]';
      default:       return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center p-4 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#39ff14]/[0.03] blur-[150px]" />
        <div className="absolute top-[-10%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#39ff14]/[0.015] blur-[100px] breathe-glow" />
      </div>
      
      <div className="z-10 max-w-3xl w-full bg-[#010a01]/95 backdrop-blur-xl p-8 relative border border-[#39ff14]/25 box-glow max-h-[90vh] flex flex-col shimmer">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent border-scan z-20" />
        <HudCorners />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-[#39ff14]/20 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-7 h-7 text-cyber-red" />
              <div className="absolute inset-0 bg-cyber-red/20 blur-sm rounded-full" />
            </div>
            <h1 className="text-2xl font-black tracking-[0.15em] text-cyber-red">ROUND 2: TANK CONTROL</h1>
          </div>
          {!done && (
            <button
              onClick={skip}
              className="text-xs text-[#39ff14]/60 hover:text-[#39ff14] border border-[#39ff14]/30 px-3 py-1 transition-all"
            >
              [SKIP]
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto pr-3 text-xs leading-relaxed space-y-1 max-h-96">
          {briefingLines.slice(0, visibleCount).map((line, i) => (
            <div key={i} className={line.type === 'blank' ? 'h-1' : getLineClass(line.type)}>
              {line.text}
            </div>
          ))}
          {!done && <span className="inline-block w-2 h-3 bg-[#39ff14] animate-pulse" />}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#39ff14]/15 shrink-0">
          {done && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onStart}
              className="w-full px-6 py-3 bg-cyber-red text-black font-black tracking-[0.2em] hover:brightness-110 transition-all uppercase flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4 group-hover:animate-pulse" />
              DEPLOY BATTLE SYSTEM
            </motion.button>
          )}
        </div>
      </div>

    </div>
  );
};

export default function Round2() {
  const navigate = useNavigate();
  const [showBriefing, setShowBriefing] = useState(() => {
    try {
      return sessionStorage.getItem('hasSeenRound2Briefing') !== 'true';
    } catch {
      return true;
    }
  });
  const [code, setCode] = useState(() => getLevelCode(1));
  const [battleLog, setBattleLog] = useState('> READY TO DEPLOY');
  const [explosions, setExplosions] = useState<Array<{x: number, y: number, id: number}>>([]);
  const [compiling, setCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState('');
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const levelStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const enemyTimeRef = useRef<number>(0);
  const enemyShotsFiredRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    maxLevel: 3,
    running: false,
    deployed: false,
    player: { x: 8, y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
    enemy: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, dir: 1, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
    projectiles: [],
    playerStrategy: {
      moveMode: 'idle',
      fireMode: 'none',
      shieldMode: 'none'
    },
    checkpoints: [
      { y: 20, visited: false },
      { y: 50, visited: false },
      { y: 80, visited: false }
    ],
    currentCheckpoint: 0,
    targets: [
      { y: 25, x: 70, active: true, id: 1 },
      { y: 50, x: 70, active: true, id: 2 },
      { y: 75, x: 70, active: true, id: 3 }
    ],
    targetsDestroyed: 0
  });

  const log = useCallback((message: string) => {
    setBattleLog(`> ${message}`);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => {
      const newState = {
        ...prev,
        running: false,
        deployed: false,
        player: { x: 8, y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
        enemy: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, dir: 1, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
        projectiles: [],
        playerStrategy: {
          moveMode: 'idle',
          fireMode: 'none',
          shieldMode: 'none'
        }
      };

      // Level-specific initialization
      if (prev.level === 1) {
        // Reset checkpoints
        newState.checkpoints = [
          { y: 20, visited: false },
          { y: 50, visited: false },
          { y: 80, visited: false }
        ];
        newState.currentCheckpoint = 0;
        log("LEVEL 1: Navigate through checkpoints at Y: 20, 50, 80");
      } else if (prev.level === 2) {
        // Reset targets with random oscillation
        newState.targets = [
          { y: 25, x: 70, active: true, id: 1 },
          { y: 50, x: 70, active: true, id: 2 },
          { y: 75, x: 70, active: true, id: 3 }
        ];
        newState.targetsDestroyed = 0;
        log("LEVEL 2: Destroy all 3 stationary targets");
      } else if (prev.level === 3) {
        // Level 3: Fixed positions, shield defense
        newState.player.x = 15;
        newState.player.y = 50;
        enemyShotsFiredRef.current = 0;
        log("LEVEL 3: Block both enemy projectiles with your shield");
      }

      return newState;
    });
    setLevelComplete(false);
    setGameOver(false);
    setExplosions([]);
  }, [log]);

  // Calculate level-specific game logic (pure function)
  const calculateLevelLogic = useCallback((
    gameStateSnapshot: GameState,
    dt: number
  ) => {
    // Note: gameStateSnapshot.player.y already has the MOVED position applied
    const newState: GameState = {
      ...gameStateSnapshot,
      player: { ...gameStateSnapshot.player },
      enemy: { ...gameStateSnapshot.enemy },
      projectiles: gameStateSnapshot.projectiles.map(p => ({ ...p })),
      checkpoints: gameStateSnapshot.checkpoints?.map(cp => ({ ...cp })),
      targets: gameStateSnapshot.targets?.map(t => ({ ...t })),
    };
    enemyTimeRef.current += dt;

    if (gameStateSnapshot.level === 1) {
      // Level 1: Check if player reached the current checkpoint (uses moved position)
      const checkpoint = newState.checkpoints?.[newState.currentCheckpoint];
      if (checkpoint && !checkpoint.visited) {
        const yDist = Math.abs(newState.player.y - checkpoint.y);
        const xDist = Math.abs(newState.player.x - 50); // Checkpoints are at x=50%
        // Require tank to be at checkpoint column AND at checkpoint Y
        if (yDist <= 4 && xDist <= 5) {
          checkpoint.visited = true;
          newState.currentCheckpoint! += 1;
          if (newState.currentCheckpoint! >= newState.checkpoints!.length) {
            // All checkpoints visited - WIN!
            newState.running = false;
            newState.player.hp = 100; // Victory condition
            setLevelComplete(true);
            log("✓ ALL CHECKPOINTS REACHED: LEVEL 1 COMPLETE");
          } else {
            const nextCP = newState.checkpoints![newState.currentCheckpoint!];
            log(`✓ CHECKPOINT ${newState.currentCheckpoint} REACHED - Moving to CP ${newState.currentCheckpoint! + 1} (Y: ${nextCP.y})`);
          }
        }
      }
    } else if (gameStateSnapshot.level === 2) {
      // Level 2: Targets are stationary at fixed positions
      // Check if all targets destroyed
      const allDestroyed = newState.targets.every(t => !t.active);
      if (allDestroyed && newState.targetsDestroyed >= 3) {
        newState.running = false;
        setLevelComplete(true);
        log("ALL TARGETS ELIMINATED: LEVEL 2 COMPLETE");
      }
    } else if (gameStateSnapshot.level === 3) {
      // Level 3: Both tanks fixed position. Enemy fires 2 timed shots.
      // Player at X:15%, Y:50%. Enemy at X:85%, Y:50%.
      newState.enemy.y = 50;

      // Enemy fires exactly 2 projectiles at t=2s and t=5s
      if (enemyTimeRef.current >= 2 && enemyShotsFiredRef.current === 0) {
        enemyShotsFiredRef.current = 1;
        newState.projectiles.push({ x: 85, y: 50, isPlayer: false });
        log("ENEMY FIRES PROJECTILE 1!");
      }
      if (enemyTimeRef.current >= 5 && enemyShotsFiredRef.current === 1) {
        enemyShotsFiredRef.current = 2;
        newState.projectiles.push({ x: 85, y: 50, isPlayer: false });
        log("ENEMY FIRES PROJECTILE 2!");
      }
    }

    return newState;
  }, [log]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameState.running) return;

    const rawDt = (timestamp - lastTimeRef.current) / 1000;
    const dt = Math.min(rawDt, 0.05); // Clamp to 50ms to prevent teleportation on tab switch
    lastTimeRef.current = timestamp;

    setGameState(prev => {
      if (!prev.running) return prev; // Guard against stale closure running extra frames

      const playerMoveSpeed = prev.level === 1 ? 25 : 60;
      const playerMoveSpeedX = 30; // Horizontal speed for Level 1

      // ===== STEP 1: COMPUTE PLAYER MOVEMENT FIRST =====
      let newPlayerX = prev.player.x;
      let newPlayerY = prev.player.y;

      // Level 3: No movement - tanks are fixed
      if (prev.level === 3) {
        newPlayerX = 15;
        newPlayerY = 50;
      } else if (prev.playerStrategy.moveMode === 'track') {
        if (prev.level === 1) {
          const checkpoint = prev.checkpoints?.[prev.currentCheckpoint!];
          if (checkpoint && !checkpoint.visited) {
            // First move X toward center (50%), then Y toward checkpoint
            const targetX = 50;
            const xDiff = targetX - newPlayerX;
            if (Math.abs(xDiff) > 1.5) {
              // Move horizontally first
              newPlayerX += Math.sign(xDiff) * playerMoveSpeedX * dt;
            } else {
              // Arrived at center column, now move vertically
              newPlayerX = targetX;
              const yDiff = checkpoint.y - newPlayerY;
              if (Math.abs(yDiff) > 2.0) {
                newPlayerY += Math.sign(yDiff) * playerMoveSpeed * dt;
              }
            }
          }
        } else if (prev.level === 2) {
          const activeTargets = prev.targets?.filter(t => t.active) || [];
          const closestTarget = activeTargets
            .sort((a, b) => Math.abs(a.y - newPlayerY) - Math.abs(b.y - newPlayerY))[0];
          if (closestTarget) {
            const diff = closestTarget.y - newPlayerY;
            if (Math.abs(diff) > 1.5) {
              newPlayerY += Math.sign(diff) * playerMoveSpeed * dt;
            }
          }
        } else {
          const diff = prev.enemy.y - newPlayerY;
          if (Math.abs(diff) > 1.5) {
            newPlayerY += Math.sign(diff) * playerMoveSpeed * dt;
          }
        }
      } else if (prev.playerStrategy.moveMode === 'up') {
        newPlayerY -= playerMoveSpeed * dt;
      } else if (prev.playerStrategy.moveMode === 'down') {
        newPlayerY += playerMoveSpeed * dt;
      }
      newPlayerX = Math.max(5, Math.min(90, newPlayerX));
      newPlayerY = Math.max(10, Math.min(90, newPlayerY));

      // ===== STEP 2: RUN LEVEL LOGIC WITH MOVED POSITION =====
      const movedPrev = { ...prev, player: { ...prev.player, x: newPlayerX, y: newPlayerY } };
      let newState = calculateLevelLogic(movedPrev, dt);

      // ===== PLAYER FIRING =====
      newState.player.cooldown -= dt;
      let shouldFire = false;

      // Level 3: No firing - shield only
      if (prev.level !== 3) {
        if (prev.playerStrategy.fireMode === 'always') {
          shouldFire = true;
        } else if (prev.playerStrategy.fireMode === 'align') {
          if (newState.level === 2) {
            // Fire when aligned with any target
            const closestTarget = newState.targets
              .filter(t => t.active)
              .sort((a, b) => Math.abs(a.y - newState.player.y) - Math.abs(b.y - newState.player.y))[0];
            if (closestTarget && Math.abs(closestTarget.y - newState.player.y) < 8) {
              shouldFire = true;
            }
          }
        }
      }

      if (shouldFire && newState.player.cooldown <= 0) {
        newState.projectiles.push({
          x: 15,
          y: newState.player.y,
          isPlayer: true
        });
        newState.player.cooldown = 0.8;
      }

      // ===== PLAYER SHIELD (Level 3) =====
      if (prev.playerStrategy.shieldMode === 'smart' && newState.level === 3) {
        // 1) Countdown FIRST so expired shields clear before auto-activate
        if (newState.player.shieldActive && newState.player.shieldTimer > 0) {
          newState.player.shieldTimer = newState.player.shieldTimer - dt;
          if (newState.player.shieldTimer <= 0) {
            newState.player.shieldActive = false;
            newState.player.shieldTimer = 0;
          }
        }
        // 2) Auto-activate shield when enemy projectile is incoming
        if (!newState.player.shieldActive && newState.player.shieldCount < 2) {
          const incomingProjectile = newState.projectiles.find(p =>
            !p.isPlayer && p.x <= 40 && Math.abs(p.y - newState.player.y) < 20
          );
          if (incomingProjectile) {
            newState.player.shieldActive = true;
            newState.player.shieldCount += 1;
            newState.player.shieldTimer = 3.0;
            log(`SHIELD ACTIVATED (${newState.player.shieldCount}/2)`);
          }
        }
      }

      // ===== UPDATE ALL PROJECTILES & COLLISIONS =====
      newState.projectiles = newState.projectiles
        .map(p => ({
          ...p,
          x: p.x + (p.isPlayer ? 85 : -60) * dt
        }))
        .filter(p => {
          if (p.isPlayer) {
            if (prev.level === 1) {
              // Level 1: No projectiles used
              return false;
            } else if (prev.level === 2) {
              // Level 2: Check hit on targets
              const hitTarget = newState.targets.find(t =>
                t.active && p.x >= 65 && p.x <= 75 && Math.abs(p.y - t.y) < 8
              );
              if (hitTarget) {
                const expId = Date.now() + Math.random();
                setExplosions(prev => [...prev, { x: p.x, y: p.y, id: expId }]);
                setTimeout(() => {
                  setExplosions(prev => prev.filter(e => e.id !== expId));
                }, 500);
                hitTarget.active = false;
                newState.targetsDestroyed += 1;
                log(`TARGET ${hitTarget.id} DESTROYED (${newState.targetsDestroyed}/3)`);
                if (newState.targetsDestroyed >= 3) {
                  newState.running = false;
                  setLevelComplete(true);
                  log("ALL TARGETS ELIMINATED: LEVEL 2 COMPLETE");
                }
                return false;
              }
            }
            // Level 3: No player projectiles, skip
          } else {
            // Enemy projectile (Level 3 only)
            if (prev.level === 3) {
              const hitPlayer = p.x <= 20 && p.x >= 0 && Math.abs(p.y - newState.player.y) < 15;
              if (hitPlayer) {
                if (newState.player.shieldActive) {
                  const expId = Date.now() + Math.random();
                  setExplosions(prev => [...prev, { x: p.x, y: p.y, id: expId }]);
                  setTimeout(() => {
                    setExplosions(prev => prev.filter(e => e.id !== expId));
                  }, 500);
                  log("SHIELD BLOCKED PROJECTILE!");
                  return false;
                }
                const expId = Date.now() + Math.random();
                setExplosions(prev => [...prev, { x: p.x, y: p.y, id: expId }]);
                setTimeout(() => {
                  setExplosions(prev => prev.filter(e => e.id !== expId));
                }, 500);
                newState.player.hp -= 50;
                log("DIRECT HIT! Your tank took damage!");
                return false;
              }
            }
          }

          // Remove out of bounds
          return p.x >= 0 && p.x <= 100;
        });

      // ===== LEVEL-SPECIFIC WIN CONDITIONS =====
      if (newState.player.hp <= 0) {
        newState.running = false;
        setGameOver(true);
        log("MISSION FAILED: TANK DESTROYED");
      } else if (prev.level === 3 && enemyShotsFiredRef.current >= 2 && !newState.projectiles.some(p => !p.isPlayer) && newState.player.hp > 0 && newState.player.hp === 100) {
        // Level 3: Win when both projectiles resolved, player took no damage (fully blocked)
        newState.running = false;
        setLevelComplete(true);
        log("ALL PROJECTILES BLOCKED: LEVEL 3 COMPLETE!");
      } else if (prev.level === 3 && enemyShotsFiredRef.current >= 2 && !newState.projectiles.some(p => !p.isPlayer) && newState.player.hp < 100) {
        // Level 3: Both shots fired, all projectiles resolved, but player took damage
        newState.running = false;
        setGameOver(true);
        log("MISSION FAILED: DID NOT BLOCK ALL PROJECTILES");
      }

      return newState;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.running, calculateLevelLogic, log]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, running: true, deployed: true }));
    lastTimeRef.current = performance.now();
    enemyTimeRef.current = 0;
    enemyShotsFiredRef.current = 0;
    levelStartTimeRef.current = Date.now();
    log(`LEVEL ${gameState.level} STARTED...`);
  }, [gameState.level, log]);

  const submitCode = async () => {
    setCompiling(true);
    setCompileStatus('COMPILING C++...');

    // Stop the game
    setGameState(prev => ({
      ...prev,
      playerStrategy: { moveMode: 'idle', fireMode: 'none', shieldMode: 'none' }
    }));

    try {
      const response = await api.post('/api/compile', {
        code: code,
        level: gameState.level
      });

      if (response.data.success) {
        setCompileStatus('LINKING OBJECTS...');
        console.log('--- PISTON API OUTPUT ---');
        console.log(response.data.output);
        console.log('-------------------------');

        // Parse output to determine strategy
        const output = response.data.output;
        let moveMode: 'idle' | 'track' | 'up' | 'down' = 'idle';
        let fireMode: 'none' | 'align' | 'always' = 'none';
        let shieldMode: 'none' | 'smart' = 'none';

        console.log('[COMPILATION OUTPUT]', output);

        // Primary: Parse PROFILE summary line from behavioral profiling
        const profileLine = output.split('\n').find((l: string) => l.trim().startsWith('PROFILE:'));
        if (profileLine) {
          const parts = profileLine.trim().split(':');
          if (parts.length >= 4) {
            const move = parts[1];
            const fire = parts[2];
            const shield = parts[3];
            if (['track', 'up', 'down', 'idle'].includes(move)) moveMode = move as typeof moveMode;
            if (['align', 'always', 'none'].includes(fire)) fireMode = fire as typeof fireMode;
            if (['smart', 'none'].includes(shield)) shieldMode = shield as typeof shieldMode;
            console.log(`[STRATEGY] PROFILE parsed: move=${moveMode}, fire=${fireMode}, shield=${shieldMode}`);
          }
          log(`STRATEGY: ${moveMode.toUpperCase()} / ${fireMode.toUpperCase()} / ${shieldMode.toUpperCase()}`);
        } else {
          // Fallback: Old marker-based detection for backward compatibility
          console.log('[STRATEGY] No PROFILE line found, using fallback markers');
          if (gameState.level === 1) {
            if (output.includes('LEVEL1_CHECKPOINT_UP') || output.includes('LEVEL1_CHECKPOINT_DOWN') ||
                output.includes('LEVEL1_CAN_MOVE') || output.includes('LEVEL1_ADAPTIVE_UP') ||
                output.includes('LEVEL1_ADAPTIVE_DOWN')) {
              moveMode = 'track';
              log('CHECKPOINT NAVIGATION DETECTED');
            } else {
              log('NO CHECKPOINT MOVEMENT DETECTED - Check your code!');
            }
          } else {
            if (output.includes('TEST_ABOVE:UP') && output.includes('TEST_BELOW:DOWN')) {
              moveMode = 'track';
            } else if (output.includes('UP')) {
              moveMode = 'up';
            } else if (output.includes('DOWN')) {
              moveMode = 'down';
            }
            if (output.includes('TEST_ATTACK:FIRE')) fireMode = 'align';
            if (output.includes('TEST_DEFEND:SHIELD')) shieldMode = 'smart';
            log(`STRATEGY: ${moveMode.toUpperCase()} / ${fireMode.toUpperCase()} / ${shieldMode.toUpperCase()}`);
          }
        }

        setTimeout(() => {
          setCompileStatus('DEPLOYMENT SUCCESSFUL');
          setTimeout(() => {
            setCompiling(false);
            // Atomic reset+strategy in ONE state update to avoid race conditions
            setGameState(prev => {
              const isLevel3 = prev.level === 3;
              const newState = {
                ...prev,
                running: false,
                deployed: false,
                player: { x: isLevel3 ? 15 : 8, y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
                enemy: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, dir: 1, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
                projectiles: [],
                playerStrategy: { moveMode: isLevel3 ? 'idle' : moveMode, fireMode: isLevel3 ? 'none' : fireMode, shieldMode },
                checkpoints: [
                  { y: 20, visited: false },
                  { y: 50, visited: false },
                  { y: 80, visited: false }
                ],
                currentCheckpoint: 0,
                targets: [
                  { y: 25, x: 70, active: true, id: 1 },
                  { y: 50, x: 70, active: true, id: 2 },
                  { y: 75, x: 70, active: true, id: 3 }
                ],
                targetsDestroyed: 0
              };
              return newState;
            });
            setLevelComplete(false);
            setExplosions([]);
            setGameOver(false);
            log(`DEPLOYING: ${moveMode.toUpperCase()} / ${fireMode.toUpperCase()} / ${shieldMode.toUpperCase()}`);
            setTimeout(() => startGame(), 500);
          }, 1000);
        }, 1000);
      } else {
        setCompileStatus('COMPILATION FAILED');
        setTimeout(() => setCompiling(false), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setCompileStatus('SERVER ERROR');
      setTimeout(() => setCompiling(false), 2000);
    }
  };

  const nextLevel = () => {
    if (gameState.level < gameState.maxLevel) {
      const newLevel = gameState.level + 1;
      setGameState(prev => ({ ...prev, level: newLevel }));
      setCode(getLevelCode(newLevel));
      setLevelComplete(false);
      resetGame();
      log(`LEVEL ${newLevel} READY. WRITE CODE AND DEPLOY.`);
    }
  };

  useEffect(() => {
    if (gameState.running) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.running, gameLoop]);

  // Create backend session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const teamName = localStorage.getItem('teamName');
        if (teamName) {
          const res = await api.post('/api/round2/session', { teamName });
          sessionIdRef.current = res.data._id;
          console.log('[SESSION] Round 2 session created:', res.data._id);
        }
      } catch (err) {
        console.error('[SESSION] Failed to create session:', err);
      }
    };
    initSession();
    return () => {
      if (sessionIdRef.current) {
        api.post(`/api/round2/session/${sessionIdRef.current}/end`).catch(() => {});
      }
    };
  }, []);

  // Report level result to backend when level completes
  useEffect(() => {
    if (levelComplete && gameState.deployed) {
      const report = async () => {
        if (!sessionIdRef.current) return;
        try {
          const timeTakenMs = Date.now() - levelStartTimeRef.current;
          await api.post(`/api/round2/session/${sessionIdRef.current}/level-complete`, {
            level: gameState.level,
            success: true,
            timeTakenMs,
            hpRemaining: gameState.player.hp,
            codeSubmitted: code,
          });
          console.log('[SESSION] Level result reported');
        } catch (err) {
          console.error('[SESSION] Failed to report level result:', err);
        }
      };
      report();
    }
  }, [levelComplete]);

  const retryGame = useCallback(() => {
    setGameOver(false);
    enemyShotsFiredRef.current = 0;
    // Preserve current strategy when retrying
    setGameState(prev => {
      const strategy = prev.playerStrategy;
      const isLevel3 = prev.level === 3;
      const newState = {
        ...prev,
        running: false,
        deployed: false,
        player: { x: isLevel3 ? 15 : 8, y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
        enemy: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, dir: 1, cooldown: 0, shieldActive: false, shieldCount: 0, shieldTimer: 0 },
        projectiles: [],
        playerStrategy: strategy,
        checkpoints: [
          { y: 20, visited: false },
          { y: 50, visited: false },
          { y: 80, visited: false }
        ],
        currentCheckpoint: 0,
        targets: [
          { y: 25, x: 70, active: true, id: 1 },
          { y: 50, x: 70, active: true, id: 2 },
          { y: 75, x: 70, active: true, id: 3 }
        ],
        targetsDestroyed: 0
      };
      return newState;
    });
    setLevelComplete(false);
    setExplosions([]);
    setTimeout(() => startGame(), 500);
  }, [startGame]);

  const finishGame = useCallback(async () => {
    if (sessionIdRef.current) {
      try {
        await api.post(`/api/round2/session/${sessionIdRef.current}/end`);
      } catch (err) {
        console.error('[SESSION] Failed to end session:', err);
      }
    }
    navigate('/competition');
  }, [navigate]);

  const handleStartBriefing = () => {
    try {
      sessionStorage.setItem('hasSeenRound2Briefing', 'true');
    } catch (e) {
      console.error('Failed to set session storage');
    }
    setShowBriefing(false);
  };

  if (showBriefing) {
    return <BriefingScreen onStart={handleStartBriefing} />;
  }

  return (
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono scanlines crt-flicker relative overflow-hidden pb-8">
      <TacticalBackground />

      {/* Ambient bloom */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#39ff14]/[0.03] blur-[150px] breathe-glow" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#39ff14]/[0.02] blur-[120px] breathe-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Compile Overlay */}
      <AnimatePresence>
        {compiling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center border border-[#ff003c]/50 bg-[#010301]/90 p-8 rounded"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-4"
              >
                <Cpu className="w-12 h-12 text-cyber-red mx-auto" />
              </motion.div>
              <div className="text-4xl font-black tracking-[0.3em] text-cyber-red mb-2">
                {compileStatus}
              </div>
              <div className="text-xs text-gray-500 font-mono">COMPILING...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-4 md:p-6 max-w-full">
        {/* Header with Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/competition')}
              className="flex items-center gap-2 px-4 py-2 border border-[#39ff14]/40 text-[#39ff14] hover:bg-[#39ff14]/10 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              RETURN TO LOBBY
            </button>

            <div className="flex items-center gap-6">
              <div className="text-center px-6 py-3 border border-[#ff003c]/40 bg-[#ff003c]/5">
                <div className="text-xs text-cyber-red/60 tracking-widest mb-1">LEVEL</div>
                <LevelBadge level={gameState.level} maxLevel={gameState.maxLevel} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-cyber-red" />
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.15em] text-cyber-red text-glow">
              TANK WARFARE
            </h1>
          </div>
          <p className="text-xs text-[#39ff14]/50 tracking-[0.3em]">
            // WRITE C++ CODE TO CONTROL YOUR TANK //
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Code Editor - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="relative border border-[#39ff14]/25 bg-[#0a0a0a]/90 backdrop-blur p-4 box-glow shimmer h-[600px] flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent" />
              <HudCorners size="sm" />

              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#39ff14]/20">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyber-red" />
                  <h2 className="text-sm font-bold tracking-[0.2em] text-cyber-red">CODE DEPLOYMENT</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#39ff14]/50">LVL {gameState.level}</span>
                  <button
                    onClick={() => setCode(getLevelCode(gameState.level))}
                    className="text-xs px-2 py-1 border border-[#39ff14]/40 text-[#39ff14] hover:bg-[#39ff14]/10 flex items-center gap-1 transition-all"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    RESET
                  </button>
                </div>
              </div>

              {/* Level Objective Banner */}
              <div className="mb-2 px-2 py-1.5 bg-black/50 border border-[#39ff14]/15 text-[10px] text-[#39ff14]/70">
                {gameState.level === 1 && '> OBJECTIVE: Navigate to checkpoints at Y: 20, 50, 80. Use moveUp() and moveDown().'}
                {gameState.level === 2 && '> OBJECTIVE: Track and destroy 3 stationary targets. Use enemy.y and fire().'}
                {gameState.level === 3 && '> OBJECTIVE: Block 2 enemy projectiles using activateShield(). Enemy fires at ~2s and ~5s.'}
              </div>

              <div className="flex-1 overflow-hidden">
                <TankCodeEditor value={code} onChange={setCode} height="100%" />
              </div>

              <button
                onClick={submitCode}
                disabled={compiling || gameState.running}
                className="mt-3 w-full px-4 py-3 bg-[#ff003c] text-black font-black tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm"
              >
                <Play className="w-4 h-4 group-hover:animate-pulse" />
                COMPILE & RUN
              </button>
            </div>
          </motion.div>

          {/* Battle Arena - Center/Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="relative border border-[#39ff14]/25 bg-[#1a1a1a]/90 backdrop-blur p-4 box-glow shimmer">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent" />
              <HudCorners size="sm" />

              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#39ff14]/20">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyber-red" />
                  <h2 className="text-sm font-bold tracking-[0.2em] text-cyber-red">BATTLE ARENA</h2>
                </div>
                {/* Mini status in header */}
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  {gameState.level === 1 && (
                    <span className="text-cyan-400">CP: {gameState.currentCheckpoint}/3</span>
                  )}
                  {gameState.level === 2 && (
                    <span className="text-cyan-400">TARGETS: {gameState.targetsDestroyed}/3</span>
                  )}
                  {gameState.level === 3 && (
                    <span className="text-cyan-400">SHIELD: {gameState.player.shieldCount}/2</span>
                  )}
                  <span className="text-[#39ff14]/60">HP: {Math.floor(gameState.player.hp)}%</span>
                </div>
              </div>

              {/* Game Board */}
              <div className="relative w-full bg-cyber-gray border border-white/10 overflow-hidden mb-4" style={{ height: '450px'}}>
                {/* Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{backgroundColor: '#0f1419'}}>
                  {/* Horizontal grid lines */}
                  <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#39ff14" strokeWidth="0.5" strokeDasharray="4,8" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#39ff14" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#39ff14" strokeWidth="0.5" strokeDasharray="4,8" />
                  {/* Vertical guide lines */}
                  <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#39ff14" strokeWidth="0.5" opacity="0.3" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#39ff14" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.3" />
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#ff003c" strokeWidth="0.5" opacity="0.3" />
                  <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#ff003c" strokeWidth="0.5" opacity="0.3" />
                </svg>

                {/* Player HP Bar - compact bottom-left */}
                <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2">
                  <span className="text-[9px] text-[#39ff14]/70 font-mono">YOU</span>
                  <div className="w-24 h-1.5 bg-black/80 border border-[#39ff14]/20">
                    <div className="h-full transition-all duration-300" style={{
                      width: `${gameState.player.hp}%`,
                      backgroundColor: gameState.player.hp > 60 ? '#39ff14' : gameState.player.hp > 30 ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                  <span className="text-[9px] font-mono" style={{color: gameState.player.hp > 60 ? '#39ff14' : gameState.player.hp > 30 ? '#f59e0b' : '#ef4444'}}>{Math.floor(gameState.player.hp)}%</span>
                </div>

                {/* Enemy Status - compact bottom-right (Level 3) */}
                {gameState.level === 3 && (
                  <div className="absolute bottom-2 right-2 z-20 flex items-center gap-2">
                    <span className="text-[9px] text-red-400/70 font-mono">FOE</span>
                    <div className="w-24 h-1.5 bg-black/80 border border-red-400/20 flex items-center">
                      <div className="h-full transition-all duration-300 bg-red-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-[9px] text-red-400 font-mono">READY</span>
                  </div>
                )}

                {/* Shield indicator on player (Level 3) */}
                {gameState.player.shieldActive && (
                  <div className="absolute bottom-5 left-2 z-20 text-[9px] text-cyan-400 font-mono animate-pulse">
                    SHIELD ACTIVE
                  </div>
                )}

                {/* Checkpoints (Level 1) - in center, tank moves to cross them */}
                {gameState.level === 1 && gameState.checkpoints.map((cp, i) => (
                  <motion.div
                    key={`cp-${i}`}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: '50%',
                      top: `${cp.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5
                    }}
                  >
                    <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${
                      cp.visited ? 'border-[#39ff14] bg-[#39ff14]/15' : 'border-cyan-400 bg-cyan-400/5 animate-pulse'
                    }`} style={{
                      boxShadow: cp.visited ? '0 0 16px rgba(57,255,20,0.7)' : '0 0 16px rgba(0,255,255,0.5)'
                    }}>
                      <span className={`text-sm font-bold ${cp.visited ? 'text-[#39ff14]' : 'text-cyan-400'}`}>
                        {cp.visited ? '✓' : (i + 1)}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Moving Targets (Level 2) */}
                {gameState.level === 2 && gameState.targets.map((target) => (
                  target.active && (
                    <div
                      key={`target-${target.id}`}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `${target.x}%`,
                        top: `${target.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5,
                        transition: 'top 0.05s linear'
                      }}
                    >
                      <svg viewBox="0 0 100 60" className="w-12 h-8" style={{
                        filter: 'drop-shadow(0 0 12px rgba(255,0,0,0.8))'
                      }}>
                        <circle cx="50" cy="30" r="25" stroke="#ff0000" strokeWidth="2" fill="none" />
                        <circle cx="50" cy="30" r="16" stroke="#ff3333" strokeWidth="1.5" fill="none" />
                        <circle cx="50" cy="30" r="8" fill="#ff0000" opacity="0.9"/>
                        <rect x="35" y="28" width="30" height="4" fill="#ff3333" />
                        <rect x="48" y="15" width="4" height="30" fill="#ff3333" />
                      </svg>
                    </div>
                  )
                ))}

                {/* Level Complete Overlay */}
                <AnimatePresence>
                  {levelComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="text-center"
                      >
                        <CheckCircle className="w-16 h-16 text-[#39ff14] mx-auto mb-4 animate-pulse" />
                        <h3 className="text-3xl font-black text-[#39ff14] text-glow mb-2">
                          {gameState.level < gameState.maxLevel ? '✓ LEVEL COMPLETE' : '✓ ALL LEVELS CLEARED!'}
                        </h3>
                        <p className="text-sm text-[#39ff14]/70 mb-2">HP Remaining: {Math.floor(gameState.player.hp)}%</p>
                        <div className="text-xs text-[#39ff14]/60 mb-4 font-mono">
                          <div>BASE: 100 pts</div>
                          <div>HP BONUS: {Math.floor(gameState.player.hp / 100 * 50)} pts</div>
                          <div>TIME BONUS: -- pts</div>
                          <div className="border-t border-[#39ff14]/20 mt-2 pt-2 text-[#39ff14]">ESTIMATED: ~{100 + Math.floor(gameState.player.hp / 100 * 50)} pts</div>
                        </div>
                        {gameState.level < gameState.maxLevel ? (
                          <button
                            onClick={nextLevel}
                            className="px-8 py-3 bg-cyber-red text-black font-bold tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                          >
                            <Zap className="w-4 h-4" />
                            LEVEL {gameState.level + 1}
                          </button>
                        ) : (
                          <button
                            onClick={finishGame}
                            className="px-8 py-3 bg-[#39ff14] text-black font-bold tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                          >
                            RETURN TO LOBBY
                          </button>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Game Over Overlay */}
                <AnimatePresence>
                  {gameOver && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="text-center"
                      >
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-3xl font-black text-red-500 text-glow mb-4">MISSION FAILED</h3>
                        <p className="text-sm text-gray-400 mb-6">Your tank was destroyed. Retry or redeploy code.</p>
                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={retryGame}
                            className="px-6 py-3 bg-yellow-600 text-black font-bold tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            RETRY
                          </button>
                          <button
                            onClick={() => { setGameOver(false); resetGame(); }}
                            className="px-6 py-3 bg-cyber-red text-black font-bold tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2"
                          >
                            <Code2 className="w-4 h-4" />
                            REDEPLOY
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Player Tank */}
                <div
                  className="absolute z-10"
                  style={{
                    left: `${gameState.player.x}%`,
                    top: `${gameState.player.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '64px',
                    height: '64px',
                    willChange: 'left, top'
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,0,0.8))' }}>
                    {/* Tank treads */}
                    <rect x="10" y="10" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#00ff00" strokeWidth="1.5"/>
                    <rect x="10" y="72" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#00ff00" strokeWidth="1.5"/>
                    {/* Tank body */}
                    <rect x="20" y="25" width="60" height="50" rx="4" fill="#004d00" stroke="#00ff00" strokeWidth="1.5"/>
                    {/* Turret */}
                    <circle cx="50" cy="50" r="14" fill="#006600" stroke="#00ff00" strokeWidth="1.5"/>
                    {/* Barrel */}
                    <rect x="50" y="46" width="38" height="8" fill="#00ff00"/>
                  </svg>
                  {gameState.player.shieldActive && (
                    <div
                      className="absolute inset-0 border-2 border-cyan-400 rounded-full opacity-75 animate-pulse"
                      style={{ transform: 'scale(1.35)', boxShadow: '0 0 25px rgba(34,211,238,0.9)' }}
                    />
                  )}
                </div>

                {/* Enemy Tank (Level 3 Only) */}
                {gameState.level === 3 && (
                  <div
                    className="absolute z-10"
                    style={{
                      left: '85%',
                      top: `${gameState.enemy.y}%`,
                      transform: 'translate(-50%, -50%) scaleX(-1)',
                      width: '64px',
                      height: '64px',
                      willChange: 'top'
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.8))' }}>
                      <rect x="10" y="10" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#ff0000" strokeWidth="1.5"/>
                      <rect x="10" y="72" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#ff0000" strokeWidth="1.5"/>
                      <rect x="20" y="25" width="60" height="50" rx="4" fill="#4d0000" stroke="#ff0000" strokeWidth="1.5"/>
                      <circle cx="50" cy="50" r="14" fill="#660000" stroke="#ff0000" strokeWidth="1.5"/>
                      <rect x="50" y="46" width="38" height="8" fill="#ff0000"/>
                    </svg>
                    {gameState.enemy.shieldActive && (
                      <div
                        className="absolute inset-0 border-2 border-cyan-400 rounded-full opacity-75 animate-pulse"
                        style={{ transform: 'scale(1.35)', boxShadow: '0 0 25px rgba(34,211,238,0.9)' }}
                      />
                    )}
                  </div>
                )}

                {/* Projectiles */}
                {gameState.projectiles.map((p, i) => (
                  <div
                    key={`proj-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 15
                    }}
                  >
                    {/* Glow trail */}
                    <div style={{
                      position: 'absolute',
                      left: p.isPlayer ? '-16px' : '0',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '24px',
                      height: '6px',
                      background: p.isPlayer
                        ? 'linear-gradient(to right, transparent, rgba(0,255,0,0.6))'
                        : 'linear-gradient(to left, transparent, rgba(255,0,0,0.6))',
                      filter: 'blur(2px)'
                    }} />
                    {/* Projectile body */}
                    <div style={{
                      width: '14px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: p.isPlayer ? '#00ff00' : '#ff0000',
                      boxShadow: p.isPlayer
                        ? '0 0 10px #00ff00, 0 0 20px rgba(0,255,0,0.5)'
                        : '0 0 10px #ff0000, 0 0 20px rgba(255,0,0,0.5)',
                    }} />
                  </div>
                ))}

                {/* Explosions */}
                {explosions.map((exp) => (
                  <motion.div
                    key={exp.id}
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${exp.x}%`,
                      top: `${exp.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 15
                    }}
                  >
                    <div className="w-6 h-6 rounded-full" style={{
                      background: 'radial-gradient(circle, #ff0, #f80, #f00, transparent)',
                      boxShadow: '0 0 20px #f80, 0 0 40px #f00'
                    }} />
                  </motion.div>
                ))}
              </div>

              {/* Battle Log */}
              <div className="font-mono text-xs text-center h-6 px-3 py-1 border-t border-[#39ff14]/20 text-cyan-300 flex items-center justify-center">
                {battleLog}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Bar at Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-[#39ff14]/25 bg-[#0a0a1a]/80 backdrop-blur p-4 box-glow text-xs mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="border-r border-[#39ff14]/20 pr-4">
              <div className="text-[#39ff14]/60 mb-1">STRATEGY</div>
              <div className="text-[#39ff14] font-mono font-bold">
                {gameState.playerStrategy.moveMode.toUpperCase()} / {gameState.playerStrategy.fireMode.toUpperCase()} / {gameState.playerStrategy.shieldMode.toUpperCase()}
              </div>
            </div>
            <div className="border-r border-[#39ff14]/20 pr-4">
              <div className="text-[#39ff14]/60 mb-1">STATUS</div>
              <div className="text-[#39ff14] font-mono font-bold">
                {gameState.running ? 'ENGAGED' : gameState.deployed ? 'IDLE' : 'READY'}
              </div>
            </div>
            <div className="border-r border-[#39ff14]/20 pr-4">
              <div className="text-[#39ff14]/60 mb-1">COMBAT</div>
              <div className="text-[#39ff14] font-mono font-bold">
                {gameState.projectiles.length} PROJECTILES
              </div>
            </div>
            <div>
              <div className="text-[#39ff14]/60 mb-1">STATE</div>
              <div className={`font-mono font-bold ${gameState.player.hp > 30 ? 'text-[#39ff14]' : gameState.player.hp > 0 ? 'text-yellow-400' : 'text-red-500'}`}>
                {gameState.player.hp > 0 ? 'OPERATIONAL' : 'DOWN'}
              </div>
            </div>
            <div className="border-l border-[#39ff14]/20 pl-4">
              <div className="text-[#39ff14]/60 mb-1">OBJECTIVE</div>
              <div className="text-[#39ff14] font-mono font-bold">
                {gameState.level === 1 && 'REACH ALL CHECKPOINTS'}
                {gameState.level === 2 && 'DESTROY ALL TARGETS'}
                {gameState.level === 3 && 'BLOCK ALL PROJECTILES'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Architect Credits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-[#39ff14]/15 bg-[#0a0a0a]/60 backdrop-blur p-4 text-center max-w-3xl mx-auto"
        >
          <div className="text-[9px] text-[#39ff14]/30 mb-3">
            <span className="text-[#39ff14]/50">$</span> cat /sys/architects
          </div>
          {/* Tier 1 */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-mono" style={{color:'rgba(251,191,36,0.7)'}}>◈</span>
              <span className="font-black text-[11px] tracking-[0.18em]" style={{color:'#fbbf24', textShadow:'0 0 10px rgba(251,191,36,0.8)'}}>ZOHAIR SHAMSI</span>
              <span className="text-[6px] font-mono px-1 py-px tracking-[0.2em]" style={{color:'rgba(251,191,36,0.5)', border:'1px solid rgba(251,191,36,0.22)'}}>&lt;ARCH&gt;</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono" style={{color:'rgba(251,191,36,0.7)'}}>◈</span>
              <span className="font-black text-[11px] tracking-[0.18em]" style={{color:'#fbbf24', textShadow:'0 0 10px rgba(251,191,36,0.8)'}}>UMER KHAN</span>
              <span className="text-[6px] font-mono px-1 py-px tracking-[0.2em]" style={{color:'rgba(251,191,36,0.5)', border:'1px solid rgba(251,191,36,0.22)'}}>&lt;ARCH&gt;</span>
            </div>
          </div>
          <div className="text-[8px] text-white/10 tracking-widest text-center my-0.5">────────────────────</div>
          {/* Tier 2 */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="text-[13px] font-mono font-bold" style={{color:'rgba(0,229,255,0.75)'}}>{'>#'}</span>
            <span className="font-bold text-[11px] tracking-[0.15em]" style={{color:'#00e5ff', textShadow:'0 0 8px rgba(0,229,255,0.8)'}}>TAHA ANWAR</span>
            <span className="text-[7px] font-mono border border-[#00e5ff]/20 px-1.5 py-px tracking-[0.2em]" style={{color:'rgba(0,229,255,0.45)'}}>#ROOT</span>
          </div>
          <div className="text-[8px] text-white/10 tracking-widest text-center my-0.5">────────────────────</div>
          {/* Tier 3 */}
          <div className="flex items-center justify-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-[#39ff14]/80 tracking-[0.1em]"><span className="font-mono text-[#39ff14]/50">▸</span> RUMESA IQBAL <span className="text-[#39ff14]/40 text-[7px] font-mono border border-[#39ff14]/15 px-1 py-px">::DEV</span></span>
            <span className="text-[#39ff14]/15">│</span>
            <span className="flex items-center gap-1 text-[#39ff14]/80 tracking-[0.1em]"><span className="font-mono text-[#39ff14]/50">▸</span> MASHAL ZAHRA <span className="text-[#39ff14]/40 text-[7px] font-mono border border-[#39ff14]/15 px-1 py-px">::DEV</span></span>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
