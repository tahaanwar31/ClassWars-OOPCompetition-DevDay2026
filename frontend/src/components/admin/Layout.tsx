import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileQuestion, Settings, Users, LogOut, Trophy, UsersRound, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { path: '/admin/teams', label: 'Teams', icon: UsersRound },
  { path: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/admin/config', label: 'Config', icon: Settings },
  { path: '/admin/sessions', label: 'Sessions', icon: Users },
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
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/[0.06] bg-[#06060a] transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Brand */}
        <div className={`flex items-center h-14 border-b border-white/[0.06] ${collapsed ? 'justify-center' : 'px-4'}`}>
          <Shield className="w-5 h-5 text-[#39ff14] shrink-0" />
          {!collapsed && (
            <span className="ml-2.5 text-sm font-bold tracking-[0.2em] text-white/80">CLASSWARS</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[11px] font-semibold tracking-[0.1em] transition-all ${
                  isActive
                    ? 'bg-[#39ff14]/10 text-[#39ff14]'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#39ff14]' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Toggle + Logout */}
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <><ChevronLeft className="w-4 h-4 shrink-0" /><span className="text-[11px] font-semibold tracking-[0.1em]">Collapse</span></>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-[11px] font-semibold tracking-[0.1em]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
