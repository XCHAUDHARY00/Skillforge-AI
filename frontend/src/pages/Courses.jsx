import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Clock, Zap, Star, ChevronRight, Sparkles } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import { mockCourses } from '../data/mockData';

const LEVEL_CONFIG = {
  Beginner:     { color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)',  glow: 'rgba(16,185,129,0.15)' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  glow: 'rgba(245,158,11,0.15)' },
  Advanced:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   glow: 'rgba(239,68,68,0.15)' },
};

const LevelBadge = ({ level }) => {
  const c = LEVEL_CONFIG[level] || LEVEL_CONFIG.Beginner;
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, boxShadow: `0 0 8px ${c.glow}` }}>
      {level}
    </span>
  );
};

// Match % ring (SVG)
const MatchRing = ({ match }) => {
  const color = match >= 80 ? '#10b981' : match >= 65 ? '#f59e0b' : '#8b5cf6';
  const pct = (match / 100) * 100;
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="-rotate-90 w-full h-full">
        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg-primary)" strokeWidth="3" />
        <motion.circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${pct * 0.88} 88`} strokeLinecap="round"
          initial={{ strokeDasharray: '0 88' }}
          animate={{ strokeDasharray: `${pct * 0.88} 88` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color }}>{match}%</span>
      </div>
    </div>
  );
};

const CourseCard = ({ course, index }) => (
  <Tilt3DCard maxTilt={8} scale={1.03} className="rounded-2xl h-full cursor-pointer"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group p-5 flex flex-col h-full">

      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {course.badge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                {course.badge}
              </span>
            )}
            <LevelBadge level={course.level} />
          </div>
          <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
        </div>
        <div className="ml-3">
          <MatchRing match={course.match} />
          <span className="text-[8px] block text-center mt-0.5" style={{ color: 'var(--text-muted)' }}>match</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><Star size={9} className="text-amber-400" />{course.provider}</span>
        <span className="flex items-center gap-1"><Zap size={9} />{course.skill}</span>
        <span className="flex items-center gap-1"><Clock size={9} />{course.duration}</span>
      </div>

      {/* AI reason */}
      <div className="rounded-xl p-3 mb-4 flex-1"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <p className="text-[10px] font-semibold text-indigo-400 mb-1 flex items-center gap-1"><Sparkles size={9} /> Why AI Recommends This</p>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{course.why}</p>
      </div>

      {/* CTA */}
      <a href={course.url} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.2)' }}>
        Start Course <ExternalLink size={12} />
      </a>
    </motion.div>
  </Tilt3DCard>
);

const Courses = () => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'Beginner', label: 'Beginner' },
    { id: 'Intermediate', label: 'Intermediate' },
    { id: 'Advanced', label: 'Advanced' },
  ];

  const types = [
    { id: 'all', label: 'All Types' },
    { id: 'certificate', label: '🎓 Certificates' },
    { id: 'youtube', label: '📺 YouTube Free' },
    { id: 'interactive', label: '💻 Interactive' },
  ];

  const filtered = mockCourses.filter(c => {
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchLevel && matchType;
  });

  const filterBtnStyle = (active) => active
    ? { background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc', boxShadow: '0 0 10px rgba(99,102,241,0.15)' }
    : { border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' };

  return (
    <AppLayout title="Learning Hub" subtitle="Courses selected for your career goals">
      <div className="p-6 max-w-7xl mx-auto">

        {/* AI banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3 mb-6 relative overflow-hidden"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'rgba(99,102,241,0.2)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}>
            <BookOpen size={16} className="text-indigo-400" />
          </div>
          <div className="relative">
            <p className="text-xs font-semibold text-indigo-300">AI-Curated Learning Path</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Ordered by impact on your career readiness score.</p>
          </div>
          <div className="ml-auto relative flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {types.map(f => (
              <button key={f.id} onClick={() => setTypeFilter(f.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={filterBtnStyle(typeFilter === f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="w-px hidden sm:block" style={{ background: 'var(--bg-card-border)' }} />
          <div className="flex gap-2 flex-wrap">
            {levels.map(f => (
              <button key={f.id} onClick={() => setLevelFilter(f.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={filterBtnStyle(levelFilter === f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length > 0
            ? filtered.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)
            : <div className="col-span-full py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                <p className="text-sm font-medium">No courses found for these filters.</p>
              </div>
          }
        </div>
      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default Courses;
