import React from 'react';

const CloudinaryUploader = React.lazy(() => import('../CloudinaryUploader'));

export default function AdminHeroTab({
  heroSettings,
  setHeroSettings,
  savingHeroSettings,
  handleSaveHeroSettings,
  heroPhotosList,
  heroPhotosFileInputRef,
  handleUploadHeroPhotos,
  uploadingHeroPhotos,
  newPhotoUrlInput,
  setNewPhotoUrlInput,
  handleAddHeroPhotoUrl,
  handleMoveHeroPhoto,
  handleRemoveHeroPhoto,
  heroMockupSlideIndex,
}) {
  return (
    <div className="manage-hero-container">
      <div className="admin-dashboard-title-row">
        <div>
          <h1 className="admin-page-title">Hero Media & Banner</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
            Default TRACE video and words are active. You can add a new photo or video here if needed.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn-export-excel"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
            title="Open live homepage to see current hero section"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i> View Live Site
          </a>
          <button
            type="button"
            className="btn-export-excel"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
            onClick={() => handleSaveHeroSettings()}
            disabled={savingHeroSettings}
          >
            {savingHeroSettings ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up"></i> Save & Apply Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Selector Cards: 3 Options (Default Video, New Photo, New Video) */}
      <div className="hero-mode-selector-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {/* Option 1: Default Original Video */}
        <div
          className={`hero-mode-card ${heroSettings.heroMediaType === 'default' ? 'active' : ''}`}
          onClick={() =>
            setHeroSettings((prev) => ({
              ...prev,
              heroMediaType: 'default',
            }))
          }
        >
          <div className="hero-mode-card-icon">
            <i className="fa-solid fa-film"></i>
          </div>
          <div className="hero-mode-card-content">
            <h4>Original TRACE Video</h4>
            <p>Default video background & original texts.</p>
          </div>
          <div className="hero-mode-check">
            <i
              className={`fa-solid ${
                heroSettings.heroMediaType === 'default'
                  ? 'fa-circle-check text-blue-600'
                  : 'fa-circle text-slate-300'
              }`}
            ></i>
          </div>
        </div>

        {/* Option 2: Add New Photo / Slideshow */}
        <div
          className={`hero-mode-card ${heroSettings.heroMediaType === 'image' ? 'active' : ''}`}
          onClick={() =>
            setHeroSettings((prev) => ({
              ...prev,
              heroMediaType: 'image',
            }))
          }
        >
          <div className="hero-mode-card-icon">
            <i className="fa-solid fa-images"></i>
          </div>
          <div className="hero-mode-card-content">
            <h4>Add New Photos / Slideshow (Up to 10)</h4>
            <p>Upload up to 10 photos that automatically transition one by one.</p>
          </div>
          <div className="hero-mode-check">
            <i
              className={`fa-solid ${
                heroSettings.heroMediaType === 'image'
                  ? 'fa-circle-check text-blue-600'
                  : 'fa-circle text-slate-300'
              }`}
            ></i>
          </div>
        </div>

        {/* Option 3: Add New Video */}
        <div
          className={`hero-mode-card ${heroSettings.heroMediaType === 'video' ? 'active' : ''}`}
          onClick={() =>
            setHeroSettings((prev) => ({
              ...prev,
              heroMediaType: 'video',
            }))
          }
        >
          <div className="hero-mode-card-icon">
            <i className="fa-solid fa-video"></i>
          </div>
          <div className="hero-mode-card-content">
            <h4>Add New Video</h4>
            <p>Upload or set a new custom video loop.</p>
          </div>
          <div className="hero-mode-check">
            <i
              className={`fa-solid ${
                heroSettings.heroMediaType === 'video'
                  ? 'fa-circle-check text-blue-600'
                  : 'fa-circle text-slate-300'
              }`}
            ></i>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid: Left Media Upload / Right Preview */}
      <div className="hero-manager-main-grid">
        {/* Left Column: Media Upload / Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Default State Active Banner */}
          {heroSettings.heroMediaType === 'default' && (
            <div className="hero-card-panel" style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                  Original Video & Texts Active
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                The homepage hero is currently playing the original TRACE video with original texts.
                To set a new custom photo slideshow or video, click <strong>"Add New Photos / Slideshow"</strong> or <strong>"Add New Video"</strong> above.
              </p>
            </div>
          )}

          {/* Panel for Photo (Image) Upload - Up to 10 Photos Slideshow */}
          {heroSettings.heroMediaType === 'image' && (
            <div className="hero-card-panel">
              <div className="hero-card-header">
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <i className="fa-solid fa-images" style={{ color: '#2563eb' }}></i> Hero Photos Slideshow
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Upload up to 10 photos. On the website hero banner, they will smoothly auto-transition one by one.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    background: heroPhotosList.length > 0 ? '#dbeafe' : '#f1f5f9',
                    color: heroPhotosList.length > 0 ? '#1e40af' : '#64748b',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-photo-film"></i> {heroPhotosList.length} / 10 Photos
                </span>
              </div>

              {/* Upload Photos from Computer (Multiple, up to 10) */}
              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#2563eb', marginRight: '6px' }}></i>
                    1. Upload Photos from Computer
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {10 - heroPhotosList.length > 0
                      ? `${10 - heroPhotosList.length} photo slot(s) remaining`
                      : 'Maximum 10 photos reached'}
                  </span>
                </div>

                <input
                  type="file"
                  ref={heroPhotosFileInputRef}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleUploadHeroPhotos}
                  disabled={uploadingHeroPhotos || heroPhotosList.length >= 10}
                />

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      background: heroPhotosList.length >= 10 ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      padding: '0.65rem 1.25rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: heroPhotosList.length >= 10 || uploadingHeroPhotos ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => heroPhotosFileInputRef.current && heroPhotosFileInputRef.current.click()}
                    disabled={uploadingHeroPhotos || heroPhotosList.length >= 10}
                  >
                    {uploadingHeroPhotos ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading Photos...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus"></i> Select & Upload Photos (Up to 10)
                      </>
                    )}
                  </button>

                  {heroPhotosList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all photos from the hero slideshow?')) {
                          const updated = {
                            ...heroSettings,
                            heroImages: [],
                            heroImageUrl: '',
                            heroMediaType: 'default',
                          };
                          setHeroSettings(updated);
                          handleSaveHeroSettings(updated);
                        }
                      }}
                      style={{
                        background: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fee2e2',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <i className="fa-solid fa-trash-can"></i> Clear All Photos
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Image URL input */}
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  <i className="fa-solid fa-link" style={{ color: '#2563eb', marginRight: '6px' }}></i>
                  2. Or Paste Photo URL
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg or Cloudinary URL..."
                    value={newPhotoUrlInput}
                    onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHeroPhotoUrl();
                      }
                    }}
                    disabled={heroPhotosList.length >= 10}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddHeroPhotoUrl}
                    disabled={!newPhotoUrlInput.trim() || heroPhotosList.length >= 10}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 1.2rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: !newPhotoUrlInput.trim() || heroPhotosList.length >= 10 ? 'not-allowed' : 'pointer',
                      opacity: !newPhotoUrlInput.trim() || heroPhotosList.length >= 10 ? 0.6 : 1,
                    }}
                  >
                    <i className="fa-solid fa-plus"></i> Add Photo
                  </button>
                </div>
              </div>

              {/* Photo Slideshow Gallery Grid (Up to 10) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    <i className="fa-regular fa-clone" style={{ color: '#2563eb', marginRight: '6px' }}></i>
                    Slideshow Photos List ({heroPhotosList.length} of 10)
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Photos auto-transition one by one on the live site
                  </span>
                </div>

                {heroPhotosList.length === 0 ? (
                  <div
                    style={{
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      color: '#64748b',
                    }}
                  >
                    <i className="fa-regular fa-image fa-3x" style={{ color: '#94a3b8', marginBottom: '0.75rem' }}></i>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#334155', fontSize: '1rem', fontWeight: 700 }}>
                      No Photos in Slideshow Yet
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Upload or add up to 10 photos above to activate the automated slideshow on the hero banner.
                    </p>
                  </div>
                ) : (
                  <div className="hero-photos-manager-grid">
                    {heroPhotosList.map((photoUrl, photoIdx) => (
                      <div key={`${photoUrl}-${photoIdx}`} className="hero-photo-manage-card">
                        <div className="hero-photo-manage-badge">
                          {photoIdx === 0 ? 'Photo 1 (Cover)' : `Photo ${photoIdx + 1}`}
                        </div>
                        <div className="hero-photo-manage-img-box">
                          <img src={photoUrl} alt={`Photo ${photoIdx + 1}`} loading="lazy" decoding="async" />
                        </div>
                        <div className="hero-photo-manage-actions">
                          <button
                            type="button"
                            onClick={() => handleMoveHeroPhoto(photoIdx, photoIdx - 1)}
                            disabled={photoIdx === 0}
                            title="Move earlier"
                            className="hero-photo-btn-icon"
                          >
                            <i className="fa-solid fa-chevron-left"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveHeroPhoto(photoIdx, photoIdx + 1)}
                            disabled={photoIdx === heroPhotosList.length - 1}
                            title="Move later"
                            className="hero-photo-btn-icon"
                          >
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroPhoto(photoIdx)}
                            title="Remove this photo"
                            className="hero-photo-btn-delete"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel for Custom Video Upload */}
          {heroSettings.heroMediaType === 'video' && (
            <div className="hero-card-panel">
              <div className="hero-card-header">
                <h3>
                  <i className="fa-solid fa-video"></i> Custom Video
                </h3>
                <span
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 700,
                  }}
                >
                  Custom Video Mode Active
                </span>
              </div>

              {/* Cloudinary Uploader Component for Video */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.4rem',
                  }}
                >
                  1. Upload Media from Computer
                </label>
                <React.Suspense fallback={<div style={{ fontSize: '0.82rem', color: '#64748b' }}>Loading uploader...</div>}>
                  <CloudinaryUploader
                    accept="image/*"
                    label="Upload Hero Media"
                    onUploadSuccess={(url) => {
                      const updated = {
                        ...heroSettings,
                        heroVideoUrl: url,
                        heroMediaType: 'video',
                      };
                      setHeroSettings(updated);
                      handleSaveHeroSettings(updated);
                    }}
                  />
                </React.Suspense>
              </div>

              {/* Direct Video URL input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.4rem',
                  }}
                >
                  2. Or Enter Video URL (.mp4)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="https://example.com/my-video.mp4"
                    value={heroSettings.heroVideoUrl || ''}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({
                        ...prev,
                        heroVideoUrl: e.target.value,
                        heroMediaType: 'video',
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  {heroSettings.heroVideoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setHeroSettings((prev) => ({
                          ...prev,
                          heroVideoUrl: '',
                        }))
                      }
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0 0.85rem',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="Clear video URL"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Panel: Hero Section Texts & Headings */}
          <div className="hero-card-panel">
            <div className="hero-card-header">
              <h3>
                <i className="fa-solid fa-heading"></i> Hero Words & Text
              </h3>
              <button
                type="button"
                onClick={() =>
                  setHeroSettings((prev) => ({
                    ...prev,
                    heroBadge: 'TRACE COMMUNITY HUB, SRI LANKA',
                    heroTitle: 'Where innovation meets community and culture.',
                    heroSubtitle:
                      "Be part of Sri Lanka's largest innovation ecosystem to make an impact.",
                  }))
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset to Original Words
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.35rem',
                  }}
                >
                  BADGE TEXT
                </label>
                <input
                  type="text"
                  value={heroSettings.heroBadge || ''}
                  onChange={(e) =>
                    setHeroSettings((prev) => ({ ...prev, heroBadge: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.35rem',
                  }}
                >
                  MAIN TITLE
                </label>
                <input
                  type="text"
                  value={heroSettings.heroTitle || ''}
                  onChange={(e) =>
                    setHeroSettings((prev) => ({ ...prev, heroTitle: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '0.35rem',
                  }}
                >
                  SUBTITLE DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={heroSettings.heroSubtitle || ''}
                  onChange={(e) =>
                    setHeroSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview & Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="hero-card-panel">
            <div className="hero-card-header">
              <h3>
                <i className="fa-solid fa-display"></i> Live Mockup Preview
              </h3>
              <span
                style={{
                  fontSize: '0.78rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background:
                    heroSettings.heroMediaType === 'image'
                      ? '#eff6ff'
                      : heroSettings.heroMediaType === 'video'
                        ? '#f0fdf4'
                        : '#f8fafc',
                  color:
                    heroSettings.heroMediaType === 'image'
                      ? '#1d4ed8'
                      : heroSettings.heroMediaType === 'video'
                        ? '#15803d'
                        : '#475569',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background:
                      heroSettings.heroMediaType === 'image'
                        ? '#2563eb'
                        : heroSettings.heroMediaType === 'video'
                          ? '#22c55e'
                          : '#64748b',
                  }}
                ></span>
                {heroSettings.heroMediaType === 'image'
                  ? 'Custom Photo'
                  : heroSettings.heroMediaType === 'video'
                    ? 'Custom Video'
                    : 'Original Video'}
              </span>
            </div>

            {/* The Live Interactive Mockup Box */}
            <div className="hero-live-preview-container">
              {heroSettings.heroMediaType === 'image' && heroPhotosList.length > 0 ? (
                <>
                  {heroPhotosList.map((photoUrl, pIdx) => (
                    <img
                      key={`${photoUrl}-${pIdx}`}
                      src={photoUrl}
                      alt={`Hero Preview ${pIdx + 1}`}
                      className="hero-live-preview-bg"
                      style={{
                        opacity: pIdx === heroMockupSlideIndex ? 1 : 0,
                        transition: 'opacity 0.8s ease-in-out',
                        zIndex: pIdx === heroMockupSlideIndex ? 1 : 0,
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                  {heroPhotosList.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        zIndex: 10,
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        padding: '3px 9px',
                        borderRadius: '14px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <i className="fa-solid fa-play" style={{ fontSize: '0.62rem', color: '#60a5fa' }}></i>
                      Photo {heroMockupSlideIndex + 1} of {heroPhotosList.length}
                    </div>
                  )}
                </>
              ) : heroSettings.heroMediaType === 'video' && heroSettings.heroVideoUrl ? (
                <video
                  src={heroSettings.heroVideoUrl}
                  className="hero-live-preview-bg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                />
              ) : (
                <div
                  className="hero-live-preview-bg"
                  style={{
                    background: 'radial-gradient(ellipse at center, #1e293b 0%, #020617 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ color: '#64748b', textAlign: 'center' }}>
                    <i className="fa-solid fa-film fa-2x" style={{ opacity: 0.6, marginBottom: '0.4rem' }}></i>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Original TRACE Video Playing</div>
                  </div>
                </div>
              )}

              <div className="hero-live-preview-overlay"></div>

              <div className="hero-live-preview-content">
                <span className="hero-live-preview-badge">
                  {heroSettings.heroBadge || 'TRACE COMMUNITY HUB, SRI LANKA'}
                </span>
                <h2 className="hero-live-preview-title">
                  {heroSettings.heroTitle || 'Where innovation meets community and culture.'}
                </h2>
                <p className="hero-live-preview-sub">
                  {heroSettings.heroSubtitle ||
                    "Be part of Sri Lanka's largest innovation ecosystem to make an impact."}
                </p>
                <div className="hero-live-preview-actions">
                  <button
                    type="button"
                    className="hero-live-preview-btn"
                    style={{ background: '#2563eb', color: '#fff' }}
                  >
                    Explore Upcoming Events
                  </button>
                  <button
                    type="button"
                    className="hero-live-preview-btn"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                  >
                    Explore Spaces
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Info & Helper */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.85rem',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#2563eb' }}></i> Instant Update
              </div>
              When you click <strong>Save & Apply Changes</strong>, settings synchronize to the database and update the live homepage without page reload.
            </div>

            {/* Save & Reset Buttons Panel */}
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => handleSaveHeroSettings()}
                disabled={savingHeroSettings}
                style={{
                  width: '100%',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {savingHeroSettings ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> Save & Apply Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const defaults = {
                    heroMediaType: 'default',
                    heroImageUrl: '',
                    heroVideoUrl: '',
                    heroBadge: 'TRACE COMMUNITY HUB, SRI LANKA',
                    heroTitle: 'Where innovation meets community and culture.',
                    heroSubtitle:
                      "Be part of Sri Lanka's largest innovation ecosystem to make an impact.",
                  };
                  setHeroSettings(defaults);
                  handleSaveHeroSettings(defaults);
                }}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
                title="Reset to original TRACE video and words"
              >
                <i className="fa-solid fa-rotate-left"></i> Reset to Original Video & Words
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
