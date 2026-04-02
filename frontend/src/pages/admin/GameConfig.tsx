import React, { useEffect, useState } from 'react';
import { Save, Target, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

interface RoundConfig {
  roundKey: string;
  roundName: string;
  enabled: boolean;
  status: string;
  underConstruction: boolean;
  startTime: string | null;
  endTime: string | null;
  playWindowStart: string | null;
  playWindowEnd: string | null;
  totalGameTimeSeconds: number;
  questionTimeoutSeconds: number;
  pointsPerCorrect: number;
  maxLevel: number;
  maxConsecutiveWrong: number;
  rules: string[];
  leaderboardEnabled: boolean;
}

export default function GameConfig() {
  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [generalRules, setGeneralRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingGeneral, setSavingGeneral] = useState(false);

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      const response = await api.get('/admin/config/rounds');
      setRounds(response.data.rounds || response.data);
      setGeneralRules(response.data.generalRules || []);
    } catch (error) {
      console.error('Failed to fetch rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRound = async (roundKey: string) => {
    setSaving(roundKey);
    try {
      const round = rounds.find(r => r.roundKey === roundKey);
      if (!round) return;

      // Validate timing
      if (round.endTime && round.startTime && new Date(round.endTime) <= new Date(round.startTime)) {
        alert('End time must be after start time');
        setSaving(null);
        return;
      }

      if (round.playWindowEnd && round.playWindowStart && new Date(round.playWindowEnd) <= new Date(round.playWindowStart)) {
        alert('Play window end must be after play window start');
        setSaving(null);
        return;
      }

      await api.put(`/admin/config/rounds/${roundKey}`, round);
      alert(`${round.roundName} configuration saved successfully!`);
    } catch (error: any) {
      console.error('Failed to save round config:', error);
      alert(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveGeneralRules = async () => {
    setSavingGeneral(true);
    try {
      await api.put('/admin/config/general-rules', { generalRules });
      alert('General rules saved successfully!');
    } catch (error: any) {
      console.error('Failed to save general rules:', error);
      alert(error.response?.data?.message || 'Failed to save general rules');
    } finally {
      setSavingGeneral(false);
    }
  };

  const updateRound = (roundKey: string, updates: Partial<RoundConfig>) => {
    setRounds(rounds.map(r => 
      r.roundKey === roundKey ? { ...r, ...updates } : r
    ));
  };

  const updateRoundRule = (roundKey: string, index: number, value: string) => {
    setRounds(rounds.map(r => {
      if (r.roundKey === roundKey) {
        const newRules = [...r.rules];
        newRules[index] = value;
        return { ...r, rules: newRules };
      }
      return r;
    }));
  };

  const addRoundRule = (roundKey: string) => {
    setRounds(rounds.map(r => {
      if (r.roundKey === roundKey) {
        return { ...r, rules: [...r.rules, ''] };
      }
      return r;
    }));
  };

  const removeRoundRule = (roundKey: string, index: number) => {
    setRounds(rounds.map(r => {
      if (r.roundKey === roundKey) {
        return { ...r, rules: r.rules.filter((_, i) => i !== index) };
      }
      return r;
    }));
  };

  const updateGeneralRule = (index: number, value: string) => {
    const newRules = [...generalRules];
    newRules[index] = value;
    setGeneralRules(newRules);
  };

  const addGeneralRule = () => {
    setGeneralRules([...generalRules, '']);
  };

  const removeGeneralRule = (index: number) => {
    setGeneralRules(generalRules.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Round Configuration</h1>
      <p className="text-gray-600">Manage settings for each competition round</p>

      {/* General Rules Section */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">General Competition Rules</h2>
            <p className="text-sm opacity-90 mt-1">These rules appear in the competition lobby for all teams</p>
          </div>
          <button
            onClick={handleSaveGeneralRules}
            disabled={savingGeneral}
            className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 disabled:bg-gray-300 font-semibold"
          >
            <Save className="w-5 h-5" />
            {savingGeneral ? 'Saving...' : 'Save Rules'}
          </button>
        </div>
        <div className="space-y-3">
          {generalRules.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={rule}
                onChange={(e) => updateGeneralRule(index, e.target.value)}
                placeholder="Enter general rule..."
                className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:ring-2 focus:ring-white"
              />
              <button
                onClick={() => removeGeneralRule(index)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addGeneralRule}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30"
          >
            + Add General Rule
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {rounds.map((round) => (
          <div key={round.roundKey} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{round.roundName}</h2>
                  <p className="text-sm text-gray-500">Key: {round.roundKey}</p>
                </div>
              </div>
              <button
                onClick={() => handleSaveRound(round.roundKey)}
                disabled={saving === round.roundKey}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
              >
                <Save className="w-5 h-5" />
                {saving === round.roundKey ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Status Settings</h3>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={round.enabled}
                      onChange={(e) => updateRound(round.roundKey, { enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enabled</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={round.underConstruction}
                      onChange={(e) => updateRound(round.roundKey, { underConstruction: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Under Construction</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={round.leaderboardEnabled}
                      onChange={(e) => updateRound(round.roundKey, { leaderboardEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Leaderboard</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={round.status}
                    onChange={(e) => updateRound(round.roundKey, { status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ended">Ended</option>
                    <option value="under_construction">Under Construction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={round.startTime ? new Date(round.startTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateRound(round.roundKey, { startTime: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={round.endTime ? new Date(round.endTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateRound(round.roundKey, { endTime: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-800 mb-3">Play Access Window</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Play Window Start
                      </label>
                      <input
                        type="datetime-local"
                        value={round.playWindowStart ? new Date(round.playWindowStart).toISOString().slice(0, 16) : ''}
                        onChange={(e) => updateRound(round.roundKey, { playWindowStart: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">When teams can start playing</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Play Window End
                      </label>
                      <input
                        type="datetime-local"
                        value={round.playWindowEnd ? new Date(round.playWindowEnd).toISOString().slice(0, 16) : ''}
                        onChange={(e) => updateRound(round.roundKey, { playWindowEnd: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">When teams can no longer play</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gameplay Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Gameplay Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Game Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={round.totalGameTimeSeconds}
                    onChange={(e) => updateRound(round.roundKey, { totalGameTimeSeconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.floor(round.totalGameTimeSeconds / 60)} minutes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={round.questionTimeoutSeconds}
                    onChange={(e) => updateRound(round.roundKey, { questionTimeoutSeconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Per Correct Answer
                  </label>
                  <input
                    type="number"
                    value={round.pointsPerCorrect}
                    onChange={(e) => updateRound(round.roundKey, { pointsPerCorrect: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Consecutive Wrong (before level down)
                  </label>
                  <input
                    type="number"
                    value={round.maxConsecutiveWrong}
                    onChange={(e) => updateRound(round.roundKey, { maxConsecutiveWrong: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Level
                  </label>
                  <input
                    type="number"
                    value={round.maxLevel}
                    onChange={(e) => updateRound(round.roundKey, { maxLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Rules Section */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Rules</h3>
              <div className="space-y-3">
                {round.rules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateRoundRule(round.roundKey, index, e.target.value)}
                      placeholder="Enter rule..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeRoundRule(round.roundKey, index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addRoundRule(round.roundKey)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Add Rule
                </button>
              </div>
            </div>

            {round.underConstruction && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Under Construction:</strong> This round is marked as under construction and will not be accessible to teams, even if enabled.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
