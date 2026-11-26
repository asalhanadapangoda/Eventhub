import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Video, MapPin, Clock, User } from 'lucide-react';
import { formatImageUrl, handleImageError } from '../../utils/imageUrl';

export default function WorkshopsSection({ workshops = [] }) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Strictly enforce: ONLY display if workshops exist in database. If empty, do not display in frontend.
  if (!workshops || !Array.isArray(workshops) || workshops.length === 0) {
    return null;
  }

  // Dynamically extract program filter tabs from the database workshops
  const programTabs = [];
  const seenSlugs = new Set();

  workshops.forEach((w) => {
    const slug =
      w.programSlug ||
      w.programId?.slug ||
      (w.programTitle
        ? w.programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : null);
    const title =
      w.programTitle ||
      w.programId?.title ||
      w.programId?.badge ||
      'Program Track';

    if (slug && !seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      programTabs.push({ slug, title });
    }
  });

  const filteredWorkshops = workshops.filter((w) => {
    if (selectedFilter === 'all') return true;
    const pSlug = w.programSlug || w.programId?.slug;
    return pSlug === selectedFilter;
  });

  return (
    <section id="workshops" className="py-14 sm:py-20 bg-white border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#e8f1fd] text-xs font-extrabold uppercase tracking-wider text-[#006398] mb-3">
              WEEKLY ACTIVITY HUB
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B192C] tracking-tight">
              Upcoming Innovation Workshops
            </h2>
          </div>

          <div className="flex items-center">
            <Link
              to="/workshops"
              className="text-xs font-bold text-[#006398] hover:text-[#0284c7] inline-flex items-center gap-1 transition-colors group"
            >
              <span>Explore All {workshops.length} Workshops Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Tabs - Swipeable on mobile */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-[#006398] text-white shadow-sm'
                : 'bg-[#faf8ff] text-slate-600 border border-slate-200 hover:border-[#006398]'
            }`}
          >
            All Workshops ({workshops.length})
          </button>

          {programTabs.map((tab) => {
            const count = workshops.filter((w) => {
              const pSlug = w.programSlug || w.programId?.slug;
              return pSlug === tab.slug;
            }).length;

            return (
              <button
                key={tab.slug}
                onClick={() => setSelectedFilter(tab.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedFilter === tab.slug
                    ? 'bg-[#006398] text-white shadow-sm'
                    : 'bg-[#faf8ff] text-slate-600 border border-slate-200 hover:border-[#006398]'
                }`}
              >
                {tab.title} ({count})
              </button>
            );
          })}
        </div>

        {/* Workshop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((w, idx) => {
            const pSlug = w.programSlug || w.programId?.slug || 'program-01';
            const pTitle =
              w.programTitle ||
              w.programId?.badge ||
              w.programId?.title ||
              'PROGRAM SESSION';

            return (
              <div
                key={w._id || idx}
                className="rounded-2xl bg-[#faf8ff] border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#cbd5e1] transition-all duration-200 group overflow-hidden"
              >
                <div>
                  {/* Cover Image if uploaded - Flush edge-to-edge complete flyer */}
                  {w.coverImage && (
                    <Link
                      to={`/programs/${pSlug}/workshops/${w.slug || w._id}`}
                      className="block -mt-5 -mx-5 sm:-mt-6 sm:-mx-6 mb-4 overflow-hidden rounded-t-2xl border-b border-slate-100 bg-white"
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

                  {/* Header: Parent Program Badge & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-100/70 text-[#00476e] border border-blue-200/60 max-w-[190px] truncate"
                      title={pTitle}
                    >
                      {pTitle}
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
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 whitespace-nowrap">
                        {w.badgeExtra || w.status || 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  {/* Workshop Title */}
                  <Link
                    to={`/programs/${pSlug}/workshops/${w.slug || w._id}`}
                    className="block group-hover:text-[#006398] transition-colors"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-[#0B192C] leading-snug line-clamp-2 mt-1">
                      {w.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  {w.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2 whitespace-pre-line">
                      {w.description}
                    </p>
                  )}

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
                </div>

                {/* Bottom Footer: Capacity Badge & Details Button */}
                <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    {w.capacity ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Only {w.capacity} Seats Available
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Limited Seats
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/programs/${pSlug}/workshops/${w.slug || w._id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm hover:shadow shrink-0"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
