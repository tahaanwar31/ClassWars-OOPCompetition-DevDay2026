import React, { useEffect, useState } from 'react';
import { Trash2, Terminal } from 'lucide-react';
import api from '../../api/axios';

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/admin/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return;
    try {
      await api.delete(`/admin/sessions/${id}`);
      fetchSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '--';
    return new Date(date).toLocaleString();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { color: '#39ff14', bg: 'rgba(57,255,20,0.06)', border: 'rgba(57,255,20,0.15)' };
      case 'completed': return { color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' };
      case 'timeout': return { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)' };
      default: return { color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' };
    }
  };

  const getRoundLabel = (roundKey: string) => {
    if (!roundKey) return '--';
    if (roundKey === 'round1') return 'ROUND 1';
    if (roundKey === 'round2') return 'ROUND 2';
    return roundKey.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#39ff14]/30 text-xs tracking-[0.4em] animate-pulse">LOADING SESSIONS</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Terminal className="w-5 h-5 text-[#39ff14]/40" />
        <h1 className="text-2xl font-black tracking-[0.2em] text-white/80">SESSIONS</h1>
      </div>

      {/* Table */}
      <div className="border border-white/[0.06] bg-[#08080a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['TEAM', 'ROUND', 'LEVEL', 'POINTS', 'STATUS', 'CREATED', 'ACTIONS'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] tracking-[0.25em] text-white/20 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const ss = getStatusStyle(session.status);
                return (
                  <tr key={session._id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-bold text-white/60 tracking-wide">{session.teamName}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 border border-white/[0.08] text-white/30">
                        {getRoundLabel(session.roundKey)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/40 tabular-nums">
                      {session.maxLevelReached ?? session.currentLevel ?? '--'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/40 tabular-nums">{session.totalPoints}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[9px] font-bold tracking-[0.15em] px-2.5 py-0.5 border"
                        style={{ color: ss.color, background: ss.bg, borderColor: ss.border }}
                      >
                        {(session.status || 'UNKNOWN').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-white/15">{formatDate(session.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleDelete(session._id)}
                        className="text-red-400/25 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[10px] tracking-[0.3em] text-white/12">NO SESSIONS FOUND</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
