import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, ArrowRight, Sparkles, ChevronDown, ChevronUp, BookOpen, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import api from '../api';
import { mockRoadmap } from '../data/mockData';

const fetchRoadmap = async () => {
  try {
    const res = await api.get('/roadmap/');
    if (res.data?.status !== 'success') throw new Error(res.data?.message || 'Failed to load Roadmap');
    return res.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Server error occurred');
  }
};

// Animated timeline dot
const StepDot = ({ active, index }) => (
  <div className={`absolute left-4 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
    active ? 'border-indigo-500' : 'border-[rgba(99,102,241,0.3)]'
  }`}
    style={{ background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)', boxShadow: active ? '0 0 16px rgba(99,102,241,0.5)' : 'none' }}>
    {active
      ? <div className="w-2 h-2 rounded-full bg-white" />
      : <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>{index + 1}</span>
    }
    {active && <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />}
  </div>
);

const Roadmap = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('30');
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: true });
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  const { data: roadmapData, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['roadmap'],
    queryFn: fetchRoadmap,
  });

  const handleForceRefresh = async () => {
    try {
      setIsForceRefreshing(true);
      await api.get('/roadmap/?force=true');
      await queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    } catch (err) { console.error("Failed to force refresh", err); }
    finally { setIsForceRefreshing(false); }
  };

  const toggleWeek = (week) => setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));

  const aiRoadmapSteps = roadmapData?.roadmap || [];
  const isMock = isError || (!isLoading && aiRoadmapSteps.length === 0);
  const mockWeeksToShow = activeTab === '30' ? [0, 1] : activeTab === '60' ? [0, 1, 2] : [0, 1, 2, 3];

  return (
    <AppLayout title="Career Roadmap" subtitle="Your personalized step-by-step plan">
      <div className="p-6 max-w-4xl mx-auto">

        {/* Error banner */}
        {isError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300">{error?.message || 'Failed to load AI roadmap. Showing demo data.'}</p>
            <button onClick={() => refetch()} className="ml-auto flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium">
              <RefreshCw size={11} /> Retry
            </button>
          </motion.div>
        )}

        {/* Progress header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
          {/* Gradient accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Career Roadmap</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Custom AI-generated path</p>
            </div>
            <div className="flex items-center gap-3">
              {isFetching && !isLoading && (
                <span className="flex items-center gap-1.5 text-[10px] text-indigo-400">
                  <RefreshCw size={10} className="animate-spin" /> updating...
                </span>
              )}
              {!isLoading && !isMock && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
                  <Sparkles size={10} /> AI Analyzed
                </span>
              )}
              {!isLoading && !isFetching && (
                <button onClick={handleForceRefresh} disabled={isForceRefreshing} title="Generate New Roadmap"
                  className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                  style={{ border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }}>
                  <RefreshCw size={14} className={isForceRefreshing ? "animate-spin text-indigo-400" : ""} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
              <div className="h-full w-[15%] rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }} />
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Step 1 in progress</span>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical gradient line */}
          <div className="absolute left-6 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(99,102,241,0.15), transparent)' }} />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pl-14">
                  <div className="rounded-2xl p-5 animate-pulse h-24" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }} />
                </div>
              ))}
            </div>
          ) : !isMock ? (
            // ─── AI Data ────────────────────────────────────────────────────────
            <div className="space-y-4">
              {aiRoadmapSteps.map((step, idx) => (
                <motion.div key={step.step || idx}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-14">
                  <StepDot active={idx === 0} index={idx} />

                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: `1px solid ${idx === 0 ? 'rgba(99,102,241,0.35)' : 'var(--bg-card-border)'}` }}>
                    <button onClick={() => toggleWeek(`ai_${idx}`)}
                      className="w-full flex items-center justify-between p-4 transition-colors"
                      style={{ background: expandedWeeks[`ai_${idx}`] ? 'var(--bg-card-hover)' : 'transparent' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start text-left">
                          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                            Step {step.step || idx + 1} · {step.estimated_time}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{step.title}</span>
                        </div>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
                            <Zap size={9} /> Current
                          </span>
                        )}
                      </div>
                      {expandedWeeks[`ai_${idx}`]
                        ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                        : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                      }
                    </button>

                    <AnimatePresence>
                      {expandedWeeks[`ai_${idx}`] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <div className="p-4" style={{ borderTop: '1px solid var(--bg-card-border)', background: 'var(--bg-secondary)' }}>
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
                            {step.resources?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Recommended Resources</p>
                                {step.resources.map((res, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                      style={{ background: 'rgba(99,102,241,0.12)', boxShadow: '0 0 8px rgba(99,102,241,0.15)' }}>
                                      <BookOpen size={14} className="text-indigo-400" />
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{res}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {idx === 0 && (
                              <button className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.35)' }}>
                                <ArrowRight size={12} className="text-indigo-300" />
                                <span className="text-indigo-300">Start Learning</span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // ─── Mock Data Fallback ──────────────────────────────────────────────
            <div className="space-y-4">
              <div className="pl-14 mb-4 flex gap-2">
                {['30', '60', '90'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={activeTab === tab
                      ? { background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc', boxShadow: '0 0 10px rgba(99,102,241,0.15)' }
                      : { border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }
                    }>
                    {tab} Days
                  </button>
                ))}
              </div>

              {mockRoadmap.weeks.slice(0, mockWeeksToShow.length === 2 ? 2 : mockWeeksToShow.length === 3 ? 3 : 4).map((week, wi) => (
                <motion.div key={week.week}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: wi * 0.1 }}
                  className="relative pl-14">
                  <StepDot active={week.week === 1} index={wi} />

                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: `1px solid ${week.week === 1 ? 'rgba(99,102,241,0.35)' : 'var(--bg-card-border)'}` }}>
                    <button onClick={() => toggleWeek(week.week)}
                      className="w-full flex items-center justify-between p-4 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Week {week.week}</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{week.focus}</span>
                        </div>
                        {week.week === 1 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
                            Current
                          </span>
                        )}
                      </div>
                      {expandedWeeks[week.week]
                        ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                        : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                      }
                    </button>

                    {expandedWeeks[week.week] && (
                      <div style={{ borderTop: '1px solid var(--bg-card-border)' }}>
                        {week.tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-4 p-4 transition-colors"
                            style={{ borderBottom: '1px solid var(--bg-card-border)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0`}
                              style={{
                                background: task.status === 'done' ? 'rgba(16,185,129,0.15)' : task.status === 'in-progress' ? 'rgba(99,102,241,0.15)' : 'var(--bg-card-border)',
                                boxShadow: task.status === 'done' ? '0 0 8px rgba(16,185,129,0.3)' : task.status === 'in-progress' ? '0 0 8px rgba(99,102,241,0.3)' : 'none',
                              }}>
                              {task.status === 'done'
                                ? <CheckCircle size={14} className="text-emerald-400" />
                                : task.status === 'in-progress'
                                  ? <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                  : <div className="w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
                              }
                            </div>
                            <p className="text-sm font-medium"
                              style={{ color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                              {task.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AIAssistant />
    </AppLayout>
  );
};

export default Roadmap;
