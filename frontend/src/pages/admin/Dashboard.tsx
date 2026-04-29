import React, { useEffect, useState } from 'react';
import { Users, Activity, FileQuestion, Trophy, Crosshair, Radio, ArrowRight, Zap, Shield } from 'lucide-react';
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

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent?: boolean }) => (
  <div className="relative overflow-hidden border border-white/[0.06] bg-[#08080a] p-5 group hover:border-[#39ff14]/15 transition-all">
    {/* Corner accents */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#39ff14]/20" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#39ff14]/20" />

    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-3.5 h-3.5 ${accent ? 'text-[#39ff14]/60' : 'text-white/15'}`} />
      <span className="text-[9px] tracking-[0.25em] text-white/25">{label}</span>
    </div>
    <span className={`text-2xl font-black ${accent ? 'text-[#39ff14]' : 'text-white/70'}`} style={accent ? { textShadow: '0 0 15px rgba(57,255,20,0.2)' } : {}}>
      {value}
    </span>
  </div>
);

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
          setError('BACKEND UNREACHABLE — Is the server running?');
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
        <div className="text-center">
          <div className="text-[#39ff14]/30 text-xs tracking-[0.4em] animate-pulse mb-1">SYNCING</div>
          <div className="text-white/10 text-[10px] tracking-widest">Establishing uplink...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-[#39ff14]/50" />
        <h1 className="text-2xl font-black tracking-[0.2em] text-white/80">
          COMMAND CENTER
        </h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="border border-red-500/30 bg-red-500/5 p-4 text-red-400 text-xs tracking-wide">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="TOTAL SESSIONS" value={stats?.totalSessions ?? 0} />
        <StatCard icon={Activity} label="ACTIVE NOW" value={stats?.activeSessions ?? 0} accent={!!(stats?.activeSessions)} />
        <StatCard icon={FileQuestion} label="QUESTIONS" value={stats?.totalQuestions ?? 0} />
        <StatCard icon={Trophy} label="AVG POINTS" value={Math.round(stats?.averagePoints ?? 0)} />
      </div>

      {/* Round Status */}
      {rounds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rounds.map((round) => {
            const accent = round.roundKey === 'round2' ? '#ff6600' : '#39ff14';
            const accentRgb = round.roundKey === 'round2' ? '255,102,0' : '57,255,20';
            return (
              <div
                key={round.roundKey}
                className="relative overflow-hidden border bg-[#08080a] p-5 transition-all"
                style={{ borderColor: round.canEnter ? `rgba(${accentRgb},0.25)` : 'rgba(255,255,255,0.06)' }}
              >
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: `rgba(${accentRgb},0.3)` }} />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: `rgba(${accentRgb},0.3)` }} />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4" style={{ color: accent }} />
                    <span className="text-sm font-black tracking-[0.15em]" style={{ color: accent }}>
                      {round.roundName.toUpperCase()}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-bold tracking-[0.2em] px-2.5 py-1"
                    style={{
                      color: round.canEnter ? accent : 'rgba(255,255,255,0.25)',
                      background: round.canEnter ? `rgba(${accentRgb},0.08)` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${round.canEnter ? `rgba(${accentRgb},0.2)` : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {round.availabilityLabel?.toUpperCase() || round.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {round.playWindowStart && (
                    <div className="flex justify-between">
                      <span className="text-[10px] tracking-[0.2em] text-white/20">OPENS</span>
                      <span className="text-[11px] text-white/45">{new Date(round.playWindowStart).toLocaleString()}</span>
                    </div>
                  )}
                  {round.playWindowEnd && (
                    <div className="flex justify-between">
                      <span className="text-[10px] tracking-[0.2em] text-white/20">CLOSES</span>
                      <span className="text-[11px] text-white/45">{new Date(round.playWindowEnd).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[10px] tracking-[0.2em] text-white/20">ENABLED</span>
                    <span className={`text-[11px] ${round.enabled ? 'text-[#39ff14]/70' : 'text-white/25'}`}>
                      {round.enabled ? 'YES' : 'NO'}
                    </span>
                  </div>
                  {round.underConstruction && (
                    <div className="flex justify-between">
                      <span className="text-[10px] tracking-[0.2em] text-white/20">MODE</span>
                      <span className="text-[11px] text-[#ff6600]/70">UNDER CONSTRUCTION</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mini Leaderboard */}
      <div className="border border-[#39ff14]/10 bg-[#08080a]">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#39ff14]/40" />
            <span className="text-xs font-black tracking-[0.2em] text-white/60">
              TOP TEAMS
            </span>
          </div>
          <Link
            to="/admin/leaderboard"
            className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] text-[#39ff14]/40 hover:text-[#39ff14] transition-colors"
          >
            FULL BOARD
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5">
          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-white/15 text-xs tracking-[0.2em]">NO DATA YET</div>
          ) : (
            <div className="space-y-1">
              {leaderboard.map((team, index) => {
                const rankColors = [
                  { text: '#FFD700', bg: 'rgba(255,215,0,0.06)' },
                  { text: '#C0C0C0', bg: 'rgba(192,192,192,0.04)' },
                  { text: '#CD7F32', bg: 'rgba(205,127,50,0.04)' },
                ][index] || { text: 'rgba(255,255,255,0.3)', bg: 'transparent' };

                return (
                  <div
                    key={team.teamName}
                    className="flex items-center gap-4 px-3 py-2.5 transition-all hover:bg-white/[0.02]"
                    style={{ background: rankColors.bg }}
                  >
                    <span className="text-[11px] font-black w-6" style={{ color: rankColors.text }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-sm text-white/60 truncate">{team.teamName}</span>
                    <span
                      className="text-[10px] font-black tracking-wider px-2 py-0.5"
                      style={{ color: '#39ff14', background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.1)' }}
                    >
                      LV.{team.maxLevelReached}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
