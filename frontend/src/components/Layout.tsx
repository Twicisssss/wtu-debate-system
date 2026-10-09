import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Home, BarChart3, PlusCircle, List, Shield, Users, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

const SIDEBAR_W = 'w-56 lg:w-60';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'captain';
  const mainRef = useRef<HTMLDivElement>(null);

  // Reset scroll + trigger fade animation on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.classList.remove('page-enter');
      void mainRef.current.offsetWidth; // force reflow
      mainRef.current.classList.add('page-enter');
    }
  }, [location.pathname]);

  const desktopTabs = [
    { path: '/home',     icon: Home,      label: '首页' },
    { path: '/ranking',  icon: BarChart3,  label: '积分榜' },
    { path: '/submit',   icon: PlusCircle, label: '提交积分' },
    { path: '/records',  icon: List,       label: '我的记录' },
    ...(isAdmin ? [{ path: '/admin', icon: Shield, label: '管理后台' }] : []),
    { path: '/roster', icon: Users, label: '队员名录' },
    { path: '/profile', icon: User, label: '我的信息' },
  ];

  const mobileTabs = [
    { path: '/home',     icon: Home,      label: '首页' },
    { path: '/records',  icon: List,       label: '记录' },
    ...(isAdmin ? [{ path: '/admin', icon: Shield, label: '管理' }] : []),
    { path: '/roster', icon: Users, label: '名录' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">

      {/* ─── Desktop Sidebar ─────────────────────────────── */}
      <aside className={`hidden md:flex md:flex-col ${SIDEBAR_W} shrink-0 h-screen sticky top-0 border-r border-[var(--color-border)]`}
             style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F5F3EF 100%)' }}>
        <div className="px-5 pt-8 pb-6">
          <h1 className="text-[15px] font-semibold text-[var(--color-text)] leading-tight">
            武汉纺织大学辩论队
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {desktopTabs.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[15px] transition-all duration-200 card-hover ${
                  active ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium' : 'text-[var(--color-text)]'
                }`}>
                <Icon size={17} strokeWidth={active ? 2.5 : 1.5} />{label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-3 mx-3 mt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--color-muted)]/15 flex items-center justify-center shrink-0 text-[13px] font-medium text-[var(--color-muted)]">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[var(--color-text)] truncate">{user?.name}</p>
              <p className="text-[11px] text-[var(--color-muted)]">{user?.department}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[14px] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-all mt-1 card-hover">
            退出登录
          </button>
        </div>
      </aside>

      {/* ─── Main Column ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="md:hidden shrink-0 sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
          <div className="px-5 h-12 flex items-center justify-between">
            <div>
              <span className="text-[14px] font-semibold text-[var(--color-text)]">武汉纺织大学辩论队</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[var(--color-muted)]">{user?.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="text-[13px] text-[var(--color-accent)] font-medium">退出</button>
            </div>
          </div>
        </header>

        {/* Content with fade animation */}
        <div ref={mainRef} className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-5 md:px-8 pt-4 sm:pt-5 md:pt-8 pb-6 md:pb-10 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile bottom nav + safe area */}
        <nav className="md:hidden shrink-0 sticky bottom-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/80 border-t border-[var(--color-border)]"
             style={{ paddingBottom: 'var(--safe-bottom)' }}>
          <div className="flex justify-around items-center h-[76px] pb-[14px]">
            {mobileTabs.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <button key={path} onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-0.5 min-w-[50px] px-1 transition-colors"
                  style={{ minHeight: 48 }}>
                  <Icon size={21} strokeWidth={active ? 2.5 : 1.5}
                    style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)' }} />
                  <span className="text-[10px] leading-none"
                    style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)', fontWeight: active ? 500 : 400 }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
