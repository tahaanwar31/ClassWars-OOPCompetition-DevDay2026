import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FileQuestion, Search } from 'lucide-react';
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

  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => { fetchQuestions(); }, []);

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
      setFormData({ level: 1, type: 'mcq', text: '', code: '', options: ['', '', '', ''], correct: '' });
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
    if (!confirm('Delete this question?')) return;
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

  const filteredQuestions = questions.filter((q) => {
    const matchesLevel = levelFilter === 'all' || q.level === parseInt(levelFilter);
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    const matchesSearch = searchQuery === '' ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.code && q.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesType && matchesSearch;
  });

  const inputCls = 'w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/70 text-sm outline-none focus:border-[#39ff14]/25 transition-colors';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#39ff14]/30 text-xs tracking-[0.4em] animate-pulse">LOADING QUESTIONS</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileQuestion className="w-5 h-5 text-[#39ff14]/40" />
          <h1 className="text-2xl font-black tracking-[0.2em] text-white/80">QUESTIONS</h1>
        </div>
        <button
          onClick={() => { setEditingQuestion(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 border border-[#39ff14]/20 text-[#39ff14]/60 text-[10px] font-bold tracking-[0.15em] hover:border-[#39ff14]/40 hover:text-[#39ff14] hover:bg-[#39ff14]/5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          ADD QUESTION
        </button>
      </div>

      {/* Filters */}
      <div className="border border-white/[0.06] bg-[#08080a] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-3.5 h-3.5 text-white/15" />
          <span className="text-[9px] tracking-[0.25em] text-white/20 font-bold">FILTER</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] tracking-[0.2em] text-white/20 mb-1.5">LEVEL</label>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/60 text-sm outline-none focus:border-[#39ff14]/25 transition-colors">
              <option value="all" className="bg-[#111116]">All Levels</option>
              {[1,2,3,4,5,6,7,8,9,10].map(l => <option key={l} value={l} className="bg-[#111116]">Level {l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.2em] text-white/20 mb-1.5">TYPE</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/60 text-sm outline-none focus:border-[#39ff14]/25 transition-colors">
              <option value="all" className="bg-[#111116]">All Types</option>
              <option value="oneword" className="bg-[#111116]">One Word</option>
              <option value="mcq" className="bg-[#111116]">Multiple Choice</option>
              <option value="code" className="bg-[#111116]">Code</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.2em] text-white/20 mb-1.5">SEARCH</label>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..."
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/60 text-sm outline-none focus:border-[#39ff14]/25 placeholder:text-white/12 transition-colors" />
          </div>
        </div>
        <div className="mt-3 text-[9px] tracking-[0.2em] text-white/15">
          {filteredQuestions.length} OF {questions.length} QUESTIONS
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/[0.06] bg-[#08080a] overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['ID', 'LEVEL', 'TYPE', 'QUESTION', 'ACTIONS'].map((h) => (
                <th key={h} className="text-left py-3 px-5 text-[9px] tracking-[0.25em] text-white/20 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q._id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                <td className="py-3 px-5 text-white/25 text-sm tabular-nums">{q.id}</td>
                <td className="py-3 px-5">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 border border-[#39ff14]/10 text-[#39ff14]/50 bg-[#39ff14]/[0.04]">
                    LVL {q.level}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 border border-white/[0.08] text-white/35 uppercase">
                    {q.type}
                  </span>
                </td>
                <td className="py-3 px-5 max-w-md truncate text-white/40 text-sm">{q.text}</td>
                <td className="py-3 px-5">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingQuestion(q); setShowModal(true); }}
                      className="p-1.5 text-white/20 hover:text-[#39ff14] transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(q._id)}
                      className="p-1.5 text-red-400/30 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredQuestions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[10px] tracking-[0.3em] text-white/12">NO QUESTIONS FOUND</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative border border-[#39ff14]/15 bg-[#0a0a0f] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#39ff14]/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#39ff14]/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#39ff14]/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#39ff14]/30" />

            <h2 className="text-sm font-black tracking-[0.25em] text-[#39ff14] mb-6">
              {editingQuestion ? 'EDIT QUESTION' : 'NEW QUESTION'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-white/25 mb-1.5">LEVEL</label>
                  <input type="number" min="1" max="10" value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className={inputCls} required />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-white/25 mb-1.5">TYPE</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={inputCls}>
                    <option value="oneword" className="bg-[#111116]">One Word</option>
                    <option value="mcq" className="bg-[#111116]">Multiple Choice</option>
                    <option value="code" className="bg-[#111116]">Code</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.2em] text-white/25 mb-1.5">QUESTION TEXT</label>
                <textarea value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className={`${inputCls} resize-none`} rows={3} required />
              </div>
              {formData.type === 'code' && (
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-white/25 mb-1.5">CODE SNIPPET</label>
                  <textarea value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`${inputCls} font-mono resize-none`} rows={6} />
                </div>
              )}
              {formData.type === 'mcq' && (
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-white/25 mb-1.5">OPTIONS</label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <input key={index} type="text" value={option}
                        onChange={(e) => { const o = [...formData.options]; o[index] = e.target.value; setFormData({ ...formData, options: o }); }}
                        className={inputCls} placeholder={`Option ${index + 1}`} />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[9px] tracking-[0.2em] text-white/25 mb-1.5">CORRECT ANSWER</label>
                <input type="text" value={formData.correct} onChange={(e) => setFormData({ ...formData, correct: e.target.value })}
                  className={inputCls} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 border border-[#39ff14]/25 bg-[#39ff14]/[0.06] text-[#39ff14] text-[10px] font-bold tracking-[0.15em] hover:bg-[#39ff14]/10 transition-all">
                  {editingQuestion ? 'UPDATE' : 'CREATE'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingQuestion(null); }}
                  className="flex-1 py-2.5 border border-white/[0.08] text-white/25 text-[10px] font-bold tracking-[0.15em] hover:text-white/40 hover:border-white/[0.12] transition-all">
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
