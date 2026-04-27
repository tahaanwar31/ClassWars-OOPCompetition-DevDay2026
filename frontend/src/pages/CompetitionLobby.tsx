import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Lock, Construction, ChevronRight, Target, AlertCircle, Power, Crosshair, Timer } from 'lucide-react';
import CWEmblem from '../components/CWEmblem';
import { motion, AnimatePresence } from 'motion/react';
import TacticalBackground from '../components/TacticalBackground';
import api from '../api/axios';

interface RoundInfo {
  roundKey: string;
  roundName: string;
  status: string;
  underConstruction: boolean;
  startTime: string | null;
  endTime: string | null;
  playWindowStart: string | null;
  playWindowEnd: string | null;
  rules: string[];
  enabled: boolean;
  canEnter: boolean;
  availabilityLabel: string;
}

interface CompetitionData {
  generalRules: string[];
  rounds: RoundInfo[];
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CompetitionLobby() {
  const navigate = useNavigate();
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [tick, setTick] = useState(0);

  // Live countdown tick every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedTeamName = localStorage.getItem('teamName');
    if (!storedTeamName) {
      navigate('/');
      return;
    }
    setTeamName(storedTeamName);
    fetchCompetitionData();
  }, [navigate]);

  const fetchCompetitionData = async () => {
    try {
      const response = await api.get('/competition/rounds');
      setCompetitionData(response.data);
    } catch (error) {
      console.error('Failed to fetch competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRound = (roundKey: string) => {
    if (roundKey === 'round1') {
      navigate('/competition/round1');
    } else if (roundKey === 'round2') {
      navigate('/competition/round2');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (round: RoundInfo) => {
    if (round.underConstruction) {
      return (
        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/60 text-yellow-400 text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5">
          <Construction className="w-3 h-3" />
          CONSTRUCTION
        </span>
      );
    }
    if (round.canEnter) {
      return (
        <span className="px-3 py-1 bg-[#39ff14]/10 border border-[#39ff14]/60 text-[#39ff14] text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14]" />
          {round.availabilityLabel.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-white/5 border border-white/15 text-white/30 text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        {round.availabilityLabel.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center scanlines">
        <TacticalBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <Crosshair className="w-12 h-12 text-[#39ff14] animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-[#39ff14] tracking-[0.5em] text-sm animate-pulse">LOADING COMPETITION DATA...</p>
          <div className="w-48 h-0.5 bg-[#39ff14]/10 rounded overflow-hidden">
            <motion.div
              className="h-full bg-[#39ff14]"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!competitionData) {
    return (
      <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center scanlines">
        <TacticalBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-400 tracking-[0.3em] text-sm">COMMS FAILURE — DATA UNAVAILABLE</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono p-4 md:p-6 scanlines crt-flicker relative overflow-hidden">
      {/* Ambient bloom */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#39ff14]/[0.025] blur-[160px] breathe-glow" />
        <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full bg-[#ff003c]/[0.015] blur-[140px] breathe-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-[#00e5ff]/[0.012] blur-[120px] breathe-glow" style={{ animationDelay: '3s' }} />
      </div>

      <TacticalBackground />

      <div className="z-10 relative max-w-6xl mx-auto">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-10"
        >
          {/* top status bar */}
          <div className="flex items-center justify-between mb-4 text-[9px] tracking-[0.35em] text-[#39ff14]/30 border-b border-[#39ff14]/10 pb-2">
            <span>SYS&gt; CLASSWARS_TERMINAL v2.0</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse inline-block" />
              OPERATIVE: <span className="text-white/60 font-bold">{teamName}</span>
            </span>
          </div>

          <div className="flex flex-col items-center text-center py-4">
            <div>
              <CWEmblem size={88} className="mx-auto mb-3" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-[0.2em] text-glow glitch-text mb-1">CLASS WARS</h1>
            <p className="text-[10px] text-[#39ff14]/40 tracking-[0.6em]">// SELECT YOUR BATTLEFIELD //</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#39ff14]/70 to-transparent mt-3" />
          <div className="h-px bg-gradient-to-r from-transparent via-[#39ff14]/20 to-transparent mt-0.5" />
        </motion.div>

        {/* ── ROUNDS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-10 lg:divide-x lg:divide-[#39ff14]/10">
          {competitionData.rounds.map((round, index) => {
            const isR2 = round.roundKey === 'round2';
            const active = round.canEnter && !round.underConstruction;
            const accent = isR2 ? '#ff003c' : '#39ff14';
            const accentRgb = isR2 ? '255,0,60' : '57,255,20';
            const numeral = index === 0 ? '01' : '02';

            return (
              <motion.div
                key={round.roundKey}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className={`relative flex flex-col overflow-hidden border p-6 md:p-8 ${
                  index === 0 ? 'lg:border-r-0' : ''
                } ${
                  active
                    ? `border-[${accent}]/35 bg-[#010a01]`
                    : 'border-[#39ff14]/12 bg-[#010301]'
                } transition-all duration-300 hover:border-opacity-60`}
                style={{
                  borderColor: active ? `rgba(${accentRgb},0.35)` : 'rgba(57,255,20,0.12)',
                  boxShadow: active ? `inset 0 0 60px rgba(${accentRgb},0.03)` : 'none',
                }}
              >
                {/* Big watermark numeral */}
                <div
                  className="absolute top-2 right-4 font-black select-none pointer-events-none leading-none"
                  style={{
                    fontSize: '7rem',
                    color: `rgba(${accentRgb},0.04)`,
                    fontFamily: 'monospace',
                    letterSpacing: '-0.05em',
                  }}
                >
                  {numeral}
                </div>

                {/* HUD corners */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: active ? `rgba(${accentRgb},0.7)` : 'rgba(57,255,20,0.2)' }} />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: active ? `rgba(${accentRgb},0.7)` : 'rgba(57,255,20,0.2)' }} />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: active ? `rgba(${accentRgb},0.7)` : 'rgba(57,255,20,0.2)' }} />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: active ? `rgba(${accentRgb},0.7)` : 'rgba(57,255,20,0.2)' }} />

                {/* Top accent bar */}
                {active && (
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.8), transparent)` }} />
                )}

                {/* Header row */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center border" style={{ borderColor: `rgba(${accentRgb},0.4)`, background: `rgba(${accentRgb},0.07)` }}>
                      <Target className="w-4 h-4" style={{ color: active ? accent : `rgba(${accentRgb},0.3)` }} />
                    </div>
                    <div>
                      <div className="text-[8px] tracking-[0.4em] mb-0.5" style={{ color: `rgba(${accentRgb},0.5)` }}>
                        // MISSION {numeral}
                      </div>
                      <h2 className={`text-lg md:text-xl font-black tracking-[0.12em] ${active ? 'text-white' : 'text-white/35'}`}>
                        {round.roundName.toUpperCase()}
                      </h2>
                    </div>
                  </div>
                  {getStatusBadge(round)}
                </div>

                {/* Divider */}
                <div className="h-px mb-4" style={{ background: active ? `rgba(${accentRgb},0.2)` : 'rgba(255,255,255,0.05)' }} />

                {/* Live Countdown */}
                {(() => {
                  const nowMs = Date.now();
                  const startMs = round.playWindowStart ? new Date(round.playWindowStart).getTime() : null;
                  const endMs = round.playWindowEnd ? new Date(round.playWindowEnd).getTime() : null;

                  // No window set
                  if (!startMs && !endMs) return null;

                  // Before start
                  if (startMs && nowMs < startMs) {
                    return (
                      <div className="mb-4 p-3 border rounded-sm" style={{ borderColor: `rgba(${accentRgb},0.2)`, background: `rgba(${accentRgb},0.04)` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="w-3.5 h-3.5" style={{ color: accent }} />
                          <span className="text-[9px] tracking-[0.25em] font-bold" style={{ color: `rgba(${accentRgb},0.7)` }}>CONTEST COUNTDOWN</span>
                        </div>
                        <div className="text-2xl font-black font-mono tabular-nums tracking-wider" style={{ color: accent, textShadow: `0 0 20px rgba(${accentRgb},0.3)` }}>
                          {formatCountdown(startMs - nowMs)}
                        </div>
                        <div className="text-[9px] tracking-[0.2em] mt-1" style={{ color: `rgba(${accentRgb},0.4)` }}>
                          OPENS {formatDate(round.playWindowStart!)}
                        </div>
                      </div>
                    );
                  }

                  // During window
                  if (endMs && nowMs <= endMs) {
                    return (
                      <div className="mb-4 p-3 border rounded-sm" style={{ borderColor: 'rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-[9px] tracking-[0.25em] font-bold text-green-400/70">TIME REMAINING</span>
                        </div>
                        <div className="text-2xl font-black font-mono tabular-nums tracking-wider text-green-400" style={{ textShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                          {formatCountdown(endMs - nowMs)}
                        </div>
                        <div className="text-[9px] tracking-[0.2em] mt-1 text-green-400/40">
                          CLOSES {formatDate(round.playWindowEnd!)}
                        </div>
                      </div>
                    );
                  }

                  // After end
                  if (endMs && nowMs > endMs) {
                    return (
                      <div className="mb-4 p-3 border border-red-500/20 bg-red-500/5 rounded-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-red-400/60" />
                          <span className="text-[10px] tracking-[0.2em] font-bold text-red-400/60">CONTEST ENDED</span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* Rules — flex-1 so both cards push button to same bottom */}
                <div className="flex-1 mb-6 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[8px] tracking-[0.45em]" style={{ color: `rgba(${accentRgb},0.4)` }}>MISSION PARAMETERS</span>
                    <div className="flex-1 h-px" style={{ background: `rgba(${accentRgb},0.1)` }} />
                  </div>
                  <ul className="space-y-2">
                    {round.rules.map((rule, idx) => (
                      <li key={idx} className={`text-[11px] md:text-xs flex items-start gap-2.5 leading-relaxed ${active ? 'text-white/75' : 'text-white/22'}`}>
                        <span className="shrink-0 mt-0.5 text-[10px] font-bold" style={{ color: active ? `rgba(${accentRgb},0.7)` : 'rgba(57,255,20,0.2)' }}>
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="relative z-10">
                  {active ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleEnterRound(round.roundKey)}
                      className="w-full py-4 font-black tracking-[0.3em] text-sm uppercase flex items-center justify-center gap-3 relative overflow-hidden group transition-all duration-200"
                      style={{
                        border: `1px solid rgba(${accentRgb},0.6)`,
                        color: accent,
                        background: `rgba(${accentRgb},0.06)`,
                        boxShadow: `0 0 20px rgba(${accentRgb},0.1)`,
                      }}
                    >
                      {/* Slide fill */}
                      <span
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-200 ease-out"
                        style={{ background: accent }}
                      />
                      <span className="relative z-10 group-hover:text-black transition-colors font-mono text-base">{'>'}</span>
                      <span className="relative z-10 group-hover:text-black transition-colors">ENTER COMPETITION</span>
                      <ChevronRight className="w-4 h-4 relative z-10 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-black/20 border border-white/6 text-white/18 cursor-not-allowed uppercase tracking-[0.25em] font-bold text-sm flex items-center justify-center gap-2"
                    >
                      {round.underConstruction ? (
                        <><Construction className="w-4 h-4" /> COMING SOON</>
                      ) : (
                        <><Lock className="w-4 h-4" /> {round.availabilityLabel.toUpperCase()}</>
                      )}
                    </button>
                  )}
                </div>

                {/* scanline overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(57,255,20,0.008)_3px,rgba(57,255,20,0.008)_4px)]" />
              </motion.div>
            );
          })}
        </div>

        {/* ── GENERAL RULES ── */}
        {competitionData.generalRules && competitionData.generalRules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#010301] border border-[#39ff14]/15 p-5 md:p-7 relative overflow-hidden mb-8"
          >
            <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[#39ff14]/40" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[#39ff14]/40" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[#39ff14]/40" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[#39ff14]/40" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39ff14]/40 to-transparent" />

            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] tracking-[0.4em] text-[#39ff14]/40">//</span>
              <h2 className="text-[11px] font-black tracking-[0.35em] text-white/70">RULES OF ENGAGEMENT</h2>
              <div className="flex-1 h-px bg-[#39ff14]/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {competitionData.generalRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 text-[11px] text-white/55">
                  <span className="text-[#39ff14]/40 font-bold shrink-0 mt-0.5 font-mono">{String(idx + 1).padStart(2, '0')}.</span>
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-5 pb-6"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              localStorage.removeItem('teamName');
              localStorage.removeItem('teamData');
              localStorage.removeItem('round2_completed');
              sessionStorage.removeItem('hasSeenBriefing_v2');
              navigate('/');
            }}
            className="px-6 py-2 border border-red-500/40 text-red-500/60 hover:border-red-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 uppercase tracking-[0.25em] font-bold text-[10px] flex items-center gap-2"
          >
            <Power className="w-3 h-3" />
            TERMINATE SESSION
          </motion.button>

          {/* Designer Credits — Hacker Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <div className="relative border border-[#39ff14]/15 bg-[#010301]/80 backdrop-blur-sm overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#39ff14]/[0.05] border-b border-[#39ff14]/10">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14]/50" />
                </div>
                <span className="text-[8px] text-[#39ff14]/30 tracking-wider">sys.architects</span>
              </div>

              <div className="p-3 space-y-1.5">
                <div className="text-[9px] text-[#39ff14]/40">
                  <span className="text-[#39ff14]/60">$</span> cat /etc/architects <span className="text-[#39ff14]/20">--format=classified</span>
                </div>

                {/* Lead Dev */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-[13px] font-mono font-bold" style={{color:'rgba(0,229,255,0.75)'}}>{'>#'}</span>
                  <span className="font-bold text-xs tracking-[0.15em]" style={{color:'#00e5ff', textShadow:'0 0 8px rgba(0,229,255,0.8)'}}>TAHA ANWAR</span>
                  <span className="text-[6px] tracking-[0.2em] font-mono px-1 py-px" style={{color:'rgba(0,229,255,0.4)', border:'1px solid rgba(0,229,255,0.18)'}}>#ROOT</span>
                </div>
                <div className="text-[8px] text-white/10 tracking-widest text-center">─────────────────────</div>
                {/* Developers */}
                <div className="flex items-center justify-center gap-4 flex-wrap py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#39ff14]/60">▸</span>
                    <span className="text-[#39ff14]/90 font-bold text-xs tracking-[0.12em]">RUMESA IQBAL</span>
                    <span className="text-[6px] tracking-[0.2em] font-mono text-[#39ff14]/35 border border-[#39ff14]/15 px-1 py-px">::DEV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#39ff14]/60">▸</span>
                    <span className="text-[#39ff14]/90 font-bold text-xs tracking-[0.12em]">MASHAL ZAHRA</span>
                    <span className="text-[6px] tracking-[0.2em] font-mono text-[#39ff14]/35 border border-[#39ff14]/15 px-1 py-px">::DEV</span>
                  </div>
                </div>
              </div>

              {/* Scanline */}
              <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(57,255,20,0.01)_2px,rgba(57,255,20,0.01)_4px)]" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
