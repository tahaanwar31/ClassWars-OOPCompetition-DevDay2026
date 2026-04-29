import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Crosshair } from 'lucide-react';
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
  '.cm-gutters': { background: '#0a0a0a !important', borderRight: '1px solid #1a3a1a', color: '#39ff1455' },
  '.cm-activeLine': { background: '#001800 !important' },
  '.cm-activeLineGutter': { background: '#001800 !important' },
  '.cm-selectionBackground': { background: '#00aa3399 !important' },
  '&.cm-focused .cm-selectionBackground': { background: '#00cc4499 !important' },
  '.cm-cursor': { borderLeftColor: '#39ff14 !important', borderLeftWidth: '2px !important' },
});

const CLIENT_ID = import.meta.env.VITE_JDOODLE_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_JDOODLE_CLIENT_SECRET as string;
const CELL = 40;

// Always use backend compile endpoint
const COMPILE_URL = '/compile';

interface Enemy {
  x: number;
  y: number;
  hit: boolean;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  phase: 'flash' | 'ring' | 'fade';
}

interface MuzzleFlash {
  id: number;
  x: number;
  y: number;
}

function makeEnemies(): Enemy[] {
  return Array.from({ length: 8 }, (_, x) => ({
    x: x + 2,
    y: Math.floor(Math.random() * 10),
    hit: false,
  }));
}

function buildStarterCode(enemies: Enemy[]): string {
  const targetsArr = enemies.map(e => `{${e.y}, ${e.x}}`).join(', ');
  return `class MyTank : public Tank {
private:
    int r = 0, c = 0;
    int currentTarget = 0;
    // {row, col} format
    int targets[8][2] = {${targetsArr}};

public:
    void move() override {
        int tr = targets[currentTarget][0];
        int tc = targets[currentTarget][1];

        int lockRow = tr;
        int lockCol = tc - 2;

        while(r != lockRow || c != lockCol) {
            if(c < lockCol) c++;
            else if(c > lockCol) c--;
            else if(r < lockRow) r++;
            else if(r > lockRow) r--;
            cout << "STEP:" << r << "," << c << endl;
        }
    }
    void attack() override {
        int tr = targets[currentTarget][0];
        int tc = targets[currentTarget][1];
        fire(tr, tc);
        currentTarget++;
    }
    void defend() override {}
};

int main() {
    MyTank t;
    for(int i = 0; i < 8; i++) {
        t.move();
        t.attack();
    }
    return 0;
}`;
}

function makeInitialState() {
  const enemies = makeEnemies();
  return { enemies, code: buildStarterCode(enemies) };
}

const HIDDEN_HEADER = `#include <iostream>
using namespace std;
class Tank { public: virtual void move() = 0; virtual void attack() = 0; virtual void defend() = 0; };
void fire(int tr, int tc) { cout << "FIRE:" << tr << "," << tc << endl; }
`;

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

// Pre-generate terrain noise so it stays stable across renders
const terrainNoise = Array.from({ length: 100 }, (_, i) => {
  const row = Math.floor(i / 10);
  const col = i % 10;
  const v = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
  const n = v - Math.floor(v);
  return n;
});

export default function Level2() {
  const navigate = useNavigate();
  const { contestEnded } = useContestTimer('round2');

  const [init] = useState(() => makeInitialState());
  const [enemies, setEnemies] = useState<Enemy[]>(init.enemies);
  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;
  const [code, setCode] = useState<string>(init.code);
  const [tankPos, setTankPos] = useState({ x: 0, y: 0 });
  const [terminalLines, setTerminalLines] = useState<string[]>(['root@tank: scanning...']);
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const [compiling, setCompiling] = useState(false);
  const [projectiles, setProjectiles] = useState<{ id: number; fromX: number; fromY: number; toX: number; toY: number; fired: boolean }[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [muzzleFlashes, setMuzzleFlashes] = useState<MuzzleFlash[]>([]);
  const [kills, setKills] = useState(0);

  const abortRef = useRef(false);
  const projectileIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const flashIdRef = useRef(0);

  useEffect(() => () => { abortRef.current = true; }, []);

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  function spawnExplosion(tx: number, ty: number) {
    const id = ++explosionIdRef.current;
    setExplosions(prev => [...prev, { id, x: tx, y: ty, phase: 'flash' }]);
    setTimeout(() => {
      setExplosions(prev => prev.map(e => e.id === id ? { ...e, phase: 'ring' } : e));
    }, 100);
    setTimeout(() => {
      setExplosions(prev => prev.map(e => e.id === id ? { ...e, phase: 'fade' } : e));
    }, 400);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== id));
    }, 700);
  }

  function spawnMuzzleFlash(sx: number, sy: number) {
    const id = ++flashIdRef.current;
    setMuzzleFlashes(prev => [...prev, { id, x: sx, y: sy }]);
    setTimeout(() => {
      setMuzzleFlashes(prev => prev.filter(f => f.id !== id));
    }, 150);
  }

  function shoot(sx: number, sy: number, tx: number, ty: number) {
    const id = ++projectileIdRef.current;
    setProjectiles(prev => [...prev, { id, fromX: sx, fromY: sy, toX: tx, toY: ty, fired: false }]);
    spawnMuzzleFlash(sx, sy);

    setTimeout(() => {
      setProjectiles(prev => prev.map(p => p.id === id ? { ...p, fired: true } : p));
    }, 50);

    setTimeout(() => {
      setProjectiles(prev => prev.filter(p => p.id !== id));
      spawnExplosion(tx, ty);
      setKills(prev => prev + 1);
      setEnemies(prev => prev.map(e =>
        e.x === tx && e.y === ty ? { ...e, hit: true } : e
      ));
    }, 300);
  }

  function handleReset() {
    abortRef.current = true;
    setTimeout(() => { abortRef.current = false; }, 0);
    const ens = makeEnemies();
    setEnemies(ens);
    setCode(buildStarterCode(ens));
    setTankPos({ x: 0, y: 0 });
    setTerminalLines(['root@tank: scanning...']);
    setResultStatus('idle');
    setCompiling(false);
    setProjectiles([]);
    setExplosions([]);
    setMuzzleFlashes([]);
    setKills(0);
  }

  async function handleRun() {
    abortRef.current = true;
    await sleep(10);
    abortRef.current = false;

    setCompiling(true);
    setResultStatus('idle');
    setTankPos({ x: 0, y: 0 });
    setEnemies(prev => prev.map(e => ({ ...e, hit: false })));
    setTerminalLines(['>> BOOTING...']);
    setProjectiles([]);
    setExplosions([]);
    setMuzzleFlashes([]);
    setKills(0);

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
        setResultStatus('failure');
        setCompiling(false);
        return;
      }

      const output: string = data.output;

      const compileErr = parseCompileError(output);
      if (compileErr) {
        setTerminalLines([`>> Code failed to execute: Syntax problem — ${compileErr}`]);
        setResultStatus('failure');
        setCompiling(false);
        return;
      }

      const lines = output.split('\n');
      let i = 0;
      let curRow = 0;
      let curCol = 0;

      const processNext = async () => {
        while (i < lines.length) {
          if (abortRef.current) return;
          const line = lines[i++].trim();

          if (line.startsWith('STEP:')) {
            const parts = line.split(':')[1].split(',').map(Number);
            const rawRow = parts[0];
            const rawCol = parts[1];

            if (rawRow < 0 || rawRow > 9 || rawCol < 0 || rawCol > 9) {
              setTerminalLines(prev => [...prev, `>> BOUNDS ERROR: Tank cannot leave the arena (tried R${rawRow} C${rawCol})`]);
              setResultStatus('failure');
              setCompiling(false);
              return;
            }

            curRow = rawRow;
            curCol = rawCol;
            setTankPos({ x: rawCol, y: rawRow });
            await sleep(120);
          } else if (line.startsWith('FIRE:')) {
            const parts = line.split(':')[1].split(',').map(Number);
            const trow = parts[0];
            const tcol = parts[1];
            const colOffset = tcol - curCol;

            if (curRow !== trow) {
              setTerminalLines(prev => [...prev, `>> FIRE_ERROR: NOT ALIGNED — row ${curRow} vs target row ${trow}. Must be on same row.`]);
            } else if (colOffset !== 2) {
              if (colOffset > 2) {
                setTerminalLines(prev => [...prev, `>> FIRE_ERROR: TARGET OUT OF RANGE — ${colOffset} cells away. Must lock at exactly 2 cells left.`]);
              } else if (colOffset > 0) {
                setTerminalLines(prev => [...prev, `>> FIRE_ERROR: TOO CLOSE — ${colOffset} cells away. Must lock at exactly 2 cells left.`]);
              } else {
                setTerminalLines(prev => [...prev, `>> FIRE_ERROR: INVALID POSITION — tank is at/past target. Must be 2 cells LEFT of target.`]);
              }
            } else {
              shoot(curCol, curRow, tcol, trow);
              await sleep(350);
            }
          }
        }

        if (abortRef.current) return;

        const won = enemiesRef.current.every(e => e.hit);
        if (won) {
          setTerminalLines(prev => [...prev, '>> SUCCESS: LEVEL 2 CLEARED.']);
          setResultStatus('success');
        } else {
          const destroyed = enemiesRef.current.filter(e => e.hit).length;
          setTerminalLines(prev => [...prev, `>> PURGE FAILED — ${destroyed}/8 hostiles eliminated. All targets must be destroyed.`]);
          setResultStatus('failure');
        }
        setCompiling(false);
      };

      processNext();
    } catch {
      setTerminalLines(['>> Code failed to execute: Connection error.']);
      setResultStatus('failure');
      setCompiling(false);
    }
  }

  const destroyedCount = enemies.filter(e => e.hit).length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#39ff14] font-mono px-4 py-5 scanlines crt-flicker relative overflow-hidden">
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
        <div className="absolute top-[-15%] left-[8%] h-[420px] w-[420px] rounded-full bg-[#ff0033]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[10%] h-[360px] w-[360px] rounded-full bg-[#ff6600]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-[#ff0033]/15 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] tracking-[0.35em] text-[#ff0033]/60">
              <Crosshair className="h-3 w-3" />
              SYSTEM_LEVEL_02 // COMBAT_PURGE_PROTOCOL
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-[0.18em] md:text-4xl" style={{ textShadow: '0 0 10px #ff0033, 0 0 30px rgba(255,0,51,0.3)' }}>
              CLASS WARS: LEVEL 2
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/competition/round2')}
              className="inline-flex items-center gap-2 border border-[#ff0033]/30 bg-black/60 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#ff0033] transition hover:border-[#ff0033] hover:bg-[#ff0033]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK
            </button>
            <div className="border border-[#ff0033]/30 bg-black/70 px-4 py-2 text-xs tracking-[0.18em]">
              <span className="text-[#ff0033]/60">STATUS:</span>{' '}
              <span className={compiling ? 'animate-pulse text-[#ff6600]' : resultStatus === 'success' ? 'text-[#39ff14]' : resultStatus === 'failure' ? 'text-[#ff3131]' : 'text-white'}>
                {compiling ? 'EXECUTING...' : resultStatus === 'idle' ? 'READY' : resultStatus === 'success' ? 'COMPLETE' : 'FAILED'}
              </span>
            </div>
            {/* Kill Counter */}
            <div className="flex items-center gap-1.5 border border-[#ff0033]/40 bg-[#1a0000]/80 px-3 py-2 text-xs tracking-[0.1em]">
              <span className="text-[#ff6600]/60">KILLS:</span>
              <span className="font-black text-[#ff0033]" style={{ textShadow: '0 0 8px rgba(255,0,51,0.6)' }}>{destroyedCount}</span>
              <span className="text-[#ff0033]/40">/8</span>
            </div>
          </div>
        </div>

                {/* BRIEFING */}
        <div className="border border-[#39ff14]/30 bg-[#020802]/90 px-4 py-3">
          <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#39ff14]">MISSION BRIEFING — LEVEL 2: COMBAT PURGE</div>

          <div className="grid gap-x-8 gap-y-3 text-[10px] leading-[1.7] md:grid-cols-2 lg:grid-cols-3">

            {/* OBJECTIVE */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">OBJECTIVE</div>
              <div className="text-[#6699ff]">Destroy all 8 enemy tanks on the 10x10 grid.</div>
              <div className="text-[#6699ff]">Hover over an enemy tank to see its (row, col) coordinates.</div>
            </div>

            {/* CLASS: Tank */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: Tank (provided base class — hidden from your view)</div>
              <div className="text-[#6699ff]">class Tank has 3 pure virtual methods: move(), attack(), defend().</div>
              <div className="text-[#6699ff]">You cannot use Tank directly — it has no implementation.</div>
              <div className="text-[#6699ff]">You MUST create MyTank that inherits from Tank and override all 3 methods.</div>
            </div>

            {/* CLASS: MyTank */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: MyTank (your class)</div>
              <div className="text-[#6699ff]">Inherit: class MyTank : public Tank.</div>
              <div className="text-[#6699ff]">Use int r (row) and int c (col) to track your tank position on the grid.</div>
              <div className="text-[#6699ff]">targets[8][2] array stores enemy positions: targets[i][0] = row, targets[i][1] = col.</div>
              <div className="text-[#6699ff]">Use int currentTarget to track which enemy you are hunting.</div>
            </div>

            {/* MOVEMENT */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">MOVEMENT (move method)</div>
              <div className="text-[#6699ff]">Use r++ (down), r-- (up), c++ (right), c-- (left) to move one cell at a time.</div>
              <div className="text-[#6699ff]">After each step, print: cout &lt;&lt; "STEP:" &lt;&lt; r &lt;&lt; "," &lt;&lt; c &lt;&lt; endl;</div>
              <div className="text-[#6699ff]">Move to the lock position: same row as target, but 2 columns to the LEFT.</div>
            </div>

            {/* FIRING */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">FIRING (attack method)</div>
              <div className="text-[#6699ff]">fire(targetRow, targetCol) is a BUILT-IN function — it handles shooting for you.</div>
              <div className="text-[#6699ff]">You must be exactly 2 cells LEFT of the target on the SAME row before calling fire().</div>
              <div className="text-[#6699ff]">So your lock column = target column - 2, and your row = target row.</div>
              <div className="text-[#6699ff]">After firing, increment currentTarget++ to move to the next enemy.</div>
            </div>

            {/* GAME LOOP */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">GAME LOOP</div>
              <div className="text-[#6699ff]">In main(), loop 8 times: call move() to reach lock position, then attack() to fire.</div>
              <div className="text-[#6699ff]">defend() can be left empty — not used in this level.</div>
              <div className="text-[#6699ff]">Enemy positions are randomized each session. Read them from targets[][] array.</div>
            </div>

          </div>
        </div>

        {/* Editor + Arena Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-5">

          {/* Code Editor Panel */}
          <section className="flex-1 border border-[#ff0033]/60 bg-black/90 shadow-[0_0_20px_rgba(255,0,51,0.3),inset_0_0_30px_rgba(255,0,51,0.03)]">
            <div className="flex items-center justify-between border-b border-[#ff0033]/60 bg-gradient-to-r from-[#2a0000] to-[#1a0000] px-4 py-2">
              <div className="text-[11px] font-bold tracking-[0.15em] text-white">
                C++ COMBAT_OS.CPP
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#ff0033] animate-pulse" />
                <span className="text-[9px] tracking-[0.1em] text-[#ff0033]/60">LIVE</span>
              </div>
            </div>
            <CodeMirror
              value={code}
              onChange={setCode}
              height="460px"
              theme={[oneDark, cppTheme]}
              extensions={[
                cpp(),
                keymap.of([indentWithTab]),
                EditorView.lineWrapping,
              ]}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                indentOnInput: true,
              }}
            />
            <div className="flex flex-col gap-2 border-t border-[#ff0033]/25 p-3 md:flex-row">
              <button
                type="button"
                onClick={handleRun}
                disabled={compiling}
                className="group inline-flex flex-1 items-center justify-center gap-2 bg-[#ff0033] px-4 py-3 text-sm font-black tracking-[0.18em] text-black transition hover:bg-white hover:shadow-[0_0_25px_rgba(255,0,51,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
                ENGAGE PURGE
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 border border-[#ff0033]/35 bg-black px-4 py-3 text-xs font-bold tracking-[0.18em] text-[#ff0033] transition hover:bg-[#ff0033]/10 hover:border-[#ff0033]"
              >
                <RotateCcw className="h-4 w-4" />
                RESET
              </button>
            </div>
          </section>

          {/* Grid Panel */}
          <section className="w-full border border-[#ff0033]/60 bg-black/90 shadow-[0_0_20px_rgba(255,0,51,0.3),inset_0_0_30px_rgba(255,0,51,0.03)] xl:max-w-[500px]">
            <div className="flex items-center justify-between border-b border-[#ff0033]/60 bg-gradient-to-r from-[#2a0000] to-[#1a0000] px-4 py-2">
              <div className="text-[11px] font-bold tracking-[0.15em] text-white">
                BATTLE_GRID // TACTICAL_OVERLAY
              </div>
              <div className="text-[9px] tracking-[0.1em] text-[#ff0033]/40">
                {destroyedCount === 8 ? 'AREA CLEAR' : 'THREAT ACTIVE'}
              </div>
            </div>
            <div className="p-4">
              {/* Grid container with coordinate labels */}
              <div className="relative mx-auto" style={{ width: 440, height: 440 }}>
                {/* Column labels (top) */}
                <div className="absolute left-[20px] top-0 flex" style={{ width: 400 }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex h-[20px] items-center justify-center text-[9px] tracking-widest text-[#ff0033]/30" style={{ width: 40 }}>
                      {i}
                    </div>
                  ))}
                </div>

                {/* Row labels (left) */}
                <div className="absolute left-0 top-[20px] flex flex-col" style={{ height: 400 }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex h-[40px] w-[20px] items-center justify-center text-[9px] tracking-widest text-[#ff0033]/30">
                      {i}
                    </div>
                  ))}
                </div>

                {/* Main Grid */}
                <div
                  className="absolute overflow-visible"
                  style={{ left: 20, top: 20, width: 400, height: 400 }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0505] via-[#080404] to-[#0a0303]" />

                  {/* Grid cells with terrain variation */}
                  <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: 'repeat(10, 40px)', gridTemplateRows: 'repeat(10, 40px)' }}
                  >
                    {Array.from({ length: 100 }, (_, i) => {
                      const row = Math.floor(i / 10);
                      const col = i % 10;
                      const n = terrainNoise[i];
                      const isEven = (row + col) % 2 === 0;
                      const opacity = 0.03 + n * 0.04;
                      return (
                        <div
                          key={i}
                          className="relative border border-[#1a0a0a]/60"
                          style={{
                            background: isEven
                              ? `rgba(40, 5, 5, ${opacity})`
                              : `rgba(30, 3, 3, ${opacity})`,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Subtle grid scan line */}
                  <div className="level2-grid-scan absolute inset-0 pointer-events-none z-5" />

                  {/* Vignette overlay */}
                  <div className="pointer-events-none absolute inset-0 z-40" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />

                  {/* Enemies */}
                  {enemies.map((en, idx) => (
                    <div key={idx} className="group absolute" style={{ left: en.x * CELL, top: en.y * CELL, width: 40, height: 40, zIndex: 10 }}>
                      {/* Targeting reticle (behind enemy) */}
                      {!en.hit && (
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 level2-reticle"
                          style={{ width: 36, height: 36 }}
                        />
                      )}
                      {/* Enemy unit */}
                      <div
                        className={`absolute left-[5px] top-[5px] flex h-[30px] w-[30px] cursor-crosshair items-center justify-center transition-all duration-500 ${
                          en.hit ? 'pointer-events-none scale-0 opacity-0' : 'opacity-100'
                        }`}
                      >
                        {/* Enemy tank SVG */}
                        <svg viewBox="0 0 30 30" width="30" height="30" className="level2-enemy-pulse">
                          {/* Tracks */}
                          <rect x="2" y="4" width="26" height="5" rx="1.5" fill="#660000" stroke="#ff0033" strokeWidth="0.6"/>
                          <rect x="2" y="21" width="26" height="5" rx="1.5" fill="#660000" stroke="#ff0033" strokeWidth="0.6"/>
                          {/* Track treads */}
                          {[3,8,13,18,23].map(x => <React.Fragment key={`et${x}`}><rect x={x} y="5" width="2.5" height="3" rx="0.3" fill="#ff0033" opacity="0.4"/><rect x={x} y="22" width="2.5" height="3" rx="0.3" fill="#ff0033" opacity="0.4"/></React.Fragment>)}
                          {/* Hull */}
                          <rect x="4" y="10" width="22" height="10" rx="1.5" fill="#990000" stroke="#ff3131" strokeWidth="0.8"/>
                          {/* Turret */}
                          <ellipse cx="14" cy="15" rx="5.5" ry="4.5" fill="#770000" stroke="#ff0033" strokeWidth="0.8"/>
                          {/* Barrel pointing LEFT (adversary direction) */}
                          <rect x="0" y="13.5" width="10" height="2.5" rx="0.8" fill="#ff0033"/>
                          {/* Threat dot */}
                          <circle cx="14" cy="15" r="1.2" fill="#ff0033" opacity="0.9"/>
                        </svg>
                        {/* Threat label */}
                        <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold tracking-wider text-[#ff0033]/70">
                          TGT-{idx + 1}
                        </span>
                      </div>
                      {/* Coordinate tooltip on hover */}
                      {!en.hit && (
                        <div className="pointer-events-none absolute -top-[26px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-0.5 text-[9px] font-bold text-black opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-opacity group-hover:opacity-100">
                          ({en.y}, {en.x})
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Muzzle Flashes */}
                  {muzzleFlashes.map(flash => (
                    <div
                      key={flash.id}
                      className="pointer-events-none absolute z-25"
                      style={{
                        left: flash.x * CELL + 32,
                        top: flash.y * CELL + 12,
                        width: 20,
                        height: 16,
                      }}
                    >
                      <div className="level2-muzzle-flash h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, #ffffff 0%, #ffcc00 30%, #ff6600 60%, transparent 80%)' }} />
                    </div>
                  ))}

                  {/* Projectiles */}
                  {projectiles.map(proj => (
                    <div key={proj.id} className="pointer-events-none absolute z-30">
                      {/* Tracer core */}
                      <div
                        className="absolute h-[3px] w-[18px] rounded-sm"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #ffcc00, #ffffff)',
                          boxShadow: '0 0 12px #ff6600, 0 0 4px #ffffff, 0 0 20px rgba(255,102,0,0.5)',
                          left: proj.fired ? proj.toX * CELL + 8 : proj.fromX * CELL + 28,
                          top: proj.fired ? proj.toY * CELL + 18.5 : proj.fromY * CELL + 18.5,
                          transition: 'all 0.25s linear',
                        }}
                      />
                      {/* Tracer trail glow */}
                      <div
                        className="absolute h-[8px] w-[30px] rounded-full"
                        style={{
                          background: 'radial-gradient(ellipse, rgba(255,102,0,0.4) 0%, transparent 70%)',
                          left: proj.fired ? proj.toX * CELL + 2 : proj.fromX * CELL + 22,
                          top: proj.fired ? proj.toY * CELL + 16 : proj.fromY * CELL + 16,
                          transition: 'all 0.25s linear',
                        }}
                      />
                    </div>
                  ))}

                  {/* Explosions */}
                  {explosions.map(exp => (
                    <div
                      key={exp.id}
                      className={`pointer-events-none absolute z-35 level2-explosion-${exp.phase}`}
                      style={{
                        left: exp.x * CELL - 10,
                        top: exp.y * CELL - 10,
                        width: 60,
                        height: 60,
                      }}
                    >
                      {/* Central flash */}
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          width: exp.phase === 'flash' ? 30 : exp.phase === 'ring' ? 40 : 50,
                          height: exp.phase === 'flash' ? 30 : exp.phase === 'ring' ? 40 : 50,
                          background: exp.phase === 'flash'
                            ? 'radial-gradient(circle, #ffffff 0%, #ffcc00 30%, #ff6600 60%, transparent 80%)'
                            : exp.phase === 'ring'
                            ? 'radial-gradient(circle, transparent 40%, #ff6600 60%, #ff0033 80%, transparent 100%)'
                            : 'radial-gradient(circle, transparent 60%, rgba(255,0,51,0.3) 80%, transparent 100%)',
                          opacity: exp.phase === 'flash' ? 1 : exp.phase === 'ring' ? 0.7 : 0.3,
                          transition: 'all 0.3s ease-out',
                        }}
                      />
                      {/* Expanding ring */}
                      {(exp.phase === 'ring' || exp.phase === 'fade') && (
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                          style={{
                            width: exp.phase === 'ring' ? 50 : 60,
                            height: exp.phase === 'ring' ? 50 : 60,
                            borderColor: exp.phase === 'ring' ? '#ff6600' : 'rgba(255,102,0,0.2)',
                            boxShadow: exp.phase === 'ring' ? '0 0 15px rgba(255,102,0,0.5), inset 0 0 10px rgba(255,0,51,0.3)' : 'none',
                            transition: 'all 0.3s ease-out',
                          }}
                        />
                      )}
                      {/* Debris particles */}
                      {exp.phase === 'flash' && (
                        <>
                          <div className="level2-debris-1 absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full bg-[#ffcc00]" />
                          <div className="level2-debris-2 absolute left-1/2 top-1/2 h-[2px] w-[2px] rounded-full bg-[#ff6600]" />
                          <div className="level2-debris-3 absolute left-1/2 top-1/2 h-[2px] w-[2px] rounded-full bg-[#ff0033]" />
                          <div className="level2-debris-4 absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full bg-[#ffffff]" />
                        </>
                      )}
                    </div>
                  ))}

                  {/* Player Tank */}
                  <div
                    className="absolute z-20"
                    style={{ left: tankPos.x * CELL, top: tankPos.y * CELL, width: 40, height: 40 }}
                  >
                    {/* Tank glow aura */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full level2-tank-aura"
                      style={{ width: 50, height: 50, background: 'radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)' }}
                    />
                    {/* Tank body */}
                    <div className="absolute inset-0 transition-all duration-[150ms] ease-linear">
                      <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                        {/* Track glow */}
                        <rect x="3" y="5" width="34" height="8" rx="2" fill="none" stroke="#39ff14" strokeWidth="0.3" opacity="0.3"/>
                        <rect x="3" y="27" width="34" height="8" rx="2" fill="none" stroke="#39ff14" strokeWidth="0.3" opacity="0.3"/>
                        {/* Tracks */}
                        <rect x="4" y="6" width="32" height="6" rx="2" fill="#1a7a1a" stroke="#39ff14" strokeWidth="0.8"/>
                        <rect x="4" y="28" width="32" height="6" rx="2" fill="#1a7a1a" stroke="#39ff14" strokeWidth="0.8"/>
                        {/* Track treads */}
                        {[6,12,18,24,30].map(x => <React.Fragment key={`t${x}`}><rect x={x} y="7" width="3" height="4" rx="0.5" fill="#39ff14" opacity="0.5"/><rect x={x} y="29" width="3" height="4" rx="0.5" fill="#39ff14" opacity="0.5"/></React.Fragment>)}
                        {/* Hull */}
                        <rect x="6" y="13" width="26" height="14" rx="2" fill="#006400" stroke="#39ff14" strokeWidth="1"/>
                        {/* Hull detail lines */}
                        <line x1="8" y1="15" x2="30" y2="15" stroke="#39ff14" strokeWidth="0.3" opacity="0.3"/>
                        <line x1="8" y1="25" x2="30" y2="25" stroke="#39ff14" strokeWidth="0.3" opacity="0.3"/>
                        {/* Turret */}
                        <ellipse cx="18" cy="20" rx="7" ry="6" fill="#004d00" stroke="#39ff14" strokeWidth="1"/>
                        {/* Barrel */}
                        <rect x="22" y="18.5" width="13" height="3" rx="1" fill="#39ff14"/>
                        {/* Barrel tip glow */}
                        <circle cx="35" cy="20" r="1.5" fill="#39ff14" opacity="0.4"/>
                        {/* Hatch */}
                        <circle cx="17" cy="20" r="1.5" fill="#39ff14" opacity="0.8"/>
                        {/* Turret inner glow */}
                        <ellipse cx="18" cy="20" rx="7" ry="6" fill="none" stroke="#39ff14" strokeWidth="0.5" opacity="0.4"/>
                      </svg>
                    </div>
                  </div>

                  {/* HUD overlays */}
                  {/* Position readout */}
                  <div className="absolute bottom-1 left-1 z-20 border border-[#ff0033]/20 bg-black/80 px-2 py-1 text-[9px] tracking-[0.15em] text-[#ff0033]/60 backdrop-blur-sm">
                    POS: R{tankPos.y} C{tankPos.x}
                  </div>

                  {/* Compass */}
                  <div className="absolute right-1 top-1 z-20 flex h-[32px] w-[32px] items-center justify-center">
                    <svg viewBox="0 0 32 32" width="32" height="32" className="opacity-30">
                      <circle cx="16" cy="16" r="14" fill="none" stroke="#ff0033" strokeWidth="0.5"/>
                      <text x="16" y="6" textAnchor="middle" fill="#ff0033" fontSize="4" fontFamily="monospace">N</text>
                      <text x="28" y="17.5" textAnchor="middle" fill="#ff0033" fontSize="4" fontFamily="monospace">E</text>
                      <text x="16" y="30" textAnchor="middle" fill="#ff0033" fontSize="4" fontFamily="monospace">S</text>
                      <text x="4" y="17.5" textAnchor="middle" fill="#ff0033" fontSize="4" fontFamily="monospace">W</text>
                      <line x1="16" y1="8" x2="16" y2="12" stroke="#ff0033" strokeWidth="0.5" opacity="0.5"/>
                      <line x1="16" y1="20" x2="16" y2="24" stroke="#ff0033" strokeWidth="0.5" opacity="0.5"/>
                      <line x1="8" y1="16" x2="12" y2="16" stroke="#ff0033" strokeWidth="0.5" opacity="0.5"/>
                      <line x1="20" y1="16" x2="24" y2="16" stroke="#ff0033" strokeWidth="0.5" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Threat assessment panel */}
              <div className="mt-3 border border-[#ff0033]/20 bg-[#0a0202]/80 px-3 py-2">
                <div className="mb-1.5 flex items-center justify-between text-[9px] tracking-[0.15em] text-[#ff0033]/50">
                  <span>THREAT ASSESSMENT</span>
                  <span className={destroyedCount === 8 ? 'text-[#39ff14]' : 'text-[#ff6600]'}>
                    {destroyedCount === 8 ? 'ALL CLEAR' : `${8 - destroyedCount} REMAINING`}
                  </span>
                </div>
                {/* Enemy status grid */}
                <div className="flex gap-1">
                  {enemies.map((en, idx) => (
                    <div
                      key={idx}
                      className={`flex h-5 w-5 items-center justify-center text-[8px] font-bold transition-all duration-300 ${
                        en.hit
                          ? 'bg-[#39ff14]/20 text-[#39ff14]'
                          : 'bg-[#ff0033]/20 text-[#ff0033]'
                      }`}
                      style={{
                        border: `1px solid ${en.hit ? 'rgba(57,255,20,0.3)' : 'rgba(255,0,51,0.4)'}`,
                      }}
                    >
                      {en.hit ? 'X' : idx + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 border border-[#ff0033]/15 bg-black/70 px-3 py-2 text-[10px] leading-5 text-[#ff0033]/50">
                <div className="mb-1 text-[9px] font-bold tracking-[0.2em] text-[#ff0033]/70">QUICK REFERENCE</div>
                <div><span className="text-white/70">fire(row, col)</span> — built-in, fires at target from your current position</div>
                <div><span className="text-white/70">STEP:row,col</span> — move tank one cell (print inside move() while loop)</div>
                <div>Lock position = target col - 2, same row. Must be at lock before firing.</div>
                <div>Targets are randomized each session. 8 kills to clear.</div>
              </div>

              {resultStatus !== 'idle' && (
                <div
                  className={`mt-3 border px-3 py-3 text-sm font-bold tracking-[0.14em] ${
                    resultStatus === 'success'
                      ? 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]'
                      : 'border-[#ff3131] bg-[#ff3131]/10 text-[#ff8080]'
                  }`}
                  style={resultStatus === 'success' ? { boxShadow: '0 0 20px rgba(57,255,20,0.2)' } : { boxShadow: '0 0 20px rgba(255,49,49,0.2)' }}
                >
                  {resultStatus === 'success'
                    ? 'HOSTILES ELIMINATED // LEVEL 2 COMPLETE'
                    : 'PURGE FAILED // RETRY REQUIRED'}
                  {resultStatus === 'success' && (
                    <button
                      type="button"
                      onClick={() => {
                        markLevelComplete(2);
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
        <section className="mt-5 border border-[#ff0033]/60 bg-black/90 shadow-[0_0_20px_rgba(255,0,51,0.3)]">
          <div className="flex items-center justify-between border-b border-[#ff0033]/60 bg-gradient-to-r from-[#2a0000] to-[#1a0000] px-4 py-2">
            <div className="text-[11px] font-bold tracking-[0.15em] text-white">
              TERMINAL
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#39ff14] animate-pulse" />
              <span className="text-[9px] tracking-[0.1em] text-[#39ff14]/40">CONNECTED</span>
            </div>
          </div>
          <div className="max-h-[160px] min-h-[100px] overflow-y-auto bg-[#050101] p-4 text-xs leading-6">
            {terminalLines.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('ERROR')
                    ? 'text-[#ff3131]'
                    : line.includes('SUCCESS')
                    ? 'text-[#39ff14]'
                    : line.includes('BOOTING')
                    ? 'text-[#ff6600]'
                    : 'text-[#39ff14]/80'
                }
                style={line.includes('SUCCESS') ? { background: 'linear-gradient(90deg, rgba(57,255,20,0.15), transparent)', padding: '4px 8px', fontWeight: 'bold', textShadow: '0 0 10px rgba(57,255,20,0.5)' } : undefined}
              >
                <span className="text-[#ff0033]/30 mr-2">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Grid scan line */
        .level2-grid-scan::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,0,51,0.15), transparent);
          animation: level2-scan 4s linear infinite;
          z-index: 5;
        }
        @keyframes level2-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }

        /* Targeting reticle */
        .level2-reticle {
          border: 1px solid rgba(255,0,51,0.2);
          animation: level2-reticle-pulse 2s ease-in-out infinite;
        }
        .level2-reticle::before,
        .level2-reticle::after {
          content: '';
          position: absolute;
          border: 1px solid rgba(255,0,51,0.3);
        }
        .level2-reticle::before {
          top: -4px; left: -4px; right: -4px; bottom: -4px;
          border-radius: 50%;
          animation: level2-ring-expand 2s ease-out infinite;
        }
        .level2-reticle::after {
          top: 50%; left: 50%;
          width: 4px; height: 4px;
          transform: translate(-50%, -50%);
          background: rgba(255,0,51,0.5);
          border-radius: 50%;
        }
        @keyframes level2-reticle-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes level2-ring-expand {
          0% { width: 30px; height: 30px; top: 3px; left: 3px; opacity: 0.6; }
          100% { width: 46px; height: 46px; top: -5px; left: -5px; opacity: 0; }
        }

        /* Enemy glow/dim pulse */
        .level2-enemy-pulse {
          filter: drop-shadow(0 0 6px rgba(255,0,51,0.6));
          animation: level2-enemy-glow 2s ease-in-out infinite;
        }
        @keyframes level2-enemy-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255,0,51,0.3)); opacity: 0.75; }
          50% { filter: drop-shadow(0 0 14px rgba(255,0,51,0.9)) drop-shadow(0 0 4px rgba(255,100,100,0.4)); opacity: 1; }
        }

        /* Tank aura pulse */
        .level2-tank-aura {
          animation: level2-aura 1.5s ease-in-out infinite;
        }
        @keyframes level2-aura {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
        }

        /* Muzzle flash */
        .level2-muzzle-flash {
          animation: level2-flash 0.15s ease-out forwards;
        }
        @keyframes level2-flash {
          0% { transform: scale(0.5); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(0.3); opacity: 0; }
        }

        /* Explosion phases */
        .level2-explosion-flash {
          animation: level2-exp-flash 0.3s ease-out forwards;
        }
        @keyframes level2-exp-flash {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .level2-explosion-ring {
          animation: level2-exp-ring 0.3s ease-out forwards;
        }
        @keyframes level2-exp-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0.5; }
        }
        .level2-explosion-fade {
          animation: level2-exp-fade 0.3s ease-out forwards;
        }
        @keyframes level2-exp-fade {
          0% { opacity: 0.5; }
          100% { opacity: 0; transform: scale(1.3); }
        }

        /* Debris particles */
        .level2-debris-1 { animation: debris-1 0.4s ease-out forwards; }
        .level2-debris-2 { animation: debris-2 0.5s ease-out forwards; }
        .level2-debris-3 { animation: debris-3 0.3s ease-out forwards; }
        .level2-debris-4 { animation: debris-4 0.45s ease-out forwards; }
        @keyframes debris-1 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(15px,-12px); opacity:0; } }
        @keyframes debris-2 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(-10px,-15px); opacity:0; } }
        @keyframes debris-3 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(12px,10px); opacity:0; } }
        @keyframes debris-4 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(-8px,14px); opacity:0; } }
      `}</style>
    </div>
  );
}
