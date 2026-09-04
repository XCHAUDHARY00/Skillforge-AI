import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Floating particle canvas — rendered with requestAnimationFrame for performance
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create sparse, slow-drifting particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.4 + 0.08,
      hue: [260, 240, 280, 200][Math.floor(Math.random() * 4)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
        ctx.fill();
      });

      // Draw subtle connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(260, 70%, 65%, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -49, opacity: 0.6 }}
    />
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
      {/* Deep perspective layer — farthest back */}
      <motion.div
        animate={{
          x: ['-15%', '15%', '-15%'],
          y: ['-15%', '15%', '-15%'],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-5%] left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(99,50,255,0.18) 0%, rgba(99,50,255,0.05) 60%, transparent 100%)' }}
      />

      {/* Mid layer violet */}
      <motion.div
        animate={{
          x: ['18%', '-18%', '18%'],
          y: ['10%', '-10%', '10%'],
          rotate: [0, 120, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[30%] right-[5%] w-[45vw] h-[45vw] max-w-[560px] max-h-[560px] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0.06) 60%, transparent 100%)' }}
      />

      {/* Teal accent — bottom */}
      <motion.div
        animate={{
          x: ['0%', '25%', '0%'],
          y: ['20%', '-10%', '20%'],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-10%] left-[25%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.03) 60%, transparent 100%)' }}
      />

      {/* Hot accent — fuchsia, center-right */}
      <motion.div
        animate={{
          x: ['-12%', '12%', '-12%'],
          y: ['8%', '-8%', '8%'],
          scale: [1, 1.4, 1],
          rotate: [0, -60, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] right-[35%] w-[28vw] h-[28vw] max-w-[360px] max-h-[360px] rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, rgba(236,72,153,0.03) 60%, transparent 100%)' }}
      />

      {/* Deep blue bottom-right */}
      <motion.div
        animate={{
          x: ['-20%', '5%', '-20%'],
          y: ['-5%', '-20%', '-5%'],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[15%] right-[15%] w-[35vw] h-[35vw] max-w-[420px] max-h-[420px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.03) 60%, transparent 100%)' }}
      />

      {/* Small hot-spot top-left */}
      <motion.div
        animate={{
          x: ['0%', '30%', '0%'],
          y: ['0%', '25%', '0%'],
          scale: [1, 1.6, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[5%] left-[5%] w-[18vw] h-[18vw] max-w-[240px] max-h-[240px] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)' }}
      />

      {/* Particle field */}
      <ParticleCanvas />
    </div>
  );
};

export default AnimatedBackground;
