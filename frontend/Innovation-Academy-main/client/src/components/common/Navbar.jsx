import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';
import { userService } from '../../services/api';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
  Bell,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, openLoginModal, openRegisterModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
  const [workshopsDropdownOpen, setWorkshopsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const programsRef = useRef(null);
  const workshopsRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications for authenticated user
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkNotificationRead = async (id, link) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark notification read:', err.message);
    }
    setNotificationsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadList = notifications.filter((n) => !n.read);
    for (const n of unreadList) {
      try {
        await userService.markNotificationRead(n._id || n.id);
      } catch (err) {}
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (programsRef.current && !programsRef.current.contains(event.target)) {
        setProgramsDropdownOpen(false);
      }
      if (workshopsRef.current && !workshopsRef.current.contains(event.target)) {
        setWorkshopsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (target) => {
    setMobileMenuOpen(false);
    setProgramsDropdownOpen(false);
    setWorkshopsDropdownOpen(false);

    if (target === '/') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (target.startsWith('#')) {
      if (location.pathname === '/') {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/' + target);
      }
      return;
    }

    navigate(target);
  };

  const handleProgramsClick = () => {
    setProgramsDropdownOpen(false);
    setMobileMenuOpen(false);
    if (location.pathname === '/programs') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/programs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWorkshopsClick = () => {
    setWorkshopsDropdownOpen(false);
    setMobileMenuOpen(false);
    if (location.pathname === '/workshops') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/workshops');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Lockup */}
          <Link to="/" className="flex items-center group py-2">
            <img
              src={`${import.meta.env.BASE_URL}trace-logo.png`}
              alt="TRACE Innovation Academy - Powered by T2T"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('/')}
              className={`text-[14px] font-semibold transition-colors cursor-pointer ${
                location.pathname === '/' && !location.hash
                  ? 'text-[#006398]'
                  : 'text-[#131b2e] hover:text-[#006398]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('#about')}
              className={`text-[14px] font-semibold transition-colors cursor-pointer ${
                location.hash === '#about'
                  ? 'text-[#006398]'
                  : 'text-[#44474c] hover:text-[#006398]'
              }`}
            >
              About TRACE
            </button>

            {/* Programs Nav Item (Direct clickable link + Dropdown for sub-links) */}
            <div
              className="relative"
              ref={programsRef}
              onMouseEnter={() => isAuthenticated && setProgramsDropdownOpen(true)}
              onMouseLeave={() => isAuthenticated && setProgramsDropdownOpen(false)}
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={handleProgramsClick}
                  className={`text-[14px] font-semibold transition-colors py-2 cursor-pointer ${
                    location.pathname.startsWith('/programs') ||
                    location.pathname === '/participant/programs'
                      ? 'text-[#006398]'
                      : 'text-[#44474c] hover:text-[#006398]'
                  }`}
                >
                  Programs
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProgramsDropdownOpen(!programsDropdownOpen);
                    }}
                    className="p-1 -ml-0.5 text-slate-400 hover:text-[#006398] transition-colors cursor-pointer"
                    aria-label="Toggle programs menu"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        programsDropdownOpen ? 'rotate-180 text-[#006398]' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {isAuthenticated && programsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-60 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    to="/programs"
                    onClick={() => setProgramsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0B192C]">All Programs</div>
                      <div className="text-[10px] text-slate-500 font-normal">Explore Flagship Tracks</div>
                    </div>
                  </Link>

                  <Link
                    to="/participant/programs"
                    onClick={() => setProgramsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors border-t border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0B192C]">My Programs</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Registered Programs Only</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Workshops Nav Item (Direct clickable link + Dropdown for sub-links) */}
            <div
              className="relative"
              ref={workshopsRef}
              onMouseEnter={() => isAuthenticated && setWorkshopsDropdownOpen(true)}
              onMouseLeave={() => isAuthenticated && setWorkshopsDropdownOpen(false)}
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={handleWorkshopsClick}
                  className={`text-[14px] font-semibold transition-colors py-2 cursor-pointer ${
                    location.pathname.startsWith('/workshops') ||
                    location.pathname === '/participant/workshops'
                      ? 'text-[#006398]'
                      : 'text-[#44474c] hover:text-[#006398]'
                  }`}
                >
                  Workshops
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkshopsDropdownOpen(!workshopsDropdownOpen);
                    }}
                    className="p-1 -ml-0.5 text-slate-400 hover:text-[#006398] transition-colors cursor-pointer"
                    aria-label="Toggle workshops menu"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        workshopsDropdownOpen ? 'rotate-180 text-[#006398]' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {isAuthenticated && workshopsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    to="/workshops"
                    onClick={() => setWorkshopsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0B192C]">All Workshops</div>
                      <div className="text-[10px] text-slate-500 font-normal">Full Workshop Catalog</div>
                    </div>
                  </Link>

                  <Link
                    to="/participant/workshops"
                    onClick={() => setWorkshopsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors border-t border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0B192C]">My Workshops</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Registered Program Workshops</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('#contact')}
              className={`text-[14px] font-semibold transition-colors cursor-pointer ${
                location.hash === '#contact'
                  ? 'text-[#006398]'
                  : 'text-[#44474c] hover:text-[#006398]'
              }`}
            >
              Contact Us
            </button>

            <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
            <a
              href="/events"
              className="text-[13px] font-semibold text-[#44474c] hover:text-[#006398] transition-colors"
            >
              Events
            </a>
            <a
              href="/spaces"
              className="text-[13px] font-semibold text-[#44474c] hover:text-[#006398] transition-colors"
            >
              Spaces
            </a>
            <a
              href="/community"
              className="text-[13px] font-semibold text-[#44474c] hover:text-[#006398] transition-colors"
            >
              Community
            </a>
          </nav>

          {/* Right Action Buttons / User Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-full border border-slate-200 hover:border-[#006398] bg-white hover:bg-slate-50 transition-all text-slate-600 hover:text-[#006398] cursor-pointer"
                    aria-label="View notifications"
                    title="Notifications & Admin Replies"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Menu */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header */}
                      <div className="px-4 py-3 bg-[#faf8ff] border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#006398]" />
                          <h4 className="text-xs font-bold text-[#0B192C]">Notifications &amp; Replies</h4>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaedff] text-[#006398]">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-[#006398] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification Items List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n._id || n.id}
                              onClick={() => handleMarkNotificationRead(n._id || n.id, n.link || '/participant/notifications')}
                              className={`p-3.5 hover:bg-[#f8faff] transition-colors cursor-pointer flex items-start gap-3 ${
                                !n.read ? 'bg-[#f4f7ff]/70' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center shrink-0 mt-0.5">
                                {n.title?.toLowerCase().includes('reply') ? (
                                  <MessageSquare className="w-4 h-4 text-[#006398]" />
                                ) : (
                                  <Bell className="w-4 h-4 text-[#006398]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <h5 className="text-xs font-bold text-[#0B192C] truncate">
                                    {n.title}
                                  </h5>
                                  {!n.read && (
                                    <span className="w-2 h-2 rounded-full bg-[#006398] shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#44474c] line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-slate-400 block mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  • {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center px-4">
                            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              When staff reply to your messages, they will appear here.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                          to="/participant/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-bold text-[#006398] hover:underline"
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill Trigger Button */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full border border-slate-200 hover:border-[#006398] bg-white hover:bg-slate-50 transition-all shadow-sm group cursor-pointer"
                    aria-expanded={profileMenuOpen}
                  >
                    {/* Avatar Circle with Unread Dot */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#006398] to-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>
                            {user?.name
                              ? user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : 'U'}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </div>

                    {/* Name & Role Text */}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[#0B192C] group-hover:text-[#006398] transition-colors max-w-[140px] truncate leading-tight">
                        {user?.name || 'My Profile'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium leading-none">
                        {isAdmin ? 'Administrator' : 'Participant'}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#006398] transition-transform duration-200 ${
                        profileMenuOpen ? 'rotate-180 text-[#006398]' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-[#faf8ff] rounded-t-2xl">
                        <p className="text-xs font-bold text-[#0B192C] truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#dbeafe] text-[#00476e]">
                          {isAdmin ? 'TRACE Admin' : 'TRACE Participant'}
                        </span>
                      </div>

                      {/* Navigation Items */}
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                          >
                            <Shield className="w-4 h-4 text-[#006398]" />
                            <span>Admin Operations Portal</span>
                          </Link>
                        )}

                        <Link
                          to={isAdmin ? '/admin/settings' : '/participant/profile'}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#006398]" />
                          <span>My Profile &amp; Account</span>
                        </Link>

                        {!isAdmin && (
                          <>
                            <Link
                              to="/participant/notifications"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <Bell className="w-4 h-4 text-[#006398]" />
                                <span>Notifications &amp; Replies</span>
                              </div>
                              {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                                  {unreadCount}
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/participant/programs"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-[#006398]" />
                              <span>My Enrolled Programs</span>
                            </Link>
                            <Link
                              to="/participant/workshops"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eaedff] hover:text-[#006398] transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-[#006398]" />
                              <span>My Workshops</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/', { replace: true });
                            logout();
                            toast.success('Signed out successfully');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-[#ba1a1a]" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="px-4 py-2 text-sm font-semibold text-[#0B192C] hover:text-[#006398] transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="px-5 py-2 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-sm font-bold tracking-wide transition-all shadow-sm shadow-[#ba1a1a]/20 cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right: Notification Bell (if logged in) + Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/participant/notifications');
                }}
                className="relative p-2 rounded-full border border-slate-200 hover:border-[#006398] bg-white text-slate-600 transition-colors cursor-pointer"
                aria-label="View notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#cbd5e1] bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <button
            onClick={() => handleNavClick('/')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold transition-colors ${
              location.pathname === '/' && !location.hash
                ? 'bg-[#eaedff] text-[#006398]'
                : 'text-[#131b2e] hover:bg-[#eaedff]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('#about')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold transition-colors ${
              location.hash === '#about'
                ? 'bg-[#eaedff] text-[#006398]'
                : 'text-[#44474c] hover:bg-[#eaedff]'
            }`}
          >
            About TRACE
          </button>

          {/* Mobile Programs Section */}
          <div>
            <button
              onClick={handleProgramsClick}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                location.pathname.startsWith('/programs') ||
                location.pathname === '/participant/programs'
                  ? 'bg-[#eaedff] text-[#006398]'
                  : 'text-[#44474c] hover:bg-[#eaedff]'
              }`}
            >
              Programs
            </button>
            {isAuthenticated && (
              <div className="ml-3 mt-1 pl-3 border-l-2 border-slate-200 space-y-1">
                <Link
                  to="/programs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-[#eaedff]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#006398]" />
                  <span>All Programs (Catalog)</span>
                </Link>
                <Link
                  to="/participant/programs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Programs (Enrolled)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Workshops Section */}
          <div>
            <button
              onClick={handleWorkshopsClick}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                location.pathname.startsWith('/workshops') ||
                location.pathname === '/participant/workshops'
                  ? 'bg-[#eaedff] text-[#006398]'
                  : 'text-[#44474c] hover:bg-[#eaedff]'
              }`}
            >
              Workshops
            </button>
            {isAuthenticated && (
              <div className="ml-3 mt-1 pl-3 border-l-2 border-slate-200 space-y-1">
                <Link
                  to="/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-[#eaedff]"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#006398]" />
                  <span>All Workshops (Catalog)</span>
                </Link>
                <Link
                  to="/participant/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Workshops (Enrolled)</span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('#contact')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold transition-colors ${
              location.hash === '#contact'
                ? 'bg-[#eaedff] text-[#006398]'
                : 'text-[#44474c] hover:bg-[#eaedff]'
            }`}
          >
            Contact Us
          </button>

          <div className="pt-4 border-t border-[#e2e8f0] flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="space-y-3">
                {/* Profile Identity Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf8ff] border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#006398] to-[#0284c7] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#0B192C] truncate">{user?.name}</span>
                    <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                    <span className="text-[10px] font-bold text-[#006398] uppercase tracking-wider">
                      {isAdmin ? 'Admin' : 'Participant'}
                    </span>
                  </div>
                </div>

                {/* Profile Links */}
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eaedff] rounded-lg"
                    >
                      <Shield className="w-4 h-4 text-[#006398]" />
                      <span>Admin Operations Portal</span>
                    </Link>
                  )}

                  <Link
                    to={isAdmin ? '/admin/settings' : '/participant/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eaedff] rounded-lg"
                  >
                    <User className="w-4 h-4 text-[#006398]" />
                    <span>My Profile &amp; Settings</span>
                  </Link>

                  {!isAdmin && (
                    <>
                      <Link
                        to="/participant/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eaedff] rounded-lg"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-[#006398]" />
                          <span>Notifications &amp; Replies</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/participant/programs"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eaedff] rounded-lg"
                      >
                        <BookOpen className="w-4 h-4 text-[#006398]" />
                        <span>My Enrolled Programs</span>
                      </Link>
                      <Link
                        to="/participant/workshops"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eaedff] rounded-lg"
                      >
                        <Calendar className="w-4 h-4 text-[#006398]" />
                        <span>My Workshops</span>
                      </Link>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/', { replace: true });
                    logout();
                    toast.success('Signed out successfully');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#ba1a1a] hover:bg-red-50 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="py-2.5 text-center font-semibold text-[#0B192C] bg-[#eaedff] hover:bg-[#dae2fd] rounded-lg cursor-pointer transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegisterModal();
                  }}
                  className="py-2.5 text-center font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

