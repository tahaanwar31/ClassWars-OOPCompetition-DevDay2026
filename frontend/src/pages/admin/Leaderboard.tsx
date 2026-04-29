import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, RefreshCw, Radio, Users, Wifi, Crown, Flame, Terminal } from 'lucide-react';
import api from '../../api/axios';

interface RoundStats {
  maxLevelReached: number;
  totalPoints: number;
  bestPoints: number;
  sessionsPlayed: number;
  lastUpdated: string;
  isActive?: boolean;
}

interface CombinedEntry {
  teamName: string;
  round1: RoundStats;
  round2: RoundStats;
  round2DisplayPoints: number;
  combinedLevel: number;
  combinedPoints: number;
}

interface LeaderboardSummary {
  totalTeams: number;
  activeTeams: number;
}

const R2_POINTS_PER_LEVEL = 10;
const R2_MAX_LEVELS = 3;
const R1_MAX_LEVEL = 10;

export default function Leaderboard() {
  const [round1Data, setRound1Data] = useState<any[]>([]);
  const [round2Data, setRound2Data] = useState<any[]>([]);
  const [summary, setSummary] = useState<LeaderboardSummary>({ totalTeams: 0, activeTeams: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [view, setView] = useState<'combined' | 'round1' | 'round2'>('round1');
  const [resetting, setResetting] = useState(false);
  const prevRanks = useRef<Map<string, number>>(new Map());

  const fetchAll = useCallback(async () => {
    try {
      const [r1, r2, sum] = await Promise.all([
        api.get('/admin/leaderboard?roundKey=round1'),
        api.get('/admin/leaderboard?roundKey=round2'),
        api.get('/admin/leaderboard/summary'),
      ]);
      setRound1Data(r1.data || []);
      setRound2Data(r2.data || []);
      setSummary(sum.data || { totalTeams: 0, activeTeams: 0 });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleReset = async () => {
    if (!confirm('RESET ALL LEADERBOARD DATA?\n\nThis will clear all team scores and sessions. This cannot be undone.')) return;
    setResetting(true);
    try {
      await api.post('/admin/reset-leaderboard');
      await fetchAll();
    } catch (e) {
      console.error('Reset failed:', e);
    } finally {
      setResetting(false);
    }
  };

  // Build combined entries
  const buildCombined = (): CombinedEntry[] => {
    const teamMap = new Map<string, CombinedEntry>();

    for (const t of round1Data) {
      teamMap.set(t.teamName, {
        teamName: t.teamName,
        round1: {
          maxLevelReached: t.maxLevelReached || 0,
          totalPoints: t.totalPoints || 0,
          bestPoints: t.bestPoints || 0,
          sessionsPlayed: t.sessionsPlayed || 0,
          lastUpdated: t.lastUpdated || '',
          isActive: t.isActive || false,
        },
        round2: { maxLevelReached: 0, totalPoints: 0, bestPoints: 0, sessionsPlayed: 0, lastUpdated: '' },
        round2DisplayPoints: 0,
        combinedLevel: 0,
        combinedPoints: 0,
      });
    }

    for (const t of round2Data) {
      const r2Points = Math.min(t.maxLevelReached || 0, R2_MAX_LEVELS) * R2_POINTS_PER_LEVEL;
      const existing = teamMap.get(t.teamName);
      if (existing) {
        existing.round2 = {
          maxLevelReached: t.maxLevelReached || 0,
          totalPoints: t.totalPoints || 0,
          bestPoints: t.bestPoints || 0,
          sessionsPlayed: t.sessionsPlayed || 0,
          lastUpdated: t.lastUpdated || '',
          isActive: t.isActive || false,
        };
        existing.round2DisplayPoints = r2Points;
      } else {
        teamMap.set(t.teamName, {
          teamName: t.teamName,
          round1: { maxLevelReached: 0, totalPoints: 0, bestPoints: 0, sessionsPlayed: 0, lastUpdated: '' },
          round2: {
            maxLevelReached: t.maxLevelReached || 0,
            totalPoints: t.totalPoints || 0,
            bestPoints: t.bestPoints || 0,
            sessionsPlayed: t.sessionsPlayed || 0,
            lastUpdated: t.lastUpdated || '',
            isActive: t.isActive || false,
          },
          round2DisplayPoints: r2Points,
          combinedLevel: 0,
          combinedPoints: 0,
        });
      }
    }

    const entries = [...teamMap.values()];
    for (const e of entries) {
      e.combinedLevel = e.round1.maxLevelReached;
      e.combinedPoints = e.round1.totalPoints + e.round2DisplayPoints;
    }

    entries.sort((a, b) => {
      if (b.round1.maxLevelReached !== a.round1.maxLevelReached) return b.round1.maxLevelReached - a.round1.maxLevelReached;
      if (b.round2DisplayPoints !== a.round2DisplayPoints) return b.round2DisplayPoints - a.round2DisplayPoints;
      if (b.round1.totalPoints !== a.round1.totalPoints) return b.round1.totalPoints - a.round1.totalPoints;
      const aTime = a.round1.lastUpdated ? new Date(a.round1.lastUpdated).getTime() : Infinity;
      const bTime = b.round1.lastUpdated ? new Date(b.round1.lastUpdated).getTime() : Infinity;
      return aTime - bTime;
    });

    return entries;
  };

  const combined = buildCombined();

  // Track rank movements
  const currentRanks = new Map<string, number>();
  const data = view === 'combined' ? combined : view === 'round1' ? round1Data : round2Data;
  data.forEach((entry: any, i: number) => {
    currentRanks.set(entry.teamName, i);
  });

  const getRankMovement = (teamName: string, currentRank: number): 'up' | 'down' | 'same' | 'new' => {
    const prev = prevRanks.current.get(teamName);
    if (prev === undefined) return 'new';
    if (prev > currentRank) return 'up';
    if (prev < currentRank) return 'down';
    return 'same';
  };

  useEffect(() => {
    prevRanks.current = currentRanks;
  });

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Terminal className="w-6 h-6 text-[#39ff14]/20 mx-auto mb-3 animate-pulse" />
          <div className="text-[#39ff14]/30 text-xs tracking-[0.4em] animate-pulse mb-1">SYNCING LEADERBOARD</div>
          <div className="text-white/8 text-[10px] tracking-[0.2em]">Awaiting transmission...</div>
        </div>
      </div>
    );
  }

  const accentColor = view === 'round2' ? '#ff6600' : '#39ff14';
  const accentRgb = view === 'round2' ? '255,102,0' : '57,255,20';

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6" style={{ color: accentColor }} />
              <h1 className="text-2xl font-black tracking-[0.2em] text-white/90">LEADERBOARD</h1>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            </div>
            <div className="flex items-center gap-5 text-[9px] tracking-[0.2em] text-white/20">
              <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{summary.totalTeams} TEAMS</span>
              <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-green-500/40" /><span className="text-green-400/40">{summary.activeTeams} LIVE</span></span>
              <span className="flex items-center gap-1.5"><Radio className="w-3 h-3" />{formatTime(lastUpdated)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 px-4 py-2 border border-white/[0.08] text-white/25 hover:border-[#39ff14]/30 hover:text-[#39ff14] transition-all text-[10px] font-bold tracking-[0.15em]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              SYNC
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-400/40 hover:border-red-500/40 hover:text-red-400 transition-all text-[10px] font-bold tracking-[0.15em] disabled:opacity-30"
            >
              <Flame className="w-3.5 h-3.5" />
              {resetting ? 'RESETTING...' : 'RESET ALL'}
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 mt-5">
          {(['round1', 'combined', 'round2'] as const).map((v) => {
            const vAccent = v === 'round2' ? '#ff6600' : '#39ff14';
            const vAccentRgb = v === 'round2' ? '255,102,0' : '57,255,20';
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative px-5 py-2.5 text-[10px] font-black tracking-[0.2em] border transition-all ${
                  view === v
                    ? ''
                    : 'border-white/[0.06] text-white/15 hover:border-white/[0.12] hover:text-white/30'
                }`}
                style={view === v ? {
                  borderColor: `rgba(${vAccentRgb},0.3)`,
                  background: `rgba(${vAccentRgb},0.06)`,
                  color: vAccent,
                  textShadow: `0 0 10px rgba(${vAccentRgb},0.2)`,
                } : {}}
              >
                {v === 'combined' ? 'COMBINED' : v === 'round1' ? 'ROUND 1' : 'ROUND 2'}
                {view === v && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: vAccent, boxShadow: `0 0 8px rgba(${vAccentRgb},0.4)` }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* COLUMN HEADERS */}
      {data.length > 0 && (
        <div className="flex items-center gap-4 px-4 pb-2 border-b border-white/[0.06]">
          <div className="w-12 shrink-0" />
          <div className="flex-1 text-[10px] tracking-[0.25em] text-white/30 font-bold">TEAM</div>
          {view === 'round1' && (
            <div className="w-32 shrink-0 text-center text-[10px] tracking-[0.25em] text-[#39ff14]/50 font-bold">LEVEL</div>
          )}
          {view === 'round2' && (
            <>
              <div className="w-28 shrink-0 text-center text-[10px] tracking-[0.25em] text-[#ff6600]/50 font-bold">LEVELS</div>
              <div className="w-28 shrink-0 text-center text-[10px] tracking-[0.25em] text-white/25 font-bold">POINTS</div>
            </>
          )}
          {view === 'combined' && (
            <>
              <div className="w-28 shrink-0 text-center text-[10px] tracking-[0.25em] text-[#39ff14]/50 font-bold">R1 LVL</div>
              <div className="w-28 shrink-0 text-center text-[10px] tracking-[0.25em] text-[#ff6600]/50 font-bold">R2 PTS</div>
            </>
          )}
        </div>
      )}

      {/* ENTRIES */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-white/[0.04] bg-[#08080a] p-12 text-center"
            >
              <Terminal className="w-8 h-8 text-white/8 mx-auto mb-3" />
              <div className="text-white/12 text-xs tracking-[0.3em]">NO DATA YET</div>
              <div className="text-white/6 text-[10px] tracking-[0.15em] mt-1">Waiting for teams to begin...</div>
            </motion.div>
          ) : (
            data.map((entry: any, i: number) => {
              const movement = getRankMovement(entry.teamName, i);
              const isActive = entry.isActive || false;

              // Rank visual
              const getRankStyle = () => {
                if (i === 0) return {
                  text: '#FFD700',
                  bg: 'rgba(255,215,0,0.04)',
                  border: 'rgba(255,215,0,0.15)',
                  glow: '0 0 20px rgba(255,215,0,0.05)',
                  icon: <Crown className="w-5 h-5 text-yellow-400" />,
                };
                if (i === 1) return {
                  text: '#C0C0C0',
                  bg: 'rgba(192,192,192,0.03)',
                  border: 'rgba(192,192,192,0.12)',
                  glow: 'none',
                  icon: <Medal className="w-5 h-5 text-gray-400" />,
                };
                if (i === 2) return {
                  text: '#CD7F32',
                  bg: 'rgba(205,127,50,0.03)',
                  border: 'rgba(205,127,50,0.12)',
                  glow: 'none',
                  icon: <Award className="w-5 h-5 text-amber-600" />,
                };
                return {
                  text: 'rgba(255,255,255,0.35)',
                  bg: 'transparent',
                  border: 'rgba(255,255,255,0.04)',
                  glow: 'none',
                  icon: <span className="text-[11px] font-black text-white/15 tabular-nums">{String(i + 1).padStart(2, '0')}</span>,
                };
              };
              const rank = getRankStyle();

              // Data extraction
              const level = view === 'round2'
                ? entry.maxLevelReached || 0
                : view === 'round1'
                  ? entry.maxLevelReached || 0
                  : entry.round1?.maxLevelReached || entry.maxLevelReached || 0;
              const r2Points = view === 'round2'
                ? Math.min(entry.maxLevelReached || 0, R2_MAX_LEVELS) * R2_POINTS_PER_LEVEL
                : entry.round2DisplayPoints || 0;
              const maxLevel = view === 'round2' ? R2_MAX_LEVELS : R1_MAX_LEVEL;

              return (
                <motion.div
                  key={entry.teamName}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: i * 0.012 }}
                  className="relative flex items-center gap-4 px-4 py-3 border transition-all hover:bg-white/[0.015]"
                  style={{
                    background: rank.bg,
                    borderColor: rank.border,
                    boxShadow: rank.glow,
                  }}
                >
                  {/* Rank */}
                  <div className="w-12 shrink-0 flex justify-center">
                    {rank.icon}
                  </div>

                  {/* Team */}
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <span
                      className="text-sm font-black tracking-[0.08em] truncate"
                      style={{ color: i < 3 ? rank.text : 'rgba(255,255,255,0.5)' }}
                    >
                      {entry.teamName}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                        </span>
                        <span className="text-[8px] font-bold tracking-[0.2em] text-green-400/60">LIVE</span>
                      </span>
                    )}
                    {movement === 'up' && prevRanks.current.size > 0 && (
                      <span className="text-[9px] text-green-400/50 font-bold">▲</span>
                    )}
                    {movement === 'down' && prevRanks.current.size > 0 && (
                      <span className="text-[9px] text-red-400/30 font-bold">▼</span>
                    )}
                  </div>

                  {/* Badges */}
                  {view === 'round1' && (
                    <div className="w-32 shrink-0 text-center">
                      <span
                        className="text-[11px] font-black tabular-nums px-3 py-1"
                        style={{
                          color: '#39ff14',
                          background: 'rgba(57,255,20,0.06)',
                          border: '1px solid rgba(57,255,20,0.12)',
                        }}
                      >
                        {level}/{maxLevel}
                      </span>
                    </div>
                  )}
                  {view === 'round2' && (
                    <>
                      <div className="w-28 shrink-0 text-center">
                        <span className="text-[10px] text-white/30 tabular-nums">{level}/{maxLevel}</span>
                      </div>
                      <div className="w-28 shrink-0 text-center">
                        <span
                          className="text-[11px] font-black tabular-nums px-3 py-1"
                          style={{
                            color: '#ff6600',
                            background: 'rgba(255,102,0,0.06)',
                            border: '1px solid rgba(255,102,0,0.12)',
                          }}
                        >
                          {r2Points} pts
                        </span>
                      </div>
                    </>
                  )}
                  {view === 'combined' && (
                    <>
                      <div className="w-28 shrink-0 text-center">
                        <span
                          className="text-[11px] font-black tabular-nums px-2.5 py-1"
                          style={{
                            color: '#39ff14',
                            background: 'rgba(57,255,20,0.06)',
                            border: '1px solid rgba(57,255,20,0.12)',
                          }}
                        >
                          L{level}
                        </span>
                      </div>
                      <div className="w-28 shrink-0 text-center">
                        <span
                          className="text-[11px] font-black tabular-nums px-2.5 py-1"
                          style={{
                            color: '#ff6600',
                            background: 'rgba(255,102,0,0.06)',
                            border: '1px solid rgba(255,102,0,0.12)',
                          }}
                        >
                          {r2Points} pts
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer info */}
      <div className="border border-white/[0.04] bg-[#08080a] px-5 py-3 flex items-center justify-between">
        <span className="text-[9px] tracking-[0.2em] text-white/15">
          AUTO-REFRESH EVERY 5s
        </span>
        <span className="text-[9px] tracking-[0.2em] text-white/15">
          {data.length} ENTRIES
        </span>
      </div>
    </div>
  );
}
