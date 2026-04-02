import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Target } from 'lucide-react';
import api from '../../api/axios';

interface LeaderboardEntry {
  teamName: string;
  maxLevelReached: number;
  totalPoints: number;
  bestPoints: number;
  sessionsPlayed: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState('round1');

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedRound]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/admin/leaderboard?roundKey=${selectedRound}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 2:
        return <Award className="w-8 h-8 text-orange-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-gray-600 mt-1">Ranked by Max Level, then Total Points</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="round1">Round 1</option>
            <option value="round2">Round 2</option>
          </select>
          <button
            onClick={fetchLeaderboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No teams have played {selectedRound === 'round1' ? 'Round 1' : 'Round 2'} yet
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.teamName}
              className={`bg-white rounded-lg shadow-md p-6 flex items-center gap-6 transition-all hover:shadow-lg ${
                index < 3 ? 'border-2 border-blue-500' : ''
              }`}
            >
              <div className="flex-shrink-0 w-16 flex justify-center">
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800">{entry.teamName}</h3>
                <div className="flex gap-6 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Max Level: {entry.maxLevelReached}
                  </span>
                  <span>Sessions: {entry.sessionsPlayed}</span>
                  <span>Best: {entry.bestPoints}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Level {entry.maxLevelReached}</div>
                <div className="text-3xl font-bold text-blue-600">{entry.totalPoints}</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Ranking System</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Primary: Highest Max Level Reached</li>
          <li>• Secondary: Highest Total Points</li>
          <li>• Max Level = Highest level achieved across all sessions</li>
          <li>• Total Points = Sum of all session scores</li>
          <li>• Best Points = Highest score in a single session</li>
        </ul>
      </div>
    </div>
  );
}
