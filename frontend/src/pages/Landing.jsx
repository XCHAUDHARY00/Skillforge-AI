import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Sparkles, ChevronRight, ArrowRight, Zap, Map, Briefcase,
  Mic, GitBranch, Brain, TrendingUp, Target, Star, Check, FileText,
  FolderGit2, BookOpen, Sun, Moon, Shield, Award, Play, Terminal, Swords
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Tilt3DCard from '../components/Tilt3DCard';
import BrandLogo, { WordMark } from '../components/BrandLogo';

// Animated Counter Hook
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dna');
  const [demoChat, setDemoChat] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', message: "Hi! I'm your SkillForge AI Coach. Ask me how to accelerate your software engineering career!" }
  ]);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  const stat1 = useCounter(94, 1500, statsInView);
  const stat2 = useCounter(38, 1500, statsInView);
  const stat3 = useCounter(12, 1500, statsInView);

  const handleDemoSend = (e) => {
    e.preventDefault();
    if (!demoChat.trim()) return;
    const msg = demoChat.trim();
    setChatLog(prev => [...prev, { sender: 'user', message: msg }]);
    setDemoChat('');
    setTimeout(() => {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          message: `To level up in ${msg.toLowerCase().includes('backend') ? 'Backend Engineering' : 'Software Development'}, focus on System Design, Docker, and Redis caching. You can run a full AI Skill Gap analysis once you sign up!`
        }
      ]);
    }, 600);
  };

  const featureTabs = [
    { id: 'dna', label: 'Career DNA', icon: Brain, color: '#6366f1' },
    { id: 'gaps', label: 'Skill Gap Analysis', icon: Zap, color: '#8b5cf6' },
    { id: 'github', label: 'GitHub Intelligence', icon: GitBranch, color: '#f59e0b' },
    { id: 'resume', label: 'Resume ATS Engine', icon: FileText, color: '#ec4899' },
    { id: 'interview', label: 'Mock Interview AI', icon: Mic, color: '#f97316' },
    { id: 'projects', label: 'AI Projects', icon: FolderGit2, color: '#10b981' },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map, color: '#3b82f6' },
    { id: 'battle', label: '1v1 Battle Arena', icon: Swords, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'transparent', color: 'var(--text-primary)' }}>

      {/* Grid background overlay */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none z-0" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors"
        style={{ background: 'var(--header-bg)', borderColor: 'var(--bg-card-border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandLogo iconSize={34} wordSize="md" animated={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#showcase" className="hover:text-indigo-400 transition-colors">Live Interactive Demo</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-indigo-400 transition-colors">Impact</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              id="theme-toggle-landing"
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all hover:scale-105"
              style={{ borderColor: 'var(--bg-card-border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link to="/login" className="text-xs font-semibold px-3 py-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}>
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/register"
                className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', boxShadow: '0 2px 12px rgba(99,102,241,0.35)' }}
              >
                Get Started Free
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* HERO SECTION — 3D Layout */}
      <section className="relative pt-14 pb-20 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Pill badge with shimmer border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 shimmer-border"
            >
              <motion.div
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={13} className="text-indigo-400" />
              </motion.div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Next-Gen AI Career OS</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-[1.08]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Forge Your
              <br />
              <span className="gradient-text text-neon-indigo">Engineering</span>
              <br />
              Career with AI
            </h1>

            <p className="text-base max-w-lg mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Analyze code evidence, map skill gaps, score resumes for ATS, and run real-time AI mock interviews — all in one unified platform.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <motion.button
                onClick={() => navigate('/register')}
                id="hero-get-started-btn"
                whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(99,102,241,0.55), 0 0 80px rgba(99,102,241,0.2)' }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden px-8 py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #14b8a6)' }}
              >
                {/* Scan line effect on button */}
                <span className="scan-line" />
                Launch Your AI Career DNA <ArrowRight size={16} />
              </motion.button>

              <motion.a
                href="#showcase"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-7 py-4 border rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 glass-deep"
                style={{ color: 'var(--text-primary)', borderColor: 'rgba(99,102,241,0.25)' }}
              >
                <Play size={14} className="text-indigo-400" /> Explore Demo
              </motion.a>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { emoji: '🧬', text: 'Career DNA', color: '#6366f1' },
                { emoji: '⚡', text: 'Skill Gaps', color: '#8b5cf6' },
                { emoji: '📄', text: 'ATS Scorer', color: '#ec4899' },
                { emoji: '🎤', text: 'Mock Interviews', color: '#f97316' },
              ].map((badge, i) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium"
                  style={{ background: `${badge.color}10`, borderColor: `${badge.color}30`, color: badge.color }}
                >
                  <span>{badge.emoji}</span>
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D floating dashboard preview cards */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
            style={{ perspective: '1200px' }}
          >
            {/* Main hero card — 3D tilt */}
            <Tilt3DCard
              className="rounded-3xl p-6 depth-shadow-colored shimmer-border"
              style={{ background: 'rgba(17,17,28,0.85)', backdropFilter: 'blur(20px)' }}
              maxTilt={10}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-teal-400 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Career Readiness</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>AI Analysis Complete</p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">Live</span>
                </motion.div>
              </div>

              {/* Score ring + label */}
              <div className="flex items-center gap-6 mb-5">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg width="80" height="80" className="-rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="6" />
                    <motion.circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke="url(#heroGrad)" strokeWidth="6"
                      strokeDasharray={201}
                      initial={{ strokeDashoffset: 201 }}
                      animate={{ strokeDashoffset: 201 * 0.18 }}
                      transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' }}
                    />
                    <defs>
                      <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>82</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label: 'Python / Django', val: 85, color: '#6366f1' },
                    { label: 'Docker & Cloud', val: 38, color: '#f97316' },
                    { label: 'System Design', val: 55, color: '#8b5cf6' },
                  ].map((s, i) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                        <span style={{ color: s.color }}>{s.val}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.val}%` }}
                          transition={{ duration: 1.2, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}99)`, boxShadow: `0 0 6px ${s.color}60` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI next move chip */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl holo-surface">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles size={14} className="text-indigo-400" />
                </motion.div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  Next move: <span className="text-indigo-400 font-bold">Learn Docker</span> — #1 gap for Backend roles
                </p>
              </div>
            </Tilt3DCard>

            {/* Floating mini-cards — positioned absolutely */}
            {/* Top-right: XP badge */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring' }}
              className="absolute -top-5 -right-6 px-4 py-2.5 rounded-2xl glass-deep border flex items-center gap-2 depth-shadow"
              style={{ borderColor: 'rgba(99,102,241,0.3)' }}
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg"
              >✨</motion.span>
              <div>
                <p className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest">Career XP</p>
                <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>2,840</p>
              </div>
            </motion.div>

            {/* Bottom-left: Streak badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.1, type: 'spring' }}
              className="absolute -bottom-4 -left-6 px-4 py-2.5 rounded-2xl glass-deep border flex items-center gap-2 depth-shadow"
              style={{ borderColor: 'rgba(245,158,11,0.3)' }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg"
              >🔥</motion.span>
              <div>
                <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-widest">Streak</p>
                <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>14 Days</p>
              </div>
            </motion.div>

            {/* Orbiting ring decoration */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
              <div className="w-[110%] h-[110%] rounded-full border border-indigo-500/8 spin-slow" />
              <div className="absolute w-[90%] h-[90%] rounded-full border border-violet-500/6 spin-reverse" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* INTERACTIVE FEATURE SHOWCASE */}
      <section id="showcase" className="py-16 px-6 max-w-7xl mx-auto z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Interactive Feature Explorer
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>Click any feature tab below to preview live AI capabilities without signing up</p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {featureTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isActive ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-md scale-105' : ''
                }`}
                style={!isActive ? { borderColor: 'var(--bg-card-border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' } : {}}
              >
                <Icon size={14} style={{ color: isActive ? '#6366f1' : tab.color }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Feature Display Window */}
        <div className="rounded-3xl p-6 sm:p-8 border min-h-[380px] relative overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}>
          <AnimatePresence mode="wait">

            {/* 1. CAREER DNA */}
            {activeTab === 'dna' && (
              <motion.div key="dna" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">AI Skill Mapping</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">Career DNA Engine</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    SkillForge AI constructs your multidimensional skill matrix by analyzing your target roles, known languages, and domain experience.
                  </p>
                  <div className="space-y-2 mb-4">
                    {['Backend Systems: 85% match', 'Distributed Systems & Databases: High', 'DevOps & Containers: Target Gap'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check size={14} className="text-emerald-400" />
                        <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-semibold">
                    Generate My Career DNA
                  </button>
                </div>
                <div className="bg-[#09090d] border border-indigo-500/20 rounded-2xl p-5 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-indigo-400">TARGET ROLE: BACKEND DEVELOPER</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">86% MATCH</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { skill: 'Python / Django', val: 85 },
                      { skill: 'SQL & PostgreSQL', val: 80 },
                      { skill: 'Docker & Microservices', val: 35 },
                      { skill: 'System Design', val: 40 },
                    ].map(s => (
                      <div key={s.skill}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-300">{s.skill}</span>
                          <span className="font-semibold text-indigo-400">{s.val}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SKILL GAPS */}
            {activeTab === 'gaps' && (
              <motion.div key="gaps" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Gap Identification</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">AI Skill Gap Diagnostics</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Instantly pinpoint missing skills between your current knowledge and market job postings. Prioritize high-impact learning.
                  </p>
                  <div className="space-y-2 mb-4">
                    {['Docker: Priority HIGH (Required in 87% jobs)', 'Redis: Priority HIGH (In-memory caching)', 'AWS EC2: Priority MEDIUM'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Zap size={14} className="text-amber-400" />
                        <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold">
                    Run Skill Gap Analysis
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Docker Containers', current: 3, req: 8, priority: 'High' },
                    { name: 'Redis Pub/Sub', current: 1, req: 6, priority: 'High' },
                    { name: 'AWS Cloud Infra', current: 2, req: 7, priority: 'Medium' },
                  ].map(gap => (
                    <div key={gap.name} className="p-4 rounded-xl border flex items-center justify-between"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{gap.name}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Level: {gap.current} / {gap.req}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gap.priority === 'High' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                        {gap.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3. GITHUB INTELLIGENCE */}
            {activeTab === 'github' && (
              <motion.div key="github" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Proof of Work</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">GitHub Evidence Intelligence</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Connect GitHub to turn public code repositories, commit streaks, and stars into validated career evidence that recruiters trust.
                  </p>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold">
                    Connect GitHub
                  </button>
                </div>
                <div className="p-5 rounded-2xl border bg-[#09090d] text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <GitBranch className="text-amber-400" size={24} />
                    <div>
                      <p className="text-xs font-bold">@octocat</p>
                      <p className="text-[10px] text-gray-400">32 Public Repositories · 142 Stars</p>
                    </div>
                    <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-lg">
                      84/100 Quality
                    </span>
                  </div>
                  <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-[11px] space-y-1">
                    <p className="text-emerald-400 font-semibold">✓ Active Commit Streak: 7 Days 🔥</p>
                    <p className="text-gray-300">Top Language: Python (54%), JavaScript (32%)</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. RESUME ATS ENGINE */}
            {activeTab === 'resume' && (
              <motion.div key="resume" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-pink-400 font-semibold uppercase tracking-wider">ATS Optimization</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">Resume PDF Intelligence</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Upload your PDF resume to extract raw text, compute ATS readiness scores, and get actionable AI bullet-point improvements.
                  </p>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-pink-500 text-white rounded-xl text-xs font-semibold">
                    Score My Resume
                  </button>
                </div>
                <div className="p-5 rounded-2xl border bg-[#09090d] text-white flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold">ATS Score: <span className="text-pink-400">78%</span></p>
                    <p className="text-[11px] text-gray-400">✓ Technical Skills Section Present</p>
                    <p className="text-[11px] text-gray-400">✓ Quantified Impact Metrics Found</p>
                    <p className="text-[11px] text-amber-400">⚠ Missing Docker & Cloud Keywords</p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-pink-500/40 flex items-center justify-center text-xl font-bold text-pink-400">
                    78
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. MOCK INTERVIEW AI */}
            {activeTab === 'interview' && (
              <motion.div key="interview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Real-Time Simulator</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">Interactive AI Mock Interview</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Practice technical & behavioral questions in a live voice/text chat environment. Receive instant scoring on technical depth and communication clarity.
                  </p>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-semibold">
                    Start Mock Interview
                  </button>
                </div>
                <div className="p-4 rounded-2xl border bg-[#09090d] text-white space-y-3 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-orange-300">
                    AI Interiewer: "How would you design a rate limiter middleware for a high-traffic REST API?"
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-950 border border-indigo-900 text-indigo-200">
                    Candidate: "I would use Redis with a Token Bucket algorithm to track requests per client IP."
                  </div>
                  <p className="text-emerald-400 font-sans text-xs">✓ Feedback: Excellent technical choice! Score: 92/100</p>
                </div>
              </motion.div>
            )}

            {/* 6. PROJECTS */}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Zero API Cost</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">Skill-Targeted AI Projects</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Build production-ready projects derived dynamically from your personal skill gaps. Every project includes milestones and tech stack guides.
                  </p>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">
                    Explore Projects
                  </button>
                </div>
                <div className="p-5 rounded-2xl border bg-[#09090d] text-white space-y-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">HIGH IMPACT</span>
                  <h4 className="text-sm font-bold">Containerized Microservices API</h4>
                  <p className="text-xs text-gray-400">Build Django + React + PostgreSQL inside Docker Compose containers.</p>
                  <div className="flex gap-2 text-[10px] text-indigo-300 pt-2">
                    <span className="bg-gray-800 px-2 py-0.5 rounded">Docker</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded">Django</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded">PostgreSQL</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. ROADMAP */}
            {activeTab === 'roadmap' && (
              <motion.div key="roadmap" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Structured Path</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">Personalized Learning Roadmap</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Get a weekly step-by-step milestone plan tailored to your target job role. Track tasks from course study to building real software.
                  </p>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
                    Build My Roadmap
                  </button>
                </div>
                <div className="p-5 rounded-2xl border bg-[#09090d] text-white space-y-3">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <p className="text-xs font-bold text-blue-400">WEEK 1: Docker Fundamentals</p>
                    <p className="text-[11px] text-gray-300">Complete Docker Crash Course & Containerize API</p>
                  </div>
                  <div className="border-l-2 border-gray-700 pl-3">
                    <p className="text-xs font-bold text-gray-400">WEEK 2: Redis Caching & Queues</p>
                    <p className="text-[11px] text-gray-500">Implement Redis pub/sub for real-time messaging</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. 1V1 BATTLE ARENA */}
            {activeTab === 'battle' && (
              <motion.div key="battle" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Multiplayer Gamification</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">Real-Time 1v1 Battles</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Challenge your friends to live coding races or fast-paced CS quizzes. Watch their progress in real-time, win matches, and climb the global leaderboard.
                  </p>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold">
                    Create Match Room
                  </button>
                </div>
                <div className="p-4 rounded-2xl border bg-[#09090d] text-white space-y-4">
                  <div className="flex justify-between items-center px-2">
                     <div className="flex items-center gap-2">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=6366f1" className="w-8 h-8 rounded-full" />
                       <span className="text-xs font-bold">You (Lvl 42)</span>
                     </div>
                     <span className="text-xl font-black italic text-red-500 font-mono">VS</span>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-bold">Rival (Lvl 45)</span>
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ef4444" className="w-8 h-8 rounded-full" />
                     </div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-red-500 w-full animate-pulse" />
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Room Code: X7B9K2</p>
                    <p className="text-sm font-bold text-indigo-400 mt-1">Python: Two Sum Problem</p>
                    <div className="flex justify-between text-[10px] mt-2 font-mono text-gray-500">
                      <span>02:14</span>
                      <span className="text-emerald-400">Rival Submitting...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ALL FEATURES GRID */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Complete Feature Suite</span>
          <h2 className="text-2xl sm:text-4xl font-bold mt-1 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Everything You Need to Get Hired Faster
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Designed specifically for developers, engineers, and computer science students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Brain, title: 'Career DNA Analysis', desc: 'AI-driven multidimensional evaluation of your engineering strengths and target job roles.', color: '#6366f1' },
            { icon: Zap, title: 'Skill Gap Diagnostics', desc: 'Compare known skills against real job market requirements to prioritize what to learn next.', color: '#8b5cf6' },
            { icon: GitBranch, title: 'GitHub Intelligence', desc: 'Turn commit streaks, public repos, and star metrics into validated proof of work.', color: '#f59e0b' },
            { icon: FileText, title: 'Resume ATS Engine', desc: 'PDF text extraction and Gemini ATS scoring with actionable bullet-point tips.', color: '#ec4899' },
            { icon: Swords, title: '1v1 Battle Arena', desc: 'Compete in live, real-time multiplayer coding & quiz matches to earn XP.', color: '#ef4444' },
            { icon: Mic, title: 'Mock Interview AI', desc: 'Interactive mock interview simulator with instant scoring on clarity and technical accuracy.', color: '#f97316' },
            { icon: FolderGit2, title: 'Derived AI Projects', desc: 'Custom project specifications derived from your skill gaps with zero extra API costs.', color: '#10b981' },
            { icon: Map, title: 'Dynamic Roadmap', desc: 'Weekly milestone timeline connecting courses, builds, and proof tasks in one flow.', color: '#3b82f6' },
            { icon: Shield, title: 'Light / Dark Mode', desc: 'Complete Token-based design system with seamless 1-click theme switching.', color: '#14b8a6' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Tilt3DCard
                  className="p-5 rounded-2xl border h-full"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}
                  maxTilt={9}
                >
                  {/* Top gradient line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${f.color}50, transparent)` }} />
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon size={18} style={{ color: f.color, filter: `drop-shadow(0 0 6px ${f.color}80)` }} />
                  </motion.div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </Tilt3DCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* LIVE AI COACH PREVIEW */}
      <section className="py-16 px-6 max-w-4xl mx-auto z-10">
        <Tilt3DCard
          className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shimmer-border"
          style={{ background: 'rgba(17,17,28,0.7)', backdropFilter: 'blur(20px)' }}
          maxTilt={5}
          glare={true}
        >
          {/* Scan line overlay */}
          <span className="scan-line" />
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white"
              animate={{ boxShadow: ['0 0 8px rgba(99,102,241,0.4)', '0 0 20px rgba(99,102,241,0.7)', '0 0 8px rgba(99,102,241,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Terminal size={18} />
            </motion.div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Try SkillForge AI Assistant Live</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Test a career question right now</p>
            </div>
          </div>

          <div className="h-44 overflow-y-auto space-y-3 p-3 rounded-xl mb-4 border text-xs"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}>
            {chatLog.map((c, i) => (
              <div key={i} className={`flex ${c.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2.5 rounded-xl ${
                  c.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
                }`}>
                  {c.message}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleDemoSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask e.g. How do I transition to Senior Backend Developer?"
              value={demoChat}
              onChange={e => setDemoChat(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-indigo-500/60"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--bg-card-border)', color: 'var(--text-primary)' }}
            />
            <button type="submit" className="px-5 py-2.5 bg-indigo-500 text-white font-semibold rounded-xl text-xs hover:bg-indigo-600 transition-all">
              Send
            </button>
          </form>
        </Tilt3DCard>
      </section>

      {/* PROOF STATS */}
      <section ref={statsRef} className="py-14 border-y z-10" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)' }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { value: stat1, suffix: '%', label: 'Resume ATS Pass Rate', color: 'gradient-text' },
            { value: stat2, suffix: '%', label: 'Faster Skill Gap Closure', color: 'gradient-text-blue' },
            { value: stat3, suffix: 'k+', label: 'AI Mock Interviews Conducted', color: 'text-teal-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}{stat.suffix}</p>
              <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center z-10 relative overflow-hidden">
        {/* CTA background accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6 bg-violet-500/10 border-violet-500/20">
              <Sparkles size={12} className="text-violet-400" />
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Free to Get Started</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Build Your
              <br />
              <span className="gradient-text">Engineering Legacy?</span>
            </h2>
            <p className="text-sm mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Join thousands of software engineers using SkillForge AI to analyze skills, optimize resumes, and master technical interviews.
            </p>
            <motion.button
              onClick={() => navigate('/register')}
              id="cta-get-started-btn"
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 bg-gradient-to-r from-indigo-500 via-violet-600 to-teal-500 text-white rounded-2xl text-sm font-bold shadow-2xl transition-all"
            >
              Get Started Free — No Credit Card Required
            </motion.button>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Trusted by developers at top companies worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t text-center" style={{ borderColor: 'var(--bg-card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 SkillForge AI — Next-Gen AI Career Operating System for Developers.
        </p>
        <div className="flex items-center justify-center gap-6 mt-3">
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
            <a key={link} href="#" className="text-xs transition-colors hover:text-indigo-400" style={{ color: 'var(--text-muted)' }}>
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Landing;
