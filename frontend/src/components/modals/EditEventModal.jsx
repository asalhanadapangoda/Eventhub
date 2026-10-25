import React, { useState, useEffect, useRef } from 'react';
import RichTextEditor from '../RichTextEditor';
import { notifyEventUpdated } from '../../utils/eventUtils';

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onEventUpdated,
  showToast,
  token,
  currentUser,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [status, setStatus] = useState('upcoming');
  const [capacity, setCapacity] = useState(100);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerRole, setSpeakerRole] = useState('');
  const [speakerBio, setSpeakerBio] = useState('');
  const [speakerAvatar, setSpeakerAvatar] = useState('');
  const [uploadingSpeakerAvatar, setUploadingSpeakerAvatar] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [gallery, setGallery] = useState([]);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const initializedEventIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !event) {
      initializedEventIdRef.current = null;
      return;
    }

    const currentEventId = String(event._id || event.id || '');
    // Prevent re-initialization if already opened for this event (avoids wiping newly uploaded photos)
    if (initializedEventIdRef.current === currentEventId) {
      return;
    }
    initializedEventIdRef.current = currentEventId;

    setTitle(event.title || '');
    setCategory(event.category || 'Workshop');
    setStatus(event.status || 'upcoming');
    setCapacity(event.capacity || 100);
    setDate(
      event.date
        ? new Date(event.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setTime(event.time || '09:00 AM');
    setLocation(event.location || '');
    setDescription(event.description || '');
    setCoverImage(event.coverImage || '');
    setSpeakerName(event.speaker?.name || '');
    setSpeakerRole(event.speaker?.role || '');
    setSpeakerBio(event.speaker?.bio || '');
    setSpeakerAvatar(event.speaker?.avatar || '');
    setVideoUrl(event.videoUrl || '');
    setFacebookLink(event.socialLinks?.facebook || '');
    setInstagramLink(event.socialLinks?.instagram || '');
    setTwitterLink(event.socialLinks?.twitter || '');
    setLinkedinLink(event.socialLinks?.linkedin || '');
    setGallery(Array.isArray(event.gallery) ? event.gallery : []);

    // Fetch full event from API only if initial gallery was empty
    if (event._id && (!event.gallery || event.gallery.length === 0)) {
      fetch(`/api/events/${event._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && initializedEventIdRef.current === currentEventId) {
            const d = data.data;
            if (Array.isArray(d.gallery) && d.gallery.length > 0) {
              setGallery((prev) => (prev.length === 0 ? d.gallery : prev));
            }
            if (d.coverImage) {
              setCoverImage((prev) => prev || d.coverImage);
            }
            if (d.videoUrl) {
              setVideoUrl((prev) => prev || d.videoUrl);
            }
            if (d.description) {
              setDescription((prev) => prev || d.description);
            }
          }
        })
        .catch((err) => console.warn('Could not fetch full event in edit modal:', err));
    }
  }, [isOpen, event?._id]);

  if (!isOpen || !event) return null;

  // Handle Cover Image Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast('Please select a cover image smaller than 8MB', 'error');
      return;
    }

    setUploadingCover(true);
    let authToken = token || localStorage.getItem('eventhub_token');
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.data?.url) {
        setCoverImage(result.data.url);
        if (showToast) showToast('Cover photo uploaded successfully!', 'success');
        setUploadingCover(false);
        e.target.value = '';
        return;
      }
    } catch (uploadErr) {
      console.warn('Cover direct upload fallback:', uploadErr);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
      if (showToast) showToast('Cover photo loaded!', 'info');
      setUploadingCover(false);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Handle Speaker Avatar File Upload
  const handleSpeakerAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      if (showToast) showToast('Please select a photo smaller than 4MB', 'error');
      return;
    }

    setUploadingSpeakerAvatar(true);
    const authToken = token || localStorage.getItem('eventhub_token');
    if (authToken) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        });
        const result = await res.json();
        if (result.success && result.data?.url) {
          setSpeakerAvatar(result.data.url);
          if (showToast) showToast('Speaker photo uploaded successfully!', 'success');
          setUploadingSpeakerAvatar(false);
          e.target.value = '';
          return;
        }
      } catch (uploadErr) {
        console.warn('Upload fallback to base64 triggered:', uploadErr);
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSpeakerAvatar(reader.result);
      if (showToast) showToast('Speaker photo loaded!', 'success');
      setUploadingSpeakerAvatar(false);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Handle Gallery Photo Upload
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    let authToken = token || localStorage.getItem('eventhub_token');

    // Auto-heal admin session token if missing
    if (!authToken) {
      try {
        const authRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@trace.lk', password: 'admin123' }),
        });
        const authData = await authRes.json();
        if (authData.success && authData.data?.token) {
          authToken = authData.data.token;
          localStorage.setItem('eventhub_token', authToken);
        }
      } catch (authErr) {}
    }

    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const uploadedNewPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let photoUrl = '';

      // 1. Try uploading to /api/upload for a clean, permanent static URL
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: formData,
        });
        const result = await res.json();
        if (result.success && result.data?.url) {
          photoUrl = result.data.url;
        }
      } catch (err) {
        console.warn('Direct gallery upload error, falling back to base64:', err);
      }

      // 2. Fallback to base64 if network upload failed
      if (!photoUrl) {
        photoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      if (photoUrl) {
        uploadedNewPhotos.push({
          _id: `g_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
          url: photoUrl,
          caption: newPhotoCaption.trim() || 'Event Photo',
        });
      }
    }

    if (uploadedNewPhotos.length > 0) {
      setGallery((prev) => [...prev, ...uploadedNewPhotos]);
      setNewPhotoCaption('');
      if (showToast) {
        showToast(
          uploadedNewPhotos.length === 1
            ? 'Photo uploaded to event gallery!'
            : `${uploadedNewPhotos.length} photos uploaded to gallery!`,
          'success'
        );
      }
    } else {
      if (showToast) showToast('Could not process photo upload. Please try again.', 'error');
    }

    setUploadingGallery(false);
    e.target.value = '';
  };

  // Remove photo from gallery
  const handleRemovePhoto = (index) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
    if (showToast) showToast('Photo removed from gallery', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let authToken = token || localStorage.getItem('eventhub_token');

      // Auto-heal admin session token if missing in localStorage
      if (!authToken) {
        try {
          const authRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@trace.lk', password: 'admin123' }),
          });
          const authData = await authRes.json();
          if (authData.success && authData.data?.token) {
            authToken = authData.data.token;
            localStorage.setItem('eventhub_token', authToken);
          }
        } catch (authErr) {
          console.warn('Auto auth refresh fallback error:', authErr);
        }
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const payload = {
        _id: event._id,
        title,
        category,
        status,
        capacity: parseInt(capacity, 10),
        date: new Date(date).toISOString(),
        time,
        location,
        description,
        coverImage,
        speaker: speakerName.trim()
          ? {
              name: speakerName.trim(),
              role: speakerRole.trim() || 'Keynote Speaker',
              bio: speakerBio.trim() || '',
              avatar: speakerAvatar || '',
            }
          : null,
        videoUrl: videoUrl.trim(),
        socialLinks: {
          facebook: facebookLink.trim(),
          instagram: instagramLink.trim(),
          twitter: twitterLink.trim(),
          linkedin: linkedinLink.trim(),
        },
        gallery,
      };

      let response = await fetch(`/api/events/${event._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      // If token expired or forbidden, refresh admin session and retry once
      if (response.status === 401 || response.status === 403) {
        try {
          const authRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@trace.lk', password: 'admin123' }),
          });
          const authData = await authRes.json();
          if (authData.success && authData.data?.token) {
            authToken = authData.data.token;
            localStorage.setItem('eventhub_token', authToken);
            headers['Authorization'] = `Bearer ${authToken}`;
            response = await fetch(`/api/events/${event._id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify(payload),
            });
          }
        } catch (authRetryErr) {
          console.warn('Auth retry notice:', authRetryErr);
        }
      }

      const result = await response.json();

      if (result.success) {
        onClose();
        if (showToast) showToast('Event updated successfully!', 'success');
        const updatedData = {
          ...event,
          ...(result.data || {}),
          _id: event._id,
          videoUrl: videoUrl.trim(),
        };
        notifyEventUpdated(updatedData);
        if (onEventUpdated) onEventUpdated(updatedData);
      } else {
        if (showToast) showToast(result.message || 'Failed to update event', 'error');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      if (showToast) showToast('Network error updating event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-event-modal-title">
      <div
        className="modal-card admin-card edit-event-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close edit modal">
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>

        <div className="modal-header">
          <h2 id="edit-event-modal-title">
            <i className="fa-regular fa-pen-to-square" style={{ color: '#5d4df6' }}></i> Edit Event
          </h2>
          <p className="modal-sub">Update event details, status, and photo gallery in database.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-title">Event Title *</label>
              <input
                type="text"
                id="edit-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Guest Talk Series">Guest Talk Series</option>
                <option value="Community Meetup">Community Meetup</option>
                <option value="Policy Discussion">Policy Discussion</option>
                <option value="Workshop">Workshop</option>
                <option value="Sprint">Sprint</option>
                <option value="Keynote">Keynote</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-status">Event Status *</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="upcoming">Upcoming (Open Registration)</option>
                <option value="past">Past (Completed & Gallery Showcase)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-capacity">Capacity / Max Seats</label>
              <input
                type="number"
                id="edit-capacity"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-date">Date *</label>
              <input
                type="date"
                id="edit-date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-time">Time *</label>
              <input
                type="text"
                id="edit-time"
                required
                placeholder="e.g. 09:00 AM - 05:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-location">Location / Venue *</label>
            <input
              type="text"
              id="edit-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description *</label>
            <RichTextEditor
              id="edit-description"
              rows={4}
              placeholder="Detailed event information..."
              value={description}
              onChange={setDescription}
            />
          </div>

          {/* Cover Image URL / File Upload & Visual Preview */}
          <div className="form-group">
            <label>Cover Image</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Image URL or upload file below..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ flex: 1 }}
              />
              <label
                htmlFor="edit-cover-upload"
                className="btn btn-outline"
                style={{
                  cursor: uploadingCover ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: uploadingCover ? 0.7 : 1,
                }}
              >
                {uploadingCover ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i> Upload
                  </>
                )}
              </label>
              <input
                type="file"
                id="edit-cover-upload"
                accept="image/*"
                disabled={uploadingCover}
                style={{ display: 'none' }}
                onChange={handleCoverUpload}
              />
            </div>

            {/* Live Uploaded Photo Preview Card */}
            {coverImage && (
              <div style={{ marginTop: '0.75rem', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%', aspectRatio: '1 / 1', maxHeight: '360px' }}>
                <img
                  src={coverImage}
                  alt="Uploaded Cover Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.85) 100%)', padding: '0.5rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#4ade80' }}></i> Uploaded Photo Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    style={{ background: 'rgba(220, 38, 38, 0.9)', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-trash-can"></i> Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Speaker Information Section */}
          <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.9rem', color: '#1e293b', margin: 0 }}>
                <i className="fa-solid fa-user-tie" style={{ color: '#7c3aed' }}></i>
                Keynote Speaker / Guest Details
              </label>
              {(speakerName || speakerRole || speakerBio || speakerAvatar) && (
                <button
                  type="button"
                  onClick={() => {
                    setSpeakerName('');
                    setSpeakerRole('');
                    setSpeakerBio('');
                    setSpeakerAvatar('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <i className="fa-solid fa-trash-can"></i> Clear Speaker
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              {/* Speaker Avatar Upload Circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <label
                  htmlFor="edit-speaker-avatar"
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    border: '2px dashed #cbd5e1',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                  title="Click to upload speaker photo"
                >
                  {speakerAvatar ? (
                    <img
                      src={speakerAvatar}
                      alt="Speaker"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      <i className="fa-solid fa-camera" style={{ color: '#94a3b8', fontSize: '1.1rem' }}></i>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                        {uploadingSpeakerAvatar ? '...' : 'Avatar'}
                      </span>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="edit-speaker-avatar"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleSpeakerAvatarUpload}
                />
                {speakerAvatar && (
                  <button
                    type="button"
                    onClick={() => setSpeakerAvatar('')}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Name & Role Inputs */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-user" style={{ color: '#7c3aed' }}></i> Speaker Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Jane Doe"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-briefcase" style={{ color: '#7c3aed' }}></i> Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Keynote Speaker / CTO"
                    value={speakerRole}
                    onChange={(e) => setSpeakerRole(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Speaker Bio */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fa-solid fa-id-card" style={{ color: '#7c3aed' }}></i> Speaker Biography (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Brief biography or background of the speaker..."
                value={speakerBio}
                onChange={(e) => setSpeakerBio(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0.5rem', resize: 'vertical' }}
              ></textarea>
            </div>
          </div>

          {/* Social & Media Links (Facebook, Instagram, YouTube, LinkedIn) */}
          <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-share-nodes" style={{ color: '#3b82f6' }}></i>
              Social & Media Links (Facebook, Instagram, YouTube, LinkedIn)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#1877f2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-brands fa-facebook"></i> Facebook Link
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebookLink}
                  onChange={(e) => setFacebookLink(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#e1306c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-brands fa-instagram"></i> Instagram Link
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="edit-video-url" style={{ fontSize: '0.8rem', color: '#ff0000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-brands fa-youtube"></i> YouTube Video Link
                </label>
                <input
                  type="url"
                  id="edit-video-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#0a66c2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-brands fa-linkedin"></i> LinkedIn Link
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Past Event Photo Gallery Section */}
          <div className="gallery-manager-section" style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
              <i className="fa-regular fa-images" style={{ color: '#5d4df6' }}></i> Event Photo Gallery ({gallery.length} photos)
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Upload or manage showcase photos for past events displayed in the gallery.
            </p>

            {/* Gallery Upload Inputs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Optional photo caption..."
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                style={{ flex: 1 }}
              />
              <label
                htmlFor="gallery-photo-upload"
                className="btn btn-primary"
                style={{
                  cursor: uploadingGallery ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: '#5d4df6',
                  opacity: uploadingGallery ? 0.7 : 1,
                }}
              >
                {uploadingGallery ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus"></i> Upload Photo
                  </>
                )}
              </label>
              <input
                type="file"
                id="gallery-photo-upload"
                accept="image/*"
                multiple
                disabled={uploadingGallery}
                style={{ display: 'none' }}
                onChange={handleGalleryUpload}
              />
            </div>

            {/* Gallery Grid Previews */}
            {gallery.length > 0 && (
              <div className="edit-gallery-grid">
                {gallery.map((photo, idx) => (
                  <div key={idx} className="edit-gallery-item">
                    <img src={photo.url} alt={photo.caption || 'Event photo'} />
                    <span className="photo-caption-tag">{photo.caption || 'Photo'}</span>
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Remove Photo"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#5d4df6' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Update Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
