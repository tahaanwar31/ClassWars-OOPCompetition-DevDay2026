import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileQuestion, Settings, Users, LogOut, Trophy, UsersRound, ChevronLeft, ChevronRight, Shield, Terminal } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/admin/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { path: '/admin/questions', label: 'QUESTIONS', icon: FileQuestion },
  { path: '/admin/teams', label: 'TEAMS', icon: UsersRound },
  { path: '/admin/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  { path: '/admin/config', label: 'CONFIG', icon: Settings },
  { path: '/admin/sessions', label: 'SESSIONS', icon: Users },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#050508] overflow-hidden font-mono">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.008)_2px,rgba(0,255,0,0.008)_4px)]" />

      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-r border-[#39ff14]/10 bg-[#030305] transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
      >
        {/* Sidebar glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#39ff14]/[0.02] to-transparent" />

        {/* Brand */}
        <div className={`relative flex items-center h-14 border-b border-[#39ff14]/10 ${collapsed ? 'justify-center' : 'px-4'}`}>
          <div className="relative">
            <Shield className="w-5 h-5 text-[#39ff14]" />
            <div className="absolute -inset-1 bg-[#39ff14]/10 blur-sm rounded-full" />
          </div>
          {!collapsed && (
            <div className="ml-2.5 flex items-center gap-1.5">
              <span className="text-xs font-black tracking-[0.25em] text-[#39ff14]" style={{ textShadow: '0 0 10px rgba(57,255,20,0.3)' }}>
                CLASS
              </span>
              <span className="text-xs font-black tracking-[0.25em] text-white/60">
                WARS
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold tracking-[0.15em] transition-all group ${
                  isActive
                    ? 'text-[#39ff14]'
                    : 'text-white/20 hover:text-white/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#39ff14]" style={{ boxShadow: '0 0 8px rgba(57,255,20,0.5)' }} />
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-[#39ff14]/[0.04]" />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#39ff14]' : 'group-hover:text-white/40'} transition-colors`} />
                {!collapsed && <span className="relative">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#39ff14]/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-white/15 hover:text-white/40 hover:bg-white/[0.02] transition-all"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5 mx-auto" /> : <><ChevronLeft className="w-3.5 h-3.5 shrink-0" /><span className="text-[10px] font-bold tracking-[0.15em]">COLLAPSE</span></>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-400/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="text-[10px] font-bold tracking-[0.15em]">LOGOUT</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
