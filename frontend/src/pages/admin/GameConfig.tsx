import React, { useEffect, useState } from 'react';
import { Save, Target, Clock, AlertCircle, X, Timer, Calendar } from 'lucide-react';
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

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getContestStatus(round: RoundConfig): { label: string; color: string; bg: string } {
  const now = Date.now();
  const start = round.playWindowStart ? new Date(round.playWindowStart).getTime() : null;
  const end = round.playWindowEnd ? new Date(round.playWindowEnd).getTime() : null;

  if (!start && !end) return { label: 'NO WINDOW SET', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' };
  if (start && now < start) return { label: 'UPCOMING', color: '#facc15', bg: 'rgba(250,204,21,0.08)' };
  if (end && now > end) return { label: 'ENDED', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' };
  return { label: 'RUNNING', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' };
}

function roundToNearest5Min(date: Date): Date {
  const d = new Date(date);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  return d;
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

function formatTime12(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const toDT = (val: string | null) => {
  if (!val) return '';
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const inputCls = 'w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-sm text-white/80 text-sm focus:outline-none focus:border-[#39ff14]/30';
const labelCls = 'block text-[11px] tracking-[0.1em] text-white/40 uppercase mb-1.5';
const sectionTitleCls = 'text-xs font-bold tracking-[0.15em] text-white/50 border-b border-white/[0.06] pb-2 mb-4';

function ContestWindowPicker({
  round,
  contestStatus,
  durationSec,
  countdownLabel,
  countdownMs,
  onUpdate,
}: {
  round: RoundConfig;
  contestStatus: { label: string; color: string; bg: string };
  durationSec: number | null;
  countdownLabel: string;
  countdownMs: number;
  onUpdate: (updates: Partial<RoundConfig>) => void;
}) {
  const startDate = round.playWindowStart ? new Date(round.playWindowStart) : null;
  const endDate = round.playWindowEnd ? new Date(round.playWindowEnd) : null;

  // Draft state — only applied on "Set" click
  const [draftOpen, setDraftOpen] = useState<string>(toDT(round.playWindowStart));
  const [draftClose, setDraftClose] = useState<string>(toDT(round.playWindowEnd));

  // Sync draft when parent data changes (e.g. after save + refetch)
  useEffect(() => {
    setDraftOpen(toDT(round.playWindowStart));
    setDraftClose(toDT(round.playWindowEnd));
  }, [round.playWindowStart, round.playWindowEnd]);

  const handleSet = () => {
    const openIso = draftOpen ? new Date(draftOpen).toISOString() : null;
    const closeIso = draftClose ? new Date(draftClose).toISOString() : null;
    onUpdate({
      playWindowStart: openIso,
      playWindowEnd: closeIso,
      startTime: openIso,
      endTime: closeIso,
    });
  };

  const hasChanges = draftOpen !== toDT(round.playWindowStart) || draftClose !== toDT(round.playWindowEnd);

  return (
    <div className="mx-5 mt-5 border border-white/[0.08] bg-white/[0.02] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/25" />
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40">CONTEST WINDOW</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-[0.15em] rounded-full"
            style={{ color: contestStatus.color, background: contestStatus.bg, border: `1px solid ${contestStatus.color}25` }}>
            {contestStatus.label}
          </span>
          <span className="text-[9px] text-white/15 tracking-wider">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
      </div>

      {/* Date/Time Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>OPENS</label>
          <input
            type="datetime-local"
            value={draftOpen}
            onChange={(e) => setDraftOpen(e.target.value)}
            className={inputCls}
            step={300}
          />
          {draftOpen && (
            <div className="text-[10px] text-white/25 mt-1.5">
              {formatDateShort(new Date(draftOpen))} at {formatTime12(new Date(draftOpen))}
            </div>
          )}
        </div>
        <div>
          <label className={labelCls}>CLOSES</label>
          <input
            type="datetime-local"
            value={draftClose}
            onChange={(e) => setDraftClose(e.target.value)}
            className={inputCls}
            step={300}
          />
          {draftClose && (
            <div className="text-[10px] text-white/25 mt-1.5">
              {formatDateShort(new Date(draftClose))} at {formatTime12(new Date(draftClose))}
            </div>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSet}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.1em] border transition ${
              hasChanges
                ? 'border-[#39ff14]/40 bg-[#39ff14]/10 text-[#39ff14] hover:bg-[#39ff14]/20'
                : 'border-white/[0.06] text-white/15 cursor-not-allowed'
            }`}
          >
            SET
          </button>
          {(round.playWindowStart || round.playWindowEnd) && (
            <button
              onClick={() => {
                setDraftOpen('');
                setDraftClose('');
                onUpdate({ playWindowStart: null, playWindowEnd: null, startTime: null, endTime: null });
              }}
              className="flex items-center gap-1 text-white/15 hover:text-red-400/60 transition text-[10px] tracking-wider"
            >
              <X className="w-3 h-3" />Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/25">
          {durationSec !== null && durationSec > 0 && (
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{formatDuration(durationSec)}</span>
          )}
          {countdownLabel && countdownMs > 0 && (
            <span className="flex items-center gap-1 text-white/60 font-mono font-bold">
              <Clock className="w-3 h-3 text-green-400/60" />{countdownLabel}: {formatCountdown(countdownMs)}
            </span>
          )}
          {countdownLabel === 'Ended' && <span className="text-red-400/60">Contest ended</span>}
        </div>
      </div>
    </div>
  );
}

export default function GameConfig() {
  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [generalRules, setGeneralRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { fetchRounds(); }, []);

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
      if (round.endTime && round.startTime && new Date(round.endTime) <= new Date(round.startTime)) {
        alert('End time must be after start time'); setSaving(null); return;
      }
      if (round.playWindowEnd && round.playWindowStart && new Date(round.playWindowEnd) <= new Date(round.playWindowStart)) {
        alert('Contest close time must be after open time'); setSaving(null); return;
      }
      await api.put(`/admin/config/rounds/${roundKey}`, round);
      alert(`${round.roundName} saved.`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveGeneralRules = async () => {
    setSavingGeneral(true);
    try {
      await api.put('/admin/config/general-rules', { generalRules });
      alert('General rules saved.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save');
    } finally {
      setSavingGeneral(false);
    }
  };

  const updateRound = (roundKey: string, updates: Partial<RoundConfig>) => {
    setRounds(rounds.map(r => r.roundKey === roundKey ? { ...r, ...updates } : r));
  };

  const updateRoundRule = (roundKey: string, index: number, value: string) => {
    setRounds(rounds.map(r => {
      if (r.roundKey === roundKey) { const rules = [...r.rules]; rules[index] = value; return { ...r, rules }; }
      return r;
    }));
  };

  const addRoundRule = (roundKey: string) => {
    setRounds(rounds.map(r => r.roundKey === roundKey ? { ...r, rules: [...r.rules, ''] } : r));
  };

  const removeRoundRule = (roundKey: string, index: number) => {
    setRounds(rounds.map(r => r.roundKey === roundKey ? { ...r, rules: r.rules.filter((_, i) => i !== index) } : r));
  };

  const updateGeneralRule = (index: number, value: string) => {
    const r = [...generalRules]; r[index] = value; setGeneralRules(r);
  };

  const addGeneralRule = () => setGeneralRules([...generalRules, '']);
  const removeGeneralRule = (index: number) => setGeneralRules(generalRules.filter((_, i) => i !== index));

  if (loading) return <div className="text-white/20 text-sm tracking-[0.1em] text-center py-12 animate-pulse">LOADING...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-[0.15em] text-white/80">CONFIGURATION</h1>

      {/* General Rules */}
      <div className="border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold tracking-[0.15em] text-white/50">GENERAL RULES</h2>
          <button onClick={handleSaveGeneralRules} disabled={savingGeneral}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] text-[10px] font-bold tracking-[0.1em] hover:bg-[#39ff14]/20 transition disabled:opacity-40">
            <Save className="w-3.5 h-3.5" />
            {savingGeneral ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
        <div className="space-y-2">
          {generalRules.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <input type="text" value={rule} onChange={(e) => updateGeneralRule(index, e.target.value)}
                placeholder="Enter rule..." className={`${inputCls} flex-1`} />
              <button onClick={() => removeGeneralRule(index)}
                className="px-3 py-2 text-red-400/50 hover:text-red-400 text-[10px] tracking-wider border border-red-400/20 hover:border-red-400/40 transition">REMOVE</button>
            </div>
          ))}
          <button onClick={addGeneralRule}
            className="px-4 py-2 text-white/30 hover:text-white/50 text-[10px] tracking-[0.1em] border border-white/[0.06] hover:border-white/[0.12] transition">
            + ADD RULE
          </button>
        </div>
      </div>

      {/* Round Configs */}
      <div className="space-y-4">
        {rounds.map((round) => {
          const contestStatus = getContestStatus(round);
          const startMs = round.playWindowStart ? new Date(round.playWindowStart).getTime() : null;
          const endMs = round.playWindowEnd ? new Date(round.playWindowEnd).getTime() : null;
          const durationSec = (startMs && endMs) ? Math.round((endMs - startMs) / 1000) : null;

          let countdownLabel = '';
          let countdownMs = 0;
          if (startMs && now < startMs) { countdownLabel = 'Starts in'; countdownMs = startMs - now; }
          else if (endMs && now <= endMs) { countdownLabel = 'Ends in'; countdownMs = endMs - now; }
          else if (endMs && now > endMs) { countdownLabel = 'Ended'; }

          return (
            <div key={round.roundKey} className="border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-white/30" />
                  <div>
                    <h2 className="text-sm font-bold tracking-[0.12em] text-white/80">{round.roundName.toUpperCase()}</h2>
                    <p className="text-[10px] text-white/20 tracking-wider">{round.roundKey}</p>
                  </div>
                </div>
                <button onClick={() => handleSaveRound(round.roundKey)} disabled={saving === round.roundKey}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] text-[10px] font-bold tracking-[0.1em] hover:bg-[#39ff14]/20 transition disabled:opacity-40">
                  <Save className="w-3.5 h-3.5" />
                  {saving === round.roundKey ? 'SAVING...' : 'SAVE'}
                </button>
              </div>

              {/* Contest Window */}
              <ContestWindowPicker
                round={round}
                contestStatus={contestStatus}
                durationSec={durationSec}
                countdownLabel={countdownLabel}
                countdownMs={countdownMs}
                onUpdate={(updates) => updateRound(round.roundKey, updates)}
              />

              {/* Settings Grid */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div className="space-y-3">
                    <h3 className={sectionTitleCls}>STATUS</h3>
                    <div className="flex items-center gap-5">
                      {[
                        { checked: round.enabled, onChange: (v: boolean) => updateRound(round.roundKey, { enabled: v }), label: 'Enabled' },
                        { checked: round.underConstruction, onChange: (v: boolean) => updateRound(round.roundKey, { underConstruction: v }), label: 'Construction' },
                        { checked: round.leaderboardEnabled, onChange: (v: boolean) => updateRound(round.roundKey, { leaderboardEnabled: v }), label: 'Leaderboard' },
                      ].map((cb, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={cb.checked} onChange={(e) => cb.onChange(e.target.checked)}
                            className="w-3.5 h-3.5 accent-[#39ff14]" />
                          <span className="text-[11px] text-white/40 tracking-wide">{cb.label}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className={labelCls}>Round Status</label>
                      <select value={round.status} onChange={(e) => updateRound(round.roundKey, { status: e.target.value })} className={inputCls}>
                        <option value="active">Active</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="ended">Ended</option>
                        <option value="under_construction">Under Construction</option>
                      </select>
                    </div>
                  </div>

                  {/* Gameplay */}
                  <div className="space-y-3">
                    <h3 className={sectionTitleCls}>GAMEPLAY</h3>
                    {[
                      { label: 'Game Time (seconds)', value: round.totalGameTimeSeconds, key: 'totalGameTimeSeconds' as const, hint: `${Math.floor(round.totalGameTimeSeconds / 60)} min` },
                      { label: 'Question Timeout (seconds)', value: round.questionTimeoutSeconds, key: 'questionTimeoutSeconds' as const },
                      { label: 'Points Per Correct', value: round.pointsPerCorrect, key: 'pointsPerCorrect' as const },
                      { label: 'Max Consecutive Wrong', value: round.maxConsecutiveWrong, key: 'maxConsecutiveWrong' as const },
                      { label: 'Max Level', value: round.maxLevel, key: 'maxLevel' as const },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className={labelCls}>{field.label}</label>
                        <input type="number" value={field.value}
                          onChange={(e) => updateRound(round.roundKey, { [field.key]: parseInt(e.target.value) || 0 })}
                          className={inputCls} />
                        {field.hint && <p className="text-[10px] text-white/15 mt-1">{field.hint}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div className="mt-5">
                  <h3 className={sectionTitleCls}>RULES</h3>
                  <div className="space-y-2">
                    {round.rules.map((rule, index) => (
                      <div key={index} className="flex gap-2">
                        <input type="text" value={rule} onChange={(e) => updateRoundRule(round.roundKey, index, e.target.value)}
                          placeholder="Enter rule..." className={`${inputCls} flex-1`} />
                        <button onClick={() => removeRoundRule(round.roundKey, index)}
                          className="px-3 py-2 text-red-400/40 hover:text-red-400 text-[10px] border border-red-400/15 hover:border-red-400/30 transition">REMOVE</button>
                      </div>
                    ))}
                    <button onClick={() => addRoundRule(round.roundKey)}
                      className="px-4 py-2 text-white/25 hover:text-white/50 text-[10px] tracking-wider border border-white/[0.06] hover:border-white/[0.12] transition">
                      + ADD RULE
                    </button>
                  </div>
                </div>

                {round.underConstruction && (
                  <div className="mt-4 border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500/50 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-yellow-400/60">Under construction — not accessible to teams even if enabled.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
