import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Dna, Zap, Map, BookOpen, Briefcase,
  Mic, FolderGit2, GitBranch, FileText, User, Settings,
  ChevronLeft, ChevronRight, LogOut, X, Menu, Sun, Moon, Swords
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import BrandLogo from '../BrandLogo';

// Each nav item now carries a unique accent colour
const navItems = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     color: '#6366f1' },
  { path: '/career-dna',    icon: Dna,             label: 'Career DNA',    color: '#a855f7' },
  { path: '/skill-gaps',    icon: Zap,             label: 'Skill Gaps',    color: '#f59e0b' },
  { path: '/roadmap',       icon: Map,             label: 'Roadmap',       color: '#3b82f6' },
  { path: '/battle',        icon: Swords,          label: '1v1 Battle',    color: '#ef4444' },
  { path: '/courses',       icon: BookOpen,        label: 'Courses',       color: '#10b981' },
  { path: '/jobs',          icon: Briefcase,       label: 'Jobs',          color: '#14b8a6' },
  { path: '/mock-interview',icon: Mic,             label: 'Mock Interview',color: '#f97316' },
  { path: '/projects',      icon: FolderGit2,      label: 'Projects',      color: '#ec4899' },
  { path: '/github',        icon: GitBranch,       label: 'GitHub',        color: '#e2a82e' },
  { path: '/resume',        icon: FileText,        label: 'Resume',        color: '#8b5cf6' },
];

const bottomItems = [
  { path: '/profile',  icon: User,     label: 'Profile',  color: '#6366f1' },
  { path: '/settings', icon: Settings, label: 'Settings', color: '#9898b0' },
];

/* ─── Nav Item ──────────────────────────────────────────────────────────────── */
const NavItem = ({ item, collapsed }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 ${
          isActive ? 'border' : 'border border-transparent'
        }`
      }
      style={({ isActive }) => isActive ? {
        color: item.color,
        background: `${item.color}12`,
        borderColor: `${item.color}30`,
      } : {
        color: 'var(--text-secondary)',
      }}
    >
      {({ isActive }) => (
        <>
          {/* Hover bg */}
          {!isActive && (
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: `${item.color}08` }}
            />
          )}

          {/* Icon with coloured tint when active */}
          <span
            className="flex-shrink-0 relative z-10"
            style={isActive ? {
              filter: `drop-shadow(0 0 4px ${item.color}80)`,
            } : {}}
          >
            <Icon size={17} style={{ color: isActive ? item.color : undefined }} />
          </span>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1 relative z-10"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active colour dot */}
          {isActive && !collapsed && (
            <motion.span
              layoutId="nav-active-dot"
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 relative z-10"
              style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
            />
          )}

          {/* Collapsed tooltip */}
          {collapsed && (
            <div
              className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity shadow-xl border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)', color: 'var(--text-primary)' }}
            >
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

/* ─── Mobile bottom nav ─────────────────────────────────────────────────────── */
const MobileNav = () => (
  <div
    className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
    style={{
      background: 'var(--header-bg)',
      borderColor: 'var(--sidebar-border)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }}
  >
    <div className="flex items-center justify-around px-2 py-2">
      {navItems.slice(0, 5).map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
            style={({ isActive }) => ({ color: isActive ? item.color : 'var(--text-muted)' })}
          >
            {({ isActive }) => (
              <>
                <span style={isActive ? { filter: `drop-shadow(0 0 4px ${item.color}80)` } : {}}>
                  <Icon size={20} />
                </span>
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        );
      })}
      <NavLink
        to="/profile"
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
        style={({ isActive }) => ({ color: isActive ? '#6366f1' : 'var(--text-muted)' })}
      >
        <User size={20} />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
    </div>
  </div>
);

/* ─── Sidebar ───────────────────────────────────────────────────────────────── */
const Sidebar = ({ collapsed, setCollapsed }) => {
  const { logout, user } = useAuth();
  const displayName = user?.user?.username || user?.username || 'User';
  const initial = displayName?.[0]?.toUpperCase() || 'U';
  const email = user?.user?.email || user?.email;

  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (email) {
      setAvatar(localStorage.getItem(`avatar_${email}`));
    }
    const handleAvatarUpdate = (e) => setAvatar(e.detail);
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, [email]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
      className="hidden md:flex flex-col h-screen border-r flex-shrink-0 overflow-hidden relative z-30"
    >
      {/* ── Logo row ── */}
      <div
        className="flex items-center justify-between px-3.5 py-4 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <BrandLogo iconSize={32} wordSize="md" collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* ── Nav items ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="h-px mx-3 my-1" style={{ background: 'var(--sidebar-border)' }} />

      {/* ── Bottom: profile/settings + user card ── */}
      <div className="py-3 px-2 space-y-0.5">
        {bottomItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}

        {/* User card */}
        <div
          className="mt-2 flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl overflow-hidden border"
          style={{
            borderColor: 'var(--sidebar-border)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.04))',
          }}
        >
          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white overflow-hidden"
              style={{
                background: 'var(--accent-indigo)',
                boxShadow: '0 0 0 2px var(--sidebar-border)',
              }}
            >
              {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : initial}
            </div>
            <span
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2"
              style={{ background: '#10b981', borderColor: 'var(--sidebar-bg)' }}
            />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  Career in progress ✨
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button
              onClick={logout}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/15"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

/* ─── App Header ────────────────────────────────────────────────────────────── */
const AppHeader = ({ title, subtitle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const displayName = user?.user?.username || user?.username || 'User';

  return (
    <>
      <header
        className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-20"
        style={{
          background: 'var(--header-bg)',
          borderColor: 'var(--sidebar-border)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <button
            className="md:hidden transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} />
          </button>
          <div>
            {title && (
              <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right pills */}
        <div className="flex items-center gap-2">
          {/* XP pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-default"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
              borderColor: 'rgba(99,102,241,0.25)',
            }}
          >
            <span
              className="text-[11px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              XP
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              {(user?.career_xp || user?.data?.career_xp || 250).toLocaleString()}
            </span>
          </motion.div>

          {/* Streak pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-default"
            style={{
              background: 'rgba(245,158,11,0.08)',
              borderColor: 'rgba(245,158,11,0.25)',
            }}
          >
            <span className="text-sm">
              🔥
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              {user?.streak || user?.data?.streak || 1}d
            </span>
          </motion.div>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all"
            style={{
              borderColor: 'var(--bg-card-border)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </motion.button>
        </div>
      </header>

      {/* ── Mobile slide-in menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 flex flex-col"
              style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
            >
              <div
                className="flex items-center justify-between px-4 py-4 border-b"
                style={{ borderColor: 'var(--sidebar-border)' }}
              >
                <BrandLogo iconSize={30} wordSize="md" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {[...navItems, ...bottomItems].map(item => (
                  <div key={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <NavItem item={item} collapsed={false} />
                  </div>
                ))}
              </div>
              <div className="p-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── AppLayout ─────────────────────────────────────────────────────────────── */
const AppLayout = ({ children, title, subtitle }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'transparent' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6" style={{ background: 'transparent' }}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export { Sidebar, AppHeader, MobileNav, AppLayout };
export default AppLayout;
