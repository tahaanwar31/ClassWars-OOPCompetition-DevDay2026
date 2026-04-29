import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Shield, Skull } from 'lucide-react';
import TacticalBackground from '../../components/TacticalBackground';
import { markLevelComplete } from './Round2Lobby';
import { useContestTimer } from './useContestTimer';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';

const cppTheme = EditorView.theme({
  '&': { background: '#000 !important' },
  '.cm-scroller': { fontFamily: "'Courier New', monospace", fontSize: '13px' },
  '.cm-content': { background: '#000 !important' },
  '.cm-gutters': { background: '#0a0a0a !important', borderRight: '1px solid #3a1a1a', color: '#ff660055' },
  '.cm-activeLine': { background: '#180000 !important' },
  '.cm-activeLineGutter': { background: '#180000 !important' },
  '.cm-selectionBackground': { background: '#aa660099 !important' },
  '&.cm-focused .cm-selectionBackground': { background: '#cc880099 !important' },
  '.cm-cursor': { borderLeftColor: '#ff6600 !important', borderLeftWidth: '2px !important' },
});

const CLIENT_ID = import.meta.env.VITE_JDOODLE_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_JDOODLE_CLIENT_SECRET as string;
const CELL = 40;

const COMPILE_URL = import.meta.env.DEV
  ? `https://corsproxy.io/?https://api.jdoodle.com/v1/execute`
  : '/compile';

// Boss patrols a SQUARE perimeter from (6,2) to (9,5), 1 cell per turn (12 cells total)
// Shield rules: Row 2 (facing RIGHT) = SHIELDED. Moving UP/DOWN = NO shield. Row 5 (facing LEFT) = FIRES!
const BOSS_PATH: [number, number][] = [
  [6, 2], [7, 2], [8, 2],       // top edge → RIGHT (shielded)
  [9, 2], [9, 3], [9, 4],       // right edge → DOWN (open)
  [9, 5], [8, 5], [7, 5],       // bottom edge → LEFT (fires!)
  [6, 5], [6, 4], [6, 3],       // left edge → UP (open)
];
type Facing = 'right' | 'down' | 'left' | 'up';
const BOSS_FACING: Facing[] = ['right', 'right', 'right', 'down', 'down', 'down', 'left', 'left', 'left', 'up', 'up', 'up'];
const SQ: [number, number][] = [[6, 2], [9, 2], [9, 5], [6, 5]]; // square corners for SVG
const FACING_DEG: Record<Facing, number> = { right: 0, down: 90, left: 180, up: 270 };

const BOSS_MAX_HP = 10;
const PLAYER_MAX_HP = 2;
const ENGAGE_DIST = 3;

interface Projectile {
  id: number; fromX: number; fromY: number; toX: number; toY: number;
  type: 'LASER' | 'CANNON' | 'BOSS'; fired: boolean;
}
interface Explosion { id: number; x: number; y: number; phase: 'flash' | 'ring' | 'fade'; }

const HIDDEN_HEADER = `#include <iostream>
#include <string>
using namespace std;
class Weapon { public: virtual void fire() = 0; virtual ~Weapon() {} };
class LaserGun : public Weapon { public: void fire() override { cout << "FIRE:LASER" << endl; } };
class Cannon : public Weapon { public: void fire() override { cout << "FIRE:CANNON" << endl; } };
`;

function getCppStarter(): string {
  return `// --- [Provided: Radar class - tracks enemy boss position] ---
// Direction codes: 1=RIGHT, 2=DOWN, 3=LEFT, 4=UP
// Boss walks a square: rows 2 to 5, cols 6 to 9
class Radar {
private:
    int bossRow, bossCol, bossDir;

public:
    Radar() {
        bossRow = 2;
        bossCol = 6;
        bossDir = 1;  // boss starts going RIGHT
    }

    // Boss moves one cell, turns at corners
    void moveBoss() {
        if (bossDir == 1) bossCol++;    // RIGHT
        if (bossDir == 2) bossRow++;    // DOWN
        if (bossDir == 3) bossCol--;    // LEFT
        if (bossDir == 4) bossRow--;    // UP

        // Turn at corners
        if (bossRow == 2 && bossCol == 9) bossDir = 2;
        if (bossRow == 5 && bossCol == 9) bossDir = 3;
        if (bossRow == 5 && bossCol == 6) bossDir = 4;
        if (bossRow == 2 && bossCol == 6) bossDir = 1;
    }

    int getBossRow() { return bossRow; }
    int getBossCol() { return bossCol; }
    int getBossDir() { return bossDir; }
};

// --- [Student implements MyTank] ---
class MyTank {
private:
    int row, col;
    Radar* radar;       // Aggregation: uses Radar, doesn't own it
    Weapon* weapon;     // Composition: owns Weapon, must delete it

public:
    MyTank(Radar* r) {
        row = 0;
        col = 0;
        radar = r;
        weapon = nullptr;
    }

    ~MyTank() {
        delete weapon;  // clean up weapon we own
    }

    // Move tank one cell at a time until we reach target
    void move(int toRow, int toCol) {
        while (row < toRow) row++;    // move down
        while (row > toRow) row--;    // move up
        while (col < toCol) col++;    // move right
        while (col > toCol) col--;    // move left
        cout << "STEP:" << col << "," << row << endl;
    }

    // Pick weapon based on what boss is doing
    void attack(int bossDir) {
        if (bossDir == 3) {
            // Boss going LEFT = it fires at us! Shield up!
            cout << "SHIELD" << endl;
            return;
        }

        // Swap to new weapon (delete old one first - Composition)
        delete weapon;
        weapon = nullptr;

        if (bossDir == 1) {
            weapon = new LaserGun();   // boss shielded, need LASER
        } else {
            weapon = new Cannon();     // boss open, use CANNON
        }

        weapon->fire();  // Polymorphism: calls LaserGun or Cannon fire()
    }
};

int main() {
    Radar radar;
    MyTank tank(&radar);

    // Keep fighting until Makarov is destroyed
    while (true) {
        // 1) Read boss position and direction from radar
        int bossRow = radar.getBossRow();
        int bossCol = radar.getBossCol();
        int bossDir = radar.getBossDir();

        // 2) Move tank to 3 cells left of boss, same row
        tank.move(bossRow, bossCol - 3);

        // 3) Attack or shield
        tank.attack(bossDir);

        // 4) Advance radar to next position
        radar.moveBoss();
    }

    return 0;
}`;
}

function parseCompileError(output: string): string | null {
  const lines = output.split('\n');
  const errLine = lines.find(l => /error:/i.test(l));
  if (!errLine) return null;
  const m = errLine.match(/:(\d+):\d+:\s*error:\s*(.+)/);
  if (m) return `Line ${m[1]}: ${m[2].trim()}`;
  const m2 = errLine.match(/error:\s*(.+)/i);
  if (m2) return m2[1].trim();
  return errLine.trim();
}

const terrainNoise = Array.from({ length: 100 }, (_, i) => {
  const row = Math.floor(i / 10);
  const col = i % 10;
  const v = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
  return v - Math.floor(v);
});

export default function Level3() {
  const navigate = useNavigate();
  const { contestEnded } = useContestTimer('round2');

  const [code, setCode] = useState(() => getCppStarter());
  const [tankPos, setTankPos] = useState({ x: 0, y: 0 });
  const [makarovState, setMakarovState] = useState({
    x: BOSS_PATH[0][0], y: BOSS_PATH[0][1],
    hp: BOSS_MAX_HP, shielded: true,
    facing: 'right' as Facing,
  });
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [currentTurn, setCurrentTurn] = useState(-1);
  const [terminalLines, setTerminalLines] = useState<string[]>(['root@boss: awaiting orders...']);
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const [compiling, setCompiling] = useState(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [playerShielded, setPlayerShielded] = useState(false);

  const abortRef = useRef(false);
  const projectileIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const bossAnimRef = useRef({ x: BOSS_PATH[0][0], y: BOSS_PATH[0][1] });

  useEffect(() => () => { abortRef.current = true; }, []);

  function sleep(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

  function spawnExplosion(tx: number, ty: number) {
    const id = ++explosionIdRef.current;
    setExplosions(prev => [...prev, { id, x: tx, y: ty, phase: 'flash' }]);
    setTimeout(() => setExplosions(prev => prev.map(e => e.id === id ? { ...e, phase: 'ring' } : e)), 100);
    setTimeout(() => setExplosions(prev => prev.map(e => e.id === id ? { ...e, phase: 'fade' } : e)), 400);
    setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== id)), 700);
  }

  function handleReset() {
    abortRef.current = true;
    setTimeout(() => { abortRef.current = false; }, 0);
    setCode(getCppStarter());
    setTankPos({ x: 0, y: 0 });
    bossAnimRef.current = { x: BOSS_PATH[0][0], y: BOSS_PATH[0][1] };
    setMakarovState({ x: BOSS_PATH[0][0], y: BOSS_PATH[0][1], hp: BOSS_MAX_HP, shielded: true, facing: 'right' });
    setPlayerHp(PLAYER_MAX_HP);
    setCurrentTurn(-1);
    setTerminalLines(['root@boss: awaiting orders...']);
    setResultStatus('idle');
    setCompiling(false);
    setProjectiles([]);
    setExplosions([]);
    setPlayerShielded(false);
  }

  async function handleRun() {
    abortRef.current = true;
    await sleep(10);
    abortRef.current = false;

    setCompiling(true);
    setResultStatus('idle');
    setTankPos({ x: 0, y: 0 });
    bossAnimRef.current = { x: BOSS_PATH[0][0], y: BOSS_PATH[0][1] };
    setMakarovState({ x: BOSS_PATH[0][0], y: BOSS_PATH[0][1], hp: BOSS_MAX_HP, shielded: true, facing: 'right' });
    setPlayerHp(PLAYER_MAX_HP);
    setCurrentTurn(-1);
    setTerminalLines(['>> BOSS PROTOCOL INITIALIZED...']);
    setProjectiles([]);
    setExplosions([]);
    setPlayerShielded(false);

    let mkvHp = BOSS_MAX_HP;
    let pHp = PLAYER_MAX_HP;

    try {
      const res = await fetch(COMPILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(import.meta.env.DEV
          ? { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, script: HIDDEN_HEADER + code, language: 'cpp17', versionIndex: '0' }
          : { script: HIDDEN_HEADER + code }
        ),
      });
      const data = await res.json();

      if (typeof data.output !== 'string') {
        setTerminalLines(['>> Code failed to execute: No response from compiler.']);
        setResultStatus('failure'); setCompiling(false); return;
      }

      const output: string = data.output;
      const compileErr = parseCompileError(output);
      if (compileErr) {
        setTerminalLines([`>> Code failed to execute: Syntax problem — ${compileErr}`]);
        setResultStatus('failure'); setCompiling(false); return;
      }

      setTerminalLines(['>> Code compiled successfully. Executing combat loop...']);

      const lines = output.split('\n');
      let i = 0;
      let curTankX = 0, curTankY = 0;
      let curMkvX = BOSS_PATH[0][0], curMkvY = BOSS_PATH[0][1];
      let curTurn = -1;
      let bossShouldFire = false; // boss fires independently when facing LEFT and player in same row
      let bossFacingLeft = false;
      let bossShielded = true;

      const processNext = async () => {
        while (i < lines.length) {
          if (abortRef.current) return;
          if (mkvHp <= 0 || pHp <= 0) break;

          const line = lines[i++].trim();
          if (!line) continue;

          if (line.startsWith('STEP:')) {
            // If boss was waiting to fire from previous turn and player did nothing, boss fires now
            if (bossShouldFire) {
              pHp--;
              const hitProjId = ++projectileIdRef.current;
              setProjectiles(prev => [...prev, { id: hitProjId, fromX: curMkvX, fromY: curMkvY, toX: curTankX, toY: curTankY, type: 'BOSS', fired: false }]);
              await sleep(50);
              setProjectiles(prev => prev.map(p => p.id === hitProjId ? { ...p, fired: true } : p));
              await sleep(300);
              setProjectiles(prev => prev.filter(p => p.id !== hitProjId));
              spawnExplosion(curTankX, curTankY);
              setPlayerHp(pHp);
              setTerminalLines(prev => [...prev, `>> HIT BY MAKAROV! You didn't shield. Player HP: ${pHp}/${PLAYER_MAX_HP}`]);
              bossShouldFire = false;
              if (pHp <= 0) break;
              await sleep(200);
            }

            // Move player tank
            const parts = line.split(':')[1].split(',').map(Number);
            curTankX = Math.max(0, Math.min(9, parts[0]));
            curTankY = Math.max(0, Math.min(9, parts[1]));
            setTankPos({ x: curTankX, y: curTankY });
            await sleep(200);

            // Auto-increment turn and move boss to next position
            curTurn++;
            const pathIdx = curTurn % BOSS_PATH.length;
            const newMkvX = BOSS_PATH[pathIdx][0];
            const newMkvY = BOSS_PATH[pathIdx][1];
            const facing = BOSS_FACING[pathIdx];
            bossShielded = (facing === 'right');
            bossFacingLeft = facing === 'left';

            setMakarovState(prev => ({ ...prev, facing, shielded: bossShielded, x: bossAnimRef.current.x, y: bossAnimRef.current.y }));

            // Animate boss cell-by-cell
            const startX = bossAnimRef.current.x;
            const startY = bossAnimRef.current.y;
            const dx = Math.sign(newMkvX - startX);
            const dy = Math.sign(newMkvY - startY);

            if (dx !== 0) {
              let ax = startX;
              while (ax !== newMkvX) {
                if (abortRef.current) return;
                ax += dx;
                bossAnimRef.current = { x: ax, y: startY };
                setMakarovState(prev => ({ ...prev, x: ax, y: startY }));
                await sleep(160);
              }
            }
            if (dy !== 0) {
              let ay = startY;
              while (ay !== newMkvY) {
                if (abortRef.current) return;
                ay += dy;
                bossAnimRef.current = { x: newMkvX, y: ay };
                setMakarovState(prev => ({ ...prev, x: newMkvX, y: ay }));
                await sleep(160);
              }
            }

            bossAnimRef.current = { x: newMkvX, y: newMkvY };
            curMkvX = newMkvX;
            curMkvY = newMkvY;
            setCurrentTurn(curTurn);

            // Boss fires independently: facing LEFT + player in same row
            bossShouldFire = bossFacingLeft && curTankY === curMkvY;

            const inFireRow = bossShouldFire;
            const shieldTag = bossShielded ? ' [SHIELD ACTIVE — use LASER]' : ' [NO SHIELD — use CANNON]';
            const threatTag = inFireRow ? ' [BOSS FACING LEFT — WILL FIRE AT YOU!]' : bossFacingLeft ? ' [BOSS FACING LEFT — not in same row]' : shieldTag;
            setTerminalLines(prev => [...prev, `>> --- TURN ${curTurn} --- Boss at (${curMkvX},${curMkvY}) facing ${facing.toUpperCase()}${threatTag}`]);
            await sleep(80);

          } else if (line === 'SHIELD') {
            if (bossShouldFire) {
              // Boss fires — player shields! Blocked!
              bossShouldFire = false;
              setPlayerShielded(true);

              // Boss projectile travels toward player
              const bossProjId = ++projectileIdRef.current;
              setProjectiles(prev => [...prev, { id: bossProjId, fromX: curMkvX, fromY: curMkvY, toX: curTankX, toY: curTankY, type: 'BOSS', fired: false }]);
              await sleep(50);
              setProjectiles(prev => prev.map(p => p.id === bossProjId ? { ...p, fired: true } : p));
              await sleep(300);
              setProjectiles(prev => prev.filter(p => p.id !== bossProjId));

              // Hold blue shield glow visible on tank
              await sleep(500);
              setPlayerShielded(false);

              setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] SHIELD ACTIVE! Makarov fired — BLOCKED!`]);
            } else {
              setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] UNNECESSARY SHIELD. Boss isn't firing at you — should have attacked!`]);
            }
            await sleep(150);

          } else if (line.startsWith('FIRE:')) {
            const rawType = line.split(':')[1].trim();
            if (rawType !== 'LASER' && rawType !== 'CANNON') {
              setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] FIRE_ERROR: Unknown weapon '${rawType}'.`]);
              continue;
            }
            const type = rawType as 'LASER' | 'CANNON';

            // Position check
            if (curTankX !== curMkvX - ENGAGE_DIST || curTankY !== curMkvY) {
              setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] FIRE_ERROR: Must be ${ENGAGE_DIST} cells LEFT of boss, same row.`]);
              continue;
            }

            // If boss is firing at us and we didn't shield — boss hits first!
            if (bossShouldFire) {
              bossShouldFire = false;
              pHp--;
              const bossProjId = ++projectileIdRef.current;
              setProjectiles(prev => [...prev, { id: bossProjId, fromX: curMkvX, fromY: curMkvY, toX: curTankX, toY: curTankY, type: 'BOSS', fired: false }]);
              await sleep(50);
              setProjectiles(prev => prev.map(p => p.id === bossProjId ? { ...p, fired: true } : p));
              await sleep(300);
              setProjectiles(prev => prev.filter(p => p.id !== bossProjId));
              spawnExplosion(curTankX, curTankY);
              setPlayerHp(pHp);
              setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] HIT BY MAKAROV! You fired without shielding. Player HP: ${pHp}/${PLAYER_MAX_HP}`]);
              if (pHp <= 0) break;
              await sleep(200);
              continue;
            }

            // Normal attack — check weapon vs boss shield state
            // LASER penetrates shields (bossShielded = true)
            // CANNON deals raw damage (bossShielded = false)
            // Wrong weapon = NO EFFECT
            const isCorrectWeapon = (type === 'LASER' && bossShielded) || (type === 'CANNON' && !bossShielded);

            const projId = ++projectileIdRef.current;
            setProjectiles(prev => [...prev, { id: projId, fromX: curTankX, fromY: curTankY, toX: curMkvX, toY: curMkvY, type, fired: false }]);
            await sleep(50);
            setProjectiles(prev => prev.map(p => p.id === projId ? { ...p, fired: true } : p));
            await sleep(300);
            setProjectiles(prev => prev.filter(p => p.id !== projId));

            if (isCorrectWeapon) {
              mkvHp--;
              spawnExplosion(curMkvX, curMkvY);
              setMakarovState(prev => ({ ...prev, hp: mkvHp }));
              setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] HIT! ${type} ${bossShielded ? 'penetrated shield' : 'dealt raw damage'}. MKV HP: ${mkvHp}`]);
            } else {
              // Wrong weapon — no effect
              if (type === 'CANNON' && bossShielded) {
                setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] NO EFFECT! CANNON cannot penetrate shield. Use LASER!`]);
              } else {
                setTerminalLines(prev => [...prev, `>> [TURN ${curTurn}] NO EFFECT! LASER is useless without a shield to penetrate. Use CANNON!`]);
              }
            }
            await sleep(200);
          }
        }

        if (abortRef.current) return;

        // If boss was waiting to fire on the very last turn
        if (bossShouldFire && pHp > 0) {
          pHp--;
          setPlayerHp(pHp);
          setTerminalLines(prev => [...prev, `>> HIT BY MAKAROV! You didn't shield. Player HP: ${pHp}/${PLAYER_MAX_HP}`]);
          bossShouldFire = false;
        }

        if (mkvHp <= 0) {
          setTerminalLines(prev => [...prev, '>> MISSION SUCCESS: MAKAROV TERMINATED. LEVEL 3 CLEAR.']);
          setResultStatus('success');
        } else if (pHp <= 0) {
          setTerminalLines(prev => [...prev, '>> MISSION FAILED: Destroyed by Makarov. Shield when boss faces LEFT on row 5!']);
          setResultStatus('failure');
        } else {
          setTerminalLines(prev => [...prev, `>> MISSION FAILED: MAKAROV SURVIVED with ${mkvHp} HP. ${BOSS_MAX_HP - mkvHp}/${BOSS_MAX_HP} hits landed.`]);
          setResultStatus('failure');
        }
        setCompiling(false);
      };

      processNext();
    } catch {
      setTerminalLines(['>> Code failed to execute: Connection error.']);
      setResultStatus('failure'); setCompiling(false);
    }
  }

  const mkvHpPct = (makarovState.hp / BOSS_MAX_HP) * 100;
  const mkvHpColor = makarovState.hp > 6 ? '#ff0033' : makarovState.hp > 3 ? '#ff6600' : '#ffcc00';
  const pHpColor = playerHp > 1 ? '#39ff14' : '#ff3131';

  return (
    <div className="min-h-screen bg-[#050505] text-[#ff6600] font-mono px-4 py-5 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />

      {/* Contest Ended Overlay */}
      {contestEnded && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-3xl font-black tracking-[0.2em] mb-3">CONTEST ENDED</div>
            <div className="text-white/30 text-sm tracking-widest">Redirecting to lobby...</div>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] right-[8%] h-[420px] w-[420px] rounded-full bg-[#ff0033]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-12%] left-[10%] h-[360px] w-[360px] rounded-full bg-[#ff6600]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-[#ff6600]/15 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] tracking-[0.35em] text-[#ff6600]/60">
              <Skull className="h-3 w-3" />
              SYSTEM_LEVEL_03 // OPERATION_SQUARE_ONE
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-[0.18em] md:text-4xl" style={{ textShadow: '0 0 10px #ff6600, 0 0 30px rgba(255,102,0,0.3)' }}>
              CLASS WARS: LEVEL 3
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate('/competition/round2')} className="inline-flex items-center gap-2 border border-[#ff6600]/30 bg-black/60 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#ff6600] transition hover:border-[#ff6600] hover:bg-[#ff6600]/10">
              <ArrowLeft className="h-4 w-4" /> BACK
            </button>
            <div className="border border-[#ff6600]/30 bg-black/70 px-4 py-2 text-xs tracking-[0.18em]">
              <span className="text-[#ff6600]/60">STATUS:</span>{' '}
              <span className={compiling ? 'animate-pulse text-[#ffcc00]' : resultStatus === 'success' ? 'text-[#39ff14]' : resultStatus === 'failure' ? 'text-[#ff3131]' : 'text-white'}>
                {compiling ? 'EXECUTING...' : resultStatus === 'idle' ? 'READY' : resultStatus === 'success' ? 'COMPLETE' : 'FAILED'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 border border-[#ff6600]/40 bg-[#1a0a00]/80 px-3 py-2 text-xs tracking-[0.1em]">
              <span className="text-[#ff6600]/60">TURN:</span>
              <span className="font-black text-[#ff6600]" style={{ textShadow: '0 0 8px rgba(255,102,0,0.6)' }}>{currentTurn >= 0 ? currentTurn : '-'}</span>
              <span className="text-[#ff6600]/40"></span>
            </div>
          </div>
        </div>

                {/* BRIEFING */}
        <div className="border border-[#39ff14]/30 bg-[#020802]/90 px-4 py-3">
          <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#39ff14]">MISSION BRIEFING — LEVEL 3: OPERATION SQUARE ONE</div>

          <div className="grid gap-x-8 gap-y-3 text-[10px] leading-[1.7] md:grid-cols-2 lg:grid-cols-3">

            {/* OBJECTIVE */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">OBJECTIVE</div>
              <div className="text-[#6699ff]">Defeat General Makarov. He has 10 HP, you have 2 HP. Keep fighting until he is destroyed.</div>
              <div className="text-[#6699ff]">Each correct weapon hit deals 1 damage. Wrong weapon = no effect.</div>
              <div className="text-[#6699ff]">You must land 10 hits before running out of HP.</div>
            </div>

            {/* BOSS BEHAVIOR */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">BOSS BEHAVIOR</div>
              <div className="text-[#6699ff]">Makarov walks around a square path: rows 2 to 5, columns 6 to 9.</div>
              <div className="text-[#6699ff]">Each turn he moves one cell. Direction codes: 1=RIGHT, 2=DOWN, 3=LEFT, 4=UP.</div>
              <div className="text-[#6699ff]">When going RIGHT on row 2 — his shield is active. Only LASER can penetrate.</div>
              <div className="text-[#6699ff]">When going UP or DOWN — no shield. Use CANNON for raw damage.</div>
              <div className="text-[#6699ff]">When going LEFT on row 5 — he fires at you! You must SHIELD or take 1 damage.</div>
            </div>

            {/* HOW EACH TURN WORKS */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">HOW EACH TURN WORKS</div>
              <div className="text-[#6699ff]">1. Ask the Radar where the boss is and which direction it is heading.</div>
              <div className="text-[#6699ff]">2. Move your tank to 3 columns left of the boss, same row.</div>
              <div className="text-[#6699ff]">3. Decide: shield or attack based on the boss direction.</div>
              <div className="text-[#6699ff]">4. Tell the radar to advance to the next position.</div>
            </div>

            {/* CLASS: Weapon */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: Weapon (abstract base class)</div>
              <div className="text-[#6699ff]">This is an abstract class — you cannot create a Weapon directly.</div>
              <div className="text-[#6699ff]">It has one pure virtual method called fire that must be overridden by subclasses.</div>
              <div className="text-[#6699ff]">It also has a virtual destructor so subclasses clean up safely.</div>
              <div className="text-[#6699ff]">OOP Concept: Abstraction — hiding details behind a common interface.</div>
            </div>

            {/* CLASS: LaserGun */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: LaserGun</div>
              <div className="text-[#6699ff]">Inherits from Weapon and overrides the fire method.</div>
              <div className="text-[#6699ff]">When fire is called, it outputs FIRE:LASER.</div>
              <div className="text-[#6699ff]">Use when boss has shield active (direction 1, row 2).</div>
              <div className="text-[#6699ff]">LASER is the only weapon that can penetrate shields.</div>
            </div>

            {/* CLASS: Cannon */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: Cannon</div>
              <div className="text-[#6699ff]">Inherits from Weapon and overrides the fire method.</div>
              <div className="text-[#6699ff]">When fire is called, it outputs FIRE:CANNON.</div>
              <div className="text-[#6699ff]">Use when boss has no shield (direction 2 or 4, moving UP/DOWN).</div>
              <div className="text-[#6699ff]">OOP Concept: Polymorphism — same weapon pointer, different behavior.</div>
            </div>

            {/* CLASS: Radar */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: Radar (provided — do not modify)</div>
              <div className="text-[#6699ff]">Tracks where the boss is at all times. Your tank receives a pointer to it.</div>
              <div className="text-[#6699ff]">Private attributes: bossRow, bossCol, bossDir (all integers).</div>
              <div className="text-[#6699ff]">Constructor: starts boss at row 2, column 6, direction 1 (going right).</div>
              <div className="text-[#6699ff]">getBossRow() returns current row. getBossCol() returns current column. getBossDir() returns direction (1 to 4).</div>
              <div className="text-[#6699ff]">moveBoss() advances the tracker one cell and changes direction at corners.</div>
              <div className="text-[#6699ff]">OOP Concept: Aggregation — your tank uses Radar but does not own or delete it.</div>
            </div>

            {/* CLASS: MyTank */}
            <div className="md:col-span-2">
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: MyTank (you write this)</div>
              <div className="text-[#6699ff] font-bold mb-0.5">Attributes:</div>
              <div className="text-[#6699ff] pl-3">row and col — your tank position on the grid.</div>
              <div className="text-[#6699ff] pl-3">Radar pointer — points to the Radar object (Aggregation — you use it but don't own it).</div>
              <div className="text-[#6699ff] pl-3">Weapon pointer — points to your current weapon (Composition — you own it and must delete it).</div>
              <div className="text-[#6699ff] font-bold mt-1 mb-0.5">Constructor:</div>
              <div className="text-[#6699ff] pl-3">Takes a Radar pointer. Sets row and col to 0. Sets weapon to null.</div>
              <div className="text-[#6699ff] font-bold mt-1 mb-0.5">Destructor:</div>
              <div className="text-[#6699ff] pl-3">Deletes the weapon pointer because your tank OWNS the weapon (Composition).</div>
              <div className="text-[#6699ff] font-bold mt-1 mb-0.5">move method:</div>
              <div className="text-[#6699ff] pl-3">Takes a target row and target column. Uses while loops to increment or decrement row and col one cell at a time. Row++ means down, row-- means up, col++ means right, col-- means left. After reaching target, prints STEP followed by column and row.</div>
              <div className="text-[#6699ff] font-bold mt-1 mb-0.5">attack method:</div>
              <div className="text-[#6699ff] pl-3">Takes boss direction. If direction is 3 (LEFT), boss is firing at you — print SHIELD and return. Otherwise delete old weapon, set to null. If direction is 1 (RIGHT), create new LaserGun (boss shielded). If direction is 2 or 4 (UP/DOWN), create new Cannon (boss open). Then call fire on the weapon pointer — Polymorphism in action.</div>
            </div>

            {/* OOP CONCEPTS */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">OOP CONCEPTS TESTED</div>
              <div className="text-[#6699ff]">Abstraction — Weapon class hides details behind a pure virtual method.</div>
              <div className="text-[#6699ff]">Polymorphism — weapon pointer calls the correct fire at runtime.</div>
              <div className="text-[#6699ff]">Aggregation — tank uses Radar via pointer but does not own or delete it.</div>
              <div className="text-[#6699ff]">Composition — tank owns the Weapon and must delete it each turn.</div>
              <div className="text-[#6699ff]">Memory Management — new creates weapon, delete cleans it up, no leaks.</div>
            </div>

          </div>
        </div>


        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-center">

          {/* Code Editor */}
          <section className="flex-1 border border-[#ff6600]/60 bg-black/90 shadow-[0_0_20px_rgba(255,102,0,0.3),inset_0_0_30px_rgba(255,102,0,0.03)]">
            <div className="flex items-center justify-between border-b border-[#ff6600]/60 bg-gradient-to-r from-[#2a1000] to-[#1a0500] px-4 py-2">
              <div className="text-[11px] font-bold tracking-[0.15em] text-white">C++ TACTICAL_INTERFACE.CPP</div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#ff6600] animate-pulse" />
                <span className="text-[9px] tracking-[0.1em] text-[#ff6600]/60">LIVE</span>
              </div>
            </div>
            <CodeMirror value={code} onChange={setCode} height="460px" theme={[oneDark, cppTheme]}
              extensions={[cpp(), keymap.of([indentWithTab]), EditorView.lineWrapping]}
              basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, highlightSelectionMatches: true, bracketMatching: true, closeBrackets: true, autocompletion: true, rectangularSelection: true, crosshairCursor: true, indentOnInput: true }}
            />
            <div className="flex flex-col gap-2 border-t border-[#ff6600]/25 p-3 md:flex-row">
              <button type="button" onClick={handleRun} disabled={compiling} className="group inline-flex flex-1 items-center justify-center gap-2 bg-[#ff6600] px-4 py-3 text-sm font-black tracking-[0.18em] text-black transition hover:bg-white hover:shadow-[0_0_25px_rgba(255,102,0,0.6)] disabled:cursor-not-allowed disabled:opacity-60">
                <Play className="h-4 w-4 transition-transform group-hover:scale-110" /> EXECUTE TAKETURN LOOP
              </button>
              <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 border border-[#ff6600]/35 bg-black px-4 py-3 text-xs font-bold tracking-[0.18em] text-[#ff6600] transition hover:bg-[#ff6600]/10 hover:border-[#ff6600]">
                <RotateCcw className="h-4 w-4" /> RESET
              </button>
            </div>
          </section>

          {/* Grid Panel */}
          <section className="w-full border border-[#ff6600]/60 bg-black/90 shadow-[0_0_20px_rgba(255,102,0,0.3),inset_0_0_30px_rgba(255,102,0,0.03)] xl:max-w-[500px]">
            <div className="flex items-center justify-between border-b border-[#ff6600]/60 bg-gradient-to-r from-[#2a1000] to-[#1a0500] px-4 py-2">
              <div className="text-[11px] font-bold tracking-[0.15em] text-white">BOSS_VITAL_SIGNS // GENERAL_MAKAROV</div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] tracking-[0.1em] text-[#ff6600]/50">
                  {makarovState.facing.toUpperCase()}
                </span>
                <Shield className="h-3 w-3" style={{ color: makarovState.shielded ? '#ff3131' : '#555' }} />
                <span className="text-[9px] tracking-[0.1em]" style={{ color: makarovState.shielded ? '#ff3131' : '#555' }}>
                  {makarovState.shielded ? 'SHIELDED' : 'OPEN'}
                </span>
              </div>
            </div>

            {/* HP Bars */}
            <div className="px-4 pt-3 flex gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] tracking-[0.15em] mb-1">
                  <span className="text-[#ff6600]/60">MAKAROV HP</span>
                  <span className="font-bold" style={{ color: mkvHpColor }}>{makarovState.hp}/{BOSS_MAX_HP}</span>
                </div>
                <div className="h-3 w-full bg-[#1a0505] border border-[#ff6600]/20">
                  <div className="h-full transition-all duration-500" style={{ width: `${mkvHpPct}%`, background: `linear-gradient(90deg, ${mkvHpColor}, ${mkvHpColor}88)`, boxShadow: `0 0 10px ${mkvHpColor}66` }} />
                </div>
              </div>
              <div className="w-[140px]">
                <div className="flex items-center justify-between text-[10px] tracking-[0.15em] mb-1">
                  <span className="text-[#39ff14]/60">YOU</span>
                  <span className="font-bold" style={{ color: pHpColor }}>{playerHp}/{PLAYER_MAX_HP}</span>
                </div>
                <div className="h-3 w-full bg-[#051a05] border border-[#39ff14]/20">
                  <div className="h-full transition-all duration-500" style={{ width: `${(playerHp / PLAYER_MAX_HP) * 100}%`, background: `linear-gradient(90deg, ${pHpColor}, ${pHpColor}88)`, boxShadow: `0 0 10px ${pHpColor}66` }} />
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="relative mx-auto" style={{ width: 440, height: 440 }}>
                <div className="absolute left-[20px] top-0 flex" style={{ width: 400 }}>
                  {Array.from({ length: 10 }, (_, i) => (<div key={i} className="flex h-[20px] items-center justify-center text-[9px] tracking-widest text-[#ff6600]/30" style={{ width: 40 }}>{i}</div>))}
                </div>
                <div className="absolute left-0 top-[20px] flex flex-col" style={{ height: 400 }}>
                  {Array.from({ length: 10 }, (_, i) => (<div key={i} className="flex h-[40px] w-[20px] items-center justify-center text-[9px] tracking-widest text-[#ff6600]/30">{i}</div>))}
                </div>

                {/* Main Grid */}
                <div className="absolute overflow-hidden" style={{ left: 20, top: 20, width: 400, height: 400 }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0505] via-[#080404] to-[#0a0303]" />
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(10, 40px)', gridTemplateRows: 'repeat(10, 40px)' }}>
                    {Array.from({ length: 100 }, (_, i) => {
                      const row = Math.floor(i / 10); const col = i % 10; const n = terrainNoise[i]; const isEven = (row + col) % 2 === 0;
                      return <div key={i} className="relative border border-[#1a0a0a]/60" style={{ background: isEven ? `rgba(40,5,5,${0.03+n*0.04})` : `rgba(30,3,3,${0.03+n*0.04})` }} />;
                    })}
                  </div>

                  {/* Patrol path with direction arrows */}
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: 400, height: 400, zIndex: 2 }}>
                    {/* Top edge: Row 2, RIGHT (SHIELD ACTIVE) */}
                    <line x1={SQ[0][0]*40+20} y1={SQ[0][1]*40+20} x2={SQ[1][0]*40+20} y2={SQ[1][1]*40+20} stroke="#ff313144" strokeWidth="2" strokeDasharray="6,4" />
                    <text x={(SQ[0][0]+SQ[1][0])/2*40+20} y={SQ[0][1]*40+12} textAnchor="middle" fill="#ff313166" fontSize="7" fontFamily="monospace">SHIELDED</text>
                    {/* Right edge: DOWN (no shield) */}
                    <line x1={SQ[1][0]*40+20} y1={SQ[1][1]*40+20} x2={SQ[2][0]*40+20} y2={SQ[2][1]*40+20} stroke="#39ff1433" strokeWidth="2" strokeDasharray="6,4" />
                    <text x={SQ[1][0]*40+32} y={(SQ[1][1]+SQ[2][1])/2*40+20} textAnchor="start" fill="#39ff1444" fontSize="7" fontFamily="monospace">OPEN</text>
                    {/* Bottom edge: Row 5, LEFT (DANGER — FIRES) */}
                    <line x1={SQ[2][0]*40+20} y1={SQ[2][1]*40+20} x2={SQ[3][0]*40+20} y2={SQ[3][1]*40+20} stroke="#ff313166" strokeWidth="2" strokeDasharray="6,4" />
                    <text x={(SQ[2][0]+SQ[3][0])/2*40+20} y={SQ[2][1]*40+38} textAnchor="middle" fill="#ff313177" fontSize="7" fontFamily="monospace" fontWeight="bold">FIRES!</text>
                    {/* Left edge: UP (no shield) */}
                    <line x1={SQ[3][0]*40+20} y1={SQ[3][1]*40+20} x2={SQ[0][0]*40+20} y2={SQ[0][1]*40+20} stroke="#39ff1433" strokeWidth="2" strokeDasharray="6,4" />
                    <text x={SQ[3][0]*40-2} y={(SQ[3][1]+SQ[0][1])/2*40+20} textAnchor="end" fill="#39ff1444" fontSize="7" fontFamily="monospace">OPEN</text>
                    {/* Corner dots */}
                    {SQ.map(([bx, by], idx) => (<circle key={idx} cx={bx*40+20} cy={by*40+20} r="3" fill={idx === 2 ? '#ff3131' : idx === 0 ? '#ff3131' : '#ff660044'} />))}
                  </svg>

                  <div className="pointer-events-none absolute inset-0 z-40" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />

                  {/* Explosions */}
                  {explosions.map(exp => (
                    <div key={exp.id} className={`pointer-events-none absolute z-35 level3-explosion-${exp.phase}`} style={{ left: exp.x * CELL - 10, top: exp.y * CELL - 10, width: 60, height: 60 }}>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: exp.phase === 'flash' ? 30 : exp.phase === 'ring' ? 40 : 50, height: exp.phase === 'flash' ? 30 : exp.phase === 'ring' ? 40 : 50, background: exp.phase === 'flash' ? 'radial-gradient(circle, #ffffff 0%, #ff6600 30%, #ff0033 60%, transparent 80%)' : exp.phase === 'ring' ? 'radial-gradient(circle, transparent 40%, #ff6600 60%, #ff0033 80%, transparent 100%)' : 'radial-gradient(circle, transparent 60%, rgba(255,102,0,0.3) 80%, transparent 100%)', opacity: exp.phase === 'flash' ? 1 : exp.phase === 'ring' ? 0.7 : 0.3, transition: 'all 0.3s ease-out' }} />
                    </div>
                  ))}

                  {/* Projectiles */}
                  {projectiles.map(proj => (
                    <div key={proj.id} className="pointer-events-none absolute z-30">
                      <div className={`absolute ${proj.type === 'LASER' ? 'h-[3px] w-[18px]' : proj.type === 'BOSS' ? 'h-[6px] w-[14px]' : 'h-[8px] w-[8px] rounded-full'}`}
                        style={{ background: proj.type === 'LASER' ? 'linear-gradient(90deg, transparent, #39ff14, #ffffff)' : proj.type === 'BOSS' ? 'linear-gradient(90deg, #ff0033, #ffffff)' : 'radial-gradient(circle, #ffcc00, #ff6600)', boxShadow: proj.type === 'LASER' ? '0 0 12px #39ff14, 0 0 4px #ffffff' : proj.type === 'BOSS' ? '0 0 12px #ff0033, 0 0 4px #ffffff' : '0 0 12px #ff6600, 0 0 4px #ffffff', left: proj.fired ? proj.toX * CELL + 12 : proj.fromX * CELL + 28, top: proj.fired ? proj.toY * CELL + 18.5 : proj.fromY * CELL + 18.5, transition: 'all 0.25s linear' }} />
                    </div>
                  ))}

                  {/* General Makarov */}
                  <div className="absolute z-20 overflow-visible" style={{ left: makarovState.x * CELL, top: makarovState.y * CELL, width: 40, height: 40, transition: 'left 130ms linear, top 130ms linear' }}>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full level3-boss-aura" style={{ width: 50, height: 50, background: makarovState.shielded ? 'radial-gradient(circle, rgba(0,150,255,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,0,51,0.2) 0%, transparent 70%)', transition: 'background 0.4s ease' }} />
                    {/* Tank body — rotates with facing. Turns BLUE when shielded */}
                    <div className="absolute inset-0" style={{ transform: `rotate(${FACING_DEG[makarovState.facing]}deg)`, transition: 'transform 0.3s ease' }}>
                      <svg viewBox="0 0 40 40" width="40" height="40">
                        <rect x="2" y="4" width="36" height="6" rx="2" fill={makarovState.shielded ? '#001a33' : '#330000'} stroke={makarovState.shielded ? '#0088ff' : '#ff6600'} strokeWidth="0.8"/>
                        <rect x="2" y="30" width="36" height="6" rx="2" fill={makarovState.shielded ? '#001a33' : '#330000'} stroke={makarovState.shielded ? '#0088ff' : '#ff6600'} strokeWidth="0.8"/>
                        <rect x="4" y="11" width="32" height="18" rx="2" fill={makarovState.shielded ? '#002244' : '#440000'} stroke={makarovState.shielded ? '#0088ff' : '#ff6600'} strokeWidth="1"/>
                        <ellipse cx="18" cy="20" rx="8" ry="7" fill={makarovState.shielded ? '#001a33' : '#330000'} stroke={makarovState.shielded ? '#0088ff' : '#ff6600'} strokeWidth="1"/>
                        <rect x="22" y="18" width="14" height="4" rx="1" fill={makarovState.shielded ? '#0088ff' : '#ff6600'}/>
                        <polygon points="14,15 15.5,18 18,18 16,20 17,23 14,21 11,23 12,20 10,18 12.5,18" fill={makarovState.shielded ? '#0088ff' : '#ff6600'} opacity="0.8"/>
                      </svg>
                    </div>
                    <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black tracking-wider"
                      style={{ color: makarovState.facing === 'left' ? '#ff3131' : makarovState.shielded ? '#0088ff' : '#ff6600', textShadow: `0 0 6px ${makarovState.facing === 'left' ? 'rgba(255,49,49,0.8)' : makarovState.shielded ? 'rgba(0,136,255,0.5)' : 'rgba(255,102,0,0.5)'}`, transition: 'color 0.4s ease' }}>
                      MAKAROV{makarovState.shielded ? ' SHIELDED' : ''}{makarovState.facing === 'left' ? ' !' : ''}
                    </span>
                  </div>

                  {/* Player Tank — turns BLUE when shielded */}
                  <div className="absolute z-15 overflow-visible" style={{ left: tankPos.x * CELL, top: tankPos.y * CELL, width: 40, height: 40 }}>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full level3-tank-aura" style={{
                      width: 50, height: 50,
                      background: playerShielded
                        ? 'radial-gradient(circle, rgba(0,170,255,0.3) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)',
                      transition: 'background 0.3s ease',
                    }} />
                    <div className="absolute inset-0 transition-all duration-[250ms] ease-linear">
                      <svg viewBox="0 0 40 40" width="40" height="40">
                        <rect x="4" y="6" width="32" height="6" rx="2" fill={playerShielded ? '#001a33' : '#1a7a1a'} stroke={playerShielded ? '#0088ff' : '#39ff14'} strokeWidth="0.8"/>
                        <rect x="4" y="28" width="32" height="6" rx="2" fill={playerShielded ? '#001a33' : '#1a7a1a'} stroke={playerShielded ? '#0088ff' : '#39ff14'} strokeWidth="0.8"/>
                        {[6,12,18,24,30].map(x => <React.Fragment key={`t${x}`}><rect x={x} y="7" width="3" height="4" rx="0.5" fill={playerShielded ? '#0088ff' : '#39ff14'} opacity="0.5"/><rect x={x} y="29" width="3" height="4" rx="0.5" fill={playerShielded ? '#0088ff' : '#39ff14'} opacity="0.5"/></React.Fragment>)}
                        <rect x="6" y="13" width="26" height="14" rx="2" fill={playerShielded ? '#002244' : '#006400'} stroke={playerShielded ? '#0088ff' : '#39ff14'} strokeWidth="1"/>
                        <ellipse cx="18" cy="20" rx="7" ry="6" fill={playerShielded ? '#001a33' : '#004d00'} stroke={playerShielded ? '#0088ff' : '#39ff14'} strokeWidth="1"/>
                        <rect x="22" y="18.5" width="13" height="3" rx="1" fill={playerShielded ? '#0088ff' : '#39ff14'}/>
                        <circle cx="35" cy="20" r="1.5" fill={playerShielded ? '#0088ff' : '#39ff14'} opacity="0.4"/>
                        <circle cx="17" cy="20" r="1.5" fill={playerShielded ? '#0088ff' : '#39ff14'} opacity="0.8"/>
                      </svg>
                    </div>
                    {playerShielded && (
                      <span className="absolute -top-[12px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-black tracking-widest text-[#00aaff]"
                        style={{ textShadow: '0 0 8px rgba(0,170,255,0.9)' }}>SHIELDED</span>
                    )}
                  </div>

                  <div className="absolute bottom-1 left-1 z-20 border border-[#ff6600]/20 bg-black/80 px-2 py-1 text-[9px] tracking-[0.15em] text-[#ff6600]/60 backdrop-blur-sm">
                    POS: R{tankPos.y} C{tankPos.x}
                  </div>
                </div>
              </div>

              <div className="mt-3 border border-[#ff6600]/20 bg-[#0a0200]/80 px-3 py-2">
                <div className="mb-1.5 text-[9px] tracking-[0.15em] text-[#ff6600]/50">OOP CONCEPTS TESTED</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Abstraction', 'Polymorphism', 'Aggregation', 'Composition', 'Memory Mgmt'].map(c => (
                    <span key={c} className="border border-[#ff6600]/20 bg-[#1a0500]/60 px-2 py-0.5 text-[8px] tracking-wider text-[#ff6600]/70">{c}</span>
                  ))}
                </div>
              </div>

              <div className="mt-2 border border-[#ff6600]/15 bg-black/70 px-3 py-2 text-[10px] leading-5 text-[#ff6600]/50">
                <div className="mb-1 text-[9px] font-bold tracking-[0.2em] text-[#ff6600]/70">QUICK REFERENCE</div>
                <div>Dir 1 (RIGHT, row 2): <span className="text-[#ff3131]/80">SHIELDED</span> → print <span className="text-white/70">FIRE:LASER</span></div>
                <div>Dir 2/4 (DOWN/UP): <span className="text-[#39ff14]/80">OPEN</span> → print <span className="text-white/70">FIRE:CANNON</span></div>
                <div>Dir 3 (LEFT, row 5): <span className="text-[#ff3131] font-bold">FIRES AT YOU</span> → print <span className="text-white/70">SHIELD</span></div>
                <div>Position: 3 cells left of boss, same row. Boss square: rows 2-5, cols 6-9.</div>
              </div>

              {resultStatus !== 'idle' && (
                <div className={`mt-3 border px-3 py-3 text-sm font-bold tracking-[0.14em] ${resultStatus === 'success' ? 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]' : 'border-[#ff3131] bg-[#ff3131]/10 text-[#ff8080]'}`}
                  style={resultStatus === 'success' ? { boxShadow: '0 0 20px rgba(57,255,20,0.2)' } : { boxShadow: '0 0 20px rgba(255,49,49,0.2)' }}>
                  {resultStatus === 'success' ? 'MAKAROV TERMINATED // LEVEL 3 COMPLETE' : 'MISSION FAILED // ADJUST YOUR STRATEGY'}
                  {resultStatus === 'success' && (
                    <button
                      type="button"
                      onClick={() => {
                        markLevelComplete(3);
                        navigate('/competition/round2');
                      }}
                      className="mt-3 w-full border border-[#39ff14] bg-[#39ff14] px-4 py-2 text-xs font-black tracking-[0.18em] text-black transition hover:bg-white"
                    >
                      RETURN TO LEVEL SELECT
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Terminal */}
        <section className="mt-5 border border-[#ff6600]/60 bg-black/90 shadow-[0_0_20px_rgba(255,102,0,0.3)]">
          <div className="flex items-center justify-between border-b border-[#ff6600]/60 bg-gradient-to-r from-[#2a1000] to-[#1a0500] px-4 py-2">
            <div className="text-[11px] font-bold tracking-[0.15em] text-white">COMBAT_LOG</div>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-[#ff6600] animate-pulse" /><span className="text-[9px] tracking-[0.1em] text-[#ff6600]/40">LIVE</span></div>
          </div>
          <div className="max-h-[160px] min-h-[100px] overflow-y-auto bg-[#050101] p-4 text-xs leading-6">
            {terminalLines.map((line, idx) => (
              <div key={idx}
                className={line.includes('HIT!') ? 'text-[#39ff14]' : line.includes('NO EFFECT') ? 'text-[#ffcc00]' : line.includes('HIT BY') ? 'text-[#ff3131] font-bold' : line.includes('SHIELD ACTIVE') ? 'text-[#39ff14]' : line.includes('SUCCESS') ? 'text-[#39ff14]' : line.includes('FAILED') ? 'text-[#ff3131]' : line.includes('ERROR') ? 'text-[#ff3131]' : line.includes('FIRES') || line.includes('FACING LEFT') ? 'text-[#ff3131]/80' : line.includes('TURN') ? 'text-[#ff6600]' : 'text-[#ff6600]/70'}
                style={line.includes('SUCCESS') ? { background: 'linear-gradient(90deg, rgba(57,255,20,0.15), transparent)', padding: '4px 8px', fontWeight: 'bold', textShadow: '0 0 10px rgba(57,255,20,0.5)' } : undefined}
              >
                <span className="text-[#ff6600]/30 mr-2">&gt;</span>{line}
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .level3-boss-aura { animation: level3-boss-pulse 1.5s ease-in-out infinite; }
        @keyframes level3-boss-pulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } }
        .level3-tank-aura { animation: level3-aura 1.5s ease-in-out infinite; }
        @keyframes level3-aura { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); } }
        .level3-explosion-flash { animation: l3ef 0.3s ease-out forwards; }
        @keyframes l3ef { 0% { transform: scale(0.3); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .level3-explosion-ring { animation: l3er 0.3s ease-out forwards; }
        @keyframes l3er { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.2); opacity: 0.5; } }
        .level3-explosion-fade { animation: l3efa 0.3s ease-out forwards; }
        @keyframes l3efa { 0% { opacity: 0.5; } 100% { opacity: 0; transform: scale(1.3); } }
      `}</style>
    </div>
  );
}
