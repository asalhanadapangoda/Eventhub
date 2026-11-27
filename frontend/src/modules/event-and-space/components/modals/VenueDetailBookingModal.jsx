import React from 'react';
import FormattedText from '../FormattedText';
import { optimizeImageUrl, getSpaceTypes, getSpaceTypeIcon, getSpaceProvince } from '../../utils/eventUtils';

export default function VenueDetailBookingModal({
  activeVenueModal,
  setActiveVenueModal,
  modalActiveTab,
  handleSwitchTab,
  modalActivePhotoIndex,
  setModalActivePhotoIndex,
  inquiryForm,
  setInquiryForm,
  handleInquirySubmit,
  isSubmittingInquiry,
  bookingConfirmation,
  setBookingConfirmation,
  getVenuePriceDetails,
  isRealVenuePhoto,
  getModalImages,
}) {
  return (
    <>
      {activeVenueModal && (
        <div
          className="modal-overlay"
          onClick={() => setActiveVenueModal(null)}
        >
          <div
            className="modal-card venue-split-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            {/* Floating Close Button */}
            <button
              className="modal-close"
              onClick={() => setActiveVenueModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                background: 'rgba(241, 245, 249, 0.95)',
                backdropFilter: 'blur(4px)',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '1.1rem',
                transition: 'all 0.2s ease',
                zIndex: 25,
              }}
              title="Close modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Modal Navigation Tabs (Overview & Booking Inquiry) */}
            <div
              className="venue-modal-header-bar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingRight: '4.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className={`venue-modal-tab-btn ${modalActiveTab === 'details' ? 'active' : ''}`}
                  onClick={() => handleSwitchTab('details')}
                  style={{
                    padding: '0.45rem 1.15rem',
                    borderRadius: '20px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    background: modalActiveTab === 'details' ? '#5d4df6' : '#f1f5f9',
                    color: modalActiveTab === 'details' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className="fa-solid fa-circle-info"></i> Space Overview
                </button>
                <button
                  type="button"
                  className={`venue-modal-tab-btn ${modalActiveTab === 'booking' ? 'active' : ''}`}
                  onClick={() => handleSwitchTab('booking')}
                  style={{
                    padding: '0.45rem 1.15rem',
                    borderRadius: '20px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    background: modalActiveTab === 'booking' ? '#5d4df6' : '#f1f5f9',
                    color: modalActiveTab === 'booking' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className="fa-solid fa-paper-plane"></i> Inquire Space
                </button>
              </div>
            </div>

            {/* TAB CONTENT: EITHER BOOKING INQUIRY OR DETAILS OVERVIEW */}
            {modalActiveTab === 'booking' ? (
              <div className="venue-booking-split-grid" style={{ minHeight: '560px', maxHeight: 'calc(90vh - 65px)', overflowY: 'auto' }}>
                {/* Left Side: Space Snapshot */}
                <div className="venue-booking-sidebar" style={{ padding: '1.75rem', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeVenueModal.coverImage && isRealVenuePhoto(activeVenueModal.coverImage) ? (
                    <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
                      <img
                        src={optimizeImageUrl(activeVenueModal.coverImage, 600)}
                        alt={activeVenueModal.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : null}

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5d4df6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Selected Facility
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                      {activeVenueModal.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fa-solid fa-location-dot"></i> {activeVenueModal.branch || activeVenueModal.address}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Rate / Pricing:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <strong style={{ color: '#059669' }}>{getVenuePriceDetails(activeVenueModal).baseText}</strong>
                        {getVenuePriceDetails(activeVenueModal).taxText && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#4f46e5',
                              background: '#eef2ff',
                              border: '1px solid #c7d2fe',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {getVenuePriceDetails(activeVenueModal).taxText}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Capacity:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {typeof activeVenueModal.capacity === 'number' && activeVenueModal.capacity > 0
                          ? `${activeVenueModal.capacity} Guests`
                          : (activeVenueModal.capacity || 'Custom Setup')}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center', marginTop: '0.35rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Space Type:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', maxWidth: '65%' }}>
                        {getSpaceTypes(activeVenueModal).map((st) => (
                          <span
                            key={st}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trust / Notification Box */}
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1rem', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <i className="fa-solid fa-shield-halved"></i> Direct TRACE Inquiry
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#3b82f6', margin: 0, lineHeight: 1.45 }}>
                      Inquiry requests are dispatched in real-time to <strong>connect@trace.lk</strong>. Our facilities coordinator will contact you promptly.
                    </p>
                  </div>
                </div>

                {/* Right Side: Inquiry Form */}
                <div className="venue-booking-form-content" style={{ padding: '2rem 2.25rem', overflowY: 'auto', background: '#ffffff' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                      Inquire Space
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
                      Fill in your event details below to submit an inquiry.
                    </p>
                  </div>

                  <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="venue-form-row-2col">
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="venue-inquiry-input"
                          placeholder="Your full name"
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          className="venue-inquiry-input"
                          placeholder="yourname@domain.com"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="venue-form-row-2col">
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          className="venue-inquiry-input"
                          placeholder="e.g. +94 77 123 4567"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Target Event Date *
                        </label>
                        <input
                          type="date"
                          required
                          className="venue-inquiry-input"
                          value={inquiryForm.eventDate}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, eventDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                        Event Title / Purpose *
                      </label>
                      <input
                        type="text"
                        required
                        className="venue-inquiry-input"
                        placeholder="e.g. Tech Founders Meetup / Product Launch 2026"
                        value={inquiryForm.eventTitle}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, eventTitle: e.target.value })}
                      />
                    </div>

                    <div className="venue-form-row-2col">
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Duration (Hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="72"
                          className="venue-inquiry-input"
                          placeholder="4"
                          value={inquiryForm.durationHours}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, durationHours: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Expected Attendees
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="venue-inquiry-input"
                          placeholder="50"
                          value={inquiryForm.guests}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, guests: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                        Special Requirements or Notes (Optional)
                      </label>
                      <textarea
                        className="venue-inquiry-input"
                        rows="3"
                        placeholder="e.g. Need podium microphone, stage lighting, coffee break space, 4K projector..."
                        value={inquiryForm.notes}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('details')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          padding: '0.6rem 1rem',
                        }}
                      >
                        Back to Details
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, #5d4df6 0%, #4f46e5 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          padding: '0.75rem 1.6rem',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(93, 77, 246, 0.3)',
                        }}
                        disabled={isSubmittingInquiry}
                      >
                        {isSubmittingInquiry ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Submitting to connect@trace.lk...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-paper-plane"></i> Send Inquiry
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* DETAILS VIEW */
              <div className="venue-split-grid">

                {/* LEFT SIDE: DATABASE UPLOADED PHOTO GALLERY SHOWCASE */}
                <div className="venue-split-left-gallery">
                  {(() => {
                    const modalImages = getModalImages(activeVenueModal);
                    const currentImg = modalImages[modalActivePhotoIndex] || modalImages[0];

                    if (!currentImg || !isRealVenuePhoto(currentImg)) {
                      return (
                        <div className="venue-modal-no-image-box">
                          <i className="fa-regular fa-image no-image-icon-large"></i>
                          <span className="no-image-title">No Photo Available</span>
                          <span className="no-image-subtitle">No facility photos have been uploaded for this space.</span>
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%', flex: 1 }}>
                        {/* Main Active Photo View */}
                        <div className="modal-active-photo-box" style={{ position: 'relative', overflow: 'hidden', width: '100%', flex: 1, minHeight: '360px', borderRadius: '16px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                          <img
                            key={modalActivePhotoIndex}
                            src={optimizeImageUrl(currentImg, 1200)}
                            alt={`${activeVenueModal.name} view ${modalActivePhotoIndex + 1}`}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                <div class="venue-modal-no-image-box" style="min-height: 480px; width: 100%; border: none;">
                                  <i class="fa-regular fa-image no-image-icon-large"></i>
                                  <span class="no-image-title">No Photo Available</span>
                                  <span class="no-image-subtitle">Photo could not be loaded.</span>
                                </div>
                              `;
                              }
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'opacity 0.3s ease',
                            }}
                          />

                          {/* Navigation Arrows (Only shown if multiple DB images exist) */}
                          {modalImages.length > 1 && (
                            <>
                              {/* Left Arrow */}
                              <button
                                type="button"
                                onClick={() =>
                                  setModalActivePhotoIndex((prev) =>
                                    prev === 0 ? modalImages.length - 1 : prev - 1
                                  )
                                }
                                style={{
                                  position: 'absolute',
                                  left: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  backdropFilter: 'blur(4px)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255, 255, 255, 0.25)',
                                  borderRadius: '50%',
                                  width: '36px',
                                  height: '36px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  zIndex: 5,
                                }}
                                title="Previous Photo"
                              >
                                <i className="fa-solid fa-chevron-left"></i>
                              </button>

                              {/* Right Arrow */}
                              <button
                                type="button"
                                onClick={() =>
                                  setModalActivePhotoIndex((prev) =>
                                    prev === modalImages.length - 1 ? 0 : prev + 1
                                  )
                                }
                                style={{
                                  position: 'absolute',
                                  right: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  backdropFilter: 'blur(4px)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255, 255, 255, 0.25)',
                                  borderRadius: '50%',
                                  width: '36px',
                                  height: '36px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  zIndex: 5,
                                }}
                                title="Next Photo"
                              >
                                <i className="fa-solid fa-chevron-right"></i>
                              </button>

                              {/* Counter Badge */}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '12px',
                                  right: '12px',
                                  background: 'rgba(15, 23, 42, 0.85)',
                                  backdropFilter: 'blur(6px)',
                                  color: '#ffffff',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  zIndex: 5,
                                }}
                              >
                                📷 {modalActivePhotoIndex + 1} / {modalImages.length}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Clickable Photo Thumbnails Row (Only rendered if multiple DB images exist) */}
                        {modalImages.length > 1 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflowX: 'auto', paddingBottom: '4px' }}>
                            {modalImages.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                onClick={() => setModalActivePhotoIndex(idx)}
                                style={{
                                  width: '74px',
                                  height: '52px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: modalActivePhotoIndex === idx ? '2.5px solid #5d4df6' : '1px solid #cbd5e1',
                                  opacity: modalActivePhotoIndex === idx ? 1 : 0.65,
                                  transition: 'all 0.2s ease',
                                  flexShrink: 0,
                                  background: '#0f172a',
                                }}
                              >
                                <img
                                  src={optimizeImageUrl(imgUrl, 200)}
                                  alt={`Thumbnail ${idx + 1}`}
                                  loading="lazy"
                                  decoding="async"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* RIGHT SIDE: VENUE NAME, SPECIFICATIONS & DETAILS DISPLAY */}
                <div className="venue-split-right-details">

                  {/* 1. SPACE NAME & TOP BADGES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                      {activeVenueModal.name}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#eef2ff', color: '#5d4df6', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.76rem', border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fa-solid fa-building"></i> {activeVenueModal.branch || 'TRACE Expert City'}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: activeVenueModal.status === 'Available' ? '#059669' : '#d97706', background: activeVenueModal.status === 'Available' ? '#dcfce7' : '#fef3c7', padding: '0.25rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ● {activeVenueModal.status || 'Available'}
                      </span>
                      {(() => {
                        const modalPrice = getVenuePriceDetails(activeVenueModal);
                        return (
                          <span
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              color: '#059669',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <i className="fa-solid fa-tag"></i> {modalPrice.baseText}
                            {modalPrice.taxText && (
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  color: '#4f46e5',
                                  background: '#eef2ff',
                                  border: '1px solid #c7d2fe',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  marginLeft: '2px',
                                }}
                              >
                                {modalPrice.taxText}
                              </span>
                            )}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Province, Type, Capacity & Location Address */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      {getSpaceTypes(activeVenueModal).map((st) => (
                        <span
                          key={st}
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: '700',
                            color: '#0369a1',
                            background: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <i className={`fa-solid ${getSpaceTypeIcon(st)}`}></i> {st}
                        </span>
                      ))}
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#5d4df6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                        📍 {getSpaceProvince(activeVenueModal)}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0052cc', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                        👥 Capacity:{' '}
                        {typeof activeVenueModal.capacity === 'number' && activeVenueModal.capacity > 0
                          ? `${activeVenueModal.capacity} Guests`
                          : !isNaN(Number(activeVenueModal.capacity)) && Number(activeVenueModal.capacity) > 0
                            ? `${Number(activeVenueModal.capacity)} Guests`
                            : (activeVenueModal.capacity && String(activeVenueModal.capacity).trim() !== '' && activeVenueModal.capacity !== 0 && activeVenueModal.capacity !== '0'
                              ? activeVenueModal.capacity
                              : 'Custom Setup')}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#64748b', marginRight: '4px' }}></i>
                        {activeVenueModal.address}
                      </span>
                    </div>
                  </div>

                  {/* 2. SPACE OVERVIEW DESCRIPTION */}
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-circle-info" style={{ color: '#0052cc' }}></i> Space Overview
                    </h4>
                    {activeVenueModal.description ? (
                      <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>
                        <FormattedText content={activeVenueModal.description} className="space-modal-description-text" />
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                        Enterprise auditorium & event venue equipped with modern AV, air conditioning, stage lighting, and high-speed fiber internet.
                      </p>
                    )}
                  </div>

                  {/* 3. INCLUDED FACILITIES & AMENITIES */}
                  {activeVenueModal.amenities && activeVenueModal.amenities.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-sliders" style={{ color: '#0052cc' }}></i> Included Facilities
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {activeVenueModal.amenities.map((am, i) => (
                          <span key={i} style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', background: '#f1f5f9', padding: '5px 11px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fa-solid fa-check" style={{ color: '#10b981', fontSize: '0.75rem' }}></i> {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. BOOKING INQUIRY ACTION BUTTON */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('booking')}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        background: 'linear-gradient(135deg, #5d4df6 0%, #4f46e5 100%)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(93, 77, 246, 0.35)',
                        border: 'none',
                      }}
                    >
                      <i className="fa-solid fa-paper-plane"></i> Inquire Space
                    </button>
                  </div>

                  {/* Extra bottom padding to ensure the last item is never cut off */}
                  <div style={{ height: '2.5rem', flexShrink: 0 }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Confirmation Receipt Modal */}
      {bookingConfirmation && (
        <div className="modal-overlay" onClick={() => setBookingConfirmation(null)}>
          <div className="modal-card" style={{ maxWidth: '580px', borderRadius: '20px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBookingConfirmation(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                Space Inquiry Submitted!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Your space inquiry has been dispatched to <strong>connect@trace.lk</strong> and a confirmation copy was sent to your email.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>INQUIRY REFERENCE</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#5d4df6', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {bookingConfirmation.bookingRef}
                </span>
              </div>

              <div className="venue-receipt-grid">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>VENUE SPACE</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.venueName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>LOCATION / BRANCH</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.branch}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>EVENT TITLE</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.eventTitle}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>TARGET DATE & DURATION</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.eventDate} ({bookingConfirmation.durationHours || 4} Hours)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>APPLICANT</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>STATUS</span>
                  <span style={{ color: '#d97706', fontWeight: '700', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', display: 'inline-block' }}>
                    ● {bookingConfirmation.status || 'Pending Review'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px' }}
                onClick={() => setBookingConfirmation(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
