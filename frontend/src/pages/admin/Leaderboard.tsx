import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, RefreshCw, Radio, Users, Wifi } from 'lucide-react';
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

  // Update prev ranks after render
  useEffect(() => {
    prevRanks.current = currentRanks;
  });

  const getRankColor = (i: number) => {
    if (i === 0) return { bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.3)', text: '#FFD700', glow: '0 0 30px rgba(255,215,0,0.15)' };
    if (i === 1) return { bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)', text: '#C0C0C0', glow: '0 0 20px rgba(192,192,192,0.1)' };
    if (i === 2) return { bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.25)', text: '#CD7F32', glow: '0 0 20px rgba(205,127,50,0.1)' };
    return { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', glow: 'none' };
  };

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-black text-white/20 tabular-nums">{rank + 1}</span>;
  };

  const LiveDot = () => (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-[9px] font-bold tracking-[0.2em] text-green-400/80">LIVE</span>
    </span>
  );

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-[#39ff14]/40 tracking-[0.3em] text-sm animate-pulse mb-2">SYNCING LEADERBOARD</div>
          <div className="text-white/10 text-xs tracking-widest">Awaiting transmission...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-[0.15em] text-white">LEADERBOARD</h1>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] tracking-[0.15em] text-white/25">
              <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{summary.totalTeams} TEAMS</span>
              <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-green-500/50" /><span className="text-green-400/50">{summary.activeTeams} ACTIVE</span></span>
              <span>UPDATED {formatTime(lastUpdated)}</span>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/30 hover:border-[#39ff14]/40 hover:text-[#39ff14] transition-all text-[10px] tracking-[0.2em]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 mt-5">
          {(['round1', 'combined', 'round2'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] border transition-all ${
                view === v
                  ? v === 'round2'
                    ? 'border-[#ff6600] bg-[#ff6600]/10 text-[#ff6600]'
                    : 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]'
                  : 'border-white/6 text-white/20 hover:border-white/15 hover:text-white/40'
              }`}
            >
              {v === 'combined' ? 'COMBINED' : v === 'round1' ? 'ROUND 1' : 'ROUND 2'}
            </button>
          ))}
        </div>
      </div>

      {/* COLUMN HEADERS (Round 1) */}
      {view === 'round1' && data.length > 0 && (
        <div className="flex items-center gap-4 px-4 pb-2 border-b border-white/[0.06]">
          <div className="w-10 shrink-0" />
          <div className="flex-1 text-sm tracking-[0.15em] text-white font-bold">TEAMS</div>
          <div className="w-28 shrink-0 text-center text-sm tracking-[0.15em] text-[#39ff14] font-bold">MAX LEVEL</div>
          <div className="w-28 shrink-0 text-center text-sm tracking-[0.15em] text-white font-bold">POINTS</div>
        </div>
      )}

      {/* COLUMN HEADERS (Round 2) */}
      {view === 'round2' && data.length > 0 && (
        <div className="flex items-center gap-4 px-4 pb-2 border-b border-white/[0.06]">
          <div className="w-10 shrink-0" />
          <div className="flex-1 text-sm tracking-[0.15em] text-white font-bold">TEAMS</div>
          <div className="w-28 shrink-0 text-center text-sm tracking-[0.15em] text-[#ff6600] font-bold">LEVELS</div>
          <div className="w-28 shrink-0 text-center text-xs tracking-[0.2em] text-white/30 font-bold">POINTS</div>
        </div>
      )}

      {/* COLUMN HEADERS (Combined) */}
      {view === 'combined' && data.length > 0 && (
        <div className="flex items-center gap-4 px-4 pb-2 border-b border-white/[0.06]">
          <div className="w-10 shrink-0" />
          <div className="flex-1 text-sm tracking-[0.15em] text-white font-bold">TEAMS</div>
          <div className="w-28 shrink-0 text-center text-sm tracking-[0.15em] text-[#39ff14] font-bold">R1 LEVEL</div>
          <div className="w-28 shrink-0 text-center text-sm tracking-[0.15em] text-white font-bold">R1 POINTS</div>
        </div>
      )}

      {/* LEADERBOARD ENTRIES */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-white/5 bg-white/[0.02] p-12 text-center"
            >
              <div className="text-white/15 text-sm tracking-widest">NO DATA YET</div>
              <div className="text-white/8 text-xs tracking-wider mt-1">Waiting for teams to begin...</div>
            </motion.div>
          ) : (
            data.map((entry: any, i: number) => {
              const colors = getRankColor(i);
              const movement = getRankMovement(entry.teamName, i);
              const isActive = entry.isActive || false;

              // Data extraction per view
              const level = view === 'round2'
                ? entry.maxLevelReached || 0
                : view === 'round1'
                  ? entry.maxLevelReached || 0
                  : entry.round1?.maxLevelReached || entry.maxLevelReached || 0;
              const points = view === 'round2'
                ? Math.min(entry.maxLevelReached || 0, R2_MAX_LEVELS) * R2_POINTS_PER_LEVEL
                : view === 'round1'
                  ? entry.totalPoints || 0
                  : entry.round1?.totalPoints || entry.totalPoints || 0;
              const maxLevel = view === 'round2' ? R2_MAX_LEVELS : R1_MAX_LEVEL;
              const accentColor = view === 'round2' ? '#ff6600' : '#39ff14';
              const accentRgb = view === 'round2' ? '255,102,0' : '57,255,20';

              return (
                <motion.div
                  key={entry.teamName}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, delay: i * 0.015 }}
                  className="flex items-center gap-4 px-4 py-3 border rounded-sm transition-all hover:bg-white/[0.02]"
                  style={{
                    background: colors.bg,
                    borderColor: colors.border,
                    boxShadow: colors.glow,
                  }}
                >
                  {/* Rank */}
                  <div className="w-10 shrink-0 flex justify-center">
                    <RankIcon rank={i} />
                  </div>

                  {/* Team name */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span
                      className="text-base font-black tracking-[0.08em] truncate"
                      style={{ color: i < 3 ? colors.text : 'rgba(255,255,255,0.6)' }}
                    >
                      {entry.teamName}
                    </span>
                    {isActive && <LiveDot />}
                    {movement === 'up' && prevRanks.current.size > 0 && (
                      <span className="text-[10px] text-green-400/60">▲</span>
                    )}
                    {movement === 'down' && prevRanks.current.size > 0 && (
                      <span className="text-[10px] text-red-400/40">▼</span>
                    )}
                  </div>

                  {/* Level badge */}
                  <div className="w-28 shrink-0 text-center">
                    <span
                      className="text-sm font-black tabular-nums px-3 py-1 rounded-sm"
                      style={{ color: accentColor, background: `rgba(${accentRgb},0.08)`, border: `1px solid rgba(${accentRgb},0.15)` }}
                    >
                      {view === 'round2' ? `${level}/${maxLevel}` : level}
                    </span>
                  </div>

                  {/* Points badge */}
                  <div className="w-28 shrink-0 text-center">
                    <span className="text-sm font-black text-white/70 tabular-nums">
                      {points}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
