import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import Tilt3DCard from '../components/Tilt3DCard';
import api from '../api';
import { mockRadarData, mockSkills, mockCareerPaths, mockUser } from '../data/mockData';

const fetchCareerDNA = async () => {
  try {
    const res = await api.get('/career-dna/');
    if (res.data?.status !== 'success') throw new Error(res.data?.message || 'Failed to load Career DNA');
    return res.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Server error occurred');
  }
};

const SectionCard = ({ title, children, accent = '#6366f1' }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
    <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <div className="p-5">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {children}
    </div>
  </div>
);

const SkillPill = ({ name, color }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
    style={{ background: `${color}10`, border: `1px solid ${color}25` }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}45`}
    onMouseLeave={e => e.currentTarget.style.borderColor = `${color}25`}>
    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
      style={{ background: `${color}20`, color, boxShadow: `0 0 8px ${color}25` }}>
      {name[0]}
    </div>
    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
  </div>
);

const SkeletonBlock = ({ h = 'h-4', w = 'w-full', rounded = 'rounded-lg' }) => (
  <div className={`${h} ${w} ${rounded} animate-pulse`} style={{ background: 'var(--bg-card-border)' }} />
);

const CareerDNA = () => {
  const { data: dnaData, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['career-dna'],
    queryFn: fetchCareerDNA,
  });

  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    try {
      setIsForceRefreshing(true);
      await api.get('/career-dna/?force=true');
      refetch();
    } catch (err) { console.error(err); }
    finally { setIsForceRefreshing(false); }
  };

  const radarData       = dnaData?.radar_data
    ? dnaData.radar_data.map(d => ({ subject: d.subject, A: d.score }))
    : mockRadarData;
  const careerPaths     = dnaData?.career_paths    || mockCareerPaths;
  const personalityTags = dnaData?.personality_tags || ['Builder', 'Analytical', 'Problem Solver', 'Backend-First'];
  const strengths       = dnaData?.strengths        || mockSkills.filter(s => s.level >= 7).map(s => s.name);
  const growthAreas     = dnaData?.growth_areas     || mockSkills.filter(s => s.level < 6).map(s => s.name);
  const readinessScore  = dnaData?.readiness_score  || 78;
  const aiSummary       = dnaData?.ai_summary       || null;

  return (
    <AppLayout title="Career DNA" subtitle="Your professional identity, analyzed by AI">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Error banner */}
        {isError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300">{error?.message || 'Failed to load. Showing demo data.'}</p>
            <button onClick={() => refetch()} className="ml-auto flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium">
              <RefreshCw size={11} /> Retry
            </button>
          </motion.div>
        )}

        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.06), transparent 60%)' }} />
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f97316, #14b8a6)' }} />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
              {mockUser.name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                {mockUser.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Targeting: <span className="text-indigo-400 font-medium">{mockUser.targetRole}</span>
              </p>

              {/* Personality tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {isLoading
                  ? [1, 2, 3].map(i => <SkeletonBlock key={i} h="h-6" w="w-20" rounded="rounded-lg" />)
                  : personalityTags.map((tag, i) => (
                    <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)', color: '#a5b4fc' }}>
                      {tag}
                    </motion.span>
                  ))
                }
              </div>
            </div>

            {/* Readiness + refresh */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Readiness Score</p>
                {isFetching && !isLoading && <RefreshCw size={11} className="text-indigo-400 animate-spin" />}
                {!isLoading && !isFetching && (
                  <button onClick={handleForceRefresh} disabled={isForceRefreshing} title="Force analyze DNA"
                    className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{ border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }}>
                    <RefreshCw size={12} className={isForceRefreshing ? "animate-spin text-indigo-400" : ""} />
                  </button>
                )}
              </div>
              {isLoading
                ? <SkeletonBlock h="h-9" w="w-20" rounded="rounded-xl" />
                : <motion.p className="text-3xl font-bold gradient-text"
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                    {readinessScore}<span className="text-base" style={{ color: 'var(--text-muted)' }}>/100</span>
                  </motion.p>
              }
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp size={12} />
                <span className="text-xs font-medium">{dnaData ? '✓ AI Analyzed' : 'Demo mode'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Radar + Career Paths ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.05), transparent 70%)' }} />
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Skill Radar</h3>
              {dnaData && (
                <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: '#34d399' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI Analyzed
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[280px]">
                <div className="w-8 h-8 border-2 border-t-indigo-500 border-indigo-500/20 rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="var(--bg-card-border)" />
                  <PolarAngleAxis dataKey="subject"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }} />
                  <Radar name="You" dataKey="A"
                    stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 3, filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.8))' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Career Path Matches */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Career Path Matches</h3>
            <div className="space-y-3">
              {isLoading
                ? [1, 2, 3, 4].map(i => <SkeletonBlock key={i} h="h-12" rounded="rounded-xl" />)
                : careerPaths.map((path, i) => (
                  <motion.div key={path.role || path.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group"
                    style={{ border: '1px solid var(--bg-card-border)', background: 'var(--bg-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${path.color || '#6366f1'}40`; e.currentTarget.style.background = `${path.color || '#6366f1'}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-card-border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                    <span className="text-xl">{path.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{path.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${path.match}%` }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: path.color || '#6366f1', boxShadow: `0 0 4px ${path.color || '#6366f1'}60` }} />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: path.color || '#6366f1', textShadow: `0 0 8px ${path.color || '#6366f1'}50` }}>
                      {path.match}%
                    </span>
                    <ChevronRight size={14} className="transition-colors" style={{ color: 'var(--text-muted)' }} />
                  </motion.div>
                ))
              }
            </div>
          </motion.div>
        </div>

        {/* ── Strengths / Growth / Evidence ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SectionCard title="💪 Strengths" accent="#6366f1">
            <div className="flex flex-wrap gap-2">
              {isLoading
                ? [1, 2, 3].map(i => <SkeletonBlock key={i} h="h-9" w="w-24" rounded="rounded-xl" />)
                : strengths.map(name => <SkillPill key={name} name={name} color="#6366f1" />)
              }
            </div>
          </SectionCard>

          <SectionCard title="🚀 Growth Areas" accent="#f59e0b">
            <div className="flex flex-wrap gap-2">
              {isLoading
                ? [1, 2, 3].map(i => <SkeletonBlock key={i} h="h-9" w="w-24" rounded="rounded-xl" />)
                : growthAreas.map(name => <SkillPill key={name} name={name} color="#f59e0b" />)
              }
            </div>
          </SectionCard>

          <SectionCard title="📊 Career Evidence" accent="#10b981">
            <div className="space-y-3">
              {[
                { label: 'Projects', count: 3, icon: '🛠️', color: '#6366f1' },
                { label: 'GitHub Repos', count: 12, icon: '🐙', color: '#10b981' },
                { label: 'Resume Score', count: '72%', icon: '📄', color: '#f59e0b' },
                { label: 'Courses Completed', count: 2, icon: '📚', color: '#8b5cf6' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color, textShadow: `0 0 8px ${item.color}40` }}>{item.count}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── AI Summary ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(99,102,241,0.08), transparent 50%)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'rgba(99,102,241,0.2)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}>
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <div className="flex-1 relative">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              AI Career Analysis
              {dnaData && <span className="text-emerald-400 normal-case flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>}
            </p>
            {isLoading
              ? <div className="space-y-2"><SkeletonBlock h="h-4" /><SkeletonBlock h="h-4" w="w-4/5" /></div>
              : <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {aiSummary || 'Your strongest career identity is a Backend Developer with deep Python and SQL expertise. Focus on Docker and System Design to unlock 3 more career paths.'}
                </p>
            }
          </div>
        </motion.div>

      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default CareerDNA;
