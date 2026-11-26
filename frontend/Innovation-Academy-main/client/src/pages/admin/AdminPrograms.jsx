import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { programService, uploadService } from '../../services/api';
import { formatImageUrl, handleImageError } from '../../utils/imageUrl';
import { toast } from '../../context/ToastContext';
import {
  School,
  Edit,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  Users,
  Award,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

const initialFormData = {
  id: '',
  title: '',
  slug: '',
  badge: '',
  shortDescription: '',
  description: '',
  duration: '1 Month',
  fee: 'LKR 15,000 per month',
  cohort: 'Cohort 01 (2025/Q3)',
  totalSeats: 50,
  status: 'Active',
  highlights: '',
  objectives: '',
  targetAudience: '',
  benefits: '',
  coverImage: '',
  coordinatorName: 'Dilshan Perera',
  coordinatorEmail: 'projects@trace.lk',
  coordinatorTitle: 'Head of Programs & Incubation',
  coordinatorPhone: '+94 70 181 0494',
};

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await programService.getPrograms();
      if (res.success) setPrograms(res.data);
    } catch (err) {
      console.warn('Failed to load programs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setIsEditing(false);
    setFormData({
      ...initialFormData,
      badge: `PROGRAM 0${programs.length + 1}`,
      cohort: `Cohort 01 (${new Date().getFullYear()}/Q3)`,
    });
    setSaveSuccess('');
    setSaveError('');
    setModalOpen(true);
  };

  const handleEditClick = (prog) => {
    setIsEditing(true);
    setFormData({
      id: prog._id || prog.id,
      title: prog.title || '',
      slug: prog.slug || '',
      badge: prog.badge || '',
      shortDescription: prog.shortDescription || '',
      description: prog.description || '',
      duration: prog.duration || '1 Month',
      fee: prog.fee || (prog.slug === 'program-01' ? 'LKR 15,000 per month' : prog.slug === 'program-02' ? 'LKR 5,000 Registration Fee + LKR 15,000 per month' : ''),
      cohort: prog.cohort || '',
      totalSeats: prog.totalSeats || 50,
      status: prog.status || 'Active',
      highlights: Array.isArray(prog.highlights) ? prog.highlights.join('\n') : prog.highlights || '',
      objectives: Array.isArray(prog.objectives) ? prog.objectives.join('\n') : prog.objectives || '',
      targetAudience: Array.isArray(prog.targetAudience)
        ? prog.targetAudience.join('\n')
        : prog.targetAudience || '',
      benefits: Array.isArray(prog.benefits) ? prog.benefits.join('\n') : prog.benefits || '',
      coverImage: prog.coverImage || '',
      coordinatorName: prog.coordinator?.name || 'Dilshan Perera',
      coordinatorEmail: prog.coordinator?.email || 'projects@trace.lk',
      coordinatorTitle: prog.coordinator?.title || 'Head of Programs & Incubation',
      coordinatorPhone: prog.coordinator?.phone || '+94 70 181 0494',
    });
    setSaveSuccess('');
    setSaveError('');
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    if (!isEditing) {
      const autoSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({
        ...prev,
        title: newTitle,
        slug: autoSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        title: newTitle,
      }));
    }
  };

  const handleSaveProgram = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaveSuccess('');
    setSaveError('');
    setIsSaving(true);

    try {
      if (isEditing) {
        const targetId = formData.id || formData._id || formData.slug;
        const res = await programService.updateProgram(targetId, formData);
        if (res.success) {
          toast.success(`Program "${formData.title}" updated successfully!`);
          setModalOpen(false);
          await fetchPrograms();
        } else {
          toast.error(res.message || 'Failed to update program');
        }
      } else {
        const res = await programService.createProgram(formData);
        if (res.success) {
          toast.success(`Program "${formData.title}" created successfully!`);
          setModalOpen(false);
          await fetchPrograms();
        } else {
          toast.error(res.message || 'Failed to create program');
        }
      }
    } catch (err) {
      console.error('Failed to save program:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save program changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    try {
      const res = await programService.deleteProgram(id);
      if (res.success) {
        toast.success('Program deleted successfully');
        setDeleteConfirmId(null);
        fetchPrograms();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete program');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B192C]">Program Management</h2>
          <p className="text-xs sm:text-sm text-[#44474c] mt-1">
            Configure TRACE Innovation Academy curricula, cohorts, capacities, and active tracks.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Program</span>
        </button>
      </div>

      {/* Programs List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((prog, idx) => (
          <div
            key={prog._id || idx}
            className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden"
          >
            <div>
              {/* Program Cover Image Preview */}
              {prog.coverImage && (
                <div className="w-full h-44 -mt-6 -mx-6 mb-4 overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={formatImageUrl(prog.coverImage)}
                    alt={prog.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#eaedff] text-[#006398]">
                  {prog.badge || `PROGRAM 0${idx + 1}`}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    prog.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : prog.status === 'Upcoming'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {prog.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#0B192C]">{prog.title}</h3>
              <p className="text-xs text-[#44474c] mt-2 leading-relaxed">
                {prog.shortDescription || prog.description}
              </p>

              <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] text-xs">
                <div>
                  <span className="text-[#75777d] block text-[11px]">Duration:</span>
                  <span className="font-bold text-[#131b2e]">{prog.duration}</span>
                </div>
                <div>
                  <span className="text-[#75777d] block text-[11px]">Programme Fee:</span>
                  <span className="font-bold text-[#006398] truncate block" title={prog.fee}>
                    {prog.fee || (prog.slug === 'program-01' ? 'LKR 15,000 / mo' : 'LKR 5k + 15k / mo')}
                  </span>
                </div>
                <div>
                  <span className="text-[#75777d] block text-[11px]">Active Cohort:</span>
                  <span className="font-bold text-[#006398]">{prog.cohort || 'Cohort Active'}</span>
                </div>
                <div>
                  <span className="text-[#75777d] block text-[11px]">Enrolled Participants:</span>
                  <span className="font-bold text-emerald-700">
                    {prog.registrationCount || 0} Registered
                  </span>
                </div>
                <div>
                  <span className="text-[#75777d] block text-[11px]">Linked Workshops:</span>
                  <span className="font-bold text-[#131b2e]">{prog.workshopCount || 0} Sessions</span>
                </div>
              </div>

              {/* Highlights preview */}
              {Array.isArray(prog.highlights) && prog.highlights.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Curriculum Highlights:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {prog.highlights.slice(0, 3).map((h, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006398] shrink-0"></span>
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                    {prog.highlights.length > 3 && (
                      <li className="text-[11px] text-slate-400 pl-3">
                        +{prog.highlights.length - 3} more highlights
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#75777d] font-mono">/{prog.slug}</span>
                <Link
                  to={`/programs/${prog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-[#006398] transition-colors"
                  title="View Public Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(prog._id || prog.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Program"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditClick(prog)}
                  className="px-4 py-2 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Program</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Program?</h3>
                <p className="text-xs text-slate-500">
                  This action will permanently delete this program along with its associated workshops and registrations.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProgram(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Delete Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Program Modal (Sticky Header Layout) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-12 overflow-y-auto">
          <form
            onSubmit={handleSaveProgram}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[88vh] overflow-hidden border border-slate-200 relative my-auto sm:my-0"
          >
            {/* Modal Header (Fixed at top, never cut off) */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white shrink-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#006398]">
                  <School className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#0B192C]">
                  {isEditing ? `Edit Program: ${formData.title}` : 'Create New Program'}
                </h3>
              </div>
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
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {saveError && (
                <div className="p-3 mb-2 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
                {/* Title & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Program Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="e.g. AI & Robotics Innovation Incubator"
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleFormChange}
                      placeholder="e.g. ai-robotics-incubator"
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Badge, Duration, Cohort & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">Badge / Tag</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleFormChange}
                      placeholder="e.g. PROGRAM 03"
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleFormChange}
                      placeholder="e.g. 1 Month or 3 Months"
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">Programme Fee</label>
                    <input
                      type="text"
                      name="fee"
                      value={formData.fee}
                      onChange={handleFormChange}
                      placeholder="e.g. LKR 15,000 per month"
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">Active Cohort</label>
                    <input
                      type="text"
                      name="cohort"
                      value={formData.cohort}
                      onChange={handleFormChange}
                      placeholder="e.g. Cohort 01 (2025/Q3)"
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
                      <option value="Active">Active</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Short Summary */}
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Short Summary / Subtitle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    required
                    value={formData.shortDescription}
                    onChange={handleFormChange}
                    placeholder="Brief 1-2 sentence overview for cards and catalogs..."
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#131b2e]">
                      Full Curriculum Description <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Supports emojis &amp; multiline formatted text</span>
                  </div>
                  <textarea
                    name="description"
                    required
                    rows={8}
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Comprehensive description of the program track, academic structure, and value proposition..."
                    className="w-full min-h-[180px] p-3.5 rounded-xl border border-[#cbd5e1] text-sm focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none leading-relaxed font-sans"
                  ></textarea>
                </div>

                {/* Curriculum Highlights */}
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Curriculum Highlights (One per line or comma separated)
                  </label>
                  <textarea
                    name="highlights"
                    rows={3}
                    value={formData.highlights}
                    onChange={handleFormChange}
                    placeholder={`Design Thinking for Deep-Tech Innovation\n12 Steps from Ideation to Launch\nRapid Prototyping & Maker Space Lab Testing\nVenture Pitch Deck Architecture`}
                    className="w-full p-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none font-mono text-[11px]"
                  ></textarea>
                  <span className="text-[11px] text-slate-400">
                    These appear with bullet checkmarks on the homepage and program details page.
                  </span>
                </div>

                {/* Objectives & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Program Objectives (One per line)
                    </label>
                    <textarea
                      name="objectives"
                      rows={3}
                      value={formData.objectives}
                      onChange={handleFormChange}
                      placeholder={`Master user empathy research\nSynthesize real-world problems\nExecute rapid prototype sprints`}
                      className="w-full p-2.5 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Target Audience (One per line)
                    </label>
                    <textarea
                      name="targetAudience"
                      rows={3}
                      value={formData.targetAudience}
                      onChange={handleFormChange}
                      placeholder={`Engineering & Computer Science Students\nEarly-Stage Deep Tech Founders\nCorporate R&D Innovation Teams`}
                      className="w-full p-2.5 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    ></textarea>
                  </div>
                </div>

                {/* Coordinator & Cover Image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Coordinator Name
                    </label>
                    <input
                      type="text"
                      name="coordinatorName"
                      value={formData.coordinatorName}
                      onChange={handleFormChange}
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Coordinator Email
                    </label>
                    <input
                      type="email"
                      name="coordinatorEmail"
                      value={formData.coordinatorEmail}
                      onChange={handleFormChange}
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Coordinator Phone
                    </label>
                    <input
                      type="text"
                      name="coordinatorPhone"
                      value={formData.coordinatorPhone}
                      onChange={handleFormChange}
                      className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#131b2e]">
                      Program Cover Image
                    </label>
                    <span className="text-[11px] text-slate-500">Upload file or enter URL</span>
                  </div>

                  {/* Image Preview if available */}
                  {formData.coverImage && (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-inner">
                      <img
                        src={formData.coverImage}
                        alt="Program Cover Preview"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
                      <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[80%]">
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
            </div>

            {/* Modal Sticky Footer */}
            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              {saveError ? (
                <div className="text-red-600 text-xs font-semibold flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{saveError}</span>
                </div>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
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
                      <span>{isEditing ? 'Save Changes' : 'Create Program'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
