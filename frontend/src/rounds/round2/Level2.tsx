import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import TacticalBackground from '../../components/TacticalBackground';
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

interface Enemy {
  x: number;
  y: number;
  hit: boolean;
}

function makeEnemies(): Enemy[] {
  return Array.from({ length: 8 }, (_, x) => ({
    x: x + 2,
    y: Math.floor(Math.random() * 10),
    hit: false,
  }));
}

function buildStarterCode(enemies: Enemy[]): string {
  const targetsArr = enemies.map(e => `{${e.x}, ${e.y}}`).join(', ');
  return `class MyTank : public Tank {
private:
    int x = 0, y = 0;
    int targets[8][2] = {${targetsArr}};

public:
    void move() override {
        for(int i = 0; i < 8; i++) {
            int tx = targets[i][0];
            int ty = targets[i][1];

            int lockX = tx - 2;
            int lockY = ty;

            while(x != lockX || y != lockY) {
                if(x < lockX) x++;
                else if(x > lockX) x--;
                else if(y < ty) y++;
                else if(y > ty) y--;
                cout << "STEP:" << x << "," << y << endl;
            }
            fire(tx, ty);
        }
    }
    void attack() override {}
    void defend() override {}
};

int main() {
    MyTank t;
    t.move();
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
void fire(int tx, int ty) { cout << "FIRE:" << tx << "," << ty << endl; }
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

interface Projectile {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fired: boolean;
}

export default function Level2() {
  const navigate = useNavigate();

  const [init] = useState(() => makeInitialState());
  const [enemies, setEnemies] = useState<Enemy[]>(init.enemies);
  const [code, setCode] = useState<string>(init.code);
  const [tankPos, setTankPos] = useState({ x: 0, y: 0 });
  const [terminalLines, setTerminalLines] = useState<string[]>(['root@tank: scanning...']);
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const [compiling, setCompiling] = useState(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  const abortRef = useRef(false);
  const projectileIdRef = useRef(0);

  useEffect(() => () => { abortRef.current = true; }, []);

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  function shoot(sx: number, sy: number, tx: number, ty: number) {
    const id = ++projectileIdRef.current;
    const proj: Projectile = { id, fromX: sx, fromY: sy, toX: tx, toY: ty, fired: false };
    setProjectiles(prev => [...prev, proj]);

    // Trigger animation after mount
    setTimeout(() => {
      setProjectiles(prev => prev.map(p => p.id === id ? { ...p, fired: true } : p));
    }, 50);

    // Remove projectile and mark enemy hit
    setTimeout(() => {
      setProjectiles(prev => prev.filter(p => p.id !== id));
      setEnemies(prev => prev.map(e =>
        e.x === tx && e.y === ty ? { ...e, hit: true } : e
      ));
    }, 300);
  }

  function checkWin(currentEnemies: Enemy[]): boolean {
    return currentEnemies.every(e => e.hit);
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

    try {
      const res = await fetch('https://corsproxy.io/?https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          script: HIDDEN_HEADER + code,
          language: 'cpp17',
          versionIndex: '0',
        }),
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
      let curX = 0;
      let curY = 0;

      // Process output lines sequentially with delays (matches HTML behavior)
      const processNext = async () => {
        while (i < lines.length) {
          if (abortRef.current) return;
          const line = lines[i++];

          if (line.startsWith('STEP:')) {
            const parts = line.split(':')[1].split(',').map(Number);
            const x = parts[0];
            const y = parts[1];
            curX = x;
            curY = y;
            setTankPos({ x, y });
            await sleep(120);
          } else if (line.startsWith('FIRE:')) {
            const parts = line.split(':')[1].split(',').map(Number);
            const tx = parts[0];
            const ty = parts[1];

            // Range check: distance <= 2 and same row
            if (Math.abs(curX - tx) <= 2 && curY === ty) {
              shoot(curX, curY, tx, ty);
              await sleep(350);
            } else {
              setTerminalLines(prev => [...prev, '>> FIRE_ERROR: TARGET OUT OF RANGE.']);
            }
          }
        }

        if (abortRef.current) return;

        // Check win condition
        // Need to read current enemies state - use a snapshot
        setEnemies(currentEnemies => {
          const won = checkWin(currentEnemies);
          if (won) {
            setTerminalLines(prev => [...prev, '>> SUCCESS: LEVEL 2 CLEARED.']);
            setResultStatus('success');
          }
          setCompiling(false);
          return currentEnemies;
        });
      };

      processNext();
    } catch {
      setTerminalLines(['>> Code failed to execute: Connection error.']);
      setResultStatus('failure');
      setCompiling(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#39ff14] font-mono px-4 py-5 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[8%] h-[420px] w-[420px] rounded-full bg-[#39ff14]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[10%] h-[360px] w-[360px] rounded-full bg-[#ff0033]/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-[#ff0033]/15 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] tracking-[0.35em] text-[#ff0033]/45">SYSTEM_LEVEL_02 // COMBAT_PURGE_PROTOCOL</div>
            <h1 className="mt-2 text-3xl font-black tracking-[0.18em] md:text-4xl" style={{ textShadow: '0 0 10px #ff0033' }}>
              CLASS WARS: LEVEL 2
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/competition')}
              className="inline-flex items-center gap-2 border border-[#ff0033]/30 bg-black/60 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#ff0033] transition hover:border-[#ff0033] hover:bg-[#ff0033]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK
            </button>
            <div className="border border-[#ff0033]/30 bg-black/70 px-4 py-2 text-xs tracking-[0.18em] text-[#ff0033]/80">
              STATUS:{' '}
              <span className="text-white">
                {compiling ? 'EXECUTING...' : resultStatus === 'idle' ? 'READY' : resultStatus === 'success' ? 'COMPLETE' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-center">

          {/* Code Editor Panel */}
          <section className="flex-1 border border-[#ff0033] bg-black/90 shadow-[0_0_15px_rgba(255,0,51,0.5)]">
            <div className="border-b border-[#ff0033] bg-[#3b0000] px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white">
              C++ COMBAT_OS.CPP
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
                className="inline-flex flex-1 items-center justify-center gap-2 bg-[#ff0033] px-4 py-3 text-sm font-black tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                ENGAGE PURGE
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 border border-[#ff0033]/35 bg-black px-4 py-3 text-xs font-bold tracking-[0.18em] text-[#ff0033] transition hover:bg-[#ff0033]/10"
              >
                <RotateCcw className="h-4 w-4" />
                RESET
              </button>
            </div>
          </section>

          {/* Grid Panel */}
          <section className="w-full border border-[#ff0033] bg-black/90 shadow-[0_0_15px_rgba(255,0,51,0.5)] xl:max-w-[436px]">
            <div className="border-b border-[#ff0033] bg-[#3b0000] px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white">
              BATTLE_GRID
            </div>
            <div className="p-4">
              <div
                className="relative mx-auto border border-[#333] bg-black"
                style={{ width: 400, height: 400 }}
              >
                {/* Grid cells */}
                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: 'repeat(10, 40px)', gridTemplateRows: 'repeat(10, 40px)' }}
                >
                  {Array.from({ length: 100 }, (_, i) => (
                    <div key={i} className="border border-[#1a1a1a]" />
                  ))}
                </div>

                {/* Enemies */}
                {enemies.map((en, idx) => (
                  <div
                    key={idx}
                    title={`(${en.x}, ${en.y})`}
                    className={`absolute z-10 flex h-[30px] w-[30px] cursor-crosshair items-center justify-center rounded border-2 border-white transition-all duration-500 ${
                      en.hit
                        ? 'pointer-events-none scale-0 opacity-0'
                        : 'opacity-100'
                    }`}
                    style={{
                      left: en.x * CELL + 5,
                      top: en.y * CELL + 5,
                      background: '#ff0033',
                      boxShadow: en.hit ? 'none' : '0 0 20px #ff0033',
                      animation: en.hit ? 'none' : 'glitch-level2 3s infinite',
                    }}
                  >
                    {!en.hit && (
                      <span className="text-[10px] font-bold text-white">{en.x}</span>
                    )}
                  </div>
                ))}

                {/* Projectiles */}
                {projectiles.map(proj => (
                  <div
                    key={proj.id}
                    className="pointer-events-none absolute z-30 h-[4px] w-[20px]"
                    style={{
                      background: '#fff',
                      boxShadow: '0 0 15px #ff3131, 0 0 5px white',
                      left: proj.fired
                        ? proj.toX * CELL + 10
                        : proj.fromX * CELL + 30,
                      top: proj.fired
                        ? proj.toY * CELL + 18
                        : proj.fromY * CELL + 18,
                      transition: 'all 0.25s linear',
                    }}
                  />
                ))}

                {/* Tank */}
                <div
                  className="absolute z-20 transition-all duration-[150ms] ease-linear"
                  style={{ left: tankPos.x * CELL, top: tankPos.y * CELL, width: 40, height: 40 }}
                >
                  <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="6" width="32" height="6" rx="2" fill="#1a7a1a" stroke="#39ff14" strokeWidth="0.8"/>
                    <rect x="4" y="28" width="32" height="6" rx="2" fill="#1a7a1a" stroke="#39ff14" strokeWidth="0.8"/>
                    {[6,12,18,24,30].map(x => <rect key={`tl${x}`} x={x} y="7" width="3" height="4" rx="0.5" fill="#39ff14" opacity="0.5"/>)}
                    {[6,12,18,24,30].map(x => <rect key={`tr${x}`} x={x} y="29" width="3" height="4" rx="0.5" fill="#39ff14" opacity="0.5"/>)}
                    <rect x="6" y="13" width="26" height="14" rx="2" fill="#006400" stroke="#39ff14" strokeWidth="1"/>
                    <ellipse cx="18" cy="20" rx="7" ry="6" fill="#004d00" stroke="#39ff14" strokeWidth="1"/>
                    <rect x="22" y="18.5" width="13" height="3" rx="1" fill="#39ff14"/>
                    <circle cx="17" cy="20" r="1.5" fill="#39ff14" opacity="0.8"/>
                    <ellipse cx="18" cy="20" rx="7" ry="6" fill="none" stroke="#39ff14" strokeWidth="0.5" opacity="0.4"/>
                  </svg>
                </div>

                {/* Position readout */}
                <div className="absolute bottom-2 left-2 z-20 border border-[#ff0033]/30 bg-black/75 px-2 py-1 text-[10px] tracking-[0.15em] text-[#ff0033]/80">
                  POS: ({tankPos.x}, {tankPos.y})
                </div>
              </div>

              <div className="mt-4 border border-[#ff0033]/20 bg-black/70 px-3 py-3 text-xs leading-6 text-[#ff0033]/75">
                <div>OBJECTIVE: Navigate to firing range (2 cells from target, same row) and destroy all 8 hostiles.</div>
                <div>NOTE: Targets are randomized each session. Use pre-generated code or write your own.</div>
              </div>

              {resultStatus !== 'idle' && (
                <div
                  className={`mt-4 border px-3 py-3 text-sm font-bold tracking-[0.14em] ${
                    resultStatus === 'success'
                      ? 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]'
                      : 'border-[#ff3131] bg-[#ff3131]/10 text-[#ff8080]'
                  }`}
                >
                  {resultStatus === 'success'
                    ? 'HOSTILES ELIMINATED // LEVEL 2 COMPLETE'
                    : 'PURGE FAILED // RETRY REQUIRED'}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Terminal */}
        <section className="mt-5 border border-[#ff0033] bg-black/90 shadow-[0_0_15px_rgba(255,0,51,0.5)]">
          <div className="border-b border-[#ff0033] bg-[#3b0000] px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white">
            TERMINAL
          </div>
          <div className="max-h-[160px] min-h-[100px] overflow-y-auto p-4 text-xs leading-6 text-[#39ff14]">
            {terminalLines.map((line, idx) => (
              <div
                key={idx}
                className={line.includes('ERROR') ? 'text-[#ff3131]' : line.includes('SUCCESS') ? 'text-[#39ff14]' : 'text-[#39ff14]'}
                style={line.includes('SUCCESS') ? { background: 'green', color: 'white', padding: '5px' } : undefined}
              >
                {line}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Glitch animation for enemies */}
      <style>{`
        @keyframes glitch-level2 {
          0%, 95%, 100% { transform: translate(5px, 5px) skew(0deg); }
          2% { transform: translate(8px, 2px) skew(15deg); }
          97% { transform: translate(2px, 7px) skew(-20deg); }
        }
      `}</style>
    </div>
  );
}
