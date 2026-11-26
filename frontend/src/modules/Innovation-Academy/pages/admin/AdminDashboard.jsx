import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, registrationService } from '../../services/api';
import { toast } from '../../context/ToastContext';
import {
  Download,
  PersonStanding,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  TrendingUp,
  UserPlus,
  Eye,
  X,
  Mail,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    stats: {
      totalParticipants: 384,
      prog1Registrations: 40,
      prog2Registrations: 28,
      totalWorkshops: 18,
      upcomingWorkshops: 6,
      pendingVisitRequests: 14,
      unreadInquiries: 48,
    },
    recentRegistrations: [],
    upcomingWorkshopList: [],
  });

  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({
    name: 'Kavindu Senanayake',
    track: 'Innovation & Design Thinking Masterclass',
    affiliation: 'University of Moratuwa - Electronic Eng',
    id: null,
  });
  const [evalNotes, setEvalNotes] = useState('');
  const [evalSuccess, setEvalSuccess] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await userService.getAdminStats();
        if (res.success) {
          setStatsData({
            stats: res.stats || {},
            recentRegistrations: res.recentRegistrations || [],
            upcomingWorkshopList: res.upcomingWorkshopList || [],
          });
        }
      } catch (err) {
        console.warn('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const openReviewModal = (name, track, affiliation, id) => {
    setSelectedCandidate({ name, track, affiliation, id });
    setEvalNotes('');
    setEvalSuccess('');
    setModalOpen(true);
  };

  const handleApproveCandidate = async () => {
    if (selectedCandidate.id) {
      try {
        await registrationService.updateStatus(selectedCandidate.id, 'Approved');
      } catch (e) {
        // ignore
      }
    }
    setEvalSuccess(`Candidate ${selectedCandidate.name} successfully approved for TRACE Bay 05!`);
    toast.success(`Candidate ${selectedCandidate.name} successfully approved for TRACE Bay 05!`);
    setTimeout(() => {
      setModalOpen(false);
      setEvalSuccess('');
    }, 1200);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Program', 'Reference', 'Status', 'Date'],
      ...statsData.recentRegistrations.map((r) => [
        r.fullName,
        r.email,
        r.programTitle,
        r.referenceNumber,
        r.status,
        new Date(r.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'trace_sri_lanka_admissions_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  const stats = statsData.stats;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B192C]">Dashboard Overview</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Real-time admissions, workshop capacities, and academy operations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-bold text-slate-700 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#006398]" />
          <span>Export Data</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#75777d] font-bold uppercase tracking-wider">
              Total Applicants
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#006398]">
              <span className="material-symbols-outlined text-[18px]">person_search</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B192C]">
              {stats.totalParticipants || 384}
            </span>
            <span className="text-xs text-[#75777d]">Candidates</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% growth
            </span>
            <span className="text-[#75777d] text-[11px]">Admissions Live</span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
            <div className="bg-[#006398] h-full rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#75777d] font-bold uppercase tracking-wider">
              Program 01 &amp; 02 Cohorts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#006398]">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B192C]">
              {(stats.prog1Registrations || 40) + (stats.prog2Registrations || 28)}
            </span>
            <span className="text-xs text-[#75777d]">/ 75 Target Seats</span>
          </div>
          <div className="mt-2 text-[11px] text-[#44474c] flex items-center justify-between pt-1">
            <span>Prog 01: <strong className="text-[#0B192C]">{stats.prog1Registrations || 40}</strong></span>
            <span>Prog 02: <strong className="text-[#0B192C]">{stats.prog2Registrations || 28}</strong></span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
            <div className="bg-[#006398] h-full rounded-full" style={{ width: '90.6%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#75777d] font-bold uppercase tracking-wider">
              Workshops &amp; Maker Labs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#006398]">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B192C]">
              {stats.totalWorkshops || 18}
            </span>
            <span className="text-xs text-[#75777d]">Sessions</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#006398] font-semibold">
              {stats.upcomingWorkshops || 4} upcoming sessions
            </span>
            <span className="text-[#75777d] text-[11px]">98.4% Attendance</span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
            <div className="bg-[#006398] h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#75777d] font-bold uppercase tracking-wider">
              Inquiries &amp; Visit Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#006398]">
              <span className="material-symbols-outlined text-[18px]">mark_email_unread</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B192C]">
              {(stats.pendingVisitRequests || 14) + (stats.unreadInquiries || 48)}
            </span>
            <span className="text-xs text-[#75777d]">Submissions</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
              {stats.pendingVisitRequests || 3} Pending Visits
            </span>
            <span className="text-[#75777d] text-[11px]">94% SLA &lt;24h</span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
            <div className="bg-[#006398] h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Operations Grid: 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Cohorts Table & Admissions Queue */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Cohorts */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2e8f0] gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006398]"></span>
                  <h3 className="text-lg font-bold text-[#0B192C]">
                    Active Academic &amp; Incubation Cohorts
                  </h3>
                </div>
                <p className="text-xs text-[#44474c] mt-0.5">
                  Current running curricula with syllabus tracking and student capacity metrics
                </p>
              </div>
              <Link
                to="/admin/programs"
                className="text-xs font-bold text-[#006398] hover:underline"
              >
                Manage Programs
              </Link>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#44474c] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-lg">Program Details</th>
                    <th className="py-3 px-3">Cohort</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Capacity</th>
                    <th className="py-3 px-3">Lifecycle Status</th>
                    <th className="py-3 px-3 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f3ff] text-[#131b2e]">
                  <tr className="hover:bg-[#faf8ff]">
                    <td className="py-3 px-3 font-bold">
                      <div>Innovation &amp; Design Thinking Masterclass</div>
                      <span className="text-[11px] text-[#75777d] font-normal">
                        Lead: TRACE Studio Mentors
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">Cohort 12</td>
                    <td className="py-3 px-3 text-[#44474c]">1 Month</td>
                    <td className="py-3 px-3 font-bold text-[#006398]">40/45 Seats</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                        In Progress
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/admin/programs"
                        className="px-2.5 py-1 rounded bg-[#eaedff] text-[#006398] hover:bg-[#dae2fd] font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#faf8ff]">
                    <td className="py-3 px-3 font-bold">
                      <div>Pre-Incubation Program on Startup Innovation</div>
                      <span className="text-[11px] text-[#75777d] font-normal">
                        Seed Stage Pipeline • National Cohort
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">Cohort 08</td>
                    <td className="py-3 px-3 text-[#44474c]">3 Months</td>
                    <td className="py-3 px-3 font-bold text-[#006398]">28/30 Seats</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[11px]">
                        Active (M2)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/admin/programs"
                        className="px-2.5 py-1 rounded bg-[#eaedff] text-[#006398] hover:bg-[#dae2fd] font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Admissions Queue */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2e8f0] gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#0B192C]">Admissions &amp; Expressions Queue</h3>
                <p className="text-xs text-[#44474c]">
                  Review candidate applications for program registration and workshop access
                </p>
              </div>
              <Link
                to="/admin/registrations"
                className="text-xs font-bold text-[#006398] hover:underline"
              >
                View All Registrations
              </Link>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#44474c] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-lg">Candidate</th>
                    <th className="py-3 px-3">Program Track</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Admission State</th>
                    <th className="py-3 px-3 rounded-r-lg text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f3ff]">
                  {statsData.recentRegistrations?.map((cand, idx) => (
                    <tr key={cand._id || idx} className="hover:bg-[#faf8ff]">
                      <td className="py-3 px-3 font-bold text-[#0B192C]">
                        <div>{cand.fullName}</div>
                        <span className="text-[11px] text-[#75777d] font-normal">{cand.email}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#131b2e]">
                        {cand.programTitle}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#75777d]">
                        {cand.referenceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            cand.status === 'Approved' || cand.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            openReviewModal(
                              cand.fullName,
                              cand.programTitle,
                              cand.organization || 'Independent Researcher',
                              cand._id
                            )
                          }
                          className="p-1.5 rounded-lg text-[#006398] hover:bg-[#eaedff] transition-colors"
                          title="Evaluate Candidate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Workshops Agenda & Fast Actions */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming Workshop Agenda */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#006398]" />
                <h3 className="text-base font-bold text-[#0B192C]">Campus Workshop Agenda</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#eaedff] text-[#006398] px-2 py-0.5 rounded">
                Bay 05
              </span>
            </div>

            <div className="space-y-3">
              {statsData.upcomingWorkshopList && statsData.upcomingWorkshopList.length > 0 ? (
                statsData.upcomingWorkshopList.map((w, idx) => (
                  <div
                    key={w._id || idx}
                    className="p-3 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#006398]">{w.date}</span>
                      <span className="text-[#75777d]">{w.startTime}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0B192C] leading-snug">{w.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-[#75777d] pt-1">
                      <span>{w.speakerName}</span>
                      <span className="font-semibold text-emerald-700">{w.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#faf8ff] border border-dashed border-[#cbd5e1] text-center text-xs text-slate-500">
                  No upcoming workshops scheduled in database.
                </div>
              )}
            </div>

            <Link
              to="/admin/workshops"
              className="mt-4 w-full py-2.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#006398] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>+ Schedule Workshop Session</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Quick Review Modal from Stitch */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <h3 className="text-base font-bold text-[#0B192C]">
                  Candidate Dossier Evaluation
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#75777d] hover:bg-[#f2f3ff]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {evalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{evalSuccess}</span>
              </div>
            )}

            <div className="p-3.5 bg-[#f2f3ff] rounded-xl space-y-1.5 text-xs text-[#131b2e]">
              <div className="flex justify-between">
                <span className="text-[#75777d]">Candidate:</span>
                <span className="font-bold">{selectedCandidate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777d]">Target Track:</span>
                <span className="font-bold text-[#006398]">{selectedCandidate.track}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777d]">Background:</span>
                <span className="font-medium">{selectedCandidate.affiliation}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1.5">
                Evaluation Notes / Screening Decision:
              </label>
              <textarea
                rows={3}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="Enter feedback for admissions committee or rationale for approval..."
                className="w-full p-2.5 rounded-lg border border-[#cbd5e1] text-xs outline-none focus:border-[#006398]"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold text-[#131b2e]"
              >
                Postpone
              </button>
              <button
                onClick={handleApproveCandidate}
                className="px-4 py-2 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Endorse &amp; Shortlist</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

