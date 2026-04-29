import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
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

const CELL = 40;

// Always use backend compile endpoint
const COMPILE_URL = '/compile';

interface Checkpoint {
  x: number;
  y: number;
  hit: boolean;
}

function makeCheckpoints(): Checkpoint[] {
  return Array.from({ length: 9 }, (_, x) => ({
    x,
    y: Math.floor(Math.random() * 10),
    hit: false,
  }));
}

function buildStarterCode(cps: Checkpoint[]): string {
  const pathArr = cps.map(cp => `{${cp.y}, ${cp.x}}`).join(', ');
  return `/*
 * LEVEL 1: CHECKPOINT RUN
 *
 * GOAL: Visit all 9 checkpoints in order, then reach Column 9 to finish.
 *
 * PROVIDED: class Tank with pure virtual methods move(), attack(), defend()
 *
 * YOUR TASK: Inherit from Tank into MyTank, override all three methods.
 *
 * TIP: Hover over each checkpoint on the grid to see its (row, col).
 *
 * MOVEMENT:  r++ = down,  r-- = up,  c++ = right,  c-- = left
 * OUTPUT:    cout << "STEP:" << r << "," << c << endl;
 * CHECKPOINT: cout << "NODE_" << (i+1) << "_SECURED" << endl;
 * FINISH:    cout << "FINISH_REACHED" << endl;
 */

#include <iostream>
using namespace std;

class Tank {
public:
    virtual void move() = 0;
    virtual void attack() = 0;
    virtual void defend() = 0;
};

class MyTank : public Tank {
private:
    int r = 0, c = 0;

public:
    void move() override {
        // TODO: Visit each checkpoint in order, then reach column 9
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
  const cps = makeCheckpoints();
  return { checkpoints: cps, code: buildStarterCode(cps) };
}

// Detect gcc-style compilation errors in JDoodle output
function parseCompileError(output: string): string | null {
  const lines = output.split('\n');
  const errLine = lines.find(l => /error:/i.test(l));
  if (!errLine) return null;
  // Extract line number if present: "filename.cpp:12:5: error: ..."
  const m = errLine.match(/:(\d+):\d+:\s*error:\s*(.+)/);
  if (m) return `Line ${m[1]}: ${m[2].trim()}`;
  const m2 = errLine.match(/error:\s*(.+)/i);
  if (m2) return m2[1].trim();
  return errLine.trim();
}

export default function Round2() {
  const navigate = useNavigate();
  const { contestEnded } = useContestTimer('round2');

  const [init] = useState(() => makeInitialState());
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(init.checkpoints);
  const [code, setCode] = useState<string>(init.code);
  const [tankPos, setTankPos] = useState({ x: 0, y: 0 });
  const [terminalLines, setTerminalLines] = useState<string[]>(['root@classwars: awaiting execution...']);
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const [compiling, setCompiling] = useState(false);

  const abortRef = useRef(false);

  useEffect(() => () => { abortRef.current = true; }, []);

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  function handleReset() {
    abortRef.current = true;
    setTimeout(() => { abortRef.current = false; }, 0);
    const cps = makeCheckpoints();
    setCheckpoints(cps);
    setCode(buildStarterCode(cps));
    setTankPos({ x: 0, y: 0 });
    setTerminalLines(['root@classwars: awaiting execution...']);
    setResultStatus('idle');
    setCompiling(false);
  }

  async function handleRun() {
    abortRef.current = true;
    await sleep(10);
    abortRef.current = false;

    setCompiling(true);
    setResultStatus('idle');
    setTankPos({ x: 0, y: 0 });
    setCheckpoints(prev => prev.map(cp => ({ ...cp, hit: false })));
    setTerminalLines(['>> Compiling...']);

    // Snapshot checkpoint positions for hit detection (all reset to unhit)
    const snapCps = checkpoints.map(cp => ({ ...cp, hit: false }));
    const hitSet = new Set<number>();

    try {
      const res = await fetch(COMPILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: code }),
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
        setTerminalLines([
          `>> Code failed to execute: Syntax problem — ${compileErr}`,
        ]);
        setResultStatus('failure');
        setCompiling(false);
        return;
      }

      setTerminalLines(['>> Code executed successfully.']);

      const lines = output.split('\n');
      let i = 0;
      const securedNodes: number[] = [];
      let finishReached = false;

      // Process output line by line — tank strictly follows code
      const processNext = async () => {
        while (i < lines.length) {
          if (abortRef.current) return;
          const line = lines[i++].trim();
          if (!line) continue;

          if (line.startsWith('STEP:')) {
            const parts = line.split(':')[1].split(',').map(Number);
            const rawRow = parts[0];
            const rawCol = parts[1];
            const row = Math.max(0, Math.min(9, rawRow));
            const col = Math.max(0, Math.min(9, rawCol));

            if (rawRow !== row || rawCol !== col) {
              setTerminalLines(prev => [...prev, `>> BOUNDS ERROR: Tank cannot leave the arena (tried R${rawRow} C${rawCol})`]);
              setResultStatus('failure');
              setCompiling(false);
              return;
            }

            setTankPos({ x: col, y: row });

            // Check if this position hits a checkpoint
            for (let ci = 0; ci < snapCps.length; ci++) {
              if (!hitSet.has(ci) && snapCps[ci].x === col && snapCps[ci].y === row) {
                hitSet.add(ci);
                const idx = ci;
                setCheckpoints(prev => prev.map((cp, j) => j === idx ? { ...cp, hit: true } : cp));
                setTerminalLines(prev => [...prev, `>> Checkpoint ${idx + 1} crossed`]);
                await sleep(120);
                break;
              }
            }

            await sleep(80);
          } else {
            const m = line.match(/^NODE_(\d+)_SECURED$/);
            if (m) {
              const nodeIdx = parseInt(m[1]) - 1;
              securedNodes.push(nodeIdx);
              // Only register checkpoint hit if tank is actually at the correct position
              if (!hitSet.has(nodeIdx) && nodeIdx < snapCps.length) {
                const cp = snapCps[nodeIdx];
                if (col === cp.x && row === cp.y) {
                  hitSet.add(nodeIdx);
                  const idx = nodeIdx;
                  setCheckpoints(prev => prev.map((cp, j) => j === idx ? { ...cp, hit: true } : cp));
                  setTerminalLines(prev => [...prev, `>> Checkpoint ${idx + 1} crossed`]);
                }
              }
            } else if (line === 'FINISH_REACHED') {
              finishReached = true;
            }
          }
        }

        if (abortRef.current) return;

        // Win condition: ALL checkpoints physically visited by the tank AND reached column 9
        const checkpointsHit = hitSet.size;
        const allCheckpointsCrossed = checkpointsHit === 9;

        if (allCheckpointsCrossed && finishReached) {
          setTerminalLines(prev => [...prev, '>> LEVEL 1 CLEARED — PROCEED TO LEVEL 2']);
          setResultStatus('success');
        } else if (!allCheckpointsCrossed && !finishReached) {
          setTerminalLines(prev => [...prev, `>> Code failed to execute: Only ${checkpointsHit}/9 checkpoints reached. Finish zone not reached.`]);
          setResultStatus('failure');
        } else if (!allCheckpointsCrossed) {
          setTerminalLines(prev => [...prev, `>> Code failed to execute: Only ${checkpointsHit}/9 checkpoints reached.`]);
          setResultStatus('failure');
        } else {
          setTerminalLines(prev => [...prev, '>> Code failed to execute: Finish zone not reached.']);
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
        <div className="absolute top-[-15%] left-[8%] h-[420px] w-[420px] rounded-full bg-[#39ff14]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[10%] h-[360px] w-[360px] rounded-full bg-[#0088ff]/[0.06] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-[#39ff14]/15 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] tracking-[0.35em] text-[#39ff14]/45">SYSTEM_LEVEL_01 // SECURE_SEQUENTIAL_NAVIGATION</div>
            <h1 className="mt-2 text-3xl font-black tracking-[0.18em] md:text-4xl" style={{ textShadow: '0 0 10px #39ff14' }}>
              CLASS WARS: ROUND 2
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/competition/round2')}
              className="inline-flex items-center gap-2 border border-[#39ff14]/30 bg-black/60 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#39ff14] transition hover:border-[#39ff14] hover:bg-[#39ff14]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK
            </button>
            <div className="border border-[#39ff14]/30 bg-black/70 px-4 py-2 text-xs tracking-[0.18em] text-[#39ff14]/80">
              STATUS:{' '}
              <span className="text-white">
                {compiling ? 'EXECUTING...' : resultStatus === 'idle' ? 'READY' : resultStatus === 'success' ? 'COMPLETE' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>

        {/* BRIEFING */}
        <div className="border border-[#39ff14]/30 bg-[#020802]/90 px-4 py-3 mb-5">
          <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#39ff14]">MISSION BRIEFING — LEVEL 1: CHECKPOINT RUN</div>

          <div className="grid gap-x-8 gap-y-3 text-[10px] leading-[1.7] md:grid-cols-2 lg:grid-cols-3">

            {/* OBJECTIVE */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">OBJECTIVE</div>
              <div className="text-[#6699ff]">Navigate your tank through all 9 checkpoints IN ORDER (1 → 9), then reach Column 9 to finish.</div>
            </div>

            {/* CHECKPOINTS */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CHECKPOINTS</div>
              <div className="text-[#6699ff]">9 checkpoints are randomly placed on a 10x10 grid.</div>
              <div className="text-[#6699ff]">Hover over a checkpoint to see its (row, col) coordinates.</div>
              <div className="text-[#6699ff]">You MUST visit them in order — checkpoint 1 first, then 2, and so on.</div>
            </div>

            {/* CLASS: Tank */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: Tank (base class)</div>
              <div className="text-[#6699ff]">Class Tank has 3 pure virtual methods: move(), attack(), defend().</div>
              <div className="text-[#6699ff]">You must override all three in your MyTank class.</div>
            </div>

            {/* CLASS: MyTank */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">CLASS: MyTank (your class)</div>
              <div className="text-[#6699ff]">Inherit from Tank: class MyTank : public Tank.</div>
              <div className="text-[#6699ff]">Use int r for row and int c for col to track your tank position.</div>
              <div className="text-[#6699ff]">path[9][2] array stores checkpoint coordinates: path[i][0] = row, path[i][1] = col.</div>
            </div>

            {/* MOVEMENT */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">MOVEMENT</div>
              <div className="text-[#6699ff]">Use r++ (move down), r-- (move up), c++ (move right), c-- (move left).</div>
              <div className="text-[#6699ff]">After each step, print: cout &lt;&lt; "STEP:" &lt;&lt; r &lt;&lt; "," &lt;&lt; c &lt;&lt; endl;</div>
              <div className="text-[#6699ff]">This tells the arena where your tank is on the grid.</div>
            </div>

            {/* CHECKPOINT SECURE */}
            <div>
              <div className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#39ff14]">SECURING CHECKPOINTS</div>
              <div className="text-[#6699ff]">When your tank reaches a checkpoint's exact (row, col), print:</div>
              <div className="text-[#6699ff]">cout &lt;&lt; "NODE_" &lt;&lt; (i+1) &lt;&lt; "_SECURED" &lt;&lt; endl;</div>
              <div className="text-[#6699ff]">After all 9, move right until column 9 and print FINISH_REACHED.</div>
            </div>

          </div>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-center">

          {/* Code Editor Panel */}
          <section className="flex-1 border border-[#39ff14] bg-black/90 shadow-[0_0_15px_rgba(0,59,0,0.9)]">
            <div className="border-b border-[#39ff14] bg-[#003b00] px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white">
              C++ SOURCE_EXPLOIT.CPP
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
            <div className="flex flex-col gap-2 border-t border-[#39ff14]/25 p-3 md:flex-row">
              <button
                type="button"
                onClick={handleRun}
                disabled={compiling}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-[#39ff14] px-4 py-3 text-sm font-black tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                INITIALIZE SYSTEM BREACH
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 border border-[#39ff14]/35 bg-black px-4 py-3 text-xs font-bold tracking-[0.18em] text-[#39ff14] transition hover:bg-[#39ff14]/10"
              >
                <RotateCcw className="h-4 w-4" />
                RESET
              </button>
            </div>
          </section>

          {/* Grid Panel */}
          <section className="w-full border border-[#39ff14] bg-black/90 shadow-[0_0_15px_rgba(0,59,0,0.9)] xl:max-w-[436px]">
            <div className="border-b border-[#39ff14] bg-[#003b00] px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white">
              GRID_CORE_VISUALIZER
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

                {/* Finish zone */}
                <div
                  className="absolute right-0 top-0 flex h-full w-[40px] items-center justify-center border-l-2 border-dashed border-[#0088ff] bg-[#0088ff]/10 text-[11px] tracking-[0.1em] text-[#0088ff] z-10"
                  style={{ writingMode: 'vertical-lr' }}
                >
                  FINISH_ZONE
                </div>

                {/* Checkpoints */}
                {checkpoints.map((cp, idx) => (
                  <div
                    key={idx}
                    title={`R:${cp.y} C:${cp.x}`}
                    className={`absolute z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                      cp.hit
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                        : 'bg-[#ff3131] text-white shadow-[0_0_10px_rgba(255,49,49,0.9)]'
                    }`}
                    style={{ left: cp.x * CELL + 7, top: cp.y * CELL + 7 }}
                  >
                    {idx + 1}
                  </div>
                ))}

                {/* Tank */}
                <div
                  className="absolute z-20 transition-all duration-[150ms] ease-linear"
                  style={{ left: tankPos.x * CELL, top: tankPos.y * CELL, width: 40, height: 40 }}
                >
                  {/* SVG top-down tank pointing right */}
                  <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                    {/* Tracks left */}
                    <rect x="4" y="6" width="32" height="6" rx="2" fill="#1a7a1a" stroke="#39ff14" strokeWidth="0.8"/>
                    {/* Tracks right */}
                    <rect x="4" y="28" width="32" height="6" rx="2" fill="#1a7a1a" stroke="#39ff14" strokeWidth="0.8"/>
                    {/* Track details left */}
                    {[6,12,18,24,30].map(x => <rect key={x} x={x} y="7" width="3" height="4" rx="0.5" fill="#39ff14" opacity="0.5"/>)}
                    {/* Track details right */}
                    {[6,12,18,24,30].map(x => <rect key={x} x={x} y="29" width="3" height="4" rx="0.5" fill="#39ff14" opacity="0.5"/>)}
                    {/* Hull body */}
                    <rect x="6" y="13" width="26" height="14" rx="2" fill="#006400" stroke="#39ff14" strokeWidth="1"/>
                    {/* Turret */}
                    <ellipse cx="18" cy="20" rx="7" ry="6" fill="#004d00" stroke="#39ff14" strokeWidth="1"/>
                    {/* Barrel pointing right */}
                    <rect x="22" y="18.5" width="13" height="3" rx="1" fill="#39ff14"/>
                    {/* Hatch dot */}
                    <circle cx="17" cy="20" r="1.5" fill="#39ff14" opacity="0.8"/>
                    {/* Glow */}
                    <ellipse cx="18" cy="20" rx="7" ry="6" fill="none" stroke="#39ff14" strokeWidth="0.5" opacity="0.4"/>
                  </svg>
                </div>

                {/* Position readout */}
                <div className="absolute bottom-2 left-2 z-20 border border-[#39ff14]/30 bg-black/75 px-2 py-1 text-[10px] tracking-[0.15em] text-[#39ff14]/80">
                  POS: R{tankPos.y} C{tankPos.x}
                </div>
              </div>

              <div className="mt-4 border border-[#39ff14]/20 bg-black/70 px-3 py-3 text-xs leading-6 text-[#39ff14]/75">
                <div>OBJECTIVE: Secure all 9 data nodes in sequence, then extract through the finish zone.</div>
                <div>NOTE: Coordinates are randomized each session. Use the pre-generated code or write your own.</div>
              </div>

              {resultStatus !== 'idle' && (
                <div
                  className={`mt-4 border px-3 py-3 text-sm font-bold tracking-[0.14em] ${
                    resultStatus === 'success'
                      ? 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]'
                      : 'border-[#ff3131] bg-[#ff3131]/10 text-[#ff8080]'
                  }`}
                >
                  <div>
                    {resultStatus === 'success'
                      ? 'ACCESS GRANTED // LEVEL 1 COMPLETE'
                      : 'ACCESS REJECTED // RETRY REQUIRED'}
                  </div>
                  {resultStatus === 'success' && (
                    <button
                      type="button"
                      onClick={() => {
                        markLevelComplete(1);
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
        <section className="mt-5 border border-[#39ff14] bg-black/90 shadow-[0_0_15px_rgba(0,59,0,0.9)]">
          <div className="border-b border-[#39ff14] bg-[#003b00] px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white">
            REMOTE_TERMINAL_LOG
          </div>
          <div className="max-h-[160px] min-h-[100px] overflow-y-auto p-4 text-xs leading-6 text-[#39ff14]">
            {terminalLines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


