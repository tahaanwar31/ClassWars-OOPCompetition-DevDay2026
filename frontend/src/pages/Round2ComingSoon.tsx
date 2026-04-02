import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import TacticalBackground from '../components/TacticalBackground';

export default function Round2ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020502] text-[#39ff14] font-mono flex items-center justify-center p-4 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 max-w-3xl w-full bg-black/80 backdrop-blur-md p-8 md:p-12 text-center relative border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]"
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-500 opacity-70"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-500 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-500 opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-500 opacity-70"></div>

        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Construction className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-widest text-yellow-500 text-glow-yellow">
          ROUND 2
        </h1>
        
        <div className="flex items-center justify-center gap-3 mb-8">
          <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-white">
            UNDER CONSTRUCTION
          </h2>
          <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
        </div>

        <div className="bg-[#111100]/80 border border-yellow-500/50 p-6 mb-8 text-left">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-yellow-500 mb-2 tracking-wider">CLASSIFIED INTEL</h3>
              <p className="text-white/90 leading-relaxed">
                Round 2 is currently in development. This phase will introduce new challenges and gameplay mechanics.
                Intelligence suggests this round will involve direct confrontation with Makarov's armored division.
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-2 text-sm text-[#39ff14]/80">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 animate-pulse"></span>
              <span>STATUS: Development Phase</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 animate-pulse"></span>
              <span>ESTIMATED DEPLOYMENT: TBD</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 animate-pulse"></span>
              <span>CLEARANCE REQUIRED: Complete Round 1</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/competition')}
            className="w-full md:w-auto px-8 py-4 bg-[#001a00] border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all duration-300 uppercase tracking-widest font-bold flex items-center justify-center gap-3 mx-auto shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.8)]"
          >
            <ArrowLeft className="w-5 h-5" />
            RETURN TO COMPETITION LOBBY
          </button>
          
          <p className="text-xs text-[#39ff14]/60 tracking-widest">
            STAY TUNED FOR UPDATES // BRAVO SIX OUT
          </p>
        </div>
      </motion.div>
    </div>
  );
}
