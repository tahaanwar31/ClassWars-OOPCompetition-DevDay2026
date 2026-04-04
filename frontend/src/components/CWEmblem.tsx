import React from 'react';
import { motion } from 'motion/react';

interface CWEmblemProps {
  size?: number;
  className?: string;
}

/**
 * CLASS WARS hacker emblem — a circuit-crosshair with CW monogram.
 * Used consistently on TeamLogin and CompetitionLobby.
 */
const CWEmblem: React.FC<CWEmblemProps> = ({ size = 80, className = '' }) => {
  const s = size;
  const c = s / 2;      // center
  const r = s * 0.38;   // outer ring radius
  const ri = s * 0.24;  // inner ring radius

  return (
    <motion.svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={{
        filter: [
          'drop-shadow(0 0 6px rgba(57,255,20,0.6)) drop-shadow(0 0 16px rgba(57,255,20,0.3))',
          'drop-shadow(0 0 18px rgba(57,255,20,1))  drop-shadow(0 0 40px rgba(57,255,20,0.5))',
          'drop-shadow(0 0 6px rgba(57,255,20,0.6)) drop-shadow(0 0 16px rgba(57,255,20,0.3))',
        ],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* ── Outer ring ── */}
      <circle cx={c} cy={c} r={r} stroke="#39ff14" strokeWidth="1.2" strokeOpacity="0.35" />

      {/* ── Inner ring ── */}
      <circle cx={c} cy={c} r={ri} stroke="#39ff14" strokeWidth="1" strokeOpacity="0.55" />

      {/* ── Dashed rotation ring (mid) ── */}
      <motion.circle
        cx={c} cy={c} r={s * 0.31}
        stroke="#39ff14"
        strokeWidth="0.7"
        strokeOpacity="0.3"
        strokeDasharray="4 5"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: `${c}px ${c}px` }}
      />

      {/* ── Cross-hair lines ── */}
      {/* Top */}
      <line x1={c} y1={c - r - s * 0.08} x2={c} y2={c - ri} stroke="#39ff14" strokeWidth="1.2" strokeOpacity="0.8" />
      {/* Bottom */}
      <line x1={c} y1={c + ri} x2={c} y2={c + r + s * 0.08} stroke="#39ff14" strokeWidth="1.2" strokeOpacity="0.8" />
      {/* Left */}
      <line x1={c - r - s * 0.08} y1={c} x2={c - ri} y2={c} stroke="#39ff14" strokeWidth="1.2" strokeOpacity="0.8" />
      {/* Right */}
      <line x1={c + ri} y1={c} x2={c + r + s * 0.08} y2={c} stroke="#39ff14" strokeWidth="1.2" strokeOpacity="0.8" />

      {/* ── Crosshair tick marks on outer ring ── */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = c + Math.cos(rad) * (r - s * 0.03);
        const y1 = c + Math.sin(rad) * (r - s * 0.03);
        const x2 = c + Math.cos(rad) * (r + s * 0.03);
        const y2 = c + Math.sin(rad) * (r + s * 0.03);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#39ff14" strokeWidth="2" strokeOpacity="0.9" />;
      })}

      {/* ── 45° corner circuit notches ── */}
      {[45, 135, 225, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const bx = c + Math.cos(rad) * r;
        const by = c + Math.sin(rad) * r;
        const nx = c + Math.cos(rad) * (r + s * 0.07);
        const ny = c + Math.sin(rad) * (r + s * 0.07);
        return (
          <g key={deg}>
            <line x1={bx} y1={by} x2={nx} y2={ny} stroke="#39ff14" strokeWidth="0.8" strokeOpacity="0.5" />
            <circle cx={nx} cy={ny} r="1.2" fill="#39ff14" fillOpacity="0.6" />
          </g>
        );
      })}

      {/* ── CW monogram ── */}
      <text
        x={c}
        y={c + s * 0.09}
        textAnchor="middle"
        fontFamily="'Courier New', monospace"
        fontSize={s * 0.26}
        fontWeight="900"
        fill="#39ff14"
        fillOpacity="0.95"
        letterSpacing="-1"
      >
        CW
      </text>

      {/* ── Sub-label ── */}
      <text
        x={c}
        y={c + s * 0.22}
        textAnchor="middle"
        fontFamily="'Courier New', monospace"
        fontSize={s * 0.07}
        fill="#39ff14"
        fillOpacity="0.45"
        letterSpacing="3"
      >
        SYS
      </text>

      {/* ── Blinking center dot ── */}
      <motion.circle
        cx={c} cy={c - s * 0.095}
        r="2"
        fill="#39ff14"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    </motion.svg>
  );
};

export default CWEmblem;
