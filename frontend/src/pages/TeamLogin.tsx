import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, AlertCircle, Cpu } from 'lucide-react';
import CWEmblem from '../components/CWEmblem';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import TacticalBackground from '../components/TacticalBackground';

const BOOT_LINES = [
  '> KERNEL v6.1.4-CW LOADING...',
  '> CPU CORES [████████████] 16x @4.8GHz',
  '> RAM 65536 MB [MAPPED]',
  '> GPU PIPELINE [INITIALIZED]',
  '> NEURAL FIREWALL [ACTIVE]',
  '> DARKNET RELAY [TUNNELED]',
  '> QUANTUM ENCRYPT [AES-256-GCM]',
  '> AWAITING OPERATIVE...',
];

// Deterministic hex streams — no Math.random so SSR-safe and stable
const HEX_L = Array.from({ length: 120 }, (_, i) => ((i * 0x9E3779B9) >>> 0).toString(16).padStart(8, '0'));
const HEX_R = Array.from({ length: 120 }, (_, i) => ((i * 0x517CC1B7 + 0xDEAD) >>> 0).toString(16).padStart(8, '0'));

export default function TeamLogin() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootIdx, setBootIdx] = useState(0);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    if (bootIdx < BOOT_LINES.length) {
      const t = setTimeout(() => setBootIdx(i => i + 1), 130);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setBootDone(true), 250);
      return () => clearTimeout(t);
    }
  }, [bootIdx]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3002/teams/login', {
        teamName,
        password,
      });
      localStorage.setItem('teamName', response.data.teamName);
      localStorage.setItem('teamData', JSON.stringify(response.data));
      navigate('/competition');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed — Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000800] text-[#39ff14] font-mono relative overflow-hidden scanlines crt-flicker">
      <TacticalBackground />

      {/* ── Flowing hex data gutters ── */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[72px] overflow-hidden pointer-events-none select-none z-[1]">
        <motion.div
          animate={{ y: [0, -2000] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="text-[9px] text-[#39ff14]/[0.06] leading-[2] pl-2 font-mono"
        >
          {HEX_L.map((h, i) => <div key={i}>{h}</div>)}
          {HEX_L.map((h, i) => <div key={`d${i}`}>{h}</div>)}
        </motion.div>
      </div>
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-[72px] overflow-hidden pointer-events-none select-none z-[1]">
        <motion.div
          animate={{ y: [-2000, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="text-[9px] text-[#39ff14]/[0.06] leading-[2] pr-2 text-right font-mono"
        >
          {HEX_R.map((h, i) => <div key={i}>{h}</div>)}
          {HEX_R.map((h, i) => <div key={`d${i}`}>{h}</div>)}
        </motion.div>
      </div>

      {/* ── Radar sweep ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ marginTop: '-50px' }}>
        <motion.svg
          width="700" height="700" viewBox="0 0 700 700"
          className="opacity-[0.05]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 0.5, duration: 2 }}
        >
          {[260, 200, 140, 80].map(r => (
            <circle key={r} cx="350" cy="350" r={r} fill="none" stroke="#39ff14" strokeWidth="0.5" />
          ))}
          <line x1="90" y1="350" x2="610" y2="350" stroke="#39ff14" strokeWidth="0.3" opacity="0.5" />
          <line x1="350" y1="90" x2="350" y2="610" stroke="#39ff14" strokeWidth="0.3" opacity="0.5" />
          <line x1="165" y1="165" x2="535" y2="535" stroke="#39ff14" strokeWidth="0.15" opacity="0.3" />
          <line x1="535" y1="165" x2="165" y2="535" stroke="#39ff14" strokeWidth="0.15" opacity="0.3" />
          {/* Sweep line */}
          <motion.line
            x1="350" y1="350" x2="350" y2="90"
            stroke="#39ff14" strokeWidth="1.5" opacity="0.7"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '350px 350px' }}
          />
          {/* Sweep cone trail */}
          <defs>
            <radialGradient id="sweepFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#39ff14" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#39ff14" stopOpacity="0.03" />
            </radialGradient>
          </defs>
          <motion.path
            d="M350,350 L350,90 A260,260 0 0,1 533.9,166.1 Z"
            fill="url(#sweepFade)"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '350px 350px' }}
          />
          {/* Blips */}
          {([[400, 220], [290, 190], [440, 400], [240, 420], [375, 310]] as [number, number][]).map(([x, y], i) => (
            <motion.circle
              key={i} cx={x} cy={y} r="2.5" fill="#39ff14"
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.8 }}
            />
          ))}
        </motion.svg>
      </div>

      {/* ── Ambient glow ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-[#39ff14]/[0.02] blur-[200px] breathe-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#001200]/30 to-transparent" />
      </div>

      {/* ═══════════ FULL-SCREEN TERMINAL ═══════════ */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* ── Terminal title bar ── */}
        <div className="bg-[#080e08]/95 backdrop-blur-md border-b border-[#39ff14]/20 px-5 py-2 flex items-center gap-3 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.5)]" />
          </div>
          <div className="h-4 w-px bg-[#39ff14]/15 mx-1" />
          <Terminal className="w-3 h-3 text-[#39ff14]/40" />
          <span className="text-[11px] text-[#39ff14]/40 tracking-wider">root@classwars:~/secure-auth</span>
          <div className="flex-1" />
          <AnimatePresence mode="wait">
            {!bootDone ? (
              <motion.span key={bootIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="text-[10px] text-[#39ff14]/30 tracking-widest hidden sm:inline">
                {BOOT_LINES[bootIdx - 1] || BOOT_LINES[0]}
                <span className="inline-block w-1.5 h-2.5 bg-[#39ff14]/50 ml-1 animate-pulse align-middle" />
              </motion.span>
            ) : (
              <motion.span key="rdy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[10px] text-[#39ff14]/60 tracking-widest font-bold hidden sm:inline">
                [✓] SYSTEM READY — ENCRYPTED CHANNEL
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Main content area ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

          {/* CW Emblem — dramatic entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.2, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <CWEmblem size={120} />
          </motion.div>

          {/* Title — CLASS WARS */}
          <motion.h1
            initial={{ opacity: 0, y: 30, letterSpacing: '0.6em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.18em' }}
            transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl md:text-[5.5rem] font-black text-glow glitch-text text-center leading-none mb-1 select-none"
          >
            CLASS WARS
          </motion.h1>

          {/* Subtitle line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#39ff14]/50" />
            <span className="text-[8px] tracking-[0.6em] text-[#39ff14]/35 uppercase whitespace-nowrap">DevDay 2026 ── Classified Combat Platform</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#39ff14]/50" />
          </motion.div>

          {/* ── AUTH TERMINAL BLOCK ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
            className="w-full max-w-2xl relative"
          >
            {/* Outer glow */}
            <div className="absolute -inset-px bg-gradient-to-b from-[#39ff14]/20 via-transparent to-[#39ff14]/10 pointer-events-none" />
            <div className="absolute -inset-1 shadow-[0_0_80px_rgba(57,255,20,0.08)] pointer-events-none rounded-sm" />

            <div className="bg-[#010a01]/95 backdrop-blur-xl border border-[#39ff14]/25 relative overflow-hidden">
              {/* Scan line across top */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent opacity-70 border-scan" />

              {/* HUD corners */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#39ff14]/50" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#39ff14]/50" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#39ff14]/50" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#39ff14]/50" />

              {/* Auth sub-header */}
              <div className="bg-[#001200]/60 border-b border-[#39ff14]/15 px-5 py-2 flex items-center gap-2">
                <Lock className="w-3 h-3 text-[#febc2e]" />
                <span className="text-[8px] tracking-[0.4em] text-[#febc2e]/90 uppercase font-bold">Secure Authentication Channel</span>
                <div className="flex-1" />
                <span className="flex items-center gap-1.5 text-[8px] text-[#ff5f57] font-bold">
                  <span className="w-1.5 h-1.5 bg-[#ff5f57] rounded-full animate-pulse shadow-[0_0_6px_rgba(255,95,87,0.8)]" />LIVE
                </span>
              </div>

              <div className="p-8">
                {/* SSH context lines — multi-color terminal output */}
                <div className="text-[11px] mb-5 space-y-1.5 font-mono leading-relaxed">
                  <div>
                    <span className="text-[#ff5f57] font-bold">$</span>
                    <span className="text-white/70"> ssh</span>
                    <span className="text-[#00e5ff]"> -p 4141</span>
                    <span className="text-[#febc2e]"> root</span>
                    <span className="text-white/50">@</span>
                    <span className="text-[#c792ea]">classwars.darknet</span>
                  </div>
                  <div>
                    <span className="text-[#28c840] font-bold">✓</span>
                    <span className="text-white/60"> tunnel established</span>
                    <span className="text-[#00e5ff]/80"> — AES-256-GCM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#febc2e]">⟩</span>
                    <span className="text-white/70">awaiting credentials</span>
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="text-[#ff5f57]"
                    >_</motion.span>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-950/40 border border-red-500/60 text-red-400 px-4 py-2.5 mb-4 flex items-start gap-3 overflow-hidden"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <div className="font-bold tracking-wider text-red-300 text-[10px]">!! ACCESS DENIED</div>
                        <div className="text-xs text-red-400/80 mt-0.5">{error}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Callsign */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[#00e5ff] text-xs font-bold">&#10095;</span>
                      <label className="text-[10px] text-[#00e5ff] tracking-[0.35em] font-bold uppercase">Callsign</label>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#000d00]/80 border border-[#00e5ff]/25 group-hover:border-[#00e5ff]/50 focus:border-[#00e5ff]/80 focus:shadow-[0_0_25px_rgba(0,229,255,0.15),inset_0_0_25px_rgba(0,229,255,0.03)] text-white placeholder-[#00e5ff]/25 outline-none transition-all duration-300 font-mono text-sm tracking-wide"
                        placeholder="team designation..."
                        required
                        autoComplete="off"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-[#39ff14] rounded-full" />
                        <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                          className="w-1.5 h-1.5 bg-[#39ff14] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Passkey */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[#ff5f57] text-xs font-bold">&#10095;</span>
                      <label className="text-[10px] text-[#ff5f57] tracking-[0.35em] font-bold uppercase">Passkey</label>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#ff5f57]/40 group-focus-within:text-[#ff5f57]/80 transition-colors duration-300" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#000d00]/80 border border-[#ff5f57]/20 group-hover:border-[#ff5f57]/45 focus:border-[#ff5f57]/70 focus:shadow-[0_0_25px_rgba(255,95,87,0.12),inset_0_0_25px_rgba(255,95,87,0.03)] text-white placeholder-[#ff5f57]/25 outline-none transition-all duration-300 font-mono text-sm tracking-[0.3em]"
                        placeholder="••••••••"
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full relative bg-[#001200] border border-[#39ff14]/50 text-[#39ff14] py-3.5 hover:bg-[#39ff14] hover:text-black hover:border-[#39ff14] disabled:opacity-25 disabled:cursor-not-allowed font-black text-xs tracking-[0.4em] uppercase overflow-hidden group transition-all duration-200 shadow-[0_0_30px_rgba(57,255,20,0.1)] hover:shadow-[0_0_60px_rgba(57,255,20,0.4)] mt-1"
                  >
                    <span className="absolute inset-0 bg-[#39ff14] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <><Cpu className="w-3.5 h-3.5 animate-spin" />AUTHENTICATING...</>
                      ) : (
                        <><Terminal className="w-3.5 h-3.5" />INITIATE ACCESS</>
                      )}
                    </span>
                  </motion.button>
                </form>

                {/* Admin / status footer */}
                <div className="mt-5 pt-4 border-t border-[#39ff14]/[0.07] flex items-center justify-between">
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="text-[#c792ea]/50 hover:text-[#c792ea] text-[9px] tracking-[0.2em] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-[#c792ea]/60 group-hover:text-[#c792ea]">$</span> admin --elevate
                  </button>
                  <div className="flex items-center gap-2 text-[8px] text-[#00e5ff]/50 tracking-widest">
                    <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
                    ENCRYPTED
                  </div>
                </div>
              </div>

              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(57,255,20,0.006)_2px,rgba(57,255,20,0.006)_4px)]" />
            </div>
          </motion.div>
        </div>

        {/* ═══ CREDITS — CENTERED PROMINENT BLOCK ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full max-w-lg mx-auto px-4 pb-6 pt-2"
        >
          <div className="relative border border-white/[0.08] bg-[#050a05]/90 backdrop-blur-xl overflow-hidden">
            {/* Top accent gradient bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-[#fbbf24] via-[#00e5ff] to-[#ff5f57]" />

            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[9px] text-white/25 tracking-wider ml-2 font-mono">credits@classwars:~/core-team</span>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Architects — GOLD */}
              <div>
                <div className="text-[8px] tracking-[0.5em] mb-2 text-center" style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.4)' }}>━━ ARCHITECTS ━━</div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-1">
                  <span className="font-black text-sm tracking-[0.2em]" style={{ color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,1), 0 0 35px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2)' }}>◈ ZOHAIR SHAMSI</span>
                  <span className="font-black text-sm tracking-[0.2em]" style={{ color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,1), 0 0 35px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2)' }}>◈ UMER KHAN</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Lead Dev — CYAN */}
              <div>
                <div className="text-[8px] tracking-[0.5em] mb-2 text-center" style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>━━ LEAD DEVELOPER ━━</div>
                <div className="text-center">
                  <span className="font-black text-[15px] tracking-[0.25em]" style={{ color: '#00e5ff', textShadow: '0 0 15px rgba(0,229,255,1), 0 0 35px rgba(0,229,255,0.5), 0 0 60px rgba(0,229,255,0.2)' }}># TAHA ANWAR</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Developers — RED */}
              <div>
                <div className="text-[8px] tracking-[0.5em] mb-2 text-center" style={{ color: '#ff5f57', textShadow: '0 0 10px rgba(255,95,87,0.4)' }}>━━ DEVELOPERS ━━</div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-1">
                  <span className="font-bold text-xs tracking-[0.15em]" style={{ color: '#ff5f57', textShadow: '0 0 12px rgba(255,95,87,0.8), 0 0 30px rgba(255,95,87,0.3)' }}>▸ RUMESA IQBAL</span>
                  <span className="font-bold text-xs tracking-[0.15em]" style={{ color: '#ff5f57', textShadow: '0 0 12px rgba(255,95,87,0.8), 0 0 30px rgba(255,95,87,0.3)' }}>▸ MASHAL ZAHRA</span>
                </div>
              </div>
            </div>

            {/* Bottom accent gradient bar */}
            <div className="h-[1px] w-full bg-gradient-to-r from-[#ff5f57] via-[#00e5ff] to-[#fbbf24] opacity-50" />
          </div>
        </motion.div>

        {/* Thin status bar */}
        <div className="bg-[#050a05]/95 border-t border-white/[0.05] px-5 py-1.5 flex items-center justify-center gap-4 text-[8px] text-[#39ff14]/30 tracking-widest shrink-0">
          <span>TF-141</span>
          <span className="text-white/10">│</span>
          <span>AES-256</span>
          <span className="text-white/10">│</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-[#39ff14] rounded-full animate-pulse" />ONLINE</span>
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.49, 0.5, 1] }}
            className="text-[#39ff14]/40 ml-1"
          >█</motion.span>
        </div>
      </div>
    </div>
  );
}
