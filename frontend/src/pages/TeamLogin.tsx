import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Terminal, Lock, AlertCircle, Cpu, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import TacticalBackground from '../components/TacticalBackground';

const BOOT_LINES = [
  '> SYS INIT... BIOS v4.1.1',
  '> CPU CORE [████████] 100%',
  '> MEMORY MAP [OK]',
  '> NETWORK ADAPTOR [ONLINE]',
  '> ENCRYPTION MODULE [ACTIVE]',
  '> AWAITING OPERATIVE CREDENTIALS...',
];

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
      const t = setTimeout(() => setBootIdx(i => i + 1), 200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setBootDone(true), 300);
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
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex flex-col items-center justify-center p-4 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />

      {/* Multiple ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#39ff14]/[0.03] blur-[150px]" />
        <div className="absolute top-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#39ff14]/[0.02] blur-[100px] breathe-glow" />
        <div className="absolute bottom-[-5%] left-[10%] w-[350px] h-[350px] rounded-full bg-[#39ff14]/[0.015] blur-[90px] breathe-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 w-full max-w-md relative"
      >
        {/* Outer glow frame */}
        <div className="absolute -inset-px bg-gradient-to-b from-[#39ff14]/30 via-[#39ff14]/10 to-[#39ff14]/5 rounded-sm pointer-events-none" />

        <div className="bg-[#020a02]/95 backdrop-blur-xl border border-[#39ff14]/40 shadow-[0_0_80px_rgba(57,255,20,0.12)] relative overflow-hidden box-glow shimmer">
          {/* Animated top scan line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent opacity-80 border-scan" />

          {/* HUD corner brackets */}
          {[['top-0 left-0 border-t-2 border-l-2',''], ['top-0 right-0 border-t-2 border-r-2',''], ['bottom-0 left-0 border-b-2 border-l-2',''], ['bottom-0 right-0 border-b-2 border-r-2','']].map(([pos], i) => (
            <div key={i} className={`absolute ${pos} w-6 h-6 border-[#39ff14]`} />
          ))}

          {/* Boot sequence header */}
          <div className="bg-[#001500]/80 border-b border-[#39ff14]/30 px-5 py-3 text-[10px] text-[#39ff14]/60 tracking-widest h-[38px] overflow-hidden">
            <AnimatePresence mode="wait">
              {!bootDone ? (
                <motion.span
                  key={bootIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="block"
                >
                  {BOOT_LINES[bootIdx - 1] || BOOT_LINES[0]}
                  <span className="inline-block w-2 h-3 bg-[#39ff14]/70 ml-1 animate-pulse align-middle" />
                </motion.span>
              ) : (
                <motion.span
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#39ff14] font-bold"
                >
                  [✓] TERMINAL READY — SECURE CHANNEL ACTIVE
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 md:p-10">
            {/* Logo / Branding */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ 
                  filter: ['drop-shadow(0 0 8px rgba(57,255,20,0.6))', 'drop-shadow(0 0 22px rgba(57,255,20,1))', 'drop-shadow(0 0 8px rgba(57,255,20,0.6))'],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'mirror' }}
                className="inline-block mb-4"
              >
                <Shield className="w-16 h-16 text-[#39ff14] mx-auto" />
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-black tracking-[0.12em] text-glow glitch-text mb-1">
                CLASS WARS
              </h1>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#39ff14]/50" />
                <span className="text-[10px] tracking-[0.4em] text-[#39ff14]/60 flex items-center gap-2">
                  <Wifi className="w-3 h-3" /> OPERATIVE AUTHENTICATION
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#39ff14]/50" />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-950/60 border border-red-500/80 text-red-400 px-4 py-3 mb-6 flex items-start gap-3 box-glow-red"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <div className="font-bold tracking-wider mb-0.5 text-red-300">ACCESS DENIED</div>
                    <div className="text-xs text-red-400/90">{error}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Team Name */}
              <div>
                <label className="block text-[10px] font-bold text-[#39ff14]/70 mb-2 tracking-[0.3em]">
                  ◈ OPERATIVE CALLSIGN
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-black/50 border border-[#39ff14]/30 group-hover:border-[#39ff14]/60 focus:border-[#39ff14] focus:shadow-[0_0_20px_rgba(57,255,20,0.25)] text-white placeholder-[#39ff14]/25 outline-none transition-all duration-200 font-mono text-sm tracking-wide"
                    placeholder="Enter team designation..."
                    required
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-[#39ff14]/40 rounded-full animate-pulse" style={{animationDelay:'0.3s'}} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-[#39ff14]/70 mb-2 tracking-[0.3em]">
                  ◈ SECURITY CLEARANCE CODE
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#39ff14]/40 group-focus-within:text-[#39ff14]/80 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-black/50 border border-[#39ff14]/30 group-hover:border-[#39ff14]/60 focus:border-[#39ff14] focus:shadow-[0_0_20px_rgba(57,255,20,0.25)] text-white placeholder-[#39ff14]/25 outline-none transition-all duration-200 font-mono text-sm tracking-widest"
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
                whileTap={{ scale: 0.98 }}
                className="w-full relative bg-[#001a00] border-2 border-[#39ff14] text-[#39ff14] py-4 hover:bg-[#39ff14] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm tracking-[0.35em] uppercase overflow-hidden group transition-colors duration-150 shadow-[0_0_25px_rgba(57,255,20,0.25)] hover:shadow-[0_0_40px_rgba(57,255,20,0.7)] mt-2"
              >
                {/* Sweep overlay */}
                <span className="absolute inset-0 bg-[#39ff14] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200 ease-out z-0" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4 group-hover:animate-pulse" />
                      [ INITIATE MISSION ]
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Admin link */}
            <div className="mt-7 pt-5 border-t border-[#39ff14]/15 text-center">
              <button
                onClick={() => navigate('/admin/login')}
                className="text-[#39ff14]/40 hover:text-[#39ff14]/80 text-[11px] tracking-[0.25em] transition-colors flex items-center justify-center gap-2 mx-auto group"
              >
                <Lock className="w-3 h-3" />
                COMMAND CENTER ACCESS
              </button>
            </div>

            {/* Status */}
            <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-[#39ff14]/30 tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse" />
                SECURE
              </span>
              <span>|</span>
              <span>256-BIT ENCRYPTED</span>
              <span>|</span>
              <span>TF-141 NETWORK</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ DESIGNER CREDITS — Hacker Terminal ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="z-10 mt-8 w-full max-w-md"
      >
        <div className="relative border border-[#39ff14]/20 bg-[#010301]/90 backdrop-blur-md overflow-hidden">
          {/* Terminal title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#39ff14]/[0.06] border-b border-[#39ff14]/15">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <div className="w-2 h-2 rounded-full bg-[#39ff14]/60" />
            </div>
            <span className="text-[9px] text-[#39ff14]/40 tracking-wider ml-1">architects@classwars:~/sys</span>
          </div>

          <div className="p-4 space-y-2">
            {/* Command prompt */}
            <div className="text-[10px] text-[#39ff14]/50">
              <span className="text-[#39ff14]/70">root@classwars</span><span className="text-white/30">:</span><span className="text-blue-400/60">~</span><span className="text-white/30">$</span> <span className="text-[#39ff14]/40">cat /etc/sys.architects</span>
            </div>

            {/* Separator */}
            <div className="text-[9px] text-[#39ff14]/20 tracking-widest">╔══════════════════════════════════════╗</div>

            {/* Head */}
            <motion.div
              className="flex items-center gap-3 px-2"
              animate={{ textShadow: ['0 0 4px rgba(57,255,20,0.3)', '0 0 12px rgba(57,255,20,0.6)', '0 0 4px rgba(57,255,20,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-[9px] text-[#39ff14]/40 font-mono">[001]</span>
              <Terminal className="w-3.5 h-3.5 text-[#39ff14]/70" />
              <span className="text-[#39ff14] font-bold text-sm tracking-[0.2em] text-glow">TAHA ANWAR</span>
              <span className="ml-auto text-[8px] tracking-[0.3em] text-[#39ff14]/50 border border-[#39ff14]/20 px-2 py-0.5">ROOT</span>
            </motion.div>

            {/* Divider */}
            <div className="text-[9px] text-[#39ff14]/15 tracking-widest">╠──────────────────────────────────────╣</div>

            {/* Co-heads */}
            <motion.div
              className="flex items-center gap-3 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <span className="text-[9px] text-[#39ff14]/30 font-mono">[002]</span>
              <Shield className="w-3 h-3 text-[#39ff14]/50" />
              <span className="text-[#39ff14]/80 font-bold text-xs tracking-[0.15em]">MASHAL ZAHRA</span>
              <span className="ml-auto text-[7px] tracking-[0.3em] text-[#39ff14]/35 border border-[#39ff14]/15 px-2 py-0.5">SUDO</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <span className="text-[9px] text-[#39ff14]/30 font-mono">[003]</span>
              <Shield className="w-3 h-3 text-[#39ff14]/50" />
              <span className="text-[#39ff14]/80 font-bold text-xs tracking-[0.15em]">RUMESA IQBAL</span>
              <span className="ml-auto text-[7px] tracking-[0.3em] text-[#39ff14]/35 border border-[#39ff14]/15 px-2 py-0.5">SUDO</span>
            </motion.div>

            <div className="text-[9px] text-[#39ff14]/20 tracking-widest">╚══════════════════════════════════════╝</div>

            {/* Footer prompt with blinking cursor */}
            <div className="text-[10px] text-[#39ff14]/30 flex items-center gap-1">
              <span>root@classwars:~$</span>
              <motion.span
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.49, 0.5, 1] }}
                className="text-[#39ff14]/70"
              >█</motion.span>
            </div>
          </div>

          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(57,255,20,0.015)_2px,rgba(57,255,20,0.015)_4px)]" />
        </div>
      </motion.div>
    </div>
  );
}
