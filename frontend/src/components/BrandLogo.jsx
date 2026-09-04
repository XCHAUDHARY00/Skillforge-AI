import React from 'react';
import { motion } from 'framer-motion';

// Counter ensures unique SVG gradient/filter IDs per mounted instance,
// preventing collisions when multiple LogoMark components render simultaneously.
let _logoMarkCounter = 0;

/**
 * LogoMark — A bold "SF" shield/hexagon mark with layered gradients and a
 * lightning-bolt accent. Designed to look sharp at any size.
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
      animate={animated ? {
        filter: [
          'drop-shadow(0 0 5px rgba(99,102,241,0.55))',
          'drop-shadow(0 0 12px rgba(168,85,247,0.75))',
          'drop-shadow(0 0 5px rgba(99,102,241,0.55))',
        ],
      } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main background gradient — indigo → violet → fuchsia */}
          <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#4338ca" />
            <stop offset="45%"  stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>

          {/* Shine overlay on top half */}
          <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Lightning bolt gradient */}
          <linearGradient id={`${id}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Soft inner glow filter */}
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Background shape: squircle (rounded square) ── */}
        <rect x="1" y="1" width="42" height="42" rx="13"
          fill={`url(#${id}-bg)`} />

        {/* ── Glass shine on top half ── */}
        <rect x="1" y="1" width="42" height="22" rx="13"
          fill={`url(#${id}-shine)`} />

        {/* ── Subtle border ring ── */}
        <rect x="1" y="1" width="42" height="42" rx="13"
          stroke="white" strokeOpacity="0.18" strokeWidth="1.2" fill="none" />

        {/* ── Inner dark panel (card feel) ── */}
        <rect x="6" y="6" width="32" height="32" rx="9"
          fill="black" fillOpacity="0.22" />

        {/* ── "S" letter — bold, clean, centred ── */}
        {/* Top bar of S */}
        <path
          d="M27.5 15H19.5C17.6 15 16 16.6 16 18.5C16 20.4 17.6 22 19.5 22H24.5C26.4 22 28 23.6 28 25.5C28 27.4 26.4 29 24.5 29H16.5"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#${id}-glow)`}
          strokeOpacity="0.95"
        />

        {/* ── Lightning bolt accent (top-right corner) ── */}
        <path
          d="M31 10L28.5 15.5H31.5L29 20"
          stroke={`url(#${id}-bolt)`}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
};

/**
 * WordMark — "Skill" bold white + "Forge" vivid gradient + a sleek "AI" pill.
 * size: 'sm' | 'md' | 'lg' | 'xl'
 */
export const WordMark = ({ size = 'md', showAI = true, className = '' }) => {
  const sizes = {
    sm: { skill: 'text-sm',   forge: 'text-sm',   tag: 'text-[8px]  px-1.5 py-0.5', gap: 'gap-0' },
    md: { skill: 'text-base', forge: 'text-base', tag: 'text-[9px]  px-1.5 py-0.5', gap: 'gap-0' },
    lg: { skill: 'text-xl',  forge: 'text-xl',  tag: 'text-[11px] px-2   py-0.5', gap: 'gap-0.5' },
    xl: { skill: 'text-2xl',  forge: 'text-2xl',  tag: 'text-xs    px-2   py-0.5', gap: 'gap-1' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={`flex items-center ${s.gap} whitespace-nowrap ${className}`}
      style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }}
    >
      {/* "Skill" — solid, primary text colour */}
      <span className={s.skill} style={{ color: 'var(--text-primary)' }}>
        Skill
      </span>

      {/* "Forge" — vivid indigo→violet→fuchsia gradient */}
      <span
        className={s.forge}
        style={{
          background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #e879f9 80%, #f0abfc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Forge
      </span>

      {/* "AI" pill — glassy indigo */}
      {showAI && (
        <span
          className={`${s.tag} rounded-full font-bold tracking-widest leading-none ml-1.5`}
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
            border: '1px solid rgba(167,139,250,0.45)',
            color: '#c4b5fd',
            letterSpacing: '0.08em',
          }}
        >
          AI
        </span>
      )}
    </span>
  );
};

/**
 * BrandLogo — LogoMark + WordMark together, the full brand unit.
 * iconSize: number
 * wordSize: 'sm' | 'md' | 'lg' | 'xl'
 * collapsed: hide wordmark (sidebar collapsed state)
 */
const BrandLogo = ({ iconSize = 32, wordSize = 'md', collapsed = false, animated = true, className = '' }) => (
  <div className={`flex items-center gap-2.5 overflow-hidden ${className}`}>
    <LogoMark size={iconSize} animated={animated} />
    {!collapsed && <WordMark size={wordSize} />}
  </div>
);

export default BrandLogo;
