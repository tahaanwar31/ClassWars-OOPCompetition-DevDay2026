import React, { useEffect, useState } from 'react';
import { Users, Activity, FileQuestion, Trophy, Crosshair, Radio, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

interface StatData {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalQuestions: number;
  topPlayers: number;
  averagePoints: number;
}

interface LeaderboardEntry {
  teamName: string;
  maxLevelReached: number;
  totalPoints: number;
  bestPoints: number;
  sessionsPlayed: number;
  lastUpdated: string;
  isActive: boolean;
}

interface RoundInfo {
  roundKey: string;
  roundName: string;
  status: string;
  canEnter: boolean;
  availabilityLabel: string;
  enabled: boolean;
  underConstruction: boolean;
  playWindowStart?: string;
  playWindowEnd?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, lbRes, roundsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/leaderboard?roundKey=round1'),
          api.get('/competition/rounds'),
        ]);
        setStats(statsRes.data);
        setLeaderboard((lbRes.data || []).slice(0, 5));
        setRounds(roundsRes.data.rounds || []);
        setError(null);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          setError('AUTH FAILED — Token expired or missing. Try logging in again.');
        } else if (err?.code === 'ERR_NETWORK') {
          setError('BACKEND UNREACHABLE — Is the server running on port 3002?');
        } else {
          setError(`FETCH FAILED — ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
        }
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-white/20 text-sm tracking-widest animate-pulse">
          LOADING
        </span>
      </div>
    );
  }

  const statCards = [
    {
      label: 'TOTAL SESSIONS',
      value: stats?.totalSessions ?? 0,
      icon: Users,
      color: 'text-white/80',
    },
    {
      label: 'ACTIVE SESSIONS',
      value: stats?.activeSessions ?? 0,
      icon: Activity,
      color: (stats?.activeSessions ?? 0) > 0 ? 'text-[#39ff14]' : 'text-white/80',
    },
    {
      label: 'TOTAL QUESTIONS',
      value: stats?.totalQuestions ?? 0,
      icon: FileQuestion,
      color: 'text-white/80',
    },
    {
      label: 'AVG POINTS',
      value: Math.round(stats?.averagePoints ?? 0),
      icon: Trophy,
      color: 'text-white/80',
    },
  ];

  const getRoundAccent = (roundKey: string) =>
    roundKey === 'round2' ? 'text-[#ff6600]' : 'text-white/80';

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-xl font-bold tracking-[0.15em] text-white/80">
        DASHBOARD
      </h1>

      {/* Error Banner */}
      {error && (
        <div className="border border-red-500/30 bg-red-500/5 p-4 text-red-400 text-sm tracking-wide">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className="w-3.5 h-3.5 text-white/20" />
              <span className="text-[11px] tracking-[0.2em] text-white/40 uppercase">
                {card.label}
              </span>
            </div>
            <span className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Round Status Cards */}
      {rounds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rounds.map((round) => (
            <div
              key={round.roundKey}
              className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Radio className={`w-4 h-4 ${getRoundAccent(round.roundKey)}`} />
                  <span className={`text-sm font-bold tracking-[0.1em] ${getRoundAccent(round.roundKey)}`}>
                    {round.roundName.toUpperCase()}
                  </span>
                </div>
                <span
                  className={`text-[10px] tracking-[0.15em] px-2.5 py-1 rounded-sm ${
                    round.canEnter
                      ? 'bg-[#39ff14]/10 text-[#39ff14]'
                      : 'bg-white/[0.04] text-white/30'
                  }`}
                >
                  {round.availabilityLabel?.toUpperCase() || round.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                {round.playWindowStart && (
                  <div className="flex justify-between">
                    <span className="text-[11px] tracking-[0.15em] text-white/20">OPENS</span>
                    <span className="text-xs text-white/50">
                      {new Date(round.playWindowStart).toLocaleString()}
                    </span>
                  </div>
                )}
                {round.playWindowEnd && (
                  <div className="flex justify-between">
                    <span className="text-[11px] tracking-[0.15em] text-white/20">CLOSES</span>
                    <span className="text-xs text-white/50">
                      {new Date(round.playWindowEnd).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[11px] tracking-[0.15em] text-white/20">ENABLED</span>
                  <span className={`text-xs ${round.enabled ? 'text-[#39ff14]' : 'text-white/30'}`}>
                    {round.enabled ? 'YES' : 'NO'}
                  </span>
                </div>
                {round.underConstruction && (
                  <div className="flex justify-between">
                    <span className="text-[11px] tracking-[0.15em] text-white/20">STATUS</span>
                    <span className="text-xs text-[#ff6600]">UNDER CONSTRUCTION</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Round 1 Mini Leaderboard */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2.5">
            <Crosshair className="w-4 h-4 text-white/20" />
            <span className="text-sm font-bold tracking-[0.1em] text-white/80">
              ROUND 1 LEADERBOARD
            </span>
          </div>
          <Link
            to="/admin/leaderboard"
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] text-white/30 hover:text-white/60 transition-colors"
          >
            VIEW FULL
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['#', 'TEAM', 'LEVEL', 'POINTS', 'SESSIONS'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] tracking-[0.2em] text-white/20 pb-3 pr-4 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/20 text-xs tracking-widest">
                    NO DATA
                  </td>
                </tr>
              ) : (
                leaderboard.map((team, index) => (
                  <tr
                    key={team.teamName}
                    className="border-b border-white/[0.03] last:border-0"
                  >
                    <td className="py-3 pr-4 text-xs text-white/30">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 pr-4 text-sm text-white/60">
                      {team.teamName}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[11px] tracking-[0.1em] px-2 py-0.5 rounded-sm bg-[#39ff14]/10 text-[#39ff14]">
                        LV.{team.maxLevelReached}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-white/60 font-bold">
                      {team.totalPoints}
                    </td>
                    <td className="py-3 text-xs text-white/30">
                      {team.sessionsPlayed}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
