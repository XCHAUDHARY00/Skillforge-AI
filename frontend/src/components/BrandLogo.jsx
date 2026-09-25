import React from 'react';
import { motion } from 'framer-motion';

// Counter ensures unique SVG gradient/filter IDs per mounted instance
let _logoMarkCounter = 0;

/**
 * LogoMark — "Book & Birds" logo
 */
export const LogoMark = ({ size = 32, animated = true, className = '' }) => {
  const idRef = React.useRef(null);
  if (!idRef.current) {
    _logoMarkCounter += 1;
    idRef.current = `sf-logo-${_logoMarkCounter}`;
  }
  const id = idRef.current;

  return (
    <motion.div
      className={`flex-shrink-0 relative ${className}`}
      style={{ width: size, height: size }}
      whileHover={animated ? { scale: 1.05 } : {}}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${id}-bookGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" /> {/* Deep slate/navy */}
            <stop offset="100%" stopColor="#1e3a8a" /> {/* Royal blue */}
          </linearGradient>
          <linearGradient id={`${id}-birdGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" /> {/* Sky blue */}
            <stop offset="100%" stopColor="#38bdf8" /> {/* Light blue */}
          </linearGradient>
        </defs>

        {/* ── Left Page ── */}
        <path 
          d="M 23 38 C 14 31 5 33 2 37 V 13 C 5 9 14 7 23 14 Z" 
          fill={`url(#${id}-bookGrad)`} 
        />
        {/* ── Right Page ── */}
        <path 
          d="M 25 38 C 34 31 43 33 46 37 V 13 C 43 9 34 7 25 14 Z" 
          fill={`url(#${id}-bookGrad)`} 
        />
        
        {/* ── Center binding line ── */}
        <path d="M 24 14 V 37" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />

        {/* ── Bird 1 (Bottom Left) ── */}
        <path 
          d="M 20 23 C 24 18 29 20 31 25 C 28 22 23 23 20 28 C 18 23 14 22 11 25 C 14 20 17 18 20 23 Z" 
          fill={`url(#${id}-birdGrad)`} 
        />
        {/* ── Bird 2 (Middle) ── */}
        <path 
          d="M 32 15 C 35 11 39 13 41 17 C 39 15 35 15 32 19 C 30 15 27 14 24 17 C 27 13 29 11 32 15 Z" 
          fill={`url(#${id}-birdGrad)`} 
        />
        {/* ── Bird 3 (Top Right) ── */}
        <path 
          d="M 40 6 C 43 3 46 5 48 8 C 46 6 43 6 40 9 C 38 6 35 5 33 8 C 35 5 37 3 40 6 Z" 
          fill={`url(#${id}-birdGrad)`} 
        />
      </svg>
    </motion.div>
  );
};

/**
 * WordMark — "SKILLFORGE" with subtitle "ELEVATING EDUCATION & SKILLS"
 */
export const WordMark = ({ size = 'md', showAI = false, className = '' }) => {
  const sizes = {
    sm: { main: 'text-xs', sub: 'text-[6px]', gap: 'gap-0' },
    md: { main: 'text-base', sub: 'text-[8px]', gap: 'gap-0' },
    lg: { main: 'text-xl', sub: 'text-[10px]', gap: 'gap-0' },
    xl: { main: 'text-2xl', sub: 'text-[12px]', gap: 'gap-0' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col justify-center ${s.gap} ${className}`}>
      {/* Main Brand Name */}
      <span
        className={`${s.main} leading-none tracking-wide`}
        style={{ 
          fontFamily: 'Space Grotesk, sans-serif', 
          fontWeight: 800,
          color: 'var(--text-primary)'
        }}
      >
        SKILLFORGE
      </span>
      {/* Subtitle */}
      <span
        className={`${s.sub} font-bold tracking-widest leading-none mt-[2px] uppercase opacity-70`}
        style={{ 
          fontFamily: 'Inter, sans-serif',
          color: 'var(--text-secondary)'
        }}
      >
        Elevating Education & Skills
      </span>
    </div>
  );
};

/**
 * BrandLogo — LogoMark + WordMark together
 */
const BrandLogo = ({ iconSize = 32, wordSize = 'md', collapsed = false, animated = true, className = '' }) => (
  <div className={`flex items-center gap-3 overflow-hidden ${className}`}>
    <LogoMark size={iconSize} animated={animated} />
    {!collapsed && <WordMark size={wordSize} />}
  </div>
);

export default BrandLogo;
