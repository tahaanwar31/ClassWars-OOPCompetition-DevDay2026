import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../../data/questions';
import { Terminal, ShieldAlert, Crosshair, Clock, AlertTriangle, Power, Cpu, Database, Target, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TacticalBackground from '../../components/TacticalBackground';
import api from '../../api/axios';

// Format compact C++ code for readable display
const formatCppCode = (code: string): string => {
  // Split into lines first
  let lines = code.split('\n');
  let result: string[] = [];
  let indent = 0;

  for (let line of lines) {
    line = line.trim();
    if (!line) { result.push(''); continue; }

    // Expand multiple statements on one line separated by semicolons
    // but not inside strings or for-loop headers
    // Handle lines like: struct A { A(){cout<<"A";} ~A(){cout<<"~A";} };
    // We'll process brace-blocks within a line

    // If line has both { and } with content between them, expand it
    const expanded = expandBraces(line);
    for (const eLine of expanded) {
      const trimmed = eLine.trim();
      if (!trimmed) continue;

      // Decrease indent for lines starting with }
      if (trimmed.startsWith('}') || trimmed.startsWith('};')) {
        indent = Math.max(0, indent - 1);
      }

      result.push('  '.repeat(indent) + trimmed);

      // Increase indent for lines ending with {
      if (trimmed.endsWith('{')) {
        indent++;
      }
    }
  }

  return result.join('\n');
};

// Expand a single line that contains inline brace blocks
const expandBraces = (line: string): string[] => {
  const trimmed = line.trim();

  // Don't expand empty braces like {}
  // Don't expand simple class/struct forward declarations
  if (!trimmed.includes('{') || !trimmed.includes('}')) return [trimmed];

  // Don't expand if it's just empty braces: {}
  if (trimmed.match(/\{\s*\}/)) return [trimmed];

  const results: string[] = [];
  let current = '';
  let depth = 0;
  let i = 0;

  while (i < trimmed.length) {
    const ch = trimmed[i];

    if (ch === '"') {
      // Skip string literals
      current += ch;
      i++;
      while (i < trimmed.length && trimmed[i] !== '"') {
        if (trimmed[i] === '\\') { current += trimmed[i]; i++; }
        current += trimmed[i];
        i++;
      }
      if (i < trimmed.length) { current += trimmed[i]; i++; }
      continue;
    }

    if (ch === '{') {
      if (depth === 0) {
        // Check if the block content is non-trivial
        const closeIdx = findMatchingBrace(trimmed, i);
        if (closeIdx !== -1) {
          const inner = trimmed.slice(i + 1, closeIdx).trim();
          if (inner.length > 0) {
            // Push the header with {
            results.push(current.trim() + ' {');
            // Push inner content (may contain multiple statements)
            const statements = splitStatements(inner);
            for (const s of statements) {
              if (s.trim()) results.push(s.trim());
            }
            // Everything after the closing brace
            const after = trimmed.slice(closeIdx + 1).trim();
            if (after === ';' || after === '};') {
              results.push('}' + after);
            } else if (after) {
              results.push('}');
              // Recursively expand the rest
              const rest = expandBraces(after);
              results.push(...rest);
            } else {
              results.push('}');
            }
            return results;
          }
        }
      }
      depth++;
      current += ch;
    } else if (ch === '}') {
      depth--;
      current += ch;
    } else {
      current += ch;
    }
    i++;
  }

  // No expansion needed
  if (results.length === 0) return [trimmed];
  return results;
};

// Find matching closing brace
const findMatchingBrace = (str: string, openIdx: number): number => {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '"') {
      i++;
      while (i < str.length && str[i] !== '"') {
        if (str[i] === '\\') i++;
        i++;
      }
      continue;
    }
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

// Split inner block content into separate statements
const splitStatements = (inner: string): string[] => {
  const results: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '"') {
      current += ch;
      i++;
      while (i < inner.length && inner[i] !== '"') {
        if (inner[i] === '\\') { current += inner[i]; i++; }
        current += inner[i];
        i++;
      }
      if (i < inner.length) current += inner[i];
      continue;
    }
    if (ch === '{') { depth++; current += ch; }
    else if (ch === '}') { depth--; current += ch; if (depth === 0) { results.push(current.trim()); current = ''; } }
    else if (ch === ';' && depth === 0) { current += ch; results.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) results.push(current.trim());
  return results;
};

type BriefingLineType = 'init' | 'ok' | 'header' | 'rule' | 'quote' | 'blank';

interface BriefingLine {
  text: string;
  type: BriefingLineType;
  delay?: number; // ms after this line appears before next line shows
}

const BRIEFING_LINES: BriefingLine[] = [
  { text: '>>> INITIALIZING SECURE CHANNEL...', type: 'init', delay: 350 },
  { text: '[✓] SATELLITE UPLINK ESTABLISHED', type: 'ok', delay: 150 },
  { text: '[✓] TASK FORCE 141 COMMAND NETWORK ONLINE', type: 'ok', delay: 150 },
  { text: '[✓] ENCRYPTION KEY VERIFIED', type: 'ok', delay: 150 },
  { text: '', type: 'blank', delay: 100 },
  { text: '  "The world is on the brink. We don\'t have the luxury of choosing our battles." — Price', type: 'quote', delay: 120 },
  { text: '', type: 'blank', delay: 80 },
  { text: '══ MISSION BRIEFING: OPERATION CODEX ══', type: 'header', delay: 150 },
  { text: '  TARGET : MAKAROV\'S PERSONAL MAINFRAME', type: 'rule', delay: 50 },
  { text: '  STATUS : Ghost & Soap have spliced you into his mobile command terminal.', type: 'rule', delay: 50 },
  { text: '  THREAT : AI-targeting tank with adaptive armor — intercept before deployment.', type: 'rule', delay: 50 },
  { text: '', type: 'blank', delay: 80 },
  { text: '══ OPERATION PARAMETERS ══', type: 'header', delay: 150 },
  { text: '  TIME LIMIT    : 60 Minutes total', type: 'rule', delay: 50 },
  { text: '  QUESTION TIME : 60 Seconds per question', type: 'rule', delay: 50 },
  { text: '  MAX CLEARANCE : Level 10', type: 'rule', delay: 50 },
  { text: '', type: 'blank', delay: 80 },
  { text: '══ RULES OF ENGAGEMENT ══', type: 'header', delay: 150 },
  { text: '  LEVEL UP    : Answer [Level #] questions correctly to breach the next firewall.', type: 'rule', delay: 50 },
  { text: '                e.g. Level 1 = 1 correct  |  Level 2 = 2 correct  |  ...', type: 'rule', delay: 50 },
  { text: '  DEMOTION    : 2 consecutive wrong OR 2 consecutive missed  →  drop 1 level.', type: 'rule', delay: 50 },
  { text: '  TIMEOUT     : Missing a question counts as 1 strike (same as a wrong answer).', type: 'rule', delay: 50 },
  { text: '  WIN         : Highest level reached. Tiebreaker = who reached that level first.', type: 'rule', delay: 50 },
  { text: '', type: 'blank', delay: 80 },
  { text: '══ INTELLIGENCE BREAKDOWN (ROUND 2 PREP) ══', type: 'header', delay: 150 },
  { text: '  LVL 1-3  ›  Foundation Protocols  — OOP Theory & Inheritance Chains', type: 'rule', delay: 50 },
  { text: '  LVL 4    ›  Movement Tactics       — Tank Navigation & Checkpoint Evasion', type: 'rule', delay: 50 },
  { text: '  LVL 5    ›  Offensive Protocols    — Weapon Systems & Targeting Algorithms', type: 'rule', delay: 50 },
  { text: '  LVL 6    ›  Defensive Architecture — Shields, Armor & Damage Mitigation', type: 'rule', delay: 50 },
  { text: '  LVL 7-10 ›  Makarov Engagement     — FINAL BOSS — All techniques combined', type: 'rule', delay: 50 },
  { text: '', type: 'blank', delay: 80 },
  { text: '══ FINAL AUTHORIZATION ══', type: 'header', delay: 150 },
  { text: '  Every level cleared here directly upgrades your Round 2 tank capabilities.', type: 'rule', delay: 50 },
  { text: '  Think fast. Answer faster. Extract maximum intel.', type: 'rule', delay: 50 },
  { text: '  "Bravo Six, going dark."', type: 'quote', delay: 100 },
  { text: '', type: 'blank', delay: 80 },
  { text: '[✓] AUTHORIZATION COMPLETE — AWAITING OPERATOR CONFIRMATION', type: 'ok', delay: 0 },
];

// Round 2 Insights & Code Snippets
const ROUND2_INSIGHTS: {
  [key: number]: { title: string; description: string; snippet?: string; isSnippet: boolean };
} = {
  1: {
    title: '🎯 ROUND 2: STRATEGIC INTEL — WHAT AWAITS YOU',
    description: `
══════════════════════════════════════════════════════════════

INTEL UNLOCKED — ROUND 1 COMPLETE

Round 1 gives you a strategic advantage in Round 2 by
providing important intel; each level you clear unlocks
useful information for what lies ahead.

═══ WHAT IS ROUND 2? ═══
In Round 2, you face MAKAROV — the enemy commander
controlling a tank — while ClassWars gives you your own.
Your objective: DEFEAT THE ENEMY using OOP logic.

═══ HOW IT WORKS ═══
There is a base class called Tank which is inherited
by a child class. The child class overrides three methods:

  → move()            — Move your tank strategically
  → attack() / fire() — Fire at the enemy
  → defend()          — Block incoming projectiles

You must implement your own logic inside these methods
to attack effectively, defend against enemy fire,
and move with precision.

═══ YOUR GOAL ═══
Defeat the enemy by combining:
  • Smart movement
  • Precise attack timing
  • Efficient defense

Each Round 2 level builds on the last.
Study the intel from every Round 1 level carefully.

════════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
  2: {
    title: '� ROUND 2 LEVEL 1 — CHECKPOINT NAVIGATION CODE',
    description: `This code will help you clear Level 1 of Round 2, where you have to cross through all 3 checkpoints on the screen.`,
    snippet: `#include <iostream>        // Includes input-output library
#include "Tank.h"          // Includes the base Tank class

class MyTank : public Tank {   // MyTank inherits from Tank
private:
    int checkpointIndex = 0;   // Keeps track of current checkpoint
    const int checkpoints[3] = {20, 50, 80};  // Y positions of 3 checkpoints

public:
    void move() override {     // Override move() function
        int targetY = checkpoints[checkpointIndex];  // Current target

        // Move down if tank is above target
        if (this->y < targetY - 2) {
            moveDown();        // Increase Y
        }
        // Move up if tank is below target
        else if (this->y > targetY + 2) {
            moveUp();          // Decrease Y
        }

        // If tank reaches checkpoint (within ±2), go to next
        if (abs(this->y - targetY) <= 2) {
            checkpointIndex++; // Move to next checkpoint

            // Reset after last checkpoint
            if (checkpointIndex >= 3) checkpointIndex = 0;
        }
    }

    void attack() override {   // Override attack()
        // No firing in Level 1
    }

    void defend() override {   // Override defend()
        // No defense in Level 1
    }
};`,
    isSnippet: true,
  },
  3: {
    title: '� ROUND 2 LEVEL 2 — FIRE AT TARGETS CODE',
    description: `This code snippet will help you in Level 2 of Round 2, where you have to fire at fixed targets on the screen.`,
    snippet: `#include <iostream>        // Include standard I/O library
#include "Tank.h"          // Include base Tank class

class MyTank : public Tank {   // MyTank inherits from Tank
public:
    void move() override {     // Override the move() function
        // Align your tank vertically with the target (enemy)
        if (this->y < enemy.y - 2) {
            moveDown();        // Move tank down if it's above the enemy
        }
        else if (this->y > enemy.y + 2) {
            moveUp();          // Move tank up if it's below the enemy
        }
        // Tank stops moving when within ±2 units of enemy.y
    }

    void attack() override {   // Override the attack() function
        // Shoot only when aligned closely with the target
        if (abs(this->y - enemy.y) < 10) {
            fire();            // Fire projectile at the target
        }
    }

    void defend() override {   // Override defend() function
        // No defense needed in Level 2
    }
};`,
    isSnippet: true,
  },
  4: {
    title: '💾 ROUND 2 LEVEL 3 — SHIELD & DEFENSE CODE',
    description: `This code will come in handy in Level 3 of Round 2, where a dummy enemy tank fires at you. It teaches you how to defend yourself by activating your shield at the right times.`,
    snippet: `#include <iostream>    // Standard I/O library
#include "Tank.h"      // Include the base Tank class

class MyTank : public Tank {
public:
    void move() override {
        // Level 3 tank does not move
        // All focus is on defending against enemy shots
    }

    void attack() override {
        // Level 3 has no attacks for the player
        // Shield is the only way to survive enemy fire
    }

    void defend() override {
        // This function handles your defensive actions
        // The enemy fires twice: ~2 seconds and ~5 seconds
        // You have exactly 2 shields; each shield blocks 1 projectile

        if (enemy.isFiring()) {  // Check if enemy is shooting at this moment
            activateShield();    // Activate shield to block the projectile
        }
    }
};`,
    isSnippet: true,
  },
  5: {
    title: '⚠️ INTEL INTERCEPT — MAKAROV THREAT ALERT',
    description: `
════════════════════════════════════════════════════════════

WARNING: MAKAROV IS MOBILISING

Wait. Our operatives have picked up movement.
MAKAROV is getting ready.

Do not underestimate him.

He is no ordinary adversary. MAKAROV is a trained
computer scientist — he understands systems, code,
and logic at a level most soldiers never reach.

But that is only half of it.

He also served as Commanding Officer of the
13th Lancers — The Spearhead Regiment of the
Pakistan Army — combining battlefield command
with deep technical expertise.

He knows how tanks think.
He knows how YOU will code.

════════════════════════════════════════════════════════════

Prepare your logic. Sharpen your code.
Round 2 is closer than you think.

════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
  6: {
    title: '🪖 CLASSIFIED INTEL — MAKAROV\'S WEAPON',
    description: `
════════════════════════════════════════════════════════════

CLASSIFIED — EYES ONLY

We've identified MAKAROV's vehicle.

He commands the HAIDER VT-4.

A third-generation plus Main Battle Tank of the
Pakistan Army — an indigenous variant of the
Chinese VT-4 MBT, built by Heavy Industries Taxila.

════════════════════════════════════════════════════════════

THREAT ASSESSMENT:

  Armament   —  125mm smoothbore gun
  Systems    —  Advanced fire-control + hunter-killer
  Armour     —  Composite + explosive reactive armour
  Mobility   —  High-speed, high-maneuverability

One of the most modern and formidable tanks
on the battlefield today.

════════════════════════════════════════════════════════════

You will face him in Round 2.
Your code is your only weapon.

Be very cautious.

════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
  7: {
    title: '�️ MISSION BRIEFING — YOUR TANK AWAITS',
    description: `
════════════════════════════════════════════════════════════

GEAR UP, FASTIAN.

You are about to enter Round 2 — Level 4.

You command the AL-ZARRAR.

A highly agile and heavily armed Main Battle Tank
of the Pakistan Army.

════════════════════════════════════════════════════════════

YOUR ARSENAL:

  Gun        —  125mm smoothbore gun
  Systems    —  Advanced fire-control systems
  Armour     —  Composite + reactive armour
  Mobility   —  High agility, deadly on the battlefield

════════════════════════════════════════════════════════════

Fastians know OOP really well.

You have THREE methods to override:

  → move()
  → attack()
  → defend()

Craft your OOP logic carefully.

Your enemy — MAKAROV — commands "The Haider VT-4."

Defeat him.

════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
  8: {
    title: '⚙️ PREPARING YOUR TANK...',
    description: `
════════════════════════════════════════════════════════════

PREPARING YOUR TANK

════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
  9: {
    title: '� LOADING AMMUNITION...',
    description: `
════════════════════════════════════════════════════════════

LOADING AMMUNITION

════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
  10: {
    title: '⚔️ BATTLE STATIONS — MOVE OUT, MAJOR!',
    description: `
════════════════════════════════════════════════════════════

Prepare yourself!

The battle is about to begin — gear up, Major!

Every second counts.
Every move matters.

The battlefield awaits your command.

Get ready to strike!

════════════════════════════════════════════════════════════
    `,
    isSnippet: false,
  },
};

// Round 2 Insights Modal Component
const Round2InsightModal = ({
  level,
  onClose,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  onClose: () => void;
}) => {
  const insight = ROUND2_INSIGHTS[level];
  const [copied, setCopied] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const title = insight?.title || '';
    let i = 0;
    const timer = setInterval(() => {
      if (i <= title.length) {
        setTypedTitle(title.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowContent(true), 200);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [insight?.title]);

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ background: 'radial-gradient(ellipse at center, rgba(0,20,0,0.95) 0%, rgba(0,0,0,0.98) 100%)' }}
    >
      {/* Animated scan line overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <motion.div
          className="absolute left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.3), transparent)' }}
          animate={{ top: ['-2px', '100vh'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.7, y: 40, rotateX: 15 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.7, y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ perspective: '1000px' }}
      >
        {/* Outer glow frame */}
        <div className="absolute -inset-[2px] rounded-lg opacity-60"
          style={{
            background: 'linear-gradient(135deg, #39ff14, #00e5ff, #39ff14, #ff5f57, #39ff14)',
            backgroundSize: '400% 400%',
            animation: 'borderScan 4s linear infinite',
          }}
        />

        {/* Main card */}
        <div className="relative bg-[#0a0f0a] rounded-lg overflow-hidden border border-lime-500/30">
          {/* Top header bar — terminal style */}
          <div className="flex items-center px-4 py-2 border-b border-lime-500/30"
            style={{ background: 'linear-gradient(90deg, rgba(57,255,20,0.08), rgba(0,229,255,0.05), rgba(57,255,20,0.08))' }}>
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(254,188,46,0.6)]" />
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
            </div>
            <span className="text-lime-500/60 text-xs font-mono flex-1 text-center tracking-widest">
              root@classwars:~/intel/round2/{insight.isSnippet ? 'code' : 'briefing'} — CLASSIFIED
            </span>
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* HUD corners */}
          <div className="absolute top-11 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400/60" />
          <div className="absolute top-11 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400/60" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400/60" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400/60" />

          <div className="p-6">
            {/* Classification stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 1.5, rotate: -10 }}
              animate={{ opacity: 0.12, scale: 1, rotate: -10 }}
              className="absolute top-20 right-8 text-red-500 text-6xl font-black font-mono tracking-[0.3em] pointer-events-none select-none"
            >
              CLASSIFIED
            </motion.div>

            {/* Intel level badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded text-xs font-mono font-bold tracking-widest border"
                style={{
                  background: insight.isSnippet
                    ? 'rgba(0,229,255,0.1)'
                    : 'rgba(255,95,87,0.1)',
                  borderColor: insight.isSnippet
                    ? 'rgba(0,229,255,0.4)'
                    : 'rgba(255,95,87,0.4)',
                  color: insight.isSnippet ? '#00e5ff' : '#ff5f57',
                  boxShadow: insight.isSnippet
                    ? '0 0 10px rgba(0,229,255,0.2)'
                    : '0 0 10px rgba(255,95,87,0.2)',
                }}>
                {insight.isSnippet ? '◈ CODE INTEL' : '◈ FIELD BRIEFING'}
              </div>
              <div className="text-lime-500/40 text-xs font-mono">
                LEVEL {level} / 10
              </div>
              <div className="flex-1" />
              <div className="text-amber-400/60 text-xs font-mono flex items-center gap-1">
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>●</motion.span>
                LIVE FEED
              </div>
            </div>

            {/* Title — typewriter effect */}
            <h2 className="text-xl md:text-2xl font-bold font-mono tracking-wider mb-5 min-h-[2rem]"
              style={{
                color: insight.isSnippet ? '#00e5ff' : '#39ff14',
                textShadow: insight.isSnippet
                  ? '0 0 20px rgba(0,229,255,0.5), 0 0 40px rgba(0,229,255,0.2)'
                  : '0 0 20px rgba(57,255,20,0.5), 0 0 40px rgba(57,255,20,0.2)',
              }}>
              {typedTitle}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-lime-400 ml-1"
              >▌</motion.span>
            </h2>

            {/* Divider with data stream look */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-lime-500/60 via-cyan-500/40 to-transparent" />
              <span className="text-lime-500/30 text-[10px] font-mono">◆ ◆ ◆</span>
              <div className="flex-1 h-px bg-gradient-to-l from-lime-500/60 via-cyan-500/40 to-transparent" />
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-6 max-h-[50vh] overflow-y-auto pr-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#39ff14 transparent',
              }}
            >
              {insight.isSnippet ? (
                <>
                  <p className="text-cyan-300/90 text-sm mb-4 font-mono whitespace-pre-line leading-relaxed px-1"
                    style={{ textShadow: '0 0 8px rgba(0,229,255,0.2)' }}>
                    {insight.description}
                  </p>
                  <div className="relative group">
                    {/* Code block header */}
                    <div className="flex items-center justify-between px-4 py-2 rounded-t border border-b-0 border-lime-500/30"
                      style={{ background: 'rgba(57,255,20,0.05)' }}>
                      <span className="text-lime-500/60 text-xs font-mono">MyTank.cpp</span>
                      <span className="text-lime-500/40 text-xs font-mono">C++</span>
                    </div>
                    <pre className="bg-black/90 border border-lime-500/30 rounded-b p-4 text-lime-300 text-xs overflow-x-auto font-mono leading-relaxed max-h-60 overflow-y-auto"
                      style={{
                        boxShadow: '0 0 20px rgba(57,255,20,0.1), inset 0 0 30px rgba(0,0,0,0.8)',
                        textShadow: '0 0 4px rgba(57,255,20,0.3)',
                      }}>
                      <code>{insight.snippet?.trim()}</code>
                    </pre>
                  </div>
                </>
              ) : (
                <div className="px-2 py-1 font-mono text-sm leading-relaxed"
                  style={{
                    color: '#c8ffc8',
                    textShadow: '0 0 6px rgba(57,255,20,0.15)',
                  }}>
                  <pre className="whitespace-pre-wrap">{insight.description.trim()}</pre>
                </div>
              )}
            </motion.div>

            {/* Bottom info bar */}
            <div className="flex items-center gap-3 mb-5 px-2 py-2 rounded border border-lime-500/20"
              style={{ background: 'rgba(57,255,20,0.03)' }}>
              {insight.isSnippet ? (
                <span className="text-cyan-400/80 text-xs font-mono">
                  <span className="text-amber-400">⚡</span> SAVE THIS CODE — You will need it for Round 2
                </span>
              ) : (
                <span className="text-lime-400/80 text-xs font-mono">
                  <span className="text-red-400">⚠</span> CLASSIFIED INTEL — Read carefully before proceeding
                </span>
              )}
              <div className="flex-1" />
              <span className="text-lime-500/30 text-xs font-mono">{level}/10 UNLOCKED</span>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              {insight.isSnippet && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    navigator.clipboard.writeText(insight.snippet || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-5 py-2.5 font-bold font-mono text-sm rounded transition-all tracking-wider"
                  style={{
                    background: copied
                      ? 'rgba(57,255,20,0.2)'
                      : 'rgba(0,229,255,0.1)',
                    border: `1px solid ${copied ? '#39ff14' : 'rgba(0,229,255,0.4)'}`,
                    color: copied ? '#39ff14' : '#00e5ff',
                    boxShadow: copied
                      ? '0 0 15px rgba(57,255,20,0.3)'
                      : '0 0 10px rgba(0,229,255,0.15)',
                  }}
                >
                  {copied ? '✓ COPIED' : '◈ COPY CODE'}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(57,255,20,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="px-6 py-2.5 font-bold font-mono text-sm rounded transition-all tracking-wider text-black"
                style={{
                  background: 'linear-gradient(135deg, #39ff14, #00e5ff)',
                  boxShadow: '0 0 15px rgba(57,255,20,0.3)',
                }}
              >
                ✓ ACKNOWLEDGED
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BriefingScreen = ({ onStart }: { onStart: () => void }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const skip = useCallback(() => {
    setVisibleCount(BRIEFING_LINES.length);
    setDone(true);
  }, []);

  useEffect(() => {
    if (visibleCount >= BRIEFING_LINES.length) {
      setDone(true);
      return;
    }
    const delay = BRIEFING_LINES[visibleCount].delay ?? 50;
    const timer = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const getLineClass = (type: BriefingLineType): string => {
    switch (type) {
      case 'init':   return 'text-yellow-400 font-bold';
      case 'ok':     return 'text-[#39ff14] font-bold';
      case 'header': return 'text-cyan-400 font-bold tracking-wider mt-1';
      case 'quote':  return 'text-gray-300 italic';
      case 'rule':   return 'text-[#a0f0a0]';
      default:       return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center p-2 md:p-4 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#39ff14]/[0.03] blur-[150px]" />
        <div className="absolute top-[-10%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#39ff14]/[0.015] blur-[100px] breathe-glow" />
      </div>
      <div className="z-10 max-w-3xl w-full bg-[#010a01]/95 backdrop-blur-xl p-6 md:p-8 relative border border-[#39ff14]/25 box-glow max-h-[90vh] flex flex-col shimmer">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent border-scan z-20" />
        <HudCorners />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-[#39ff14]/20 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Target className="w-7 h-7 text-[#39ff14]" />
              <div className="absolute inset-0 bg-[#39ff14]/20 blur-sm rounded-full" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-[0.15em] text-glow">CLASS WARS <span className="text-[#39ff14]/40">//</span> ROUND 1</h1>
          </div>
          {!done && (
            <button
              onClick={skip}
              className="text-xs text-[#39ff14]/60 hover:text-[#39ff14] border border-[#39ff14]/30 hover:border-[#39ff14] px-3 py-1 transition-all duration-150 tracking-widest uppercase"
            >
              [SKIP]
            </button>
          )}
        </div>

        {/* Scrollable briefing lines */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto pr-2 text-xs md:text-sm leading-relaxed space-y-0.5">
          {BRIEFING_LINES.slice(0, visibleCount).map((line, i) => (
            <div key={i} className={line.type === 'blank' ? 'h-2' : getLineClass(line.type)}>
              {line.text}
            </div>
          ))}
          {!done && <span className="inline-block w-2.5 h-3.5 bg-[#39ff14] animate-pulse align-middle ml-1" />}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#39ff14]/15 flex justify-between items-center shrink-0">
          <span className={`text-[10px] tracking-[0.3em] ${ done ? 'text-[#39ff14]/60' : 'text-[#39ff14]/30' }`}>
            {done ? '[✓] ALL SYSTEMS READY' : `DECRYPTING ${visibleCount} / ${BRIEFING_LINES.length}...`}
          </span>
          {done && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="px-6 py-2.5 bg-[#001800] border border-[#39ff14]/60 text-[#39ff14] hover:bg-[#39ff14] hover:text-black hover:border-[#39ff14] transition-all duration-150 uppercase tracking-[0.25em] font-black flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(57,255,20,0.25)] hover:shadow-[0_0_40px_rgba(57,255,20,0.7)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-[#39ff14] -translate-x-full group-hover:translate-x-0 transition-transform duration-150 ease-out" />
              <Cpu className="w-4 h-4 relative z-10 group-hover:animate-spin" />
              <span className="relative z-10">[ INITIATE BREACH ]</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

// Decorative HUD Corners Component
const HudCorners = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => {
  const s = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  const b = size === 'sm' ? 'border-2' : 'border-[3px]';
  return (
    <>
      <div className={`absolute top-0 left-0 ${s} ${b} border-t border-l border-[#39ff14] opacity-80`} />
      <div className={`absolute top-0 right-0 ${s} ${b} border-t border-r border-[#39ff14] opacity-80`} />
      <div className={`absolute bottom-0 left-0 ${s} ${b} border-b border-l border-[#39ff14] opacity-80`} />
      <div className={`absolute bottom-0 right-0 ${s} ${b} border-b border-r border-[#39ff14] opacity-80`} />
    </>
  );
};

// Level badge with animation
const LevelBadge = ({ level }: { level: number }) => (
  <motion.div
    key={level}
    initial={{ scale: 1.4, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="relative flex items-center justify-center"
  >
    <div className="absolute inset-0 rounded-full bg-[#39ff14]/10 pulse-ring" />
    <span className="text-3xl font-black text-white text-glow tabular-nums">{level}</span>
  </motion.div>
);

export default function Round1() {
  const [hasStarted, setHasStarted] = useState(() => {
    try {
      return sessionStorage.getItem('hasSeenBriefing_v2') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showBriefing, setShowBriefing] = useState(() => {
    try {
      return sessionStorage.getItem('hasSeenBriefing_v2') !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime, setTotalTime] = useState(3600); // 1 hour
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showRound2Insight, setShowRound2Insight] = useState(false);
  const [round2InsightLevel, setRound2InsightLevel] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);
  const [questionsByLevel, setQuestionsByLevel] = useState<{ [key: number]: Question[] }>({});
  // Track answered questions PER LEVEL (only exclude if answered while at that level)
  const [answeredByLevel, setAnsweredByLevel] = useState<{ [key: number]: Set<number> }>({});
  // Track the order questions were shown per level so we can replay oldest-first on demotion
  const [shownOrderByLevel, setShownOrderByLevel] = useState<{ [key: number]: number[] }>({});

  // Create or get session when game starts
  const initializeSession = useCallback(async () => {
    try {
      const teamName = localStorage.getItem('teamName');
      if (!teamName) {
        window.location.href = '/';
        return;
      }

      const response = await api.post('/game/session', {
        teamName,
        roundKey: 'round1'
      });

      const session = response.data;
      setSessionId(session._id);
      setLevel(session.currentLevel);
      setPoints(session.totalPoints);
      setCorrectInLevel(session.correctInLevel);
      setConsecutiveWrong(session.consecutiveWrong);
      setTotalTime(session.timeRemaining);
      
      // If session is already completed (e.g., round was finished), go to game over
      if (session.status === 'completed' || session.isFinalized) {
        setGameOver(true);
      }
      
      // Don't use backend's answered questions list — track locally per-level instead
      // This way when demoted, those questions are available again on that level
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, []);

  // Fetch all questions for a specific level from backend
  const fetchQuestionsForLevel = useCallback(async (targetLevel: number): Promise<Question[]> => {
    if (targetLevel < 1) return [];
    try {
      const response = await api.get(`/questions/by-level?level=${targetLevel}&roundKey=round1`);
      const questions = response.data;
      
      if (questions.length > 0) {
        setQuestionsByLevel(prev => ({ ...prev, [targetLevel]: questions }));
        return questions;
      }
      
      // No questions at this level — try the level below (avoids auth-protected admin endpoint)
      if (targetLevel > 1) {
        return fetchQuestionsForLevel(targetLevel - 1);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      return [];
    }
  }, []);

  const pickQuestion = useCallback(async (targetLevel: number) => {
    // Check if we already have questions for this level cached
    let available = questionsByLevel[targetLevel];
    
    // If not cached, fetch from backend
    if (!available || available.length === 0) {
      available = await fetchQuestionsForLevel(targetLevel);
    }
    
    if (available && available.length > 0) {
      // Get the list of questions shown on this specific level
      const levelShown = shownOrderByLevel[targetLevel] || [];
      const levelShownSet = new Set(levelShown);
      
      // 1) Never-shown questions on this level (top priority)
      const neverShown = available.filter(q => !levelShownSet.has(q.id));
      
      let picked: Question;
      
      if (neverShown.length > 0) {
        // Pick randomly from unseen
        picked = neverShown[Math.floor(Math.random() * neverShown.length)];
      } else {
        // All exhausted — recycle oldest-shown first (least likely to remember)
        if (levelShown.length > 0) {
          const oldestId = levelShown[0];
          picked = available.find(q => q.id === oldestId) || available[0];
          // Move it to the end so it won't repeat next time
          const updated = [...levelShown.slice(1), oldestId];
          setShownOrderByLevel(prev => ({ ...prev, [targetLevel]: updated }));
        } else {
          picked = available[0];
        }
      }
      
      // Avoid showing same question as the one just on screen
      if (currentQuestion && picked.id === currentQuestion.id && available.length > 1) {
        const pool = neverShown.length > 1 ? neverShown : available;
        const others = pool.filter(q => q.id !== currentQuestion.id);
        if (others.length > 0) {
          picked = others[Math.floor(Math.random() * others.length)];
        }
      }
      
      // Track that this question was shown on this level
      setShownOrderByLevel(prev => {
        const current = prev[targetLevel] || [];
        const without = current.filter(id => id !== picked.id);
        return { ...prev, [targetLevel]: [...without, picked.id] };
      });
      
      setCurrentQuestion(picked);
      setTimeLeft(60);
      setAnswerInput('');
      setSelectedOption('');
      setFeedback(null);
    } else {
      console.error('No questions available for level', targetLevel);
    }
  }, [questionsByLevel, fetchQuestionsForLevel, shownOrderByLevel, currentQuestion]);

  // Pre-fetch session as soon as component mounts (even during briefing)
  useEffect(() => {
    if (!sessionId) {
      initializeSession();
    }
  }, [sessionId, initializeSession]);

  // Fetch first question once session is ready, and on every level change
  useEffect(() => {
    if (sessionId) {
      setFeedback(null);
      pickQuestion(level);
    }
  }, [sessionId, level]);

  // Timer effect
  useEffect(() => {
    if (!hasStarted || gameOver || feedback || showQuitModal) return;

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });

      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, gameOver, feedback, showQuitModal, level]);

  const handleTimeout = async () => {
    // Record timeout as a miss (counts as a strike) on the server so consecutive misses can demote
    if (!sessionId || !currentQuestion) {
      setFeedback({ message: 'CONNECTION TIMEOUT: DEFENSE MEASURE RECONFIGURED', type: 'warning' });
      setTimeout(() => {
        pickQuestion(level);
      }, 2000);
      return;
    }

    setFeedback({ message: 'CONNECTION TIMEOUT: MISS REGISTERED', type: 'warning' });

    try {
      const response = await api.post(`/game/session/${sessionId}/answer`, {
        questionId: currentQuestion.id,
        answer: 'TIMEOUT',
        isCorrect: false,
      });

      const updatedSession = response.data;

      setPoints(updatedSession.totalPoints);
      setCorrectInLevel(updatedSession.correctInLevel);
      setConsecutiveWrong(updatedSession.consecutiveWrong);

      if (updatedSession.currentLevel < level) {
        // Demoted
        setFeedback({ message: 'SECURITY TRIGGERED: ACCESS DOWNGRADED', type: 'error' });
        setTimeout(() => {
          setLevel(updatedSession.currentLevel);
        }, 1200);
      } else {
        setTimeout(() => {
          setFeedback(null);
          pickQuestion(level);
        }, 800);
      }
    } catch (error) {
      console.error('Failed to record timeout as miss:', error);
      setFeedback({ message: 'CONNECTION ERROR: TIMEOUT NOT RECORDED', type: 'error' });
      setTimeout(() => {
        setFeedback(null);
        pickQuestion(level);
      }, 2000);
    }
  };

  const checkAnswer = (q: Question, ans: string) => {
    if (q.type === 'mcq') return ans === q.correct;
    const normalize = (s: string) => s.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
    return normalize(ans) === normalize(q.correct);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || feedback || !sessionId) return;

    const ans = currentQuestion.type === 'mcq' ? selectedOption : answerInput;
    if (!ans) return;

    const isCorrect = checkAnswer(currentQuestion, ans);

    try {
      // Submit answer to backend
      const response = await api.post(`/game/session/${sessionId}/answer`, {
        questionId: currentQuestion.id,
        answer: ans,
        isCorrect
      });

      const updatedSession = response.data;
      
      // Update local state from server response
      setPoints(updatedSession.totalPoints);
      setCorrectInLevel(updatedSession.correctInLevel);
      setConsecutiveWrong(updatedSession.consecutiveWrong);

      if (isCorrect) {
        if (updatedSession.status === 'completed' || updatedSession.isFinalized) {
          // Round completed — all levels beaten!
          setFeedback({ message: 'ALL FIREWALLS BREACHED: ROUND 1 COMPLETE!', type: 'success' });
          setTimeout(() => {
            setGameOver(true);
          }, 2000);
        } else if (updatedSession.currentLevel > level) {
          // Level up — show Round 2 insights for the just-completed level
          setFeedback({ message: `FIREWALL BREACHED: LEVEL ${updatedSession.currentLevel} UNLOCKED`, type: 'success' });
          
          // Show Round 2 insights/snippets after completing Levels 1-10
          if (level >= 1 && level <= 10) {
            setTimeout(() => {
              setRound2InsightLevel(level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10);
              setShowRound2Insight(true);
            }, 1500);
          }
          
          setTimeout(() => {
            setLevel(updatedSession.currentLevel);
          }, 1000);
        } else {
          setFeedback({ message: 'NODE COMPROMISED: CORRECT', type: 'success' });
          setTimeout(() => {
            setFeedback(null);
            pickQuestion(level);
          }, 800);
        }
      } else {
        if (updatedSession.currentLevel < level) {
          // Level down
          setFeedback({ message: 'SECURITY TRIGGERED: ACCESS DOWNGRADED', type: 'error' });
          setTimeout(() => {
            setLevel(updatedSession.currentLevel);
          }, 1200);
        } else {
          setFeedback({ message: `ACCESS DENIED: INCORRECT (${updatedSession.consecutiveWrong}/2 STRIKES)`, type: 'error' });
          setTimeout(() => {
            setFeedback(null);
            pickQuestion(level);
          }, 800);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setFeedback({ message: 'CONNECTION ERROR: RETRY', type: 'error' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Briefing Screen
  if (showBriefing) {
    return (
      <BriefingScreen
        onStart={() => {
          setShowBriefing(false);
          setHasStarted(true);
          try {
            sessionStorage.setItem('hasSeenBriefing_v2', 'true');
          } catch (e) {}
        }}
      />
    );
  }

  if (gameOver) {
    if (sessionId) {
      api.post(`/game/session/${sessionId}/end`).catch(err => console.error('Failed to end session:', err));
    }

    return (
      <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center p-4 scanlines crt-flicker relative">
        <TacticalBackground />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#39ff14]/[0.03] blur-[150px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 max-w-xl w-full bg-[#010a01]/95 backdrop-blur-md p-10 md:p-14 text-center relative border border-[#39ff14]/30 box-glow shimmer"
        >
          <HudCorners />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent border-scan" />
          <motion.div
            animate={{ filter: ['drop-shadow(0 0 8px rgba(57,255,20,0.5))', 'drop-shadow(0 0 24px rgba(57,255,20,1))', 'drop-shadow(0 0 8px rgba(57,255,20,0.5))'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldAlert className="w-20 h-20 mx-auto mb-6 text-[#39ff14]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-[0.12em] text-glow glitch-text">OPERATION</h1>
          <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-[0.12em] text-glow">CONCLUDED</h1>
          <div className="space-y-3 text-sm mb-8 text-left bg-[#000a00]/90 p-5 border border-[#39ff14]/15">
            <div className="h-px bg-gradient-to-r from-[#39ff14]/30 via-[#39ff14]/10 to-transparent mb-4" />
            <p className="flex justify-between items-center">
              <span className="text-[#39ff14]/50 tracking-widest text-xs">FINAL CLEARANCE LEVEL</span>
              <span className="text-white text-glow text-2xl font-black">{level}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-[#39ff14]/50 tracking-widest text-xs">INTEL EXTRACTED</span>
              <span className="text-white text-glow text-xl font-bold">{points} <span className="text-sm text-[#39ff14]/50">PTS</span></span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-[#39ff14]/50 tracking-widest text-xs">TIME ELAPSED</span>
              <span className="text-white font-bold">{formatTime(3600 - totalTime)}</span>
            </p>
            <div className="h-px bg-gradient-to-r from-[#39ff14]/30 via-[#39ff14]/10 to-transparent mt-2" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                try { sessionStorage.removeItem('hasSeenBriefing_v2'); } catch (e) {}
                window.location.href = '/competition/round1';
              }}
              className="px-8 py-3.5 bg-[#001800] border border-[#39ff14]/50 text-[#39ff14] hover:border-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all duration-150 uppercase tracking-[0.2em] font-black text-sm shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_35px_rgba(57,255,20,0.6)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-[#39ff14] -translate-x-full group-hover:translate-x-0 transition-transform duration-150 ease-out" />
              <span className="relative z-10">[ RESTART ]</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { window.location.href = '/competition'; }}
              className="px-8 py-3.5 bg-black/60 border border-blue-500/40 text-blue-400 hover:border-blue-400 hover:bg-blue-500 hover:text-black transition-all duration-150 uppercase tracking-[0.2em] font-black text-sm relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-blue-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-150 ease-out" />
              <span className="relative z-10">[ RETURN TO LOBBY ]</span>
            </motion.button>
          </div>

          {/* Designer Credits — Hacker Terminal */}
          <div className="mt-8 pt-5 border-t border-[#39ff14]/10">
            <div className="text-[9px] text-[#39ff14]/30 text-center mb-2">
              <span className="text-[#39ff14]/50">$</span> cat /sys/architects
            </div>
            {/* Tier 1 */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-1">
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
            <div className="flex items-center justify-center gap-1.5 mb-1">
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
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono p-2 md:p-3 flex flex-col items-center justify-center scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />

      {/* Ambient center bloom */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#39ff14]/[0.025] blur-[160px] rounded-full breathe-glow" />
        <div className="absolute top-[-5%] left-[30%] w-[300px] h-[300px] bg-[#39ff14]/[0.01] blur-[80px] rounded-full" />
      </div>
      
      {/* Main HUD Container */}
      <div className="z-10 w-full max-w-5xl bg-[#010a01]/90 backdrop-blur-sm flex flex-col h-[95vh] relative border border-[#39ff14]/25 box-glow">
        {/* Animated top scan line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent border-scan z-20" />
        <HudCorners />
        
        {/* Top Bar */}
        <div className="bg-[#000e00]/90 border-b border-[#39ff14]/30 px-4 md:px-5 py-3 flex flex-wrap justify-between items-center gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Target className="w-7 h-7 text-[#39ff14] animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-[#39ff14]/20 blur-sm" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-[0.18em] text-glow">CLASS WARS <span className="text-[#39ff14]/50">//</span> ROUND 1</h1>
              <p className="text-[10px] text-[#39ff14]/50 tracking-[0.3em]">
                OPERATIVE: <span className="text-[#39ff14]/80">{localStorage.getItem('teamName')?.toUpperCase() || 'UNKNOWN'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowBriefing(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#39ff14]/40 text-[#39ff14]/70 hover:border-[#39ff14] hover:text-[#39ff14] hover:bg-[#39ff14]/5 transition-all text-[10px] tracking-widest uppercase"
            >
              [ MISSION BRIEF ]
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-[#39ff14]/40 uppercase tracking-widest">MISSION CLOCK</span>
              <span className={`text-lg font-black flex items-center gap-2 tabular-nums ${
                totalTime <= 300 ? 'text-red-400 text-glow-red animate-pulse' : 'text-[#39ff14] text-glow'
              }`}>
                <Clock className="w-3.5 h-3.5" /> {formatTime(totalTime)}
              </span>
            </div>
            <button 
              onClick={() => setShowQuitModal(true)}
              className="p-2 border border-red-500/60 text-red-500/70 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Disconnect"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetry / Status Bar */}
        <div className="grid grid-cols-3 border-b border-[#39ff14]/20 bg-[#000800]/80 text-xs z-10 shrink-0">
          <div className="py-2.5 px-3 border-r border-[#39ff14]/20 flex flex-col justify-center items-center gap-0.5">
            <span className="text-[9px] text-[#39ff14]/40 tracking-[0.25em] uppercase">Clearance</span>
            <LevelBadge level={level} />
          </div>
          <div className="py-2.5 px-3 border-r border-[#39ff14]/20 flex flex-col justify-center items-center gap-0.5">
            <span className="text-[9px] text-[#39ff14]/40 tracking-[0.25em] uppercase">Progress</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black text-[#39ff14] tabular-nums">{correctInLevel}</span>
              <span className="text-[#39ff14]/40 text-sm mb-0.5">/ {level}</span>
            </div>
            {/* mini progress bar */}
            <div className="w-full h-0.5 bg-[#39ff14]/15 mt-1">
              <div
                className="h-full bg-[#39ff14] transition-all duration-500"
                style={{ width: `${Math.min((correctInLevel / level) * 100, 100)}%`, boxShadow: '0 0 6px rgba(57,255,20,0.8)' }}
              />
            </div>
          </div>
          <div className="py-2.5 px-3 flex flex-col justify-center items-center gap-0.5">
            <span className="text-[9px] text-red-500/50 tracking-[0.25em] uppercase">Strikes</span>
            <div className="flex items-end gap-1">
              <span className={`text-2xl font-black tabular-nums ${consecutiveWrong > 0 ? 'text-red-400 text-glow-red' : 'text-red-500/40'}`}>{consecutiveWrong}</span>
              <span className="text-red-500/30 text-sm mb-0.5">/ 2</span>
            </div>
            <div className="flex gap-2 mt-1">
              {[0,1].map(i => (
                <div key={i} className={`w-3 h-1.5 ${i < consecutiveWrong ? 'bg-red-500 shadow-[0_0_6px_rgba(255,50,50,0.8)]' : 'bg-red-500/20'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="p-4 md:p-5 flex-grow relative flex flex-col z-10 overflow-y-auto">
          
          {/* Local Timer — top right */}
          <div className="absolute top-4 right-5 flex flex-col items-end gap-0.5 z-20">
            <span className="text-[9px] tracking-[0.3em] text-[#39ff14]/40 uppercase hidden md:block">Node Timeout</span>
            <span className={`text-2xl md:text-3xl font-black font-mono tabular-nums ${
              timeLeft <= 10 ? 'text-red-400 animate-pulse text-glow-red' :
              timeLeft <= 20 ? 'text-yellow-400' :
              'text-[#39ff14] text-glow'
            }`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
            {/* countdown bar */}
            <div className="hidden md:block w-20 h-0.5 bg-[#39ff14]/10 mt-0.5">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-400' : 'bg-[#39ff14]'
                }`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          {currentQuestion && (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              key={currentQuestion.id}
              className="max-w-4xl w-full mx-auto mt-10 md:mt-6 flex-grow flex flex-col"
            >
              {/* Question type badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-[#001800]/80 border border-[#39ff14]/25 px-3 py-1.5 text-[10px] tracking-[0.3em] text-[#39ff14]/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_6px_rgba(57,255,20,0.8)]"></span>
                  ENCRYPTED HURDLE
                </div>
                <div className={`px-3 py-1.5 text-[10px] tracking-[0.3em] font-bold border ${
                  currentQuestion.type === 'mcq'
                    ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/5'
                    : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5'
                }`}>
                  {currentQuestion.type === 'mcq' ? '◈ MCQ' : '◈ ONE-WORD'}
                </div>
              </div>
              
              {(() => {
                const raw = currentQuestion.text || '';
                const nlIdx = raw.indexOf('\n\n');
                const hasCode = nlIdx !== -1 && nlIdx < raw.length - 2;
                const prompt = hasCode ? raw.slice(0, nlIdx) : raw;
                const codeBlock = hasCode ? raw.slice(nlIdx + 2) : (currentQuestion.code || null);
                return (
                  <>
                    <h2 className="text-base md:text-lg leading-relaxed text-white mb-4 font-bold">
                      <span className="text-[#39ff14]/40 mr-2">{'>'}</span>
                      {prompt}
                    </h2>
                    {codeBlock && (
                      <div className="relative mb-5 group">
                        {/* Code header bar */}
                        <div className="flex items-center justify-between bg-[#001500]/90 border border-b-0 border-[#39ff14]/20 px-3 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/70" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                            <div className="w-2 h-2 rounded-full bg-[#39ff14]/70" />
                          </div>
                          <span className="text-[9px] tracking-widest text-[#39ff14]/30">C++ // ENCRYPTED PAYLOAD</span>
                        </div>
                        <pre className="border border-[#39ff14]/20 border-t-[#39ff14]/40 p-4 md:p-5 text-[#39ff14] overflow-x-auto text-sm shadow-[inset_0_0_30px_rgba(57,255,20,0.04)] bg-[#000a00]/90 max-h-[40vh] overflow-y-auto font-mono whitespace-pre leading-6 tracking-wide">
                          {formatCppCode(codeBlock)}
                        </pre>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Input Section */}
              <div className="mt-auto pt-4">
                {currentQuestion.type === 'mcq' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                    {currentQuestion.options?.map((opt, idx) => (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3 md:p-4 text-left border transition-all duration-150 font-mono text-xs md:text-sm relative overflow-hidden group ${
                          selectedOption === opt 
                            ? 'bg-[#39ff14] border-[#39ff14] text-black shadow-[0_0_25px_rgba(57,255,20,0.5)] font-bold' 
                            : 'bg-[#000a00]/80 border-[#39ff14]/25 text-[#39ff14]/90 hover:border-[#39ff14]/70 hover:bg-[#001400]/80'
                        }`}
                      >
                        {selectedOption !== opt && <span className="absolute inset-0 bg-[#39ff14]/0 group-hover:bg-[#39ff14]/4 transition-colors" />}
                        <span className={`font-black mr-2 text-[10px] tracking-widest ${
                          selectedOption === opt ? 'text-black/60' : 'text-[#39ff14]/35'
                        }`}>[{String.fromCharCode(65+idx)}]</span>
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] text-yellow-400/60 tracking-[0.25em] mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">⚠</span> ONE-WORD ANSWER — type exactly one word, case-insensitive
                    </div>
                    <div className="flex items-center bg-[#000a00]/90 border border-[#39ff14]/30 focus-within:border-[#39ff14]/80 focus-within:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all p-3 md:p-4 gap-3">
                      <span className="text-[#39ff14]/50 text-sm shrink-0 hidden md:inline">root@classwars:~$</span>
                      <span className="text-[#39ff14]/50 text-sm shrink-0 md:hidden">{'>'}</span>
                      <input
                        type="text"
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="type your answer..."
                        className="w-full bg-transparent text-base md:text-lg text-white outline-none placeholder:text-[#39ff14]/20 tracking-wide"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <span className="w-2.5 h-5 bg-[#39ff14] animate-pulse ml-1 shrink-0"></span>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!!feedback || (currentQuestion.type === 'mcq' ? !selectedOption : !answerInput)}
                    whileTap={{ scale: 0.96 }}
                    className="px-8 py-3 bg-[#001a00] border border-[#39ff14]/50 text-[#39ff14] hover:border-[#39ff14] hover:bg-[#39ff14] hover:text-black disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-100 uppercase tracking-[0.25em] font-black flex items-center gap-2.5 text-sm shadow-[0_0_20px_rgba(57,255,20,0.15)] hover:shadow-[0_0_35px_rgba(57,255,20,0.6)] relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-[#39ff14] translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out" />
                    <Crosshair className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">[ EXECUTE ]</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30"
              >
                <div className={`p-10 border-2 text-center max-w-2xl w-full relative ${
                  feedback.type === 'success' ? 'border-[#39ff14] bg-[#001100]/95 text-[#39ff14] shadow-[0_0_60px_rgba(57,255,20,0.25)]' : 
                  feedback.type === 'error' ? 'border-red-500 bg-[#110000]/95 text-red-500 shadow-[0_0_60px_rgba(255,0,0,0.25)]' :
                  'border-yellow-500 bg-[#111100]/95 text-yellow-500 shadow-[0_0_60px_rgba(255,255,0,0.25)]'
                }`}>
                  <HudCorners />
                  <h2 className={`text-2xl md:text-3xl font-black tracking-[0.1em] mb-4 ${
                    feedback.type === 'success' ? 'text-glow' : 
                    feedback.type === 'error' ? 'text-glow-red' : 'text-glow-amber'
                  }`}>
                    {feedback.type === 'success' ? '✓ ' : feedback.type === 'error' ? '✗ ' : '⚠ '}
                    {feedback.message}
                  </h2>
                  <div className="mt-6 text-sm opacity-70 tracking-[0.3em] uppercase">
                    {feedback.type === 'success' ? 'PROCEEDING TO NEXT NODE...' : 'RECALCULATING ROUTE...'}
                  </div>
                  {/* Animated bar */}
                  <div className="mt-4 h-0.5 bg-current/10 overflow-hidden rounded">
                    <motion.div
                      className="h-full bg-current/60"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Round 2 Insights Modal */}
      <AnimatePresence>
        {showRound2Insight && (
          <Round2InsightModal
            level={round2InsightLevel}
            onClose={() => setShowRound2Insight(false)}
          />
        )}
      </AnimatePresence>

      {/* Quit Modal */}
      <AnimatePresence>
        {showQuitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="max-w-md w-full border border-red-500/60 bg-[#0a0000]/98 p-10 text-center box-glow-red relative"
            >
              <HudCorners size="sm" />
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-14 h-14 mx-auto text-red-500 mb-5" />
              </motion.div>
              <h2 className="text-2xl font-black text-red-400 mb-3 tracking-[0.15em] text-glow-red">SEVER CONNECTION?</h2>
              <p className="text-red-400/60 mb-8 text-sm leading-relaxed tracking-wide">Disconnecting now will finalize your session. Your highest level will be recorded.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    if (sessionId) {
                      try { await api.post(`/game/session/${sessionId}/end`); }
                      catch (err) { console.error('Failed to end session:', err); }
                    }
                    setGameOver(true);
                  }}
                  className="px-6 py-3 bg-red-950/60 border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all uppercase tracking-[0.2em] font-black text-sm"
                >
                  [ CONFIRM ]
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowQuitModal(false)}
                  className="px-6 py-3 bg-[#001800] border border-[#39ff14]/40 text-[#39ff14]/80 hover:border-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all uppercase tracking-[0.2em] font-black text-sm"
                >
                  [ STAY IN MISSION ]
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
