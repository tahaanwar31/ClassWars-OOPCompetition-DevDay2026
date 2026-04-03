import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Shield, Lock, Construction, ChevronRight, Target, Zap, AlertCircle, Power, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TacticalBackground from '../components/TacticalBackground';
import api from '../api/axios';

interface RoundInfo {
  roundKey: string;
  roundName: string;
  status: string;
  underConstruction: boolean;
  startTime: string | null;
  endTime: string | null;
  playWindowStart: string | null;
  playWindowEnd: string | null;
  rules: string[];
  enabled: boolean;
  canEnter: boolean;
  availabilityLabel: string;
}

interface CompetitionData {
  generalRules: string[];
  rounds: RoundInfo[];
}

export default function CompetitionLobby() {
  const navigate = useNavigate();
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const storedTeamName = localStorage.getItem('teamName');
    if (!storedTeamName) {
      navigate('/');
      return;
    }
    setTeamName(storedTeamName);
    fetchCompetitionData();
  }, [navigate]);

  const fetchCompetitionData = async () => {
    try {
      const response = await api.get('/competition/rounds');
      setCompetitionData(response.data);
    } catch (error) {
      console.error('Failed to fetch competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRound = (roundKey: string) => {
    if (roundKey === 'round1') {
      navigate('/competition/round1');
    } else if (roundKey === 'round2') {
      navigate('/competition/round2');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (round: RoundInfo) => {
    if (round.underConstruction) {
      return (
        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/60 text-yellow-400 text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5">
          <Construction className="w-3 h-3" />
          CONSTRUCTION
        </span>
      );
    }
    if (round.canEnter) {
      return (
        <span className="px-3 py-1 bg-[#39ff14]/10 border border-[#39ff14]/60 text-[#39ff14] text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14]" />
          {round.availabilityLabel.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-white/5 border border-white/15 text-white/30 text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        {round.availabilityLabel.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center scanlines">
        <TacticalBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <Crosshair className="w-12 h-12 text-[#39ff14] animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-[#39ff14] tracking-[0.5em] text-sm animate-pulse">LOADING COMPETITION DATA...</p>
          <div className="w-48 h-0.5 bg-[#39ff14]/10 rounded overflow-hidden">
            <motion.div
              className="h-full bg-[#39ff14]"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!competitionData) {
    return (
      <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono flex items-center justify-center scanlines">
        <TacticalBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-400 tracking-[0.3em] text-sm">COMMS FAILURE — DATA UNAVAILABLE</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010301] text-[#39ff14] font-mono p-4 md:p-8 scanlines crt-flicker relative overflow-hidden">
      {/* Ambient bloom */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#39ff14]/[0.03] blur-[150px] breathe-glow" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#39ff14]/[0.02] blur-[120px] breathe-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] rounded-full bg-[#39ff14]/[0.015] blur-[100px] breathe-glow" style={{ animationDelay: '2.5s' }} />
      </div>

      <TacticalBackground />

      <div className="z-10 relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  filter: ['drop-shadow(0 0 6px #39ff14)', 'drop-shadow(0 0 22px #39ff14)', 'drop-shadow(0 0 6px #39ff14)'],
                  y: [0, -4, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Trophy className="w-10 h-10 text-[#39ff14]" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-[0.15em] text-glow glitch-text">CLASS WARS</h1>
                <p className="text-[10px] md:text-xs text-[#39ff14]/50 tracking-[0.4em] mt-1">// WARFARE SELECTION TERMINAL //</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[#39ff14]/40 tracking-[0.3em] mb-1">OPERATIVE ID</p>
              <p className="text-base md:text-xl font-black text-white tracking-widest">{teamName}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
                <span className="text-[9px] text-[#39ff14]/50 tracking-[0.3em]">AUTHENTICATED</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#39ff14]/60 to-transparent" />
          <div className="h-px bg-gradient-to-r from-transparent via-[#39ff14]/20 to-transparent mt-0.5" />
        </motion.div>

        {/* Rounds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
          {competitionData.rounds.map((round, index) => (
            <motion.div
              key={round.roundKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              className={`relative overflow-hidden border p-6 md:p-8 ${
                round.canEnter && !round.underConstruction
                  ? 'bg-[#010a01] border-[#39ff14]/40 box-glow border-scan shimmer'
                  : 'bg-[#010301] border-[#39ff14]/15'
              } transition-all duration-300 hover:border-[#39ff14]/50`}
            >
              {/* HUD corners */}
              <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${round.canEnter && !round.underConstruction ? 'border-[#39ff14]/70' : 'border-[#39ff14]/25'}`} />
              <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${round.canEnter && !round.underConstruction ? 'border-[#39ff14]/70' : 'border-[#39ff14]/25'}`} />
              <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${round.canEnter && !round.underConstruction ? 'border-[#39ff14]/70' : 'border-[#39ff14]/25'}`} />
              <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${round.canEnter && !round.underConstruction ? 'border-[#39ff14]/70' : 'border-[#39ff14]/25'}`} />

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Target className={`w-6 h-6 ${round.canEnter && !round.underConstruction ? 'text-[#39ff14]' : 'text-[#39ff14]/30'}`} />
                  <h2 className={`text-xl md:text-2xl font-black tracking-widest ${round.canEnter && !round.underConstruction ? 'text-white text-shadow' : 'text-white/40'}`}>
                    {round.roundName}
                  </h2>
                </div>
                {getStatusBadge(round)}
              </div>

              {/* Divider */}
              <div className={`h-px mb-5 ${round.canEnter && !round.underConstruction ? 'bg-[#39ff14]/20' : 'bg-white/5'}`} />

              {/* Timing Info */}
              {(round.playWindowStart || round.playWindowEnd || round.startTime || round.endTime) && (
                <div className="mb-5 space-y-2">
                  {round.playWindowStart && (
                    <div className="flex items-center gap-2 text-[#39ff14]/60 text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="tracking-[0.15em]">OPENS: {formatDate(round.playWindowStart)}</span>
                    </div>
                  )}
                  {round.playWindowEnd && (
                    <div className="flex items-center gap-2 text-[#39ff14]/60 text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="tracking-[0.15em]">CLOSES: {formatDate(round.playWindowEnd)}</span>
                    </div>
                  )}
                  {round.startTime && !round.playWindowStart && (
                    <div className="flex items-center gap-2 text-[#39ff14]/60 text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="tracking-[0.15em]">START: {formatDate(round.startTime)}</span>
                    </div>
                  )}
                  {round.endTime && !round.playWindowEnd && (
                    <div className="flex items-center gap-2 text-[#39ff14]/60 text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="tracking-[0.15em]">END: {formatDate(round.endTime)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rules */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-3.5 h-3.5 text-[#39ff14]/50" />
                  <h3 className="text-[10px] text-[#39ff14]/40 tracking-[0.3em]">MISSION PARAMETERS</h3>
                </div>
                <ul className="space-y-1.5">
                  {round.rules.map((rule, idx) => (
                    <li key={idx} className={`text-xs flex items-start gap-2 ${round.canEnter && !round.underConstruction ? 'text-white/70' : 'text-white/25'}`}>
                      <span className={`mt-0.5 shrink-0 ${round.canEnter && !round.underConstruction ? 'text-[#39ff14]/60' : 'text-[#39ff14]/20'}`}>▸</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                {round.canEnter && !round.underConstruction ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleEnterRound(round.roundKey)}
                    className="w-full px-6 py-3.5 bg-[#001800] border border-[#39ff14]/60 text-[#39ff14] hover:bg-[#39ff14] hover:text-black hover:border-[#39ff14] transition-all duration-150 uppercase tracking-[0.25em] font-black text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(57,255,20,0.15)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-[#39ff14] -translate-x-full group-hover:translate-x-0 transition-transform duration-150 ease-out" />
                    <Zap className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">ENTER COMPETITION</span>
                    <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ) : (
                  <button
                    disabled
                    className="w-full px-6 py-3.5 bg-black/30 border border-white/8 text-white/20 cursor-not-allowed uppercase tracking-[0.2em] font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {round.underConstruction ? (
                      <>
                        <Construction className="w-4 h-4" />
                        COMING SOON
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {round.availabilityLabel.toUpperCase()}
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* General Rules */}
        {competitionData.generalRules && competitionData.generalRules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#010301] border border-[#39ff14]/20 p-6 md:p-8 relative overflow-hidden mb-12"
          >
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#39ff14]/40" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#39ff14]/40" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#39ff14]/40" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#39ff14]/40" />

            <div className="flex items-center gap-3 mb-5">
              <AlertCircle className="w-5 h-5 text-[#39ff14]/70" />
              <h2 className="text-base font-black tracking-[0.3em] text-white/80">GENERAL RULES OF ENGAGEMENT</h2>
            </div>

            <div className="h-px bg-[#39ff14]/15 mb-5" />

            <div className="space-y-2.5">
              {competitionData.generalRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-white/60">
                  <span className="text-[#39ff14]/50 font-bold shrink-0 mt-0.5">{String(idx + 1).padStart(2, '0')}.</span>
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer — logout + credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-6 pb-6"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              localStorage.removeItem('teamName');
              localStorage.removeItem('teamData');
              navigate('/');
            }}
            className="px-6 py-2.5 border border-red-500/50 text-red-500/70 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 uppercase tracking-[0.25em] font-bold text-xs flex items-center gap-2 group relative overflow-hidden"
          >
            <Power className="w-3.5 h-3.5" />
            TERMINATE SESSION
          </motion.button>

          {/* Designer Credits — Hacker Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <div className="relative border border-[#39ff14]/15 bg-[#010301]/80 backdrop-blur-sm overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#39ff14]/[0.05] border-b border-[#39ff14]/10">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14]/50" />
                </div>
                <span className="text-[8px] text-[#39ff14]/30 tracking-wider">sys.architects</span>
              </div>

              <div className="p-3 space-y-1.5">
                <div className="text-[9px] text-[#39ff14]/40">
                  <span className="text-[#39ff14]/60">$</span> cat /etc/architects <span className="text-[#39ff14]/20">--format=classified</span>
                </div>

                <div className="flex items-center justify-center gap-6 flex-wrap py-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-[#39ff14]/60" />
                    <span className="text-[#39ff14] font-bold text-xs tracking-[0.15em] text-glow">TAHA ANWAR</span>
                    <span className="text-[7px] tracking-[0.2em] text-[#39ff14]/40 border border-[#39ff14]/15 px-1.5 py-px">ROOT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-2.5 h-2.5 text-[#39ff14]/40" />
                    <span className="text-[#39ff14]/70 font-bold text-xs tracking-[0.12em]">MASHAL ZAHRA</span>
                    <span className="text-[6px] tracking-[0.2em] text-[#39ff14]/25 border border-[#39ff14]/10 px-1 py-px">SUDO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-2.5 h-2.5 text-[#39ff14]/40" />
                    <span className="text-[#39ff14]/70 font-bold text-xs tracking-[0.12em]">RUMESA IQBAL</span>
                    <span className="text-[6px] tracking-[0.2em] text-[#39ff14]/25 border border-[#39ff14]/10 px-1 py-px">SUDO</span>
                  </div>
                </div>
              </div>

              {/* Scanline */}
              <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(57,255,20,0.01)_2px,rgba(57,255,20,0.01)_4px)]" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
