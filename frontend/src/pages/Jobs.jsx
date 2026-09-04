import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, Check, AlertTriangle, Search, ChevronRight, ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import { mockJobs } from '../data/mockData';

// Animated SVG score ring
const ScoreRing = ({ match }) => {
  const color = match >= 80 ? '#10b981' : match >= 65 ? '#f59e0b' : '#9898b0';
  const glow = match >= 80 ? 'rgba(16,185,129,0.4)' : match >= 65 ? 'rgba(245,158,11,0.4)' : 'rgba(152,152,176,0.2)';
  const circumference = 2 * Math.PI * 40;
  const dash = (match / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-primary)" strokeWidth="6" />
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color, textShadow: `0 0 12px ${glow}` }}>{match}%</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>match</p>
        </div>
      </div>
    </div>
  );
};

// Small match badge for job card
const MatchBadge = ({ match }) => {
  const color = match >= 80 ? '#10b981' : match >= 65 ? '#f59e0b' : '#9898b0';
  const bg = match >= 80 ? 'rgba(16,185,129,0.1)' : match >= 65 ? 'rgba(245,158,11,0.1)' : 'rgba(152,152,176,0.08)';
  const border = match >= 80 ? 'rgba(16,185,129,0.3)' : match >= 65 ? 'rgba(245,158,11,0.3)' : 'rgba(152,152,176,0.2)';
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: bg, border: `1px solid ${border}`, boxShadow: `0 0 10px ${bg}` }}>
      <span className="text-lg font-bold" style={{ color }}>{match}%</span>
      <span className="text-[9px]" style={{ color }}>match</span>
    </div>
  );
};

const Jobs = () => {
  const [query, setQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = mockJobs.filter(job =>
    !query || job.title.toLowerCase().includes(query.toLowerCase()) || job.company.toLowerCase().includes(query.toLowerCase())
  );

  if (selectedJob) {
    return (
      <AppLayout title="Job Analysis" subtitle={`${selectedJob.company} · ${selectedJob.title}`}>
        <div className="p-6 max-w-3xl mx-auto">
          <button onClick={() => setSelectedJob(null)}
            className="flex items-center gap-2 text-xs mb-6 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={14} /> Back to Jobs
          </button>

          {/* Match score hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-5 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            {/* Glow bg */}
            <div className="absolute inset-0 opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08), transparent 60%)' }} />
            <div className="relative flex items-center gap-6">
              <ScoreRing match={selectedJob.match} />
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedJob.title}</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedJob.company} · {selectedJob.location}</p>
                <p className="text-sm font-semibold text-emerald-400 mt-1">{selectedJob.salary}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Overall Job Match Score</p>
              </div>
            </div>
          </motion.div>

          {/* Skills grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Skills You Have
              </p>
              <div className="space-y-2">
                {selectedJob.skillsMatch.map(skill => (
                  <motion.div key={skill} className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 8px rgba(16,185,129,0.3)' }}>
                      <Check size={10} className="text-emerald-400" />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{skill}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Missing Skills
              </p>
              <div className="space-y-2">
                {selectedJob.skillsGap.map(skill => (
                  <motion.div key={skill} className="flex items-center gap-2"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 8px rgba(245,158,11,0.2)' }}>
                      <AlertTriangle size={10} className="text-amber-400" />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{skill}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* AI Recommendation */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 text-indigo-400">
              <Sparkles size={12} /> AI Recommendation
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You're <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedJob.match}%</span> ready for this role. Focus on{' '}
              <span className="text-indigo-400 font-medium">{selectedJob.skillsGap.join(' and ')}</span>{' '}
              — achievable in 4–6 weeks of focused learning. Apply now, you're very close!
            </p>
          </motion.div>

          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01, boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <TrendingUp size={15} /> Create Preparation Plan
          </motion.button>
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Find Your Best-Match Roles" subtitle="AI matches you to jobs based on your actual skills">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by role or company..."
            className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm transition-all focus:outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--bg-card-border)'}
          />
        </div>

        {/* Job cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((job, i) => (
              <motion.div key={job.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedJob(job)}
                className="rounded-2xl p-5 cursor-pointer group transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bg-card-border-hover)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-card-border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1"><Briefcase size={10} />{job.company}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{job.posted}</span>
                        </div>
                      </div>
                      <MatchBadge match={job.match} />
                    </div>

                    <p className="text-xs font-semibold text-emerald-400 mb-2">{job.salary}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {job.skillsMatch.map(s => (
                        <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
                          <Check size={8} />{s}
                        </span>
                      ))}
                      {job.skillsGap.map(s => (
                        <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
                          <AlertTriangle size={8} />{s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={16} className="transition-colors flex-shrink-0 mt-2"
                    style={{ color: 'var(--text-muted)' }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default Jobs;
