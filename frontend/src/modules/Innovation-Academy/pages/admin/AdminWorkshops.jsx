import React, { useState, useEffect } from 'react';
import { workshopService, programService, uploadService } from '../../services/api';
import { formatImageUrl, handleImageError } from '../../utils/imageUrl';
import { toast } from '../../context/ToastContext';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Check,
  Upload,
  Loader2,
} from 'lucide-react';

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    programId: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: 'TRACE Expert City, Bay 05, Maradana',
    isOnline: false,
    meetingLink: '',
    speakerName: '',
    speakerDescription: '',
    topicsCovered: '',
    learningOutcomes: '',
    additionalInstructions: '',
    status: 'Upcoming',
    capacity: 45,
    coverImage: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workRes, progRes] = await Promise.all([
        workshopService.getWorkshops(),
        programService.getPrograms(),
      ]);
      if (workRes.success) setWorkshops(workRes.data);
      if (progRes.success) setPrograms(progRes.data);
    } catch (err) {
      console.warn('Failed to load workshops or programs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    setUploadingCover(true);
    setUploadError('');

    try {
      const res = await uploadService.uploadImage(file);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: res.url,
        }));
      } else {
        setUploadError(res.message || 'Image upload failed');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image from computer');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      programId: programs[0]?._id || '',
      description: '',
      date: 'Saturday, July 12, 2025',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      venue: 'TRACE Expert City, Bay 05, Maradana',
      isOnline: false,
      meetingLink: '',
      speakerName: '',
      speakerDescription: '',
      topicsCovered: 'Ideation, Prototyping, Validation',
      learningOutcomes: 'Practical design thinking skills',
      additionalInstructions: 'Bring notebook and laptop.',
      status: 'Upcoming',
      capacity: 45,
      coverImage: '',
    });
    setErrorMsg('');
    setUploadError('');
    setModalOpen(true);
  };

  const openEditModal = (w) => {
    setIsEditing(true);
    setFormData({
      id: w._id,
      title: w.title,
      programId: w.programId?._id || w.programId,
      description: w.description,
      date: w.date,
      startTime: w.startTime,
      endTime: w.endTime,
      venue: w.venue,
      isOnline: Boolean(w.isOnline),
      meetingLink: w.meetingLink || '',
      speakerName: w.speakerName,
      speakerDescription: w.speakerDescription || '',
      topicsCovered: Array.isArray(w.topicsCovered)
        ? w.topicsCovered.join(', ')
        : w.topicsCovered || '',
      learningOutcomes: Array.isArray(w.learningOutcomes)
        ? w.learningOutcomes.join(', ')
        : w.learningOutcomes || '',
      additionalInstructions: w.additionalInstructions || '',
      status: w.status,
      capacity: w.capacity || 45,
      coverImage: w.coverImage || '',
    });
    setErrorMsg('');
    setUploadError('');
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSaveWorkshop = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      if (isEditing) {
        const res = await workshopService.updateWorkshop(formData.id, formData);
        if (res.success) {
          toast.success(`Workshop "${formData.title}" updated successfully!`);
          setModalOpen(false);
          await fetchData();
        } else {
          toast.error(res.message || 'Failed to update workshop');
        }
      } else {
        const res = await workshopService.createWorkshop(formData);
        if (res.success) {
          toast.success(`Workshop "${formData.title}" created successfully!`);
          setModalOpen(false);
          await fetchData();
        } else {
          toast.error(res.message || 'Failed to create workshop');
        }
      }
    } catch (err) {
      console.error('Failed to save workshop:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save workshop');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkshop = async (id) => {
    try {
      const res = await workshopService.deleteWorkshop(id);
      if (res.success) {
        toast.success('Workshop deleted successfully');
        setDeleteConfirmId(null);
        fetchData();
      } else {
        toast.error(res.message || 'Failed to delete workshop');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workshop');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Group workshops by parent program
  const workshopsByProgram = programs.map((prog) => ({
    program: prog,
    items: workshops.filter(
      (w) =>
        (w.programId?._id || w.programId) === prog._id ||
        w.programSlug === prog.slug
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B192C]">Workshop Management</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Workshops are organized under their respective parent programs. Participants enrolled in a
            program gain automatic admission to all its sessions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workshop</span>
        </button>
      </div>

      {/* Grouped by Parent Program */}
      <div className="space-y-10">
        {workshopsByProgram.map(({ program, items }) => (
          <div key={program._id} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#006398]/30">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-[#006398] text-white text-[10px] font-extrabold uppercase tracking-widest">
                  {program.badge || program.slug?.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-[#0B192C]">{program.title}</h3>
              </div>
              <span className="text-xs font-bold text-[#75777d]">
                {items.length} Active Sessions
              </span>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((w) => (
                  <div
                    key={w._id}
                    className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group overflow-hidden"
                  >
                    <div>
                      {w.coverImage && (
                        <div className="w-full -mt-1 mb-3 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-1">
                          <img
                            src={formatImageUrl(w.coverImage)}
                            alt={w.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto max-h-80 object-contain rounded-lg"
                            onError={handleImageError}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.status === 'Ongoing'
                              ? 'bg-amber-100 text-amber-800'
                              : w.status === 'Completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {w.status}
                        </span>
                        <span className="text-xs font-semibold text-[#75777d]">
                          {w.isOnline ? 'Virtual Google Meet' : 'Bay 05 Physical'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#0B192C] leading-snug line-clamp-2">
                        {w.title}
                      </h4>

                      <div className="pt-2 text-xs text-[#44474c] space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#006398]" />
                          <span>{w.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#006398]" />
                          <span>
                            {w.startTime} – {w.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#006398]" />
                          <span className="truncate">{w.speakerName}</span>
                        </div>
                      </div>
                    </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditModal(w)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#006398] font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {deleteConfirmId === (w._id || w.id || w.slug) ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteWorkshop(w._id || w.id || w.slug)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(w._id || w.id || w.slug)}
                          className="p-2 rounded-lg text-[#75777d] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Workshop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#cbd5e1] text-xs text-[#75777d]">
                No workshops added to this program yet. Click "Create Workshop" to add one.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Workshop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header (Fixed at top of modal, never cut off) */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white shrink-0 z-10">
              <h3 className="text-lg font-bold text-[#0B192C]">
                {isEditing ? 'Edit Workshop Details' : 'Create New Workshop'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveWorkshop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Workshop Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Design Thinking & Grand Challenges"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>

              {/* Parent Program Selection */}
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Parent Program <span className="text-red-500">*</span>
                </label>
                <select
                  name="programId"
                  required
                  value={formData.programId}
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none bg-white"
                >
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.badge || p.slug})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#75777d] mt-0.5 block">
                  Participants enrolled in this parent program will automatically have access.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#131b2e]">
                    Workshop Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Supports emojis &amp; multiline formatted text</span>
                </div>
                <textarea
                  name="description"
                  required
                  rows={8}
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Outline the workshop agenda, framework, exercises, learning objectives..."
                  className="w-full min-h-[180px] p-3.5 rounded-xl border border-[#cbd5e1] text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none leading-relaxed font-sans"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="date"
                    required
                    placeholder="Saturday, May 24, 2025"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="startTime"
                    required
                    placeholder="09:30 AM"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="endTime"
                    required
                    placeholder="12:30 PM"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Speaker Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="speakerName"
                    required
                    placeholder="Eng. Dimuthu Perera"
                    value={formData.speakerName}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none bg-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Online vs Physical Switch */}
              <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    name="isOnline"
                    checked={formData.isOnline}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-[#006398] rounded"
                  />
                  <label htmlFor="isOnline" className="text-xs font-bold text-[#131b2e] cursor-pointer">
                    This is an Online Virtual Session (Google Meet / Zoom)
                  </label>
                </div>

                {formData.isOnline ? (
                  <div>
                    <label className="block text-[11px] font-bold text-[#131b2e] mb-1">
                      Online Meeting Link
                    </label>
                    <input
                      type="url"
                      name="meetingLink"
                      placeholder="https://meet.google.com/xyz-abc-def"
                      value={formData.meetingLink}
                      onChange={handleFormChange}
                      className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-[#131b2e] mb-1">
                      Physical Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      placeholder="TRACE Expert City, Bay 05, Maradana"
                      value={formData.venue}
                      onChange={handleFormChange}
                      className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Topics Covered (Comma separated)
                </label>
                <input
                  type="text"
                  name="topicsCovered"
                  placeholder="e.g. Empathy Maps, Journey Mapping, Root Cause"
                  value={formData.topicsCovered}
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>

              {/* Cover Image Upload from Computer or URL */}
              <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#131b2e]">
                    Workshop Cover Image
                  </label>
                  <span className="text-[11px] text-slate-500">Upload file or enter URL</span>
                </div>

                {/* Image Preview if available - Full Flyer Preview */}
                {formData.coverImage && (
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-inner flex items-center justify-center p-2 min-h-[200px]">
                    <img
                      src={formData.coverImage}
                      alt="Workshop Cover Preview"
                      className="w-full h-auto max-h-96 object-contain rounded-lg"
                      onError={handleImageError}
                    />
                    <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[80%]">
                      {formData.coverImage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Upload Button */}
                    <label className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs shrink-0 ${
                      uploadingCover
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-[#006398] hover:bg-[#0284c7] text-white'
                    }`}>
                      {uploadingCover ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading from PC...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload from Computer</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverFileUpload}
                        disabled={uploadingCover}
                      />
                    </label>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleFormChange}
                        placeholder="Or paste image URL (e.g. https://...)"
                        className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none bg-white"
                      />
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 mt-6 border-t border-slate-200">
                {errorMsg ? (
                  <div className="text-red-600 text-xs font-semibold flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">{errorMsg}</span>
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || uploadingCover}
                    className="px-5 py-2 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Update Workshop' : 'Create Workshop'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

