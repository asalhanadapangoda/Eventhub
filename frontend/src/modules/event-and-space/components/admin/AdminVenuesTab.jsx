import React from 'react';
import { notifyVenueUpdated, getSpaceTypes, getSpaceTypeIcon, AVAILABLE_SPACE_TYPES } from '../../utils/eventUtils';

export default function AdminVenuesTab({
  venues,
  setVenues,
  displayedVenues,
  venueSearchQuery,
  setVenueSearchQuery,
  venueBranchFilter,
  setVenueBranchFilter,
  venueStatusFilter,
  setVenueStatusFilter,
  venueTypeFilter,
  setVenueTypeFilter,
  venueCapacityFilter,
  setVenueCapacityFilter,
  setShowAddVenueModal,
  setEditingVenue,
  token,
  showToast,
}) {
  return (
    <div className="manage-venues-container">
      <div className="admin-dashboard-title-row">
        <div>
          <h1 className="admin-page-title">Spaces & Facilities</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
            Manage event spaces, seating capacity, and hall reservations.
          </p>
        </div>
        <button
          className="btn-create-event-blue"
          onClick={() => setShowAddVenueModal(true)}
        >
          <i className="fa-solid fa-plus"></i> Add New Space
        </button>
      </div>

      {/* ADMIN SPACES FILTER BAR */}
      <div className="admin-filter-bar-card" style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fa-solid fa-filter" style={{ color: '#5d4df6', fontSize: '1rem' }}></i>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Filter Spaces ({displayedVenues.length} of {venues.length})
            </h3>
          </div>
          {(venueSearchQuery || venueBranchFilter !== 'all' || venueStatusFilter !== 'all' || venueTypeFilter !== 'all' || venueCapacityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setVenueSearchQuery('');
                setVenueBranchFilter('all');
                setVenueStatusFilter('all');
                setVenueTypeFilter('all');
                setVenueCapacityFilter('all');
              }}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
            >
              <i className="fa-solid fa-rotate-left"></i> Reset Filters
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          {/* 1. Search Query */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Search Space</label>
            <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', pointerEvents: 'none', zIndex: 1 }}></i>
              <input
                type="text"
                placeholder="Search space name, address..."
                value={venueSearchQuery}
                onChange={(e) => setVenueSearchQuery(e.target.value)}
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem 0.6rem 2.3rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none' }}
              />
            </div>
          </div>

          {/* 2. Location Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Location</label>
            <select
              value={venueBranchFilter}
              onChange={(e) => setVenueBranchFilter(e.target.value)}
              style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Locations</option>
              <option value="TRACE Expert City Colombo 10">TRACE Expert City Colombo 10</option>
              <option value="TRACE Coworking Colombo 02">TRACE Coworking Colombo 02</option>
              <option value="TRACE Coworking Jaffna City">TRACE Coworking Jaffna City</option>
              <option value="TRACE BREAD Center, Makandura">TRACE BREAD Center, Makandura</option>
              <option value="TRACE Creators Space, Rathnapura">TRACE Creators Space, Rathnapura</option>
              <option value="Innovator Park - Kandy">Innovator Park - Kandy</option>
              <option value="ASAYA Workation By the Sea">ASAYA Workation By the Sea</option>
              <option value="UVA Co-Working Space">UVA Co-Working Space</option>
            </select>
          </div>

          {/* 3. Availability Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Status</label>
            <select
              value={venueStatusFilter}
              onChange={(e) => setVenueStatusFilter(e.target.value)}
              style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>

          {/* 4. Space Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Space Type</label>
            <select
              value={venueTypeFilter}
              onChange={(e) => setVenueTypeFilter(e.target.value)}
              style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Space Types</option>
              {AVAILABLE_SPACE_TYPES.map((typeOpt) => (
                <option key={typeOpt} value={typeOpt}>
                  {typeOpt}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Capacity Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Seating Capacity</label>
            <select
              value={venueCapacityFilter}
              onChange={(e) => setVenueCapacityFilter(e.target.value)}
              style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Any Capacity</option>
              <option value="small">Small (&lt; 100 Seats)</option>
              <option value="medium">Medium (100 - 200 Seats)</option>
              <option value="large">Large (&gt; 200 Seats)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {displayedVenues.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
            <i className="fa-solid fa-building-circle-xmark"></i>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>No Spaces Match Your Filters</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Try adjusting your search query, branch selector, or capacity limits.</p>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: '1.25rem' }}
            onClick={() => {
              setVenueSearchQuery('');
              setVenueBranchFilter('all');
              setVenueStatusFilter('all');
              setVenueCapacityFilter('all');
            }}
          >
            <i className="fa-solid fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      ) : (
        <div className="venues-grid-2col">
          {displayedVenues.map((v) => {
            const venueId = v._id || v.id;
            const formattedAddress = (v.address || '').replace(/,/g, ', ');
            const isDemand = v.isOnDemand || (v.rentalPrice && v.rentalPrice.toLowerCase().includes('demand')) || (!v.rentalPrice && (!v.pricePerHour || Number(v.pricePerHour) <= 0));
            const rawPrice = v.rentalPrice || (isDemand ? 'On Demand' : (v.pricePerHour ? `Rs. ${Number(v.pricePerHour).toLocaleString()} / hr` : 'On Demand'));
            const priceDisplay = (v.includeTax && !rawPrice.toLowerCase().includes('tax') && !rawPrice.toLowerCase().includes('vat'))
              ? `${rawPrice} ${v.taxLabelType || '+ Tax'}`
              : rawPrice;

            return (
              <div key={venueId || Math.random()} className="admin-venue-card">
                <div className="admin-venue-card-banner-wrapper">
                  {v.coverImage && typeof v.coverImage === 'string' && v.coverImage.trim().length > 0 && !v.coverImage.includes('photo-1517457373958-b7bdd4587205') && !v.coverImage.includes('photo-1540575467063-178a50c2df87') ? (
                    <img
                      src={v.coverImage}
                      alt={v.name}
                      className="admin-venue-card-banner"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.admin-venue-no-image-banner');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div
                    className="admin-venue-no-image-banner"
                    style={{
                      display: v.coverImage && typeof v.coverImage === 'string' && v.coverImage.trim().length > 0 && !v.coverImage.includes('photo-1517457373958-b7bdd4587205') && !v.coverImage.includes('photo-1540575467063-178a50c2df87') ? 'none' : 'flex',
                    }}
                  >
                    <i className="fa-regular fa-image" style={{ fontSize: '1.75rem', color: '#94a3b8' }}></i>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>No Photo</span>
                  </div>
                </div>
                <div className="admin-venue-card-body">
                  <div className="admin-venue-badges-row" style={{ flexWrap: 'wrap', gap: '5px' }}>
                    <span className={`admin-venue-status-pill ${v.status === 'Available' ? 'available' : 'reserved'}`}>
                      <span className="admin-venue-status-dot"></span>
                      {v.status || 'Available'}
                    </span>
                    {v.branch && (
                      <span className="admin-venue-branch-tag" title={v.branch}>
                        <i className="fa-solid fa-location-dot" style={{ fontSize: '0.7rem' }}></i>
                        {v.branch}
                      </span>
                    )}
                    {getSpaceTypes(v).map((st) => (
                      <span
                        key={st}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: '#0284c7',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <i className={`fa-solid ${getSpaceTypeIcon(st)}`}></i> {st}
                      </span>
                    ))}
                  </div>

                  <h3 className="admin-venue-card-title">{v.name}</h3>

                  <div className="admin-venue-location">
                    <i className="fa-solid fa-location-dot"></i>
                    <span title={formattedAddress}>{formattedAddress}</span>
                  </div>

                  <div className="admin-venue-stats-grid">
                    <div className="admin-venue-stat-box">
                      <div className="admin-venue-stat-label">
                        <i className="fa-solid fa-users"></i> Capacity
                      </div>
                      <div className="admin-venue-stat-val">
                        {typeof v.capacity === 'number' && v.capacity > 0
                          ? `${v.capacity} Seats`
                          : !isNaN(Number(v.capacity)) && Number(v.capacity) > 0
                            ? `${Number(v.capacity)} Seats`
                            : (v.capacity && String(v.capacity).trim() !== '' && v.capacity !== 0 && v.capacity !== '0'
                              ? v.capacity
                              : 'Custom Setup')}
                      </div>
                    </div>
                    <div className="admin-venue-stat-box">
                      <div className="admin-venue-stat-label">
                        <i className="fa-solid fa-tag"></i> {typeof priceDisplay === 'string' && priceDisplay.includes('/ day') ? 'Rate / Day' : (isDemand ? 'Rate' : 'Rate / Hr')}
                      </div>
                      <div
                        className="admin-venue-stat-val rate-val"
                        style={isDemand ? { color: '#059669', fontWeight: 800 } : {}}
                        title={priceDisplay}
                      >
                        {priceDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="admin-venue-amenities-section">
                    <div className="admin-venue-amenities-tags">
                      {v.amenities && v.amenities.map((am, i) => (
                        <span key={i} className="admin-venue-amenity-chip">
                          <i className="fa-solid fa-check"></i> {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="admin-venue-card-actions">
                    <button
                      type="button"
                      className="admin-btn-schedule"
                      onClick={() => showToast && showToast(`Booking schedule checked for "${v.name}"`, 'info')}
                    >
                      <i className="fa-regular fa-calendar-check"></i> Check Schedule
                    </button>
                    <button
                      type="button"
                      className="admin-btn-edit-venue"
                      onClick={() => setEditingVenue(v)}
                      title="Edit Venue Facility"
                    >
                      <i className="fa-regular fa-pen-to-square"></i> Edit Facility
                    </button>
                    <button
                      type="button"
                      className="admin-btn-delete-venue"
                      title="Delete Space"
                      onClick={async () => {
                        if (!venueId) return;
                        if (window.confirm(`Are you sure you want to delete venue "${v.name}"?`)) {
                          try {
                            const authToken = localStorage.getItem('eventhub_token') || token;
                            const res = await fetch(`/api/venues/${venueId}`, {
                              method: 'DELETE',
                              headers: {
                                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                              },
                            });
                            const data = await res.json();
                            if (data.success) {
                              notifyVenueUpdated({ _id: venueId, id: venueId, deleted: true });
                              setVenues((prev) => prev.filter((item) => (item._id || item.id) !== venueId));
                              if (showToast) showToast(`Deleted venue "${v.name}" successfully!`, 'success');
                            } else {
                              notifyVenueUpdated({ _id: venueId, id: venueId, deleted: true });
                              setVenues((prev) => prev.filter((item) => (item._id || item.id) !== venueId));
                              if (showToast) showToast(data.message || `Deleted venue "${v.name}"`, 'info');
                            }
                          } catch (err) {
                            console.error('Error deleting venue:', err);
                            notifyVenueUpdated({ _id: venueId, id: venueId, deleted: true });
                            setVenues((prev) => prev.filter((item) => (item._id || item.id) !== venueId));
                            if (showToast) showToast(`Deleted venue "${v.name}"`, 'info');
                          }
                        }
                      }}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
