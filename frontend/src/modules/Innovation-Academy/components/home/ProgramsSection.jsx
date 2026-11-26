import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Rocket, Check, ArrowRight, Award, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { registrationService } from '../../services/api';

export default function ProgramsSection({ programs = [] }) {
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    organization: '',
    additionalInformation: '',
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const defaultProg1 = {
    slug: 'program-01',
    badge: 'PROGRAM 01',
    title: 'Innovation & Design Thinking Masterclass',
    description:
      'Design thinking for innovation, 12 steps from ideation to launching real world challenges.',
    highlights: [
      'Innovation Mindset & Vision Building',
      'Design Thinking',
      'Rapid Prototyping',
      'Idea Pitching & Feedback',
    ],
    duration: '1 Month',
    fee: 'LKR 15,000 per month',
  };

  const defaultProg2 = {
    slug: 'program-02',
    badge: 'PROGRAM 02',
    title: 'Pre-Incubation Program on Startup Innovation',
    description:
      'Comprehensive venture formation, seed validation, unit economics, and investment readiness.',
    highlights: [
      'Ideation & Problem Discovery',
      'Design Thinking & Business Model Canvas',
      'Proof of Concept & Rapid Prototyping',
      'Go-To-Market Strategy',
      'Pitch Deck Development & Investment Readiness',
    ],
    duration: '3 Months',
    fee: 'LKR 5,000 Registration Fee + LKR 15,000 per month',
  };

  const displayPrograms =
    programs && programs.length > 0
      ? programs
      : [defaultProg1, defaultProg2];

  const handleEnrollClick = (prog) => {
    setSelectedProgram(prog);
    setRegSuccess('');
    setRegError('');
    setModalOpen(true);
  };

  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegSuccess('');
    setRegError('');

    try {
      const res = await registrationService.registerProgram({
        programSlug: selectedProgram.slug,
        ...formData,
      });
      if (res.success) {
        setRegSuccess(
          `Enrollment confirmed! Reference No: ${res.referenceNumber}. You now have automatic access to all workshops in this program.`
        );
      }
    } catch (err) {
      setRegError(
        err.response?.data?.message || 'Failed to complete registration. Please log in or try again.'
      );
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <section id="programs" className="py-14 sm:py-20 bg-[#faf8ff] border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#e8f1fd] text-xs font-extrabold uppercase tracking-wider text-[#006398] mb-3">
            STRUCTURED LEARNING PATHS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B192C] tracking-tight">
           Innovation Programs
          </h2>
          <p className="text-xs sm:text-base text-slate-600 mt-2">
            Directly aligned with Sri Lanka's growing deep-tech and startup ecosystems.
          </p>
        </div>

        {/* Dynamic Program Cards */}
        <div
          className={`grid grid-cols-1 ${displayPrograms.length === 1
              ? 'max-w-xl mx-auto'
              : displayPrograms.length === 2
                ? 'lg:grid-cols-2 max-w-6xl mx-auto'
                : 'md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'
            } gap-8 items-stretch`}
        >
          {displayPrograms.map((prog, idx) => {
            const isSecond = idx === 1;
            const Icon = idx === 0 ? Brain : idx === 1 ? Rocket : Award;
            const FooterIcon = isSecond ? ShieldCheck : Sparkles;
            const footerText = isSecond
              ? 'VC Investor Demo Day Included'
              : 'TRACE Certificate Awarded';

            const isProg1 = prog.slug === 'program-01' || idx === 0;
            const programDuration = isProg1 ? '1 Month' : '3 Months';

            const defaultHighlights = isProg1
              ? [
                'Innovation Mindset & Vision Building',
                'Design Thinking',
                'Rapid Prototyping',
                'Idea Pitching & Feedback',
              ]
              : [
                'Ideation & Problem Discovery',
                'Design Thinking & Business Model Canvas',
                'Proof of Concept & Rapid Prototyping',
                'Go-To-Market Strategy',
                'Pitch Deck Development & Investment Readiness',
              ];

            const programHighlights =
              Array.isArray(prog.highlights) && prog.highlights.length > 0
                ? prog.highlights
                : defaultHighlights;

            return (
              <div
                key={prog._id || prog.slug || idx}
                className="rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Top Navy/Blue Gradient Header with Glowing Icon & Cover Image */}
                <div
                  className="relative p-8 text-white overflow-hidden text-center flex flex-col items-center bg-cover bg-center"
                  style={
                    prog.coverImage
                      ? {
                        backgroundImage: `linear-gradient(to bottom, rgba(0, 30, 60, 0.65), rgba(0, 20, 45, 0.88)), url(${prog.coverImage})`,
                      }
                      : {
                        background: 'linear-gradient(to bottom right, #006398, #004e78, #003857)',
                      }
                  }
                >
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>

                  <div className="w-full flex items-center justify-end text-xs mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs text-[#cce5ff] font-bold">
                      {programDuration}
                    </span>
                  </div>

                  {/* Glowing Icon in Center */}
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner my-2">
                    <Icon className="w-8 h-8 text-[#5bb8fe]" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug mt-3 max-w-sm">
                    {prog.title}
                  </h3>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-[#006398] block mb-4">
                        CURRICULUM HIGHLIGHTS
                      </span>
                      <ul className="space-y-3 text-xs sm:text-sm text-[#1e293b]">
                        {programHighlights.map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full bg-[#e8f1fd] flex items-center justify-center text-[#006398] shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Programme Investment & Duration (Clean, Modern Minimalist Design) */}
                    <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Programme Fee
                        </span>
                        {isProg1 ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-[#0B192C] tracking-tight">
                              LKR 15,000
                            </span>
                            <span className="text-xs font-semibold text-slate-500">/ month</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-black text-[#0B192C] tracking-tight">
                                LKR 15,000
                              </span>
                              <span className="text-xs font-semibold text-slate-500">/ month</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                              + LKR 5,000 one-time registration
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/60">
                          <Clock className="w-3.5 h-3.5 text-[#006398]" />
                          <span>{programDuration}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="pt-5 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <FooterIcon className="w-4 h-4 text-[#006398]" />
                      <span>{footerText}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        to={`/programs/${prog.slug}`}
                        className="py-2.5 px-3.5 rounded-lg border border-slate-300 hover:border-[#006398] text-slate-700 hover:text-[#006398] text-xs font-bold uppercase tracking-wider text-center transition-colors"
                      >
                        Explore
                      </Link>
                      <Link
                        to={`/programs/${prog.slug}#register`}
                        className="flex-1 sm:flex-none py-2.5 px-6 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Registration Modal */}
      {modalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#006398] bg-[#e8f1fd] px-2.5 py-0.5 rounded-full">
                PROGRAM ENROLLMENT
              </span>
              <h3 className="text-xl font-bold text-[#0B192C] mt-2">
                Join {selectedProgram.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enrolling grants you automatic access to all workshops in this program.
              </p>
            </div>

            {regSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm space-y-4">
                <p className="font-semibold">{regSuccess}</p>
                <Link
                  to="/participant/workshops"
                  className="block w-full py-2.5 rounded-lg bg-[#006398] text-white text-xs font-bold text-center uppercase tracking-wider"
                >
                  Go to My Workshops
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnrollment} className="space-y-4">
                {regError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {regError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavindu Senanayake"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#006398] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kavindu@eng.mrt.ac.lk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#006398] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+94 77 123 4567"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#006398] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    University / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. University of Moratuwa / Tech Startup"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#006398] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {regLoading ? 'Confirming Enrollment...' : 'Submit Program Enrollment'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
