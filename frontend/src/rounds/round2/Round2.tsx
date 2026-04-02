import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Shield, Target, Zap, AlertTriangle, Code2, Cpu, AlertCircle, CheckCircle, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TacticalBackground from '../../components/TacticalBackground';
import api from '../../api/axios';

interface GameState {
  level: number;
  maxLevel: number;
  running: boolean;
  deployed: boolean;
  player: {
    y: number;
    hp: number;
    shield: number;
    maxHp: number;
    maxShield: number;
    cooldown: number;
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
}

const defaultCode = `#include <iostream>
#include "Tank.h"

class MyTank : public Tank {
public:
    void move() override {
        // LEVEL 1: Learn movement
        // Move your tank to reach checkpoints
        if (this->y < 50) {
            moveDown();  // Move towards target
        } else {
            moveUp();    // Or move up
        }
    }

    void attack() override {
        // You'll learn firing in Level 2
    }

    void defend() override {
        // You'll learn defense in Level 3
    }
};`;

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
    { text: '  LEVEL 3 ›  DEFENSE       [Learn activateShield() + Fight MAKAROV]', type: 'rule' },
    { text: '', type: 'blank' },
    { text: '══ ROUND 2 STRUCTURE ══', type: 'header' },
    { text: '  Each level teaches one core mechanic.', type: 'rule' },
    { text: '  Level 3 combines everything: your full tank vs MAKAROV.', type: 'rule' },
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

      <style jsx>{`
        .cyber-red { color: #ff003c; }
        .bg-cyber-red { background-color: #ff003c; }
        .text-cyber-red { color: #ff003c; }
        .text-glow { text-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
        .box-glow { box-shadow: 0 0 30px rgba(57,255,20,0.2), inset 0 0 20px rgba(57,255,20,0.05); }
        .shimmer { animation: shimmer 3s infinite; }
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.98; } }
        .breathe-glow { animation: breathe 4s infinite; }
        @keyframes breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .scanlines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(57,255,20,0.03) 2px,
            rgba(57,255,20,0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .crt-flicker { animation: flicker 0.15s infinite; }
        @keyframes flicker {
          0% { opacity: 0.98; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
      `}</style>
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
  const [code, setCode] = useState(defaultCode);
  const [battleLog, setBattleLog] = useState('> READY TO DEPLOY');
  const [compiling, setCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState('');
  const [levelComplete, setLevelComplete] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const enemyTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    maxLevel: 3,
    running: false,
    deployed: false,
    player: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, cooldown: 0 },
    enemy: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, dir: 1, cooldown: 0, shieldActive: false, shieldCount: 0 },
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
        player: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, cooldown: 0 },
        enemy: { y: 50, hp: 100, shield: 0, maxHp: 100, maxShield: 100, dir: 1, cooldown: 0, shieldActive: false, shieldCount: 0 },
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
        log("LEVEL 2: Destroy all 3 moving targets");
      } else if (prev.level === 3) {
        // Enemy tank starts at Y: 50, will activate shield start when low HP
        newState.enemy.shieldCount = 0;
        log("LEVEL 3: Defeat the enemy tank");
      }

      return newState;
    });
    setLevelComplete(false);
  }, [log]);

  // Calculate level-specific game logic (pure function)
  const calculateLevelLogic = useCallback((
    gameStateSnapshot: GameState,
    dt: number
  ) => {
    const newState = { ...gameStateSnapshot };
    enemyTimeRef.current += dt;

    if (gameStateSnapshot.level === 1) {
      // Level 1: Check if player reached the current checkpoint
      const checkpoint = newState.checkpoints[newState.currentCheckpoint];
      if (checkpoint) {
        const distance = Math.abs(gameStateSnapshot.player.y - checkpoint.y);
        if (distance < 3) {
          checkpoint.visited = true;
          newState.currentCheckpoint += 1;
          if (newState.currentCheckpoint >= newState.checkpoints.length) {
            // All checkpoints visited - WIN!
            newState.running = false;
            newState.player.hp = 100; // Victory condition
            setLevelComplete(true);
            log("ALL CHECKPOINTS REACHED: LEVEL 1 COMPLETE");
          } else {
            log(`CHECKPOINT ${newState.currentCheckpoint} REACHED`);
          }
        }
      }
    } else if (gameStateSnapshot.level === 2) {
      // Level 2: Move targets with sine wave and check collisions
      newState.targets = newState.targets.map(target => ({
        ...target,
        y: target.y + Math.sin(enemyTimeRef.current * 0.8 + target.id) * 0.5,
        active: target.active
      }));

      // Clamp target positions
      newState.targets = newState.targets.map(t => ({
        ...t,
        y: Math.max(10, Math.min(90, t.y))
      }));

      // Check if all targets destroyed
      const allDestroyed = newState.targets.every(t => !t.active);
      if (allDestroyed && newState.targetsDestroyed >= 3) {
        newState.running = false;
        setLevelComplete(true);
        log("ALL TARGETS ELIMINATED: LEVEL 2 COMPLETE");
      }
    } else if (gameStateSnapshot.level === 3) {
      // Level 3: Enemy tank erratic movement + AI firing + shield when low HP
      const baseY = 50;
      newState.enemy.y = baseY + Math.sin(enemyTimeRef.current * 1.5) * 30 + Math.sin(enemyTimeRef.current * 2.3) * 15;
      newState.enemy.y = Math.max(10, Math.min(90, newState.enemy.y));

      // Enemy fires logic
      newState.enemy.cooldown -= dt;
      const fireThreshold = 16;
      if (newState.enemy.cooldown <= 0 && Math.abs(newState.enemy.y - gameStateSnapshot.player.y) < fireThreshold) {
        newState.enemy.cooldown = 0.7;
        newState.projectiles.push({
          x: 85,
          y: newState.enemy.y,
          isPlayer: false
        });
      }

      // Enemy shield auto-activation when low HP
      if (gameStateSnapshot.enemy.hp < 40 && gameStateSnapshot.enemy.shieldCount < 2 && !gameStateSnapshot.enemy.shieldActive) {
        newState.enemy.shieldActive = true;
        newState.enemy.shieldCount += 1;
        newState.enemy.shield = 100;
        log(`ENEMY SHIELD ACTIVE (${3}s, USE ${newState.enemy.shieldCount}/2)`);

        // Auto-deactivate after 3 seconds
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            enemy: { ...prev.enemy, shieldActive: false, shield: 0 }
          }));
        }, 3000);
      }
    }

    return newState;
  }, [log]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameState.running) return;

    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setGameState(prev => {
      let newState = calculateLevelLogic(prev, dt);
      const playerMoveSpeed = 60;

      // ===== PLAYER MOVEMENT =====
      if (prev.playerStrategy.moveMode === 'track') {
        const playerMoveSpeed = 60;
        
        if (prev.level === 1) {
          // LEVEL 1: Track checkpoint, not enemy
          const checkpoint = prev.checkpoints[prev.currentCheckpoint];
          if (checkpoint) {
            const diff = checkpoint.y - prev.player.y;
            if (Math.abs(diff) > 1.5) {
              newState.player.y += Math.sign(diff) * playerMoveSpeed * dt;
            }
          }
        } else {
          // LEVEL 2+: Track enemy
          const diff = prev.enemy.y - prev.player.y;
          if (Math.abs(diff) > 1.5) {
            newState.player.y += Math.sign(diff) * playerMoveSpeed * dt;
          }
        }
      } else if (prev.playerStrategy.moveMode === 'up') {
        newState.player.y -= playerMoveSpeed * dt;
      } else if (prev.playerStrategy.moveMode === 'down') {
        newState.player.y += playerMoveSpeed * dt;
      }

      // Clamp player position
      newState.player.y = Math.max(10, Math.min(90, newState.player.y));

      // ===== PLAYER FIRING & SHIELD =====
      newState.player.cooldown -= dt;
      let shouldFire = false;

      if (prev.playerStrategy.fireMode === 'always') {
        shouldFire = true;
      } else if (prev.playerStrategy.fireMode === 'align') {
        if (prev.level === 3) {
          // Fire when aligned with enemy
          if (Math.abs(prev.enemy.y - prev.player.y) < 14) {
            shouldFire = true;
          }
        } else if (prev.level === 2) {
          // Fire when aligned with any target
          const closestTarget = newState.targets
            .filter(t => t.active)
            .sort((a, b) => Math.abs(a.y - prev.player.y) - Math.abs(b.y - prev.player.y))[0];
          if (closestTarget && Math.abs(closestTarget.y - prev.player.y) < 18) {
            shouldFire = true;
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
            } else if (prev.level === 3) {
              // Level 3: Check hit on enemy
              const hitEnemy = p.x >= 80 && p.x <= 100 && Math.abs(p.y - newState.enemy.y) < 14;
              if (hitEnemy) {
                if (!newState.enemy.shieldActive) {
                  newState.enemy.hp -= 10;
                  log(`HIT! Enemy HP: ${Math.max(0, newState.enemy.hp)}%`);
                } else {
                  log("BLOCKED BY SHIELD!");
                }
                return false;
              }
            }
          } else {
            // Enemy projectile (Level 3 only)
            if (prev.level === 3) {
              const hitPlayer = p.x <= 20 && p.x >= 0 && Math.abs(p.y - newState.player.y) < 12;
              if (hitPlayer) {
                newState.player.hp -= 10;
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
        log("MISSION FAILED: TANK DESTROYED");
      } else if (prev.level === 3 && newState.enemy.hp <= 0) {
        newState.running = false;
        setLevelComplete(true);
        log("ENEMY DEFEATED: LEVEL 3 COMPLETE");
      }

      return newState;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.running, calculateLevelLogic, log]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, running: true, deployed: true }));
    lastTimeRef.current = performance.now();
    enemyTimeRef.current = 0;
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

        // Parse output to determine strategy (level-specific)
        const output = response.data.output;
        let moveMode: 'idle' | 'track' | 'up' | 'down' = 'idle';
        let fireMode: 'none' | 'align' | 'always' = 'none';
        let shieldMode: 'none' | 'smart' = 'none';

        if (gameState.level === 1) {
          // LEVEL 1: Checkpoint Navigation
          // If code can move, use 'track' mode which will follow checkpoints in special Level 1 logic
          if (output.includes('LEVEL1_CHECKPOINT_UP') || output.includes('LEVEL1_CAN_MOVE')) {
            moveMode = 'track';  // Uses checkpoint logic in gameLoop for Level 1
            log('✓ CHECKPOINT NAVIGATION DETECTED');
          }
        } else {
          // LEVEL 2 & 3: Enemy Tracking & Combat
          if (output.includes('TEST_ABOVE:UP') && output.includes('TEST_BELOW:DOWN')) {
            moveMode = 'track';
          } else if (output.includes('TEST_ABOVE:UP') || output.includes('TEST_BELOW:UP')) {
            moveMode = 'up';
          } else if (output.includes('TEST_ABOVE:DOWN') || output.includes('TEST_BELOW:DOWN')) {
            moveMode = 'down';
          }

          if (output.includes('TEST_ATTACK:FIRE')) {
            fireMode = 'align';
          }

          if (output.includes('TEST_DEFEND:SHIELD')) {
            shieldMode = 'smart';
          }
        }

        setTimeout(() => {
          setCompileStatus('DEPLOYMENT SUCCESSFUL');
          setTimeout(() => {
            setCompiling(false);
            resetGame();
            setGameState(prev => ({
              ...prev,
              playerStrategy: { moveMode, fireMode, shieldMode }
            }));
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
      setGameState(prev => ({ ...prev, level: prev.level + 1 }));
      resetGame();
      log(`LEVEL ${gameState.level + 1} READY. DEPLOY CODE.`);
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
              className="text-center border border-cyber-red/50 bg-[#010301]/90 p-8 rounded"
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
              <div className="text-center px-6 py-3 border border-cyber-red/40 bg-cyber-red/5">
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

              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#39ff14]/20">
                <Code2 className="w-5 h-5 text-cyber-red" />
                <h2 className="text-sm font-bold tracking-[0.2em] text-cyber-red">CODE DEPLOYMENT</h2>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-black border border-[#39ff14]/30 text-[#00ff00] font-mono text-xs p-3 resize-none focus:border-cyber-red focus:outline-none overflow-auto"
                spellCheck={false}
              />

              <button
                onClick={submitCode}
                disabled={compiling || gameState.running}
                className="mt-3 w-full px-4 py-2.5 bg-cyber-red text-black font-bold tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
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
                {!gameState.running && !levelComplete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={resetGame}
                    className="text-xs px-3 py-1 border border-[#39ff14]/40 text-[#39ff14] hover:bg-[#39ff14]/10 flex items-center gap-1 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    RESET
                  </motion.button>
                )}
              </div>

              {/* Game Board */}
              <div className="relative w-full bg-cyber-gray border border-white/10 overflow-hidden mb-4" style={{ height: '450px'}}>
                {/* Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{backgroundColor: '#0f1419'}}>
                  {/* Horizontal grid lines for aiming (every 25%) */}
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#39ff14" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#39ff14" strokeWidth="1.5" strokeDasharray="5,5" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#39ff14" strokeWidth="1" strokeDasharray="5,5" />
                  
                  {/* Vertical guide lines */}
                  <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#39ff14" strokeWidth="0.5" opacity="0.3" />
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#ff003c" strokeWidth="0.5" opacity="0.3" />
                  <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#39ff14" strokeWidth="0.5" opacity="0.3" />
                </svg>

                {/* HUD Status Panels */}
                <div className="absolute top-3 left-3 z-20 text-xs font-mono">
                  <div className="border border-[#39ff14]/40 bg-[#010301]/80 p-2 mb-2">
                    <div className="text-[#39ff14] font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> PLAYER</div>
                    <div className="text-white text-[10px] mt-1">HP: <span className="text-[#00ff00]">{Math.floor(gameState.player.hp)}%</span></div>
                    <div className="text-white text-[10px]">Y: <span className="text-cyan-400">{Math.floor(gameState.player.y)}</span></div>
                  </div>
                </div>

                {/* Distance & Status Indicator */}
                <div className="absolute top-3 right-3 z-20 text-xs font-mono text-right">
                  <div className="border border-[#39ff14]/40 bg-[#010301]/80 p-2">
                    <div className="text-[#39ff14] font-bold mb-1">TARGET</div>
                    {gameState.level === 1 && (
                      <>
                        <div className="text-white text-[10px]">CP: {gameState.currentCheckpoint}/3</div>
                        <div className="text-cyan-300 text-[10px]">Dist: {Math.floor(Math.abs(gameState.player.y - gameState.checkpoints[gameState.currentCheckpoint]?.y || 0))}</div>
                      </>
                    )}
                    {gameState.level === 2 && (
                      <>
                        <div className="text-white text-[10px]">Hit: {gameState.targetsDestroyed}/3</div>
                      </>
                    )}
                    {gameState.level === 3 && (
                      <>
                        <div className="text-red-400 text-[10px]">Enemy HP: {Math.floor(gameState.enemy.hp)}%</div>
                        <div className="text-cyan-300 text-[10px]">Dist: {Math.floor(Math.abs(gameState.player.y - gameState.enemy.y))}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Checkpoints (Level 1) */}
                {gameState.level === 1 && gameState.checkpoints.map((cp, i) => (
                  <motion.div
                    key={`cp-${i}`}
                    className="absolute w-8 h-8 flex items-center justify-center"
                    style={{
                      left: '50%',
                      top: `${cp.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5
                    }}
                  >
                    <div className={`w-full h-full rounded-lg border-2 flex items-center justify-center ${
                      cp.visited ? 'border-[#39ff14] bg-[#39ff14]/10' : 'border-cyan-400 bg-cyan-400/5 animate-pulse'
                    }`} style={{
                      boxShadow: cp.visited ? '0 0 12px rgba(57,255,20,0.6)' : '0 0 12px rgba(0,255,255,0.4)'
                    }}>
                      <span className={`text-xs font-bold ${cp.visited ? 'text-[#39ff14]' : 'text-cyan-400'}`}>{i + 1}</span>
                    </div>
                  </motion.div>
                ))}

                {/* Moving Targets (Level 2) */}
                {gameState.level === 2 && gameState.targets.map((target) => (
                  target.active && (
                    <motion.div
                      key={`target-${target.id}`}
                      animate={{ y: `${target.y}%` }}
                      transition={{ type: 'tween', duration: 0.05 }}
                      className="absolute w-10 h-6 flex items-center justify-center"
                      style={{
                        left: `${target.x}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5
                      }}
                    >
                      <svg viewBox="0 0 100 60" className="w-full h-full" style={{
                        filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.6))'
                      }}>
                        {/* Target shape */}
                        <circle cx="50" cy="30" r="20" stroke="#ff0000" strokeWidth="2" fill="none" />
                        <circle cx="50" cy="30" r="14" stroke="#ff3333" strokeWidth="1.5" fill="none" />
                        <circle cx="50" cy="30" r="8" fill="#ff0000" opacity="0.8"/>
                        <rect x="40" y="28" width="20" height="4" fill="#ff3333" />
                        <rect x="48" y="20" width="4" height="20" fill="#ff3333" />
                      </svg>
                    </motion.div>
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
                        <h3 className="text-3xl font-black text-[#39ff14] text-glow mb-4">
                          {gameState.level < gameState.maxLevel ? '✓ LEVEL COMPLETE' : '✓ ALL LEVELS CLEARED!'}
                        </h3>
                        {gameState.level < gameState.maxLevel && (
                          <button
                            onClick={nextLevel}
                            className="px-8 py-3 bg-cyber-red text-black font-bold tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                          >
                            <Zap className="w-4 h-4" />
                            LEVEL {gameState.level + 1}
                          </button>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Player Tank */}
                <motion.div
                  animate={{ y: `${gameState.player.y}%` }}
                  transition={{ type: 'tween', duration: 0.05 }}
                  className="absolute w-16 h-16 z-10"
                  style={{ left: '8%', transform: 'translate(-50%, -50%)', top: 0 }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,0,0.6))' }}>
                    <rect x="10" y="10" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#00ff00" strokeWidth="1.5"/>
                    <rect x="10" y="72" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#00ff00" strokeWidth="1.5"/>
                    <rect x="20" y="25" width="60" height="50" rx="4" fill="#004d00" stroke="#00ff00" strokeWidth="1.5"/>
                    <circle cx="50" cy="50" r="14" fill="#006600" stroke="#00ff00" strokeWidth="1.5"/>
                    <rect x="50" y="46" width="38" height="8" fill="#00ff00"/>
                  </svg>
                  <div className="text-center text-[10px] text-[#39ff14] mt-1 font-mono font-bold">YOU</div>
                </motion.div>

                {/* Enemy Tank (Level 3 Only) */}
                {gameState.level === 3 && (
                  <motion.div
                    animate={{ y: `${gameState.enemy.y}%` }}
                    transition={{ type: 'tween', duration: 0.05 }}
                    className="absolute w-16 h-16 z-10"
                    style={{ left: '92%', transform: 'translate(-50%, -50%) scaleX(-1)', top: 0 }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(255,0,0,0.6))' }}>
                      <rect x="10" y="10" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#ff0000" strokeWidth="1.5"/>
                      <rect x="10" y="72" width="80" height="18" rx="4" fill="#1a1a1a" stroke="#ff0000" strokeWidth="1.5"/>
                      <rect x="20" y="25" width="60" height="50" rx="4" fill="#4d0000" stroke="#ff0000" strokeWidth="1.5"/>
                      <circle cx="50" cy="50" r="14" fill="#660000" stroke="#ff0000" strokeWidth="1.5"/>
                      <rect x="50" y="46" width="38" height="8" fill="#ff0000"/>
                    </svg>
                    {gameState.enemy.shieldActive && (
                      <div 
                        className="absolute inset-0 border-2 border-cyan-400 rounded-full opacity-75 animate-pulse"
                        style={{ transform: 'scale(1.35)', boxShadow: '0 0 20px rgba(34,211,238,0.8)' }}
                      />
                    )}
                    <div className="text-center text-[10px] text-red-500 mt-1 font-mono font-bold" style={{ transform: 'scaleX(-1)' }}>TARGET</div>
                  </motion.div>
                )}

                {/* Projectiles */}
                {gameState.projectiles.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1 }}
                    animate={{ x: `${p.x}%`, y: `${p.y}%` }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'tween', duration: 0.016 }}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: '10px',
                      height: '6px',
                      backgroundColor: p.isPlayer ? '#00ff00' : '#ff0000',
                      boxShadow: p.isPlayer ? '0 0 8px #00ff00' : '0 0 8px #ff0000',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="border-r border-[#39ff14]/20 pr-4">
              <div className="text-[#39ff14]/60 mb-1">STRATEGY</div>
              <div className="text-[#39ff14] font-mono font-bold">
                {gameState.playerStrategy.moveMode.toUpperCase()} / {gameState.playerStrategy.fireMode.toUpperCase()}
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="w-3 h-3 text-[#39ff14]/60" />
            <span className="text-[#39ff14]/80 font-bold text-[11px] tracking-[0.15em] text-glow">TAHA ANWAR</span>
            <span className="text-[7px] text-[#39ff14]/35 border border-[#39ff14]/15 px-1.5 py-px tracking-[0.2em]">ROOT</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px]">
            <span className="text-[#39ff14]/50 tracking-[0.1em]">MASHAL ZAHRA <span className="text-[#39ff14]/25 text-[7px] border border-[#39ff14]/10 px-1 py-px">SUDO</span></span>
            <span className="text-[#39ff14]/15">│</span>
            <span className="text-[#39ff14]/50 tracking-[0.1em]">RUMESA IQBAL <span className="text-[#39ff14]/25 text-[7px] border border-[#39ff14]/10 px-1 py-px">SUDO</span></span>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .cyber-red { color: #ff003c; }
        .text-cyber-red { color: #ff003c; }
        .bg-cyber-red { background-color: #ff003c; }
        .border-cyber-red { border-color: #ff003c; }
        .cyber-red\/5 { background-color: rgba(255, 0, 60, 0.05); }
        .cyber-red\/40 { border-color: rgba(255, 0, 60, 0.4); }
        .text-glow { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
        .box-glow { box-shadow: 0 0 25px rgba(57,255,20,0.15), inset 0 0 15px rgba(57,255,20,0.03); }
        .shimmer { animation: shimmer 3s infinite; }
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.97; } }
        .breathe-glow { animation: breathe 4s infinite; }
        @keyframes breathe { 0%, 100% { scale: 1; opacity: 1; } 50% { scale: 1.02; opacity: 0.8; } }
        .border-scan { animation: scan 8s infinite; }
        @keyframes scan { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .bg-cyber-gray { background-color: #0f1419; }
        .scanlines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(57,255,20,0.02) 2px,
            rgba(57,255,20,0.02) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .crt-flicker { animation: flicker 0.15s infinite; }
        @keyframes flicker {
          0% { opacity: 0.98; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
      `}</style>
    </div>
  );
}
