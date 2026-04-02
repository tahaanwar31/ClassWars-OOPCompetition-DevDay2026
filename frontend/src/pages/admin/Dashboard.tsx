import React, { useEffect, useState } from 'react';
import { Users, FileQuestion, Trophy, TrendingUp, Target, Zap } from 'lucide-react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [roundsStatus, setRoundsStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLeaderboard();
    fetchRoundsStatus();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/admin/leaderboard?roundKey=round1');
      setLeaderboard(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const fetchRoundsStatus = async () => {
    try {
      const response = await api.get('/competition/rounds');
      setRoundsStatus(response.data.rounds || []);
    } catch (error) {
      console.error('Failed to fetch rounds status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const round1Stats = leaderboard.length > 0 ? {
    highestLevel: Math.max(...leaderboard.map(t => t.maxLevelReached)),
    totalTeams: leaderboard.length,
    avgPoints: Math.round(leaderboard.reduce((sum, t) => sum + t.totalPoints, 0) / leaderboard.length)
  } : { highestLevel: 0, totalTeams: 0, avgPoints: 0 };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalSessions || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-green-600">{stats?.activeSessions || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalQuestions || 0}</p>
            </div>
            <FileQuestion className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Points</p>
              <p className="text-3xl font-bold text-orange-600">{Math.round(stats?.averagePoints || 0)}</p>
            </div>
            <Trophy className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Round Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roundsStatus.map((round: any) => (
          <div key={round.roundKey} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{round.roundName}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                round.canEnter 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {round.availabilityLabel}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium">{round.status}</span>
              </div>
              {round.playWindowStart && (
                <div className="flex justify-between">
                  <span>Opens:</span>
                  <span className="font-medium">{new Date(round.playWindowStart).toLocaleString()}</span>
                </div>
              )}
              {round.playWindowEnd && (
                <div className="flex justify-between">
                  <span>Closes:</span>
                  <span className="font-medium">{new Date(round.playWindowEnd).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className="font-medium">{round.enabled ? 'Yes' : 'No'}</span>
              </div>
              {round.underConstruction && (
                <div className="mt-2 text-yellow-600 font-medium">
                  ⚠️ Under Construction
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Round 1 Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Round 1 Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90">Highest Level Reached</p>
            <p className="text-3xl font-bold">{round1Stats.highestLevel}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90">Teams Participated</p>
            <p className="text-3xl font-bold">{round1Stats.totalTeams}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90">Average Points</p>
            <p className="text-3xl font-bold">{round1Stats.avgPoints}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Round 1 Top Teams
          </h2>
          <a href="/admin/leaderboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Full Leaderboard →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Team Name</th>
                <th className="text-left py-3 px-4">Max Level</th>
                <th className="text-left py-3 px-4">Total Points</th>
                <th className="text-left py-3 px-4">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No teams have played Round 1 yet
                  </td>
                </tr>
              ) : (
                leaderboard.map((team: any, index: number) => (
                  <tr key={team.teamName} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold">{team.teamName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <Target className="w-3 h-3" />
                        Level {team.maxLevelReached}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{team.totalPoints}</td>
                    <td className="py-3 px-4 text-gray-600">{team.sessionsPlayed}</td>
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
