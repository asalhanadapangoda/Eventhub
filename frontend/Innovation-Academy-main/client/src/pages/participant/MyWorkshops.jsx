import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { formatImageUrl, handleImageError } from '../../utils/imageUrl';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function MyWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await userService.getParticipantOverview();
        if (res.success && res.data) {
          setWorkshops(res.data.availableWorkshops || []);
          setEnrolledPrograms(res.data.enrolledPrograms || []);
        }
      } catch (err) {
        console.warn('Failed to load participant workshops:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredWorkshops = workshops.filter((w) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Online') return w.isOnline;
    if (selectedFilter === 'Physical') return !w.isOnline;
    if (selectedFilter === 'Upcoming') return w.status === 'Upcoming';
    if (selectedFilter === 'Completed') return w.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B192C]">My Unlocked Workshops</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Automatic admission granted via your approved program registrations. No individual
            tickets or separate registration required.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Upcoming', 'Online', 'Physical', 'Completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-[#006398] text-white shadow-xs'
                  : 'bg-white border border-[#cbd5e1] text-[#44474c] hover:bg-[#eaedff]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Info notice about automatic access */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Showing all <strong>{workshops.length}</strong> workshops associated with your enrolled
            programs ({enrolledPrograms.map((p) => p.programSlug?.toUpperCase()).join(', ')}).
            Any new workshop scheduled by TRACE administrators appears here automatically.
          </span>
        </div>
      </div>

      {filteredWorkshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((w) => {
            const isOnline = w.isOnline;
            const isCompleted = w.status === 'Completed';
            const isOngoing = w.status === 'Ongoing';

            return (
              <div
                key={w._id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-[#cbd5e1] transition-all duration-200 flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {/* Cover Image / Flyer if uploaded - Flush edge-to-edge */}
                  {w.coverImage && (
                    <Link
                      to={`/programs/${w.programSlug}/workshops/${w.slug}`}
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

                  {/* Header: Track Pill & Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-100/70 text-[#00476e] border border-blue-200/60 max-w-[190px] truncate"
                      title={w.programTitle}
                    >
                      {w.programTitle}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
                        {isOnline ? (
                          <>
                            <Video className="w-3 h-3 text-purple-600" /> Online
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {w.venue ? w.venue.split(',')[0].trim() : 'Bay 05'}
                          </>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          isOngoing
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isCompleted
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {w.status || 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link
                    to={`/programs/${w.programSlug}/workshops/${w.slug}`}
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
                        {isOnline ? 'Online Google Meet' : (w.venue || 'TRACE Expert City, Bay 05, Maradana')}
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
                        </span>
                      </div>
                    )}

                    {/* Physical Note / Additional Instructions if present */}
                    {w.additionalInstructions && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-700 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[#006398] shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong className="text-slate-900 font-bold">Note:</strong> {w.additionalInstructions}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    {isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                        Session Completed
                      </span>
                    ) : isOnline && w.meetingLink ? (
                      <a
                        href={w.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Attendance Unlocked</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/programs/${w.programSlug}/workshops/${w.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm hover:shadow shrink-0"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#75777d] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0B192C]">No Workshops Found</h3>
          <p className="text-xs text-[#44474c] mt-1.5 mb-6">
            {enrolledPrograms.length === 0
              ? 'You have not enrolled in any program yet. Once you join Program 01 or Program 02, workshops appear here automatically.'
              : 'No workshops match the selected filter.'}
          </p>
          {enrolledPrograms.length === 0 && (
            <Link
              to="/programs"
              className="px-6 py-2.5 rounded-lg bg-[#006398] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              Browse Programs
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

