import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { programService } from '../services/api';
import { Brain, Rocket, ArrowRight, CheckCircle2, Calendar, Award, Clock } from 'lucide-react';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState(() => {
    try {
      const cached = localStorage.getItem('trace_cached_programs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('trace_cached_programs');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await programService.getPrograms();
        if (res.success && res.data) {
          setPrograms(res.data);
          try {
            localStorage.setItem('trace_cached_programs', JSON.stringify(res.data));
          } catch { }
        }
      } catch (err) {
        console.warn('Failed to fetch programs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      <Navbar />

      <main className="flex-1 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-[#eaedff] text-xs font-bold uppercase tracking-wider text-[#006398] mb-3 inline-block">
              TRACE ACADEMIC CATALOG
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight">
              Our Programs
            </h1>
            <p className="text-base text-[#44474c] mt-3">
              Explore our structured learning tracks engineered in partnership with top industry leaders,
              fostering design thinking and deep-tech startup creation.
            </p>
          </div>

          {/* Programs Grid */}
          <div
            className={`grid grid-cols-1 ${programs.length === 1
              ? 'max-w-xl mx-auto'
              : programs.length === 2
                ? 'lg:grid-cols-2 max-w-6xl mx-auto'
                : 'md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'
              } gap-10`}
          >
            {programs.map((prog, idx) => {
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
                  key={prog._id || idx}
                  className="rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div
                    className="p-7 text-white bg-cover bg-center relative overflow-hidden"
                    style={
                      prog.coverImage
                        ? {
                          backgroundImage: `linear-gradient(to right, rgba(0, 30, 60, 0.75), rgba(0, 15, 40, 0.88)), url(${prog.coverImage})`,
                        }
                        : isProg1
                          ? { background: 'linear-gradient(to right, #006398, #00476e)' }
                          : { background: 'linear-gradient(to right, #0B192C, #0e1c2f)' }
                    }
                  >
                    <div className="flex items-center justify-end mb-4">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs text-[#cce5ff] font-bold">
                        {programDuration}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                        {isProg1 ? (
                          <Brain className="w-7 h-7 text-[#5bb8fe]" />
                        ) : (
                          <Rocket className="w-7 h-7 text-[#5bb8fe]" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{prog.title}</h2>
                        <span className="text-xs text-[#cce5ff] block mt-1">
                          TRACE Expert City • Bay 07
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-7 flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-6">
                      <p className="text-sm text-[#44474c] leading-relaxed">
                        {prog.description}
                      </p>

                      <div className="space-y-2">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#006398] block mb-2">
                          Core Focus Areas:
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-[#131b2e]">
                          {programHighlights.map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-[#006398] shrink-0 mt-0.5" />
                              <span>{h}</span>
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

                    <div className="pt-6 border-t border-[#e2e8f0] flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs text-[#44474c]">
                        <span className="flex items-center gap-1 font-semibold text-[#006398]">
                          <Award className="w-4 h-4" />
                          {isProg1 ? 'TRACE Certification' : 'Venture Endorsement'}
                        </span>
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {prog.cohort || 'Admissions Open'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Link
                          to={`/programs/${prog.slug}`}
                          className="py-3 px-4 rounded-lg border border-[#cbd5e1] hover:border-[#006398] hover:bg-[#f2f3ff] text-[#0B192C] font-bold text-xs uppercase tracking-wide text-center transition-colors"
                        >
                          View Curriculum
                        </Link>
                        <Link
                          to={`/programs/${prog.slug}#register`}
                          className="py-3 px-4 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wide text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Enroll Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

