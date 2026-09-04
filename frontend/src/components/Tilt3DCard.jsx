import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Tilt3DCard — wraps children with a realistic 3D tilt that follows the mouse.
 * Props:
 *   className, style   — forwarded to the wrapper div
 *   glare              — boolean, adds a moving light-reflection glare layer
 *   maxTilt            — degrees of max tilt (default 12)
 *   scale              — scale on hover (default 1.02)
 */
const Tilt3DCard = ({
  children,
  className = '',
  style = {},
  glare = true,
  maxTilt = 12,
  scale = 1.03,
  onClick,
}) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const frameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rotY = dx * maxTilt;
      const rotX = -dy * maxTilt;

      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      card.style.boxShadow = `
        ${-rotY * 1.5}px ${rotX * 1.5}px 30px rgba(0,0,0,0.35),
        0 20px 60px rgba(99,102,241,${0.08 + Math.abs(dx) * 0.1})
      `;

      if (glare && glareRef.current) {
        const glareX = (dx + 1) / 2 * 100;
        const glareY = (dy + 1) / 2 * 100;
        glareRef.current.style.background = `
          radial-gradient(
            circle at ${glareX}% ${glareY}%,
            rgba(255,255,255,0.13) 0%,
            rgba(255,255,255,0.04) 40%,
            transparent 70%
          )
        `;
        glareRef.current.style.opacity = '1';
      }
    });
  }, [maxTilt, scale, glare]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease';
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.boxShadow = '';
    setTimeout(() => {
      if (card) card.style.transition = '';
    }, 500);
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [glare]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      {/* Glare overlay */}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 transition-opacity duration-300"
          style={{ zIndex: 10 }}
        />
      )}
    </div>
  );
};

export default Tilt3DCard;
