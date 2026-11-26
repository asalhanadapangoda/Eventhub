import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { workshopService, programService } from '../services/api';
import { formatImageUrl, handleImageError } from '../utils/imageUrl';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState(() => {
    try {
      const cached = localStorage.getItem('trace_cached_workshops');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

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
      return !localStorage.getItem('trace_cached_workshops');
    } catch {
      return true;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, pRes] = await Promise.allSettled([
          workshopService.getWorkshops(),
          programService.getPrograms(),
        ]);

        if (wRes.status === 'fulfilled' && wRes.value?.data && Array.isArray(wRes.value.data)) {
          setWorkshops(wRes.value.data);
          try {
            localStorage.setItem('trace_cached_workshops', JSON.stringify(wRes.value.data));
          } catch {}
        } else {
          setWorkshops([]);
        }

        if (pRes.status === 'fulfilled' && pRes.value?.data && Array.isArray(pRes.value.data)) {
          setPrograms(pRes.value.data);
          try {
            localStorage.setItem('trace_cached_programs', JSON.stringify(pRes.value.data));
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to load workshops:', err.message);
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredWorkshops = workshops.filter((w) => {
    // Search query match
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = w.title?.toLowerCase().includes(query);
    const descMatch = w.description?.toLowerCase().includes(query);
    const speakerMatch = w.speakerName?.toLowerCase().includes(query);
    const topicMatch = w.topicsCovered?.some((t) => t.toLowerCase().includes(query));
    const matchesSearch = !query || titleMatch || descMatch || speakerMatch || topicMatch;

    // Program track match
    const pSlug = w.programSlug || w.programId?.slug;
    const pId = w.programId?._id || w.programId;
    const matchesProgram =
      selectedProgram === 'all' ||
      pSlug === selectedProgram ||
      pId === selectedProgram ||
      (selectedProgram === 'program-01' && (pSlug === 'program-01' || w.programTitle?.includes('Design Thinking'))) ||
      (selectedProgram === 'program-02' && (pSlug === 'program-02' || w.programTitle?.includes('Pre-Incubation')));

    // Format match
    const matchesFormat =
      selectedFormat === 'all' ||
      (selectedFormat === 'online' && w.isOnline) ||
      (selectedFormat === 'physical' && !w.isOnline);

    return matchesSearch && matchesProgram && matchesFormat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3.5 py-1 rounded-full bg-[#eaedff] text-xs font-black uppercase tracking-wider text-[#006398] mb-3 inline-block">
              TRACE WORKSHOPS
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight">
              Innovation Workshops & Masterclasses
            </h1>
            <p className="text-sm sm:text-base text-[#44474c] mt-3">
              Hands-on innovation masterclasses and workshops at TRACE Expert City.
            </p>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4 sm:p-6 mb-10">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search workshops by topic, keyword, or speaker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006398]/30 focus:border-[#006398] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Program Track Tabs - Swipeable on mobile */}
              <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-xl overflow-x-auto max-w-full pb-1 scrollbar-none sm:flex-wrap">
                <button
                  onClick={() => setSelectedProgram('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedProgram === 'all'
                      ? 'bg-white text-[#006398] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  All ({workshops.length})
                </button>
                {programs.length > 0 ? (
                  programs.map((p) => {
                    const count = workshops.filter((w) => {
                      const pSlug = w.programSlug || w.programId?.slug;
                      const pId = w.programId?._id || w.programId;
                      return (
                        pSlug === p.slug ||
                        pId === p._id ||
                        pId === p.id ||
                        (p.slug === 'program-01' && w.programTitle?.includes('Design Thinking')) ||
                        (p.slug === 'program-02' && w.programTitle?.includes('Pre-Incubation'))
                      );
                    }).length;

                    return (
                      <button
                        key={p._id || p.slug}
                        onClick={() => setSelectedProgram(p.slug)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                          selectedProgram === p.slug
                            ? 'bg-white text-[#006398] shadow-sm'
                            : 'text-slate-600 hover:text-[#0B192C]'
                        }`}
                      >
                        {p.badge || p.title}: {p.title.length > 20 ? p.title.slice(0, 18) + '...' : p.title} ({count})
                      </button>
                    );
                  })
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedProgram('program-01')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedProgram === 'program-01'
                          ? 'bg-white text-[#006398] shadow-sm'
                          : 'text-slate-600 hover:text-[#0B192C]'
                      }`}
                    >
                      Program 01: Design Thinking (3)
                    </button>
                    <button
                      onClick={() => setSelectedProgram('program-02')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedProgram === 'program-02'
                          ? 'bg-white text-[#006398] shadow-sm'
                          : 'text-slate-600 hover:text-[#0B192C]'
                      }`}
                    >
                      Program 02: Pre-Incubation (3)
                    </button>
                  </>
                )}
              </div>

              {/* Format Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#006398]/30"
                >
                  <option value="all">All Formats</option>
                  <option value="physical">Physical (Bay 05 Labs)</option>
                  <option value="online">Online / Virtual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workshops Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-[#44474c]">Loading TRACE Workshops...</span>
            </div>
          ) : workshops.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#0B192C]">No Workshops Scheduled</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are currently no active workshops published. When administrators create and publish upcoming workshop sessions in the database, they will appear here.
              </p>
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#0B192C]">No workshops match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Try searching with different keywords or reset your filters to see all available workshops.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProgram('all');
                  setSelectedFormat('all');
                }}
                className="px-4 py-2 rounded-lg bg-[#006398] text-white text-xs font-bold hover:bg-[#0284c7] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((w, idx) => {
                const isProg1 =
                  w.programSlug === 'program-01' || w.programTitle?.includes('Design Thinking');
                const pSlug = w.programSlug || w.programId?.slug || (isProg1 ? 'program-01' : 'program-02');
                const pBadge =
                  w.programTitle ||
                  w.programId?.badge ||
                  w.programId?.title ||
                  (isProg1 ? 'PROGRAM 01' : 'PROGRAM 02');

                return (
                  <div
                    key={w._id || idx}
                    className="rounded-2xl bg-white border border-[#e2e8f0] p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#cbd5e1] transition-all duration-300 group overflow-hidden"
                  >
                    <div>
                      {/* Cover Image if uploaded - Flush edge-to-edge complete flyer */}
                      {w.coverImage && (
                        <Link
                          to={`/programs/${pSlug}/workshops/${w.slug || w._id}`}
                          className="block -mt-6 -mx-6 mb-5 overflow-hidden rounded-t-2xl border-b border-slate-100 bg-white"
                        >
                          <img
                            src={formatImageUrl(w.coverImage)}
                            alt={w.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto block object-contain group-hover:scale-[1.01] transition-transform duration-300"
                            onError={handleImageError}
                          />
                        </Link>
                      )}

                      {/* Top Header: Parent Program Badge & Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-100/70 text-[#00476e] border border-blue-200/60 max-w-[190px] truncate"
                          title={pBadge}
                        >
                          {pBadge}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {w.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/70 whitespace-nowrap">
                              <Video className="w-3 h-3" />
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              {w.venue ? w.venue.split(',')[0].trim() : 'Bay 05'}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">
                            {w.badgeExtra || w.status || 'Upcoming'}
                          </span>
                        </div>
                      </div>

                      {/* Workshop Title */}
                      <Link
                        to={`/programs/${pSlug}/workshops/${w.slug || w._id}`}
                        className="block group-hover:text-[#006398] transition-colors"
                      >
                        <h3 className="text-lg font-bold text-[#0B192C] leading-snug line-clamp-2">
                          {w.title}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="text-xs text-[#44474c] leading-relaxed line-clamp-3 my-3 whitespace-pre-line">
                        {w.description}
                      </p>

                      {/* Structured Details: Date, Time, Venue, Facilitator */}
                      <div className="mt-4 pt-3.5 border-t border-slate-200/80 space-y-2 text-xs">
                        {/* Date & Time Row */}
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <div className="w-6 h-6 rounded-md bg-blue-50 text-[#006398] flex items-center justify-center shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-bold text-slate-900">{w.date}</span>
                            {(w.startTime || w.endTime) && (
                              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#006398] shrink-0" />
                                <span>{w.startTime}{w.endTime ? ` – ${w.endTime}` : ''}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Venue / Location Row */}
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate font-medium text-slate-700">
                            {w.venue || 'TRACE Expert City, Bay 05, Maradana'}
                          </span>
                        </div>

                        {/* Facilitator / Speaker Row */}
                        {w.speakerName && (
                          <div className="flex items-center gap-2.5 text-slate-600">
                            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">
                              <span className="text-slate-400 text-[11px] mr-1">Facilitator:</span>
                              <span className="font-semibold text-slate-800">{w.speakerName}</span>
                              {w.speakerDescription && (
                                <span className="text-slate-400 text-[11px] ml-1">({w.speakerDescription})</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Topics pills */}
                      {w.topicsCovered && w.topicsCovered.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {w.topicsCovered.slice(0, 3).map((topic, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-[#f1f5f9] text-[10px] font-medium text-slate-600"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        {w.capacity ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Only {w.capacity} Seats Available
                          </span>
                        ) : (
                          <Link
                            to={`/programs/${w.programSlug || (isProg1 ? 'program-01' : 'program-02')}`}
                            className="text-[11px] font-bold text-slate-500 hover:text-[#0B192C] transition-colors"
                          >
                            Parent Program
                          </Link>
                        )}
                      </div>

                      <Link
                        to={`/programs/${w.programSlug || (isProg1 ? 'program-01' : 'program-02')}/workshops/${w.slug}`}
                        className="px-4 py-2 rounded-xl bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 group-hover:gap-2 shrink-0"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

