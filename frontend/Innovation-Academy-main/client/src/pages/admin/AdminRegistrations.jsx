import React, { useState, useEffect } from 'react';
import { registrationService, programService } from '../../services/api';
import { toast } from '../../context/ToastContext';
import {
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedProgram, selectedStatus]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedProgram !== 'all') params.programSlug = selectedProgram;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;

      const [regRes, progRes] = await Promise.all([
        registrationService.getAllRegistrations(params),
        programService.getPrograms(),
      ]);

      if (regRes.success) setRegistrations(regRes.data);
      if (progRes.success) setPrograms(progRes.data);
    } catch (err) {
      console.warn('Failed to load registrations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await registrationService.updateStatus(id, newStatus);
      if (res.success) {
        toast.success(`Registration status changed to "${newStatus}"`);
        setRegistrations(
          registrations.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update registration status');
    }
  };

  const handleDeleteRegistration = async (id) => {
    try {
      const res = await registrationService.deleteRegistration(id);
      if (res.success) {
        toast.success('Registration record deleted successfully');
        setRegistrations((prev) =>
          prev.filter((r) => r._id !== id && r.id !== id && r.referenceNumber !== id)
        );
        setDeleteConfirmId(null);
      } else {
        toast.error(res.message || 'Failed to delete registration');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete registration');
    }
  };

  const handleExportCSV = () => {
    const rows = [
      [
        'Reference Number',
        'Candidate Name',
        'Email',
        'Phone',
        'Organization',
        'Program',
        'Status',
        'Registration Date',
      ],
      ...registrations.map((r) => [
        r.referenceNumber,
        r.fullName,
        r.email,
        r.phoneNumber,
        r.organization || 'Independent',
        r.programTitle,
        r.status,
        new Date(r.createdAt).toLocaleString(),
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'trace_sri_lanka_program_registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.fullName?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.referenceNumber?.toLowerCase().includes(term) ||
      r.organization?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B192C]">Program Registrations</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Review admissions and approve access to program workshops and Bay 05 facilities.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Roster (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, email, ref number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none bg-white font-semibold text-[#131b2e]"
          >
            <option value="all">All Programs</option>
            <option value="program-01">Program 01: Innovation Masterclass</option>
            <option value="program-02">Program 02: Pre-Incubation Track</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none bg-white font-semibold text-[#131b2e]"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#44474c] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
                <th className="py-3.5 px-4">Candidate Profile</th>
                <th className="py-3.5 px-4">Program Track</th>
                <th className="py-3.5 px-3">Reference No</th>
                <th className="py-3.5 px-3">Organization</th>
                <th className="py-3.5 px-3">Admission State</th>
                <th className="py-3.5 px-4 text-right">Admissions Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f3ff] text-[#131b2e]">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((r) => (
                  <tr key={r._id} className="hover:bg-[#faf8ff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#006398] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {r.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-[#0B192C] block">{r.fullName}</span>
                          <span className="text-[11px] text-[#75777d]">{r.email}</span>
                          {r.phoneNumber && (
                            <span className="text-[10px] text-[#75777d] block">{r.phoneNumber}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#006398] block">{r.programTitle}</span>
                      <span className="text-[10px] text-[#75777d] uppercase tracking-wider font-bold">
                        {r.programSlug?.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-[11px] text-[#131b2e]">
                      {r.referenceNumber}
                    </td>

                    <td className="py-3.5 px-3 text-[#44474c]">
                      {r.organization || 'Independent'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          r.status === 'Approved' || r.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'Approved' || r.status === 'Active'
                              ? 'bg-emerald-600'
                              : r.status === 'Pending'
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                        ></span>
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'Approved' && r.status !== 'Active' ? (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'Approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'Pending')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors"
                          >
                            Suspend
                          </button>
                        )}

                        <button
                          onClick={() => handleStatusUpdate(r._id, 'Rejected')}
                          className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[11px] transition-colors"
                        >
                          Reject
                        </button>

                        {deleteConfirmId === (r._id || r.id || r.referenceNumber) ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteRegistration(r._id || r.id || r.referenceNumber)}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(r._id || r.id || r.referenceNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-xs text-[#75777d]">
                    No program registrations matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

