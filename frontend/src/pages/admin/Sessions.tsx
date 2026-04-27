import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../api/axios';

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

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
    if (!confirm('Are you sure you want to delete this session?')) return;

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

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#39ff14]/10 text-[#39ff14]/70';
      case 'completed':
        return 'bg-white/[0.06] text-white/40';
      case 'timeout':
        return 'bg-red-500/10 text-red-400/60';
      default:
        return 'bg-white/[0.06] text-white/40';
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
      <div className="flex items-center justify-center py-12 font-mono text-white/20 text-sm tracking-[0.1em]">
        LOADING...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-mono font-bold text-white/80 tracking-[0.1em]">
          SESSIONS
        </h1>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Team</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Round</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Level</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Points</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Created</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className="border-b border-white/[0.04]">
                  <td className="px-5 py-3.5 font-mono text-sm text-white/80 whitespace-nowrap">
                    {session.teamName}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 bg-white/[0.06] text-white/40 font-mono text-[11px] tracking-[0.1em]">
                      {getRoundLabel(session.roundKey)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-white/60 whitespace-nowrap">
                    {session.maxLevelReached ?? session.currentLevel ?? '--'}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-white/60 whitespace-nowrap">
                    {session.totalPoints}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 font-mono text-[11px] tracking-[0.1em] ${getStatusClasses(session.status)}`}
                    >
                      {(session.status || 'UNKNOWN').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/20 whitespace-nowrap">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-red-400/40 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center font-mono text-sm text-white/20">
                    No sessions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
