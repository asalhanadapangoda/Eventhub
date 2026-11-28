import React from 'react';

export default function AdminInquiriesTab({
  venueBookings,
  displayedVenueBookings,
  fetchDashboardData,
  handleExportInquiriesCSV,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  inquirySearchQuery,
  setInquirySearchQuery,
  inquiryBranchFilter,
  setInquiryBranchFilter,
  allVenueBranches,
  pendingInquiriesCount,
  contactedInquiriesCount,
  confirmedInquiriesCount,
  cancelledInquiriesCount,
  handleUpdateBookingStatus,
  handleDeleteBooking,
}) {
  return (
    <div className="manage-inquiries-container">
      <div className="admin-dashboard-title-row">
        <div>
          <h1 className="admin-page-title">Space & Facility Inquiries</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
            Customer booking requests submitted for TRACE spaces. Real-time notifications are automatically dispatched to <strong>connect@trace.lk</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fetchDashboardData(true)}
            style={{ background: '#ffffff', color: '#475569', borderColor: '#cbd5e1' }}
            title="Refresh inquiries list from server"
          >
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
          <button
            type="button"
            className="btn-export-excel"
            onClick={handleExportInquiriesCSV}
            title="Export filtered inquiries to CSV"
          >
            <i className="fa-solid fa-file-excel"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setInquiryStatusFilter('all')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: inquiryStatusFilter === 'all' ? '#5d4df6' : '#cbd5e1',
            background: inquiryStatusFilter === 'all' ? '#5d4df6' : '#ffffff',
            color: inquiryStatusFilter === 'all' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          All Inquiries <span style={{ opacity: 0.85 }}>({venueBookings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setInquiryStatusFilter('Pending')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: inquiryStatusFilter === 'Pending' ? '#d97706' : '#fde68a',
            background: inquiryStatusFilter === 'Pending' ? '#d97706' : '#fef3c7',
            color: inquiryStatusFilter === 'Pending' ? '#ffffff' : '#92400e',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ● Pending <span style={{ opacity: 0.85 }}>({pendingInquiriesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setInquiryStatusFilter('Contacted')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: inquiryStatusFilter === 'Contacted' ? '#2563eb' : '#bfdbfe',
            background: inquiryStatusFilter === 'Contacted' ? '#2563eb' : '#eff6ff',
            color: inquiryStatusFilter === 'Contacted' ? '#ffffff' : '#1e40af',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ● Contacted <span style={{ opacity: 0.85 }}>({contactedInquiriesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setInquiryStatusFilter('Confirmed')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: inquiryStatusFilter === 'Confirmed' ? '#059669' : '#a7f3d0',
            background: inquiryStatusFilter === 'Confirmed' ? '#059669' : '#ecfdf5',
            color: inquiryStatusFilter === 'Confirmed' ? '#ffffff' : '#065f46',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ● Confirmed <span style={{ opacity: 0.85 }}>({confirmedInquiriesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setInquiryStatusFilter('Cancelled')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: inquiryStatusFilter === 'Cancelled' ? '#dc2626' : '#fecaca',
            background: inquiryStatusFilter === 'Cancelled' ? '#dc2626' : '#fef2f2',
            color: inquiryStatusFilter === 'Cancelled' ? '#ffffff' : '#991b1b',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ● Cancelled <span style={{ opacity: 0.85 }}>({cancelledInquiriesCount})</span>
        </button>
      </div>

      {/* Filter Toolbar Panel */}
      <div className="reg-toolbar-panel" style={{ marginBottom: '1.25rem' }}>
        <div className="reg-toolbar-filters" style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input
              type="text"
              placeholder="Search by ref, inquirer, email, space name..."
              value={inquirySearchQuery}
              onChange={(e) => setInquirySearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem 0.6rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#ffffff',
              }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              value={inquiryBranchFilter}
              onChange={(e) => setInquiryBranchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Locations</option>
              {allVenueBranches.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              value={inquiryStatusFilter}
              onChange={(e) => setInquiryStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {(inquirySearchQuery || inquiryBranchFilter !== 'all' || inquiryStatusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setInquirySearchQuery('');
                setInquiryBranchFilter('all');
                setInquiryStatusFilter('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#5d4df6',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                textDecoration: 'underline',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Inquiries Table Card */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        {displayedVenueBookings.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#5d4df6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Inquiries Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              No space inquiries match your current filters. Incoming inquiries will appear here and email <strong>connect@trace.lk</strong> automatically.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Ref #</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Space / Venue</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Inquirer Details</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Event Details</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Notes</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedVenueBookings.map((bk) => {
                  const statusBg =
                    bk.status === 'Confirmed' ? '#ecfdf5' :
                      bk.status === 'Contacted' ? '#eff6ff' :
                        bk.status === 'Cancelled' ? '#fef2f2' : '#fef3c7';
                  const statusColor =
                    bk.status === 'Confirmed' ? '#065f46' :
                      bk.status === 'Contacted' ? '#1e40af' :
                        bk.status === 'Cancelled' ? '#991b1b' : '#92400e';
                  const statusBorder =
                    bk.status === 'Confirmed' ? '#a7f3d0' :
                      bk.status === 'Contacted' ? '#bfdbfe' :
                        bk.status === 'Cancelled' ? '#fecaca' : '#fde68a';

                  return (
                    <tr
                      key={bk._id || bk.bookingRef}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <span style={{ background: '#eef2ff', color: '#5d4df6', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                          {bk.bookingRef}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                          {new Date(bk.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{bk.venueName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-solid fa-location-dot" style={{ fontSize: '0.7rem' }}></i> {bk.branch}
                        </div>
                        {bk.price && (
                          <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            {bk.price}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{bk.name}</div>
                        <div>
                          <a href={`mailto:${bk.email}`} style={{ color: '#5d4df6', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <i className="fa-regular fa-envelope"></i> {bk.email}
                          </a>
                        </div>
                        <div>
                          <a href={`tel:${bk.phone}`} style={{ color: '#059669', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <i className="fa-solid fa-phone"></i> {bk.phone}
                          </a>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{bk.eventTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                          📅 <strong>{bk.eventDate}</strong> ({bk.durationHours || 4} hrs)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          👥 {bk.guests || 50} Expected Guests
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', maxWidth: '240px' }}>
                        {bk.notes ? (
                          <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontStyle: 'italic', lineHeight: 1.4 }}>
                            "{bk.notes}"
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>None</span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <select
                          value={bk.status || 'Pending'}
                          onChange={(e) => handleUpdateBookingStatus(bk._id || bk.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: `1px solid ${statusBorder}`,
                            background: statusBg,
                            color: statusColor,
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="Pending">● Pending</option>
                          <option value="Contacted">● Contacted</option>
                          <option value="Confirmed">● Confirmed</option>
                          <option value="Cancelled">● Cancelled</option>
                        </select>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <a
                            href={`mailto:${bk.email}?subject=RE: TRACE Space Inquiry [${bk.bookingRef}] - ${bk.venueName}&body=Hi ${bk.name},%0D%0A%0D%0AThank you for inquiring about ${bk.venueName}.`}
                            className="btn btn-outline"
                            style={{ padding: '5px 9px', borderRadius: '6px', fontSize: '0.78rem', color: '#5d4df6', borderColor: '#c7d2fe', background: '#eff6ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Reply via Email"
                          >
                            <i className="fa-solid fa-reply"></i> Reply
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(bk._id || bk.id, bk.bookingRef)}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                            title="Delete Inquiry"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
