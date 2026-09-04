import React from 'react';
import { motion } from 'framer-motion';

/**
 * SkillForge SVG Logo Mark — a colourful, multi-stop gradient hexagonal forge mark.
 * size: pixel size of the icon container
 * animated: whether to pulse the inner glow
 */
// Counter ensures unique SVG gradient/filter IDs per mounted instance,
// preventing collisions when multiple LogoMark components render simultaneously.
let _logoMarkCounter = 0;

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
          'drop-shadow(0 0 4px rgba(99,102,241,0.5))',
          'drop-shadow(0 0 10px rgba(139,92,246,0.7))',
          'drop-shadow(0 0 4px rgba(99,102,241,0.5))',
        ],
      } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background fill gradient */}
          <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#4f46e5" />
            <stop offset="35%"  stopColor="#7c3aed" />
            <stop offset="65%"  stopColor="#ec4899" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Inner glow filter */}
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Icon stroke gradient */}
          <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.80" />
          </linearGradient>
        </defs>

        {/* Hexagon / rounded rect background */}
        <rect
          x="1" y="1" width="38" height="38"
          rx="11"
          fill={`url(#${id}-bg)`}
        />

        {/* Subtle inner highlight */}
        <rect
          x="1" y="1" width="38" height="19"
          rx="11"
          fill="white" fillOpacity="0.08"
        />

        {/* Border */}
        <rect
          x="1" y="1" width="38" height="38"
          rx="11"
          stroke="white" strokeOpacity="0.15" strokeWidth="1"
          fill="none"
        />

        {/* Forge "S" mark — stylised lightning bolt S */}
        {/* Top arc of S */}
        <path
          d="M27 13H18C15.8 13 14 14.8 14 17C14 19.2 15.8 21 18 21H22C24.2 21 26 22.8 26 25C26 27.2 24.2 29 22 29H13"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter={`url(#${id}-glow)`}
        />

        {/* Top horizontal cap */}
        <path
          d="M14.5 13H26.5"
          stroke="white" strokeOpacity="0.5"
          strokeWidth="1.5" strokeLinecap="round"
        />

        {/* Bottom horizontal cap */}
        <path
          d="M13.5 29H25.5"
          stroke="white" strokeOpacity="0.5"
          strokeWidth="1.5" strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
};

/**
 * WordMark — "Skill" in white + "Forge" in rich multi-colour gradient + "AI" tag
 * size: 'sm' | 'md' | 'lg'
 */
export const WordMark = ({ size = 'md', showAI = true, className = '' }) => {
  const sizes = {
    sm: { text: 'text-sm',  tag: 'text-[8px] px-1 py-0.5', gap: 'gap-0.5' },
    md: { text: 'text-base', tag: 'text-[9px] px-1.5 py-0.5', gap: 'gap-1' },
    lg: { text: 'text-xl',  tag: 'text-xs px-2 py-0.5', gap: 'gap-1.5' },
    xl: { text: 'text-2xl', tag: 'text-xs px-2 py-0.5', gap: 'gap-1.5' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span className={`flex items-baseline ${s.gap} whitespace-nowrap ${className}`}
      style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' }}>
      {/* "Skill" — plain text-primary */}
      <span style={{ color: 'var(--text-primary)' }} className={s.text}>Skill</span>
      {/* "Forge" — rich multi-stop gradient */}
      <span
        className={s.text}
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 30%, #ec4899 60%, #f97316 85%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Forge
      </span>
      {/* "AI" pill */}
      {showAI && (
        <span
          className={`${s.tag} rounded-md font-bold tracking-wide leading-none`}
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
            border: '1px solid rgba(99,102,241,0.35)',
            color: '#a78bfa',
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
