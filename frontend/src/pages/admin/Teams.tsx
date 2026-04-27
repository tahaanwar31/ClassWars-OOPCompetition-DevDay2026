import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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

  useEffect(() => {
    fetchTeams();
  }, []);

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
    if (!confirm(`Delete team "${teamName}"?`)) return;
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
      <div className="flex items-center justify-center py-12 font-mono text-white/20 text-sm tracking-[0.1em]">
        LOADING...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-mono font-bold text-white/80 tracking-[0.1em]">
          TEAMS
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/80 hover:border-[#39ff14]/30 font-mono text-xs tracking-[0.1em] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          ADD TEAM
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Team Name</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Score</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Games</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Best</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id} className="border-b border-white/[0.04]">
                  <td className="px-5 py-3.5 font-mono text-sm text-white/80 whitespace-nowrap">
                    {team.teamName}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-white/60 whitespace-nowrap">
                    {team.totalScore}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-white/60 whitespace-nowrap">
                    {team.gamesPlayed}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-white/60 whitespace-nowrap">
                    {team.bestScore}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 font-mono text-[11px] tracking-[0.1em] ${
                        team.isActive
                          ? 'bg-[#39ff14]/10 text-[#39ff14]/70'
                          : 'bg-red-500/10 text-red-400/60'
                      }`}
                    >
                      {team.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(team.teamName)}
                        className="text-[#39ff14]/60 hover:text-[#39ff14] transition-colors"
                        title={team.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {team.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.teamName)}
                        className="text-red-400/40 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center font-mono text-sm text-white/20">
                    No teams found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111116] border border-white/[0.08] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-mono font-bold text-white/80 tracking-[0.1em] mb-6">
              ADD TEAM
            </h2>
            <form onSubmit={handleAddTeam} className="space-y-5">
              <div>
                <label className="block text-[11px] tracking-[0.1em] text-white/40 font-mono mb-2">
                  TEAM NAME
                </label>
                <input
                  type="text"
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/80 font-mono text-sm outline-none focus:border-[#39ff14]/30 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.1em] text-white/40 font-mono mb-2">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/80 font-mono text-sm outline-none focus:border-[#39ff14]/30 transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14]/80 font-mono text-xs tracking-[0.1em] hover:bg-[#39ff14]/15 hover:border-[#39ff14]/30 transition-colors"
                >
                  ADD
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/40 font-mono text-xs tracking-[0.1em] hover:text-white/60 hover:border-white/[0.12] transition-colors"
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
