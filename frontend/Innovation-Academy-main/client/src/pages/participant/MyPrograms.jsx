import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationService } from '../../services/api';
import { School, CheckCircle2, ArrowRight, Calendar, Award } from 'lucide-react';

export default function MyPrograms() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      try {
        const res = await registrationService.getMyRegistrations();
        if (res.success) {
          setRegistrations(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch user registrations:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B192C]">My Joined Programs</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Programs you have registered for at TRACE Innovation Academy.
          </p>
        </div>

        <Link
          to="/programs"
          className="px-4 py-2 rounded-lg bg-[#006398] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#0284c7] transition-colors self-start sm:self-auto"
        >
          Explore All Programs
        </Link>
      </div>

      {registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => {
            const program = reg.programId || {};
            const isProg1 = reg.programSlug === 'program-01';

            return (
              <div
                key={reg._id}
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Program Cover Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#0e1c2f]">
                    <img
                      src={
                        program.coverImage ||
                        (isProg1
                          ? 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
                          : 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80')
                      }
                      alt={reg.programTitle}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-[#006398] text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                        {reg.programSlug?.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-sm">
                        Status: {reg.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-sm leading-tight">
                        {reg.programTitle}
                      </h3>
                      <span className="text-[11px] text-[#cce5ff] font-mono mt-0.5 block">
                        Reference Number: {reg.referenceNumber}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-[#44474c] leading-relaxed line-clamp-3">
                      {program.description ||
                        'Comprehensive academy track covering design thinking sprints, hardware benchmarking, and startup formation.'}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#e2e8f0] text-xs text-[#131b2e]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#75777d]">Registration Date:</span>
                        <span className="font-semibold">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#75777d]">Workshop Access:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fully Unlocked</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#75777d]">Affiliation:</span>
                        <span className="font-semibold">{reg.organization || 'Independent'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to={`/programs/${reg.programSlug}`}
                      className="py-2.5 px-3 rounded-lg border border-[#cbd5e1] hover:border-[#006398] text-[#0B192C] font-bold text-xs uppercase tracking-wider text-center transition-colors"
                    >
                      View Program
                    </Link>
                    <Link
                      to="/participant/workshops"
                      className="py-2.5 px-3 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <span>All Workshops</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center max-w-xl mx-auto shadow-sm">
          <School className="w-12 h-12 text-[#75777d] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0B192C]">No Program Registrations Yet</h3>
          <p className="text-xs text-[#44474c] mt-1.5 mb-6">
            Register for Program 01 (Innovation &amp; Design Thinking Masterclass) or Program 02
            (Pre-Incubation Program on Startup Innovation) to get automatic admission to all workshops.
          </p>
          <Link
            to="/programs"
            className="px-6 py-2.5 rounded-lg bg-[#006398] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            Browse Programs Catalog
          </Link>
        </div>
      )}
    </div>
  );
}

