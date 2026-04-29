import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import api from '../../api/axios';

interface Team {
  _id: string;
  teamName: string;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  isActive: boolean;
  createdAt: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: '', password: '' });

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/admin/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/teams', newTeam);
      setNewTeam({ teamName: '', password: '' });
      setShowAddModal(false);
      fetchTeams();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding team');
    }
  };

  const handleDeleteTeam = async (teamName: string) => {
    if (!confirm(`DELETE TEAM "${teamName}"?\n\nThis cannot be undone.`)) return;
    try {
      await api.delete(`/admin/teams/${teamName}`);
      fetchTeams();
    } catch (error) {
      alert('Error deleting team');
    }
  };

  const handleToggleStatus = async (teamName: string) => {
    try {
      await api.put(`/admin/teams/${teamName}/toggle`);
      fetchTeams();
    } catch (error) {
      alert('Error toggling team status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#39ff14]/30 text-xs tracking-[0.4em] animate-pulse">LOADING TEAMS</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[#39ff14]/40" />
          <h1 className="text-2xl font-black tracking-[0.2em] text-white/80">TEAMS</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-[#39ff14]/20 text-[#39ff14]/60 text-[10px] font-bold tracking-[0.15em] hover:border-[#39ff14]/40 hover:text-[#39ff14] hover:bg-[#39ff14]/5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          ADD TEAM
        </button>
      </div>

      {/* Table */}
      <div className="border border-white/[0.06] bg-[#08080a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['TEAM', 'SCORE', 'GAMES', 'BEST', 'STATUS', 'ACTIONS'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] tracking-[0.25em] text-white/20 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-white/60 tracking-wide">{team.teamName}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40 tabular-nums">{team.totalScore}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40 tabular-nums">{team.gamesPlayed}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40 tabular-nums">{team.bestScore}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-[0.15em] border ${
                        team.isActive
                          ? 'text-[#39ff14]/60 border-[#39ff14]/15 bg-[#39ff14]/[0.04]'
                          : 'text-red-400/50 border-red-400/15 bg-red-500/[0.04]'
                      }`}
                    >
                      {team.isActive ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(team.teamName)}
                        className="text-white/20 hover:text-[#39ff14] transition-colors"
                        title={team.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {team.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.teamName)}
                        className="text-red-400/25 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[10px] tracking-[0.3em] text-white/12">NO TEAMS REGISTERED</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative border border-[#39ff14]/15 bg-[#0a0a0f] p-6 w-full max-w-md">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#39ff14]/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#39ff14]/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#39ff14]/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#39ff14]/30" />

            <h2 className="text-sm font-black tracking-[0.25em] text-[#39ff14] mb-6">REGISTER TEAM</h2>
            <form onSubmit={handleAddTeam} className="space-y-5">
              <div>
                <label className="block text-[9px] tracking-[0.25em] text-white/25 mb-2">TEAM NAME</label>
                <input
                  type="text"
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-white/70 text-sm outline-none focus:border-[#39ff14]/30 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.25em] text-white/25 mb-2">PASSWORD</label>
                <input
                  type="password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-white/70 text-sm outline-none focus:border-[#39ff14]/30 transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 border border-[#39ff14]/25 bg-[#39ff14]/[0.06] text-[#39ff14] text-[10px] font-bold tracking-[0.15em] hover:bg-[#39ff14]/10 transition-all"
                >
                  REGISTER
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-white/[0.08] text-white/25 text-[10px] font-bold tracking-[0.15em] hover:text-white/40 hover:border-white/[0.12] transition-all"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
