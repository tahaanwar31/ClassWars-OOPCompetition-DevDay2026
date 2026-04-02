import React, { useEffect, useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
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
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Game Sessions</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Player</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Level</th>
                <th className="text-left py-3 px-4">Points</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Started</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{session.playerName}</td>
                  <td className="py-3 px-4">{session.playerEmail}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      Level {session.currentLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">{session.totalPoints}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
