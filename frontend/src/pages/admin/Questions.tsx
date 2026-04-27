import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';

export default function Questions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    level: 1,
    type: 'mcq',
    text: '',
    code: '',
    options: ['', '', '', ''],
    correct: '',
  });

  // Filter states
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        level: editingQuestion.level || 1,
        type: editingQuestion.type || 'mcq',
        text: editingQuestion.text || '',
        code: editingQuestion.code || '',
        options: editingQuestion.options || ['', '', '', ''],
        correct: editingQuestion.correct || '',
      });
    } else {
      setFormData({
        level: 1,
        type: 'mcq',
        text: '',
        code: '',
        options: ['', '', '', ''],
        correct: '',
      });
    }
  }, [editingQuestion, showModal]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/admin/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.delete(`/admin/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionData = {
        ...formData,
        options: formData.type === 'mcq' ? formData.options.filter(o => o.trim()) : undefined,
        code: formData.type === 'code' ? formData.code : undefined,
      };

      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion._id}`, questionData);
      } else {
        await api.post('/admin/questions', questionData);
      }

      setShowModal(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save question');
    }
  };

  // Filter questions based on level, type, and search query
  const filteredQuestions = questions.filter((q) => {
    const matchesLevel = levelFilter === 'all' || q.level === parseInt(levelFilter);
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    const matchesSearch = searchQuery === '' ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.code && q.code.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesLevel && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 font-mono text-white/20 text-sm tracking-[0.1em]">
        LOADING...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white/80 tracking-[0.08em] uppercase">
          Questions Management
        </h1>
        <button
          onClick={() => { setEditingQuestion(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] rounded text-sm tracking-[0.05em] hover:bg-[#39ff14]/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Question
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">
              Filter by Level
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm focus:outline-none focus:border-[#39ff14]/30 transition-colors appearance-none"
            >
              <option value="all" className="bg-[#111116]">All Levels</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <option key={level} value={level} className="bg-[#111116]">Level {level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm focus:outline-none focus:border-[#39ff14]/30 transition-colors appearance-none"
            >
              <option value="all" className="bg-[#111116]">All Types</option>
              <option value="oneword" className="bg-[#111116]">One Word</option>
              <option value="mcq" className="bg-[#111116]">Multiple Choice</option>
              <option value="code" className="bg-[#111116]">Code</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">
              Search Questions
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in text or code..."
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-[#39ff14]/30 transition-colors"
            />
          </div>
        </div>

        <div className="mt-4 text-[11px] tracking-[0.1em] text-white/25 uppercase">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4 text-[10px] tracking-[0.15em] text-white/25 uppercase font-normal">ID</th>
              <th className="text-left py-3 px-4 text-[10px] tracking-[0.15em] text-white/25 uppercase font-normal">Level</th>
              <th className="text-left py-3 px-4 text-[10px] tracking-[0.15em] text-white/25 uppercase font-normal">Type</th>
              <th className="text-left py-3 px-4 text-[10px] tracking-[0.15em] text-white/25 uppercase font-normal">Question</th>
              <th className="text-left py-3 px-4 text-[10px] tracking-[0.15em] text-white/25 uppercase font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 text-white/40 text-sm">{q.id}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-[10px] bg-[#39ff14]/10 text-[#39ff14]/70 rounded tracking-[0.05em]">
                    LVL {q.level}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-[10px] bg-[#3b82f6]/10 text-[#3b82f6]/70 rounded tracking-[0.05em] uppercase">
                    {q.type}
                  </span>
                </td>
                <td className="py-3 px-4 max-w-md truncate text-white/60 text-sm">{q.text}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingQuestion(q); setShowModal(true); }}
                      className="p-1.5 text-white/30 hover:text-[#3b82f6] rounded transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="p-1.5 text-red-400/60 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredQuestions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/20 text-sm tracking-[0.05em]">
                  No questions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111116] border border-white/[0.08] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white/80 tracking-[0.05em] uppercase mb-6">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">Level</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm focus:outline-none focus:border-[#39ff14]/30 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm focus:outline-none focus:border-[#39ff14]/30 transition-colors appearance-none"
                    required
                  >
                    <option value="oneword" className="bg-[#111116]">One Word</option>
                    <option value="mcq" className="bg-[#111116]">Multiple Choice</option>
                    <option value="code" className="bg-[#111116]">Code</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">Question Text</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm focus:outline-none focus:border-[#39ff14]/30 transition-colors resize-none"
                  rows={3}
                  required
                />
              </div>

              {formData.type === 'code' && (
                <div>
                  <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">Code Snippet</label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm font-mono focus:outline-none focus:border-[#39ff14]/30 transition-colors resize-none"
                    rows={6}
                  />
                </div>
              )}

              {formData.type === 'mcq' && (
                <div>
                  <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">Options</label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm placeholder:text-white/20 focus:outline-none focus:border-[#39ff14]/30 transition-colors"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] tracking-[0.1em] text-white/40 mb-2 uppercase">Correct Answer</label>
                <input
                  type="text"
                  value={formData.correct}
                  onChange={(e) => setFormData({ ...formData, correct: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-white/80 rounded text-sm focus:outline-none focus:border-[#39ff14]/30 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] py-2.5 rounded text-sm tracking-[0.05em] hover:bg-[#39ff14]/20 transition-colors"
                >
                  {editingQuestion ? 'Update' : 'Add'} Question
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingQuestion(null); }}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white/40 py-2.5 rounded text-sm tracking-[0.05em] hover:bg-white/[0.08] hover:text-white/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
