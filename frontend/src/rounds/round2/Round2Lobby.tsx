import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, ChevronRight, Crosshair, Skull, Timer } from 'lucide-react';
import TacticalBackground from '../../components/TacticalBackground';
import { motion } from 'motion/react';
import api from '../../api/axios';

const ACCENT = '#ff6600';
const ACCENT_RGB = '255,102,0';

interface LevelInfo {
  id: number;
  title: string;
  subtitle: string;
  path: string;
  description: string;
  mechanics: string[];
  icon: 'crosshair' | 'skull';
}

const LEVELS: LevelInfo[] = [
  {
    id: 1,
    title: 'LEVEL 1',
    subtitle: 'SECURE SEQUENTIAL NAVIGATION',
    path: '/competition/round2/level1',
    description: 'Navigate your tank through 9 randomized checkpoints in sequence, then extract through the finish zone.',
    mechanics: ['Override move()', 'Follow coordinates {row, col}', 'Sequential checkpoint traversal'],
    icon: 'crosshair',
  },
  {
    id: 2,
    title: 'LEVEL 2',
    subtitle: 'COMBAT PURGE',
    path: '/competition/round2/level2',
    description: 'Engage and destroy 8 hostile targets. You must lock on from exactly 2 cells LEFT before firing. Miss = elimination.',
    mechanics: ['Override attack()', 'Strict 2-cell lock range', 'Destroy all hostiles to proceed'],
    icon: 'crosshair',
  },
  {
    id: 3,
    title: 'LEVEL 3',
    subtitle: 'OPERATION SQUARE ONE',
    path: '/competition/round2/level3',
    description: 'Boss fight against General Makarov. He patrols a square — shield when he faces you, pick the right weapon each turn.',
    mechanics: ['LASER for shielded targets', 'CANNON for unshielded targets', 'SHIELD when boss fires at you'],
    icon: 'skull',
  },
];

function getCompletedLevels(): Set<number> {
  try {
    const raw = localStorage.getItem('round2_completed');
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function markLevelComplete(levelId: number) {
  const completed = getCompletedLevels();
  completed.add(levelId);
  localStorage.setItem('round2_completed', JSON.stringify([...completed]));
}

export { markLevelComplete };

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Round2Lobby() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [teamName, setTeamName] = useState('');
  const [contestEndMs, setContestEndMs] = useState<number | null>(null);
  const [contestEnded, setContestEnded] = useState(false);
  const [tick, setTick] = useState(0);

  // Live countdown tick every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch round config for contest window
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/game/config/round/round2');
        if (res.data.playWindowEnd) {
          const endMs = new Date(res.data.playWindowEnd).getTime();
          if (endMs > Date.now()) {
            setContestEndMs(endMs);
          } else {
            setContestEnded(true);
          }
        }
      } catch (e) {
        console.error('Failed to fetch round config:', e);
      }
    };
    fetchConfig();
  }, []);

  // Check contest expiry on tick
  useEffect(() => {
    if (contestEndMs && Date.now() >= contestEndMs) {
      setContestEnded(true);
    }
  }, [tick, contestEndMs]);

  useEffect(() => {
    const stored = localStorage.getItem('teamName');
    if (!stored) {
      navigate('/');
      return;
    }
    setTeamName(stored);
    setCompleted(getCompletedLevels());
  }, [navigate]);

  const handleEnterLevel = (level: LevelInfo) => {
    if (contestEnded) return;
    if (level.id > 1 && !completed.has(level.id - 1)) return;
    if (completed.has(level.id)) return;
    navigate(level.path);
  };

  const isAccessible = (level: LevelInfo): boolean => {
    if (completed.has(level.id)) return false;
    if (level.id === 1) return true;
    return completed.has(level.id - 1);
  };

  const getStatusLabel = (level: LevelInfo): string => {
    if (completed.has(level.id)) return 'COMPLETED';
    if (isAccessible(level)) return 'READY';
    return 'LOCKED';
  };

  const renderIcon = (icon: string, color: string) => {
    if (icon === 'skull') return <Skull className="w-5 h-5" style={{ color }} />;
    return <Crosshair className="w-5 h-5" style={{ color }} />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ff6600] font-mono px-4 py-5 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] right-[8%] h-[420px] w-[420px] rounded-full bg-[#ff0033]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-12%] left-[10%] h-[360px] w-[360px] rounded-full bg-[#ff6600]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 border-b border-[#ff6600]/15 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] tracking-[0.35em] text-[#ff6600]/45">ROUND 2 // TANK WARFARE</div>
            <h1 className="mt-2 text-3xl font-black tracking-[0.18em] md:text-4xl" style={{ textShadow: '0 0 10px #ff6600, 0 0 30px rgba(255,102,0,0.3)' }}>
              SELECT LEVEL
            </h1>
            <div className="mt-1 text-[10px] tracking-[0.15em] text-white/30">
              OPERATIVE: <span className="text-white/60">{teamName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/competition')}
            className="inline-flex items-center gap-2 border border-[#ff6600]/30 bg-black/60 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#ff6600] transition hover:border-[#ff6600] hover:bg-[#ff6600]/10"
          >
            <ArrowLeft className="h-4 w-4" /> BACK
          </button>
        </div>

        {/* Contest Timer */}
        {contestEnded ? (
          <div className="mb-6 border border-red-500/30 bg-red-500/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-red-400/60" />
              <span className="text-[10px] tracking-[0.2em] font-bold text-red-400/60">CONTEST ENDED</span>
            </div>
            <button
              onClick={() => navigate('/competition')}
              className="px-4 py-1.5 border border-red-400/30 text-red-400/70 text-[10px] font-bold tracking-[0.15em] hover:border-red-400 hover:text-red-400 transition"
            >
              RETURN TO LOBBY
            </button>
          </div>
        ) : contestEndMs ? (
          <div className="mb-6 border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[9px] tracking-[0.25em] font-bold text-green-400/70">CONTEST TIME REMAINING</span>
            </div>
            <div className="text-2xl font-black font-mono tabular-nums tracking-wider text-green-400" style={{ textShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
              {formatCountdown(Math.max(0, contestEndMs - Date.now()))}
            </div>
          </div>
        ) : null}

        {/* Level Boxes */}
        <div className="flex flex-col gap-5">
          {LEVELS.map((level, index) => {
            const accessible = isAccessible(level);
            const done = completed.has(level.id);
            const status = getStatusLabel(level);

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`relative overflow-hidden border p-5 md:p-6 transition-all duration-300 ${
                  done
                    ? 'border-[#ff6600]/15 bg-[#0a0500]/50'
                    : accessible
                    ? 'border-[#ff6600]/40 bg-black/80 cursor-pointer hover:border-[#ff6600]/70 hover:shadow-[0_0_30px_rgba(255,102,0,0.15)]'
                    : 'border-white/8 bg-[#0a0a0a]/50'
                }`}
                onClick={() => handleEnterLevel(level)}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.6)` : 'rgba(255,255,255,0.08)' }} />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.6)` : 'rgba(255,255,255,0.08)' }} />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.6)` : 'rgba(255,255,255,0.08)' }} />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.6)` : 'rgba(255,255,255,0.08)' }} />

                {/* Active top glow bar */}
                {accessible && !done && (
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, rgba(${ACCENT_RGB},0.8), transparent)` }} />
                )}

                {/* Big watermark number */}
                <div className="absolute top-1 right-4 font-black select-none pointer-events-none leading-none"
                  style={{ fontSize: '5rem', color: done ? 'rgba(255,102,0,0.05)' : accessible ? `rgba(${ACCENT_RGB},0.06)` : 'rgba(255,255,255,0.02)', fontFamily: 'monospace' }}>
                  {String(level.id).padStart(2, '0')}
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  {/* Icon */}
                  <div className="w-10 h-10 flex items-center justify-center border shrink-0"
                    style={{ borderColor: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.4)` : 'rgba(255,255,255,0.08)', background: done ? 'rgba(255,102,0,0.03)' : accessible ? `rgba(${ACCENT_RGB},0.07)` : 'rgba(255,255,255,0.02)' }}>
                    {done ? <CheckCircle className="w-5 h-5 text-[#ff6600]/40" /> : renderIcon(level.icon, accessible ? ACCENT : 'rgba(255,255,255,0.15)')}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className={`text-base md:text-lg font-black tracking-[0.15em] ${done ? 'text-[#ff6600]/40' : accessible ? 'text-white' : 'text-white/20'}`}>
                        {level.title}
                      </h2>
                      <span className="px-2 py-0.5 text-[8px] font-bold tracking-[0.2em] border"
                        style={{
                          borderColor: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.5)` : 'rgba(255,255,255,0.08)',
                          color: done ? 'rgba(255,102,0,0.5)' : accessible ? ACCENT : 'rgba(255,255,255,0.15)',
                          background: done ? 'rgba(255,102,0,0.03)' : accessible ? `rgba(${ACCENT_RGB},0.05)` : 'transparent',
                        }}>
                        {status}
                      </span>
                    </div>
                    <div className="text-[9px] tracking-[0.3em] mb-2" style={{ color: done ? 'rgba(255,102,0,0.2)' : accessible ? `rgba(${ACCENT_RGB},0.4)` : 'rgba(255,255,255,0.08)' }}>
                      {level.subtitle}
                    </div>
                    <p className={`text-[11px] leading-5 mb-3 ${done ? 'text-white/15' : accessible ? 'text-white/55' : 'text-white/12'}`}>
                      {level.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {level.mechanics.map((m, mi) => (
                        <span key={mi} className="px-2 py-0.5 text-[8px] tracking-wider border"
                          style={{ borderColor: done ? 'rgba(255,102,0,0.1)' : accessible ? `rgba(${ACCENT_RGB},0.2)` : 'rgba(255,255,255,0.05)', color: done ? 'rgba(255,102,0,0.25)' : accessible ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.08)' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow or Lock */}
                  <div className="flex items-center shrink-0 ml-2">
                    {done ? (
                      <CheckCircle className="w-6 h-6 text-[#ff6600]/30" />
                    ) : accessible ? (
                      <ChevronRight className="w-6 h-6 text-[#ff6600]" />
                    ) : (
                      <Lock className="w-5 h-5 text-white/10" />
                    )}
                  </div>
                </div>

                {/* Completed overlay */}
                {done && (
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,102,0,0.02) 0%, transparent 50%)' }} />
                )}

                {/* Scanline */}
                <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,102,0,0.008)_3px,rgba(255,102,0,0.008)_4px)]" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom info */}
        <div className="mt-8 border border-[#ff6600]/15 bg-black/70 px-4 py-3 text-[10px] leading-5 text-white/25">
          <div>Complete levels in order. Each level unlocks the next. Progress is saved for this session.</div>
          <div className="mt-1">OOP Concepts: Abstraction, Polymorphism, Aggregation, Composition, Memory Management.</div>
        </div>
      </div>
    </div>
  );
}
