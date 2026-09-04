import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, ArrowRight, BookOpen, FolderGit2, ChevronRight, RefreshCw, AlertCircle, Zap, Target } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import api from '../api';
import { mockSkillGaps } from '../data/mockData';

const fetchSkillGaps = async (role) => {
  try {
    const url = role ? `/skills_gap/?role=${encodeURIComponent(role)}` : `/skills_gap/`;
    const res = await api.get(url);
    if (res.data?.status !== 'success') throw new Error(res.data?.message || 'Failed to load skill gaps');
    return res.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Server error occurred');
  }
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const config = {
    high:   { label: 'High Priority', bg: 'rgba(239,68,68,0.12)',  text: '#f87171',  border: 'rgba(239,68,68,0.3)',  glow: 'rgba(239,68,68,0.2)' },
    medium: { label: 'Medium',        bg: 'rgba(245,158,11,0.12)', text: '#fbbf24',  border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.2)' },
    low:    { label: 'Low',           bg: 'rgba(59,130,246,0.12)', text: '#60a5fa',  border: 'rgba(59,130,246,0.3)', glow: 'rgba(59,130,246,0.2)' },
  };
  const c = config[priority] || config.low;
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, boxShadow: `0 0 8px ${c.glow}` }}
    >
      {c.label}
    </span>
  );
};

// ─── Skill Detail Drawer ──────────────────────────────────────────────────────
const SkillDrawer = ({ skill, onClose }) => {
  if (!skill) return null;
  const progress = (skill.current / skill.required) * 100;
  const gapColor = skill.priority === 'high' ? '#ef4444' : skill.priority === 'medium' ? '#f59e0b' : '#3b82f6';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="relative w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl"
        style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--bg-card-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glowing top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t" style={{ background: `linear-gradient(90deg, transparent, ${gapColor}, transparent)`, boxShadow: `0 0 12px ${gapColor}` }} />

        <button onClick={onClose} className="absolute top-5 right-5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>

        <div className="mt-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
              style={{ background: `${gapColor}18`, color: gapColor, border: `1px solid ${gapColor}35`, boxShadow: `0 0 20px ${gapColor}25` }}>
              {skill.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{skill.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{skill.category}</p>
              <div className="mt-2"><PriorityBadge priority={skill.priority} /></div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>Current Level</span><span>Target Level</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-primary)' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${gapColor}, ${gapColor}aa)`, boxShadow: `0 0 8px ${gapColor}60` }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{skill.current}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</span></span>
              <span className="text-lg font-bold" style={{ color: gapColor }}>{skill.required}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</span></span>
            </div>
            <p className="text-xs mt-2" style={{ color: gapColor }}>Gap: {skill.gap} levels to close</p>
          </div>

          {/* Why it matters */}
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Why It Matters</p>
            <p className="text-sm leading-relaxed rounded-xl p-3" style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
              {skill.reason}
            </p>
          </div>

          {/* Recommendations */}
          <div className="space-y-3 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recommendations</p>
            {[
              { icon: <BookOpen size={14} />, label: 'Recommended Course', value: `${skill.name} for Developers`, color: '#6366f1' },
              { icon: <FolderGit2 size={14} />, label: 'Practice Project', value: `Build something using ${skill.name}`, color: '#14b8a6' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20`, color: item.color, boxShadow: `0 0 10px ${item.color}25` }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Career impact */}
          <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.22)' }}>
            <p className="text-xs font-semibold text-emerald-400 mb-1">Expected Career Impact</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Closing this gap will improve your readiness by <strong style={{ color: 'var(--text-primary)' }}>+{skill.gap * 2} points</strong>.
            </p>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            Start Building This Skill <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl" style={{ background: 'var(--bg-card-border)' }} />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg-card-border)' }} />
        <div className="h-2.5 rounded w-1/5" style={{ background: 'var(--bg-card-border)' }} />
      </div>
      <div className="h-5 w-20 rounded-full" style={{ background: 'var(--bg-card-border)' }} />
    </div>
    <div className="h-2 rounded-full" style={{ background: 'var(--bg-card-border)' }} />
  </div>
);

const ROLES = ['Backend Developer', 'Full Stack Developer', 'AI Engineer', 'Data Scientist'];
const FILTERS = [
  { id: 'all',    label: 'All' },
  { id: 'high',   label: 'High Priority' },
  { id: 'medium', label: 'Medium' },
  { id: 'low',    label: 'Low' },
];

const SUMMARY_CONFIG = [
  { label: 'High Priority', priority: 'high',   color: '#ef4444', glow: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.2)'  },
  { label: 'Medium Priority', priority: 'medium', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
  { label: 'Low Priority',  priority: 'low',    color: '#3b82f6', glow: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const SkillGaps = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [filter, setFilter]             = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['skill-gaps', selectedRole],
    queryFn: () => fetchSkillGaps(selectedRole),
    placeholderData: (previousData) => previousData,
  });

  const gaps        = data?.skill_gaps      || [];
  const usedRole    = data?.target_role     || selectedRole || '';
  const overallScore = data?.overall_gap_score ?? null;

  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const handleForceRefresh = async () => {
    try {
      setIsForceRefreshing(true);
      // Invalidate with refetchType 'all' so react-query re-fetches with the
      // force=true param already baked into fetchSkillGaps via the queryKey.
      // Pass the force flag via a temporary override of the query function.
      await queryClient.fetchQuery({
        queryKey: ['skill-gaps', selectedRole],
        queryFn: async () => {
          const url = selectedRole
            ? `/skills_gap/?role=${encodeURIComponent(selectedRole)}&force=true`
            : `/skills_gap/?force=true`;
          const res = await api.get(url);
          if (res.data?.status !== 'success') throw new Error(res.data?.message || 'Failed to load skill gaps');
          return res.data.data;
        },
        staleTime: 0,
      });
    } catch (err) {
      console.error("Failed to force refresh", err);
    } finally { setIsForceRefreshing(false); }
  };

  const displayGaps = gaps.length > 0 ? gaps : (isError ? mockSkillGaps : []);
  const filtered = filter === 'all' ? displayGaps : displayGaps.filter(s => s.priority === filter);

  return (
    <AppLayout title="Skill Gaps" subtitle="Know exactly what separates you from your target role">
      <div className="p-6 max-w-7xl mx-auto">

        {/* Error banner */}
        {isError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300">{error?.message || 'Server unreachable. Showing demo data.'}</p>
            <button onClick={() => refetch()} className="ml-auto flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium">
              <RefreshCw size={11} /> Retry
            </button>
          </motion.div>
        )}

        {/* Role switcher + status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {ROLES.map(role => (
              <motion.button key={role} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedRole(prev => prev === role ? null : role)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={selectedRole === role
                  ? { background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc', boxShadow: '0 0 12px rgba(99,102,241,0.2)' }
                  : { border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }
                }>
                {role}
              </motion.button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            {isFetching && !isLoading && (
              <span className="flex items-center gap-1.5 text-[10px] text-indigo-400">
                <RefreshCw size={10} className="animate-spin" /> updating...
              </span>
            )}
            {usedRole && !isLoading && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                {usedRole}
              </span>
            )}
            {!isLoading && !isFetching && (
              <button onClick={handleForceRefresh} disabled={isForceRefreshing} title="Force refresh"
                className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{ border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }}>
                <RefreshCw size={14} className={isForceRefreshing ? "animate-spin text-indigo-400" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {SUMMARY_CONFIG.map((item, i) => (
            <Tilt3DCard key={i} maxTilt={8} scale={1.04}
              className="rounded-2xl p-4 text-center cursor-pointer"
              style={{ background: item.bg, border: `1px solid ${item.border}` }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                {isLoading
                  ? <div className="h-8 w-12 rounded-lg animate-pulse mx-auto mb-1" style={{ background: 'var(--bg-card-border)' }} />
                  : <p className="text-2xl font-bold" style={{ color: item.color, textShadow: `0 0 16px ${item.glow}` }}>
                      {displayGaps.filter(s => s.priority === item.priority).length}
                    </p>
                }
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </motion.div>
            </Tilt3DCard>
          ))}
        </div>

        {/* Overall readiness */}
        {overallScore !== null && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-4 mb-5 flex items-center gap-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', boxShadow: '0 0 12px rgba(99,102,241,0.2)' }}>
              <Target size={14} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Role Readiness — {usedRole}</p>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${overallScore}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold gradient-text">{overallScore}<span className="text-sm" style={{ color: 'var(--text-muted)' }}>%</span></p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ready</p>
            </div>
          </motion.div>
        )}

        {/* Priority filters */}
        <div className="flex gap-2 mb-5">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={filter === f.id
                ? { background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc', boxShadow: '0 0 10px rgba(99,102,241,0.15)' }
                : { border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }
              }>
              {f.label}
            </button>
          ))}
        </div>

        {/* Skill gap cards */}
        <div className="space-y-3">
          {isLoading
            ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? <div className="py-16 text-center"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No gaps found for this filter.</p></div>
              : filtered.map((skill, i) => {
                const currentPct  = (skill.current / 10) * 100;
                const requiredPct = (skill.required / 10) * 100;
                const gapColor = skill.priority === 'high' ? '#ef4444' : skill.priority === 'medium' ? '#f59e0b' : '#3b82f6';

                return (
                  <motion.div key={skill.id || skill.name}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    onClick={() => setSelectedSkill(skill)}
                    className="rounded-2xl p-5 cursor-pointer group transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bg-card-border-hover)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-card-border)'}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ background: `${gapColor}14`, color: gapColor, border: `1px solid ${gapColor}28`, boxShadow: `0 0 10px ${gapColor}18` }}>
                          {skill.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{skill.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{skill.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={skill.priority} />
                        <ChevronRight size={14} className="transition-colors" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>Current ({skill.current}/10)</span>
                        <span>Required ({skill.required}/10)</span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${currentPct}%` }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                          className="absolute h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${gapColor}, ${gapColor}99)`, boxShadow: `0 0 6px ${gapColor}50` }}
                        />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-white/30" style={{ left: `${requiredPct}%` }} />
                      </div>
                      <p className="text-[10px] font-medium flex items-center gap-1" style={{ color: gapColor }}>
                        <Zap size={9} /> Gap: {skill.gap} levels to close
                      </p>
                    </div>
                  </motion.div>
                );
              })
          }
        </div>
      </div>

      <AnimatePresence>
        {selectedSkill && <SkillDrawer skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
      </AnimatePresence>
      <AIAssistant />
    </AppLayout>
  );
};

export default SkillGaps;
