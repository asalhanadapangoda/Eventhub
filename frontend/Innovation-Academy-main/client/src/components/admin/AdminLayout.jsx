import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  School,
  FlaskConical,
  Users,
  Building2,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Bell,
  ExternalLink,
  Shield,
  Download,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
    toast.success('Logged out successfully');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: 'space_dashboard', end: true },
    { to: '/admin/programs', label: 'Programs', icon: 'school' },
    { to: '/admin/workshops', label: 'Workshops', icon: 'biotech' },
    { to: '/admin/registrations', label: 'Program Registrations', icon: 'how_to_reg' },
    { to: '/admin/participants', label: 'Participants', icon: 'group' },
    { to: '/admin/contact-messages', label: 'Contact Messages', icon: 'contact_support' },
    { to: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen flex bg-[#faf8ff] text-[#131b2e]">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        ></div>
      )}

      {/* Fixed/Sticky Dark Navy Sidebar Matching Google Stitch Design */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0e1c2f] text-white z-50 flex flex-col justify-between transition-transform duration-300 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/trace-logo-white.png"
                alt="TRACE Innovation Academy"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#77849c] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Academy Portal Badge with Pulse */}
          <div className="px-4 py-3 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#cce5ff] uppercase tracking-wider">
                OPERATIONS INTELLIGENCE
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5bb8fe] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006398]"></span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm border border-white/10'
                      : 'text-[#77849c] hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info lockup */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#5bb8fe]" />
              <span className="text-[10px] uppercase font-bold text-[#cce5ff] tracking-wider">
                TRACE Incubation Engine
              </span>
            </div>
            <p className="text-[11px] text-[#77849c] leading-relaxed">
              National catalyst fostering tech entrepreneurship &amp; high-value innovation.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="text-xs text-[#bac7e1] hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-200 font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar from Stitch Design */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#131b2e] hover:bg-[#eaedff]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search programs, candidates, workshops, or partner visits..."
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#f2f3ff] text-xs placeholder:text-[#94a3b8] focus:bg-white focus:ring-1 focus:ring-[#006398] outline-none transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
