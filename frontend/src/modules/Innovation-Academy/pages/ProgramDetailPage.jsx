import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { programService, registrationService } from '../services/api';
import { formatImageUrl, handleImageError } from '../utils/imageUrl';
import {
  Brain,
  Rocket,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
  Video,
  Lock,
  Check,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function ProgramDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated, openLoginModal, openRegisterModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Smooth scroll to target hash anchor (e.g. #register)
  useEffect(() => {
    if (location.hash && !loading) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location.hash, loading]);

  // Registration form state
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    organization: '',
    additionalInformation: '',
  });

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [existingRef, setExistingRef] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);
  const [regError, setRegError] = useState('');

  // Fetch program data & check access
  useEffect(() => {
    const fetchProgram = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await programService.getProgramBySlug(slug);
        if (res.success && res.data) {
          setProgram(res.data);
        } else {
          setError('Program not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load program details');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [slug]);

  // Check enrollment status when user or program changes
  useEffect(() => {
    const checkAccess = async () => {
      if (isAuthenticated && slug) {
        try {
          const res = await registrationService.checkAccess(slug);
          if (res.hasAccess) {
            setIsEnrolled(true);
            setExistingRef(res.registration?.referenceNumber || '');
          }
        } catch (err) {
          // ignore error
        }
      }
    };

    checkAccess();
  }, [isAuthenticated, slug]);

  // Autofill form if user is logged in
  useEffect(() => {
    if (user) {
      setRegForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        organization: user.organization || '',
      }));
    }
  }, [user]);

  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/programs/${slug}#register` } });
      return;
    }

    setSubmittingReg(true);
    setRegError('');
    setRegSuccess(null);

    try {
      const res = await registrationService.registerProgram({
        programId: program._id,
        programSlug: program.slug,
        fullName: regForm.fullName,
        email: regForm.email,
        phoneNumber: regForm.phoneNumber,
        organization: regForm.organization,
        additionalInformation: regForm.additionalInformation,
      });

      if (res.success) {
        setRegSuccess(res);
        setIsEnrolled(true);
        setExistingRef(res.referenceNumber);
        toast.success(`Registration Confirmed! Reference: ${res.referenceNumber || ''}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. You may already be registered.';
      setRegError(msg);
      toast.error(msg);
    } finally {
      setSubmittingReg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8ff]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-[#44474c]">Loading Program Syllabus...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8ff]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-md">
            <ShieldAlert className="w-12 h-12 text-[#ba1a1a] mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-[#0B192C]">Program Not Found</h2>
            <p className="text-sm text-[#44474c] mt-2 mb-6">
              The requested TRACE curriculum could not be located.
            </p>
            <Link
              to="/programs"
              className="px-6 py-2.5 rounded-lg bg-[#006398] text-white font-bold text-sm"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isProg1 = program.slug === 'program-01';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section
          style={
            program.coverImage
              ? {
                  backgroundImage: `linear-gradient(to right, rgba(11, 25, 44, 0.72), rgba(0, 23, 75, 0.85)), url(${program.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
          className={`py-16 text-white ${
            program.coverImage
              ? 'bg-cover bg-center'
              : isProg1
              ? 'bg-gradient-to-r from-[#006398] via-[#00476e] to-[#0B192C]'
              : 'bg-gradient-to-r from-[#0B192C] via-[#0e1c2f] to-[#00174b]'
          } relative overflow-hidden`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/programs" className="text-xs font-semibold text-[#cce5ff] hover:underline">
                Programs
              </Link>
              <span className="text-xs text-[#cce5ff]">/</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
                {program.title || 'Overview'}
              </span>
            </div>

            <div className="max-w-4xl flex flex-col gap-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {program.title}
              </h1>
              <p className="text-base sm:text-lg text-[#cce5ff] max-w-2xl leading-relaxed">
                {program.shortDescription || program.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-[#bac7e1]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5bb8fe]" />
                  <span>Duration: <strong className="text-white">{program.slug === 'program-01' ? '1 Month' : program.slug === 'program-02' ? '3 Months' : (program.duration || '1 Month')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5bb8fe]" />
                  <span>Programme Fee: <strong className="text-white">{program.fee || (program.slug === 'program-01' ? 'LKR 15,000 / month' : 'LKR 5,000 Reg + LKR 15,000 / month')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#5bb8fe]" />
                  <span>Location: <strong className="text-white">TRACE Expert City, Bay 05</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#5bb8fe]" />
                  <span>Certification: <strong className="text-white">TRACE Sri Lanka</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Program Detail Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-12">
              {/* 1. Program Overview */}
              <section className="bg-white p-7 sm:p-9 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-[#006398]"></span>
                  <h2 className="text-2xl font-bold text-[#0B192C]">1. Program Overview</h2>
                </div>
                <p className="text-sm sm:text-base text-[#44474c] leading-relaxed whitespace-pre-line">
                  {program.description}
                </p>

                {/* Coordinator Lockup */}
                {program.coordinator && (
                  <div className="mt-6 p-4 rounded-xl bg-[#f2f3ff] border border-[#dae2fd] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#006398] text-white flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-[#75777d] uppercase font-bold tracking-wider block">
                          Program Coordinator
                        </span>
                        <span className="text-sm font-bold text-[#0B192C]">
                          {program.coordinator.name}
                        </span>
                        <span className="text-xs text-[#44474c] block">
                          {program.coordinator.title}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${program.coordinator.email}`}
                      className="text-xs font-semibold text-[#006398] hover:underline"
                    >
                      {program.coordinator.email}
                    </a>
                  </div>
                )}
              </section>

              {/* 2. Program Activities */}
              <section className="bg-white p-7 sm:p-9 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-[#006398]"></span>
                  <h2 className="text-2xl font-bold text-[#0B192C]">2. Program Activities &amp; Sprints</h2>
                </div>
                <div className="space-y-3">
                  {program.activities?.map((act, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#faf8ff] border-l-4 border-[#006398] border-t border-r border-b border-[#e2e8f0] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase font-extrabold text-[#006398] tracking-wider">
                          Module {i + 1}
                        </span>
                        <span className="text-sm font-bold text-[#0B192C]">{act}</span>
                      </div>
                      <span className="text-xs text-[#75777d]">Bay 05 Studio</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Program Information (Audience, Benefits, Outcomes) */}
              <section className="bg-white p-7 sm:p-9 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-3 h-3 rounded-full bg-[#006398]"></span>
                  <h2 className="text-2xl font-bold text-[#0B192C]">3. Target Audience &amp; Benefits</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm uppercase font-extrabold tracking-wider text-[#006398] mb-3">
                      Who Should Join:
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#44474c]">
                      {program.targetAudience?.map((aud, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#006398] shrink-0 mt-0.5" />
                          <span>{aud}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm uppercase font-extrabold tracking-wider text-[#006398] mb-3">
                      Program Benefits:
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#44474c]">
                      {program.benefits?.map((ben, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#006398] shrink-0 mt-0.5" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Workshops belonging to THIS program */}
              <section className="bg-white p-7 sm:p-9 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#006398]"></span>
                      <h2 className="text-2xl font-bold text-[#0B192C]">
                        4. Workshops Under {program.title}
                      </h2>
                    </div>
                    <p className="text-xs text-[#44474c] mt-1">
                      Participants enrolled in this program automatically gain access to all sessions below.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#eaedff] text-[#006398]">
                    {program.workshops?.length || 0} Sessions
                  </span>
                </div>

                <div className="space-y-4">
                  {program.workshops && program.workshops.length > 0 ? (
                    program.workshops.map((w, idx) => (
                      <div
                        key={w._id || idx}
                        className="p-5 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] hover:border-[#006398] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {w.coverImage && (
                          <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={formatImageUrl(w.coverImage)}
                              alt={w.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                          </div>
                        )}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#eaedff] text-[#006398]">
                              Session 0{idx + 1}
                            </span>
                            <span className="text-xs text-[#75777d]">({w.status})</span>
                          </div>
                          <h3 className="text-base font-bold text-[#0B192C]">{w.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#44474c]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#006398]" />
                              {w.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#006398]" />
                              {w.startTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-[#006398]" />
                              {w.speakerName}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/programs/${program.slug}/workshops/${w.slug}`}
                          className="py-2 px-4 rounded-lg bg-white border border-[#cbd5e1] hover:border-[#006398] hover:bg-[#006398] hover:text-white text-xs font-bold uppercase tracking-wider text-center transition-all shrink-0 self-start sm:self-auto"
                        >
                          View Details
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-[#75777d]">
                      No workshops scheduled yet for this program.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Program Registration Form (5 cols) */}
            <div className="lg:col-span-5" id="register">
              <div className="sticky top-28 rounded-3xl bg-white border border-[#cbd5e1] p-7 sm:p-9 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#006398] text-white flex items-center justify-center font-bold shadow-md shadow-[#006398]/20 shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0B192C] tracking-tight">Join Program</h3>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#006398]">
                      {program.badge || 'PROGRAM REGISTRATION'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Register once for <strong>{program.title}</strong>. You will automatically receive
                  access to all its workshops, mentorship, and Bay 05 facilities.
                </p>

                {/* Fee & Duration Pill */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#f0f6ff] to-[#e6f1fe] border border-[#bfdbfe] mb-6 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#004e78] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#006398]" />
                      Programme Fee
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#006398] text-white shadow-xs">
                      {program.slug === 'program-01' ? '1 Month' : program.slug === 'program-02' ? '3 Months' : (program.duration || '1 Month')}
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-[#006398] tracking-tight">
                    {program.fee || (program.slug === 'program-01' ? 'LKR 15,000 per month' : 'LKR 5,000 Registration Fee + LKR 15,000 per month')}
                  </div>
                </div>

                {/* Already Enrolled Banner */}
                {isEnrolled && (
                  <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Already Registered!</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      You are already enrolled in this program. Your reference number is{' '}
                      <strong>{existingRef}</strong>.
                    </p>
                    <Link
                      to="/participant/workshops"
                      className="mt-3 block w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                    >
                      Go to My Workshops
                    </Link>
                  </div>
                )}

                {/* Success Registration Notice */}
                {regSuccess && (
                  <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Registration Confirmed!</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      Your Reference: <strong>{regSuccess.referenceNumber}</strong>. You now have
                      automatic access to all workshops in this program.
                    </p>
                    <Link
                      to="/participant"
                      className="mt-3 block w-full py-2.5 text-center bg-[#006398] hover:bg-[#0284c7] text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                    >
                      Open Participant Dashboard
                    </Link>
                  </div>
                )}

                {regError && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="mb-6 p-4 rounded-xl bg-[#f2f3ff] border border-[#dae2fd] text-xs sm:text-sm text-[#00476e]">
                    <div className="flex items-center gap-2 font-extrabold mb-1.5 text-sm text-[#0B192C]">
                      <Lock className="w-4 h-4 text-[#006398]" />
                      <span>Account Required</span>
                    </div>
                    <span className="text-xs text-slate-600 leading-relaxed block mb-3">
                      Please log in or register your account to enroll in this program.
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={openLoginModal}
                        className="py-2.5 text-center bg-[#0B192C] hover:bg-[#1e293b] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={openRegisterModal}
                        className="py-2.5 text-center bg-[#006398] hover:bg-[#0284c7] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Kavindu Senanayake"
                      value={regForm.fullName}
                      onChange={handleRegChange}
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-slate-300 text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="kavindu@domain.lk"
                      value={regForm.email}
                      onChange={handleRegChange}
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-slate-300 text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      placeholder="+94 77 123 4567"
                      value={regForm.phoneNumber}
                      onChange={handleRegChange}
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-slate-300 text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Organization / University
                    </label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="e.g. University of Moratuwa"
                      value={regForm.organization}
                      onChange={handleRegChange}
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-slate-300 text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Additional Information / Aspirations
                    </label>
                    <textarea
                      name="additionalInformation"
                      rows={3}
                      placeholder="Share your prototype ideas or motivation..."
                      value={regForm.additionalInformation}
                      onChange={handleRegChange}
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReg || isEnrolled}
                    className="w-full h-12 sm:h-13 rounded-xl bg-[#006398] hover:bg-[#0284c7] text-white font-extrabold text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer mt-2"
                  >
                    {submittingReg ? (
                      <span>Processing Application...</span>
                    ) : isEnrolled ? (
                      <span>Enrolled Already</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm Program Registration</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

