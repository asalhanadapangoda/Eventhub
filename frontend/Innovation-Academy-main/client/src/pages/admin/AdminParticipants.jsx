import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Award,
  Trash2,
  X,
  AlertCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [roleLoadingId, setRoleLoadingId] = useState(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await userService.getParticipants();
      if (res.success) {
        setParticipants(res.data);
      }
    } catch (err) {
      console.warn('Failed to load participants:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (id) => {
    try {
      const res = await userService.deleteParticipant(id);
      if (res.success) {
        toast.success('User account removed successfully');
        setParticipants((prev) =>
          prev.filter((p) => p._id !== id && p.id !== id && p.email !== id)
        );
        setDeleteConfirmId(null);
      } else {
        toast.error(res.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Grant or Revoke Admin access
  const handleRoleChange = async (userId, newRole) => {
    setRoleLoadingId(userId);
    try {
      const res = await userService.updateParticipantRole(userId, newRole);
      if (res.success) {
        toast.success(res.message);
        setParticipants((prev) =>
          prev.map((p) =>
            p._id === userId || p.id === userId
              ? { ...p, role: newRole }
              : p
          )
        );
      } else {
        toast.error(res.message || 'Failed to update user role');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setRoleLoadingId(null);
    }
  };

  const filtered = participants.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.organization?.toLowerCase().includes(term) ||
      p.role?.toLowerCase().includes(term)
    );
  });

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
          <h2 className="text-2xl font-bold text-[#0B192C]">Users &amp; Innovators Roster</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Registered students, founders, engineers, and administrators inside the TRACE Sri Lanka network.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, university, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
          />
        </div>
        <span className="text-xs font-bold text-[#75777d]">
          Total Accounts: {participants.length}
        </span>
      </div>

      {/* Participants & Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const userId = p._id || p.id;
          const isSuperAdmin = p.email === 'admin@trace.lk';
          const isAdmin = p.role === 'admin';

          return (
            <div
              key={userId}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${
                isAdmin ? 'border-purple-200 ring-1 ring-purple-100' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="space-y-3">
                {/* Header with Avatar, Name, Email, and Role Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 ${
                        isAdmin ? 'bg-purple-700' : 'bg-[#006398]'
                      }`}
                    >
                      {p.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#0B192C] truncate">{p.name}</h3>
                      <span className="text-[11px] text-[#75777d] truncate block">{p.email}</span>
                    </div>
                  </div>

                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-purple-700" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      Participant
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-[#44474c] pt-2 border-t border-[#e2e8f0]">
                  {p.organization && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#006398] shrink-0" />
                      <span className="truncate">{p.organization}</span>
                    </div>
                  )}
                  {p.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#006398] shrink-0" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                </div>

                {/* Enrolled programs list */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#75777d] block mb-1">
                    Enrolled Tracks ({p.enrolledCount || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.registrations?.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eaedff] text-[#006398]"
                      >
                        {r.programTitle?.includes('Masterclass')
                          ? 'Masterclass'
                          : 'Pre-Incubation'}
                      </span>
                    ))}
                    {(!p.registrations || p.registrations.length === 0) && (
                      <span className="text-[11px] text-[#75777d] italic">None enrolled yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#75777d]">
                <span>Joined: {new Date(p.createdAt).toLocaleDateString()}</span>

                <div className="flex items-center gap-2">
                  {/* Give / Revoke Admin Access Button */}
                  {isSuperAdmin ? (
                    <span className="text-[10px] font-bold text-slate-400 italic">Super Admin</span>
                  ) : isAdmin ? (
                    <button
                      type="button"
                      disabled={roleLoadingId === userId}
                      onClick={() => handleRoleChange(userId, 'participant')}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Revoke Admin access (set as participant)"
                    >
                      <UserCheck className="w-3 h-3 text-slate-600" />
                      <span>Revoke Admin</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={roleLoadingId === userId}
                      onClick={() => handleRoleChange(userId, 'admin')}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#eaedff] hover:bg-[#dae2fd] text-[#006398] border border-[#006398]/30 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                      title="Grant Administrator privileges to this user"
                    >
                      <ShieldCheck className="w-3 h-3 text-[#006398]" />
                      <span>Give Admin</span>
                    </button>
                  )}

                  {/* Delete button (only for non-superadmin) */}
                  {!isSuperAdmin && (
                    deleteConfirmId === userId ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteParticipant(userId)}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(userId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
