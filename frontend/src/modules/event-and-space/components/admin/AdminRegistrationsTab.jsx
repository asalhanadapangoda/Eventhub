import React from 'react';

export default function AdminRegistrationsTab({
  events,
  registrations,
  displayedRegistrations,
  regEventFilter,
  setRegEventFilter,
  regStatusFilter,
  setRegStatusFilter,
  handleExportExcel,
  handleExportPDF,
  totalRegsCount,
  confirmedRegsCount,
  selectedReg,
  setSelectedReg,
  handleDirectStatusChange,
}) {
  return (
    <div className="manage-registrations-container">
      <div className="admin-dashboard-title-row">
        <div>
          <h1 className="admin-page-title">Event Registrations</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
            Manage attendees, view details, and export registration data.
          </p>
        </div>
      </div>

      {/* Filter Toolbar Box */}
      <div className="reg-toolbar-panel">
        <div className="reg-toolbar-filters">
          <div className="reg-filter-group">
            <label>SELECT EVENT</label>
            <select
              className="reg-filter-select"
              value={regEventFilter}
              onChange={(e) => setRegEventFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map((evt) => (
                <option key={evt._id} value={evt.title}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="reg-filter-group">
            <label>STATUS FILTER</label>
            <select
              className="reg-filter-select"
              value={regStatusFilter}
              onChange={(e) => setRegStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Export Action Buttons */}
        <div className="reg-export-actions">
          <button
            type="button"
            className="btn-export-excel"
            onClick={handleExportExcel}
            title="Download registration list as Excel (CSV) spreadsheet"
          >
            <i className="fa-solid fa-file-excel"></i> Export Excel
          </button>
          <button
            type="button"
            className="btn-export-pdf"
            onClick={handleExportPDF}
            title="Export / Print attendee list as PDF report"
          >
            <i className="fa-solid fa-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      {/* 2 Stat Cards Row */}
      <div className="reg-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">TOTAL REGISTERED</span>
            <div className="stat-value">{totalRegsCount.toLocaleString()}</div>
            <div className="stat-trend positive">
              <i className="fa-solid fa-arrow-trend-up"></i> +12% this week
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <i className="fa-solid fa-user-group"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">CONFIRMED</span>
            <div className="stat-value">{confirmedRegsCount.toLocaleString()}</div>
            <div className="stat-trend positive-pill">89% completion</div>
          </div>
          <div className="stat-icon-wrapper">
            <i className="fa-regular fa-circle-check"></i>
          </div>
        </div>
      </div>

      {/* Registrations Data Table Card */}
      <div className="admin-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <table className="admin-data-table reg-table-interactive">
            <thead>
              <tr>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>CONTACT NUMBER</th>
                <th>EVENT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {displayedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No registration records found.
                  </td>
                </tr>
              ) : (
                displayedRegistrations.map((reg) => {
                  const currentStatus = reg.status || 'Confirmed';
                  const statusClass =
                    currentStatus === 'Confirmed'
                      ? 'confirmed'
                      : currentStatus === 'Pending'
                        ? 'pending'
                        : 'cancelled';

                  return (
                    <tr
                      key={reg._id}
                      className={`reg-row-clickable ${selectedReg?._id === reg._id ? 'selected-row' : ''}`}
                      onClick={() => setSelectedReg(reg)}
                    >
                      <td>
                        <strong className="registrant-name">{reg.name}</strong>
                      </td>
                      <td>
                        <span className="registrant-email">{reg.email}</span>
                      </td>
                      <td>
                        <span className="cell-contact-text">{reg.contactNumber || '+94 77 123 4567'}</span>
                      </td>
                      <td>
                        <span className="cell-event-title">{reg.eventTitle || 'Tech Summit 2024'}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`status-pill-select ${statusClass}`}
                          value={currentStatus}
                          onChange={(e) => handleDirectStatusChange(reg._id, e.target.value)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            outline: 'none',
                            backgroundColor:
                              currentStatus === 'Confirmed'
                                ? '#dcfce7'
                                : currentStatus === 'Pending'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                            color:
                              currentStatus === 'Confirmed'
                                ? '#15803d'
                                : currentStatus === 'Pending'
                                  ? '#b45309'
                                  : '#b91c1c',
                          }}
                        >
                          <option value="Confirmed" style={{ background: '#fff', color: '#0f172a' }}>
                            Confirmed
                          </option>
                          <option value="Pending" style={{ background: '#fff', color: '#0f172a' }}>
                            Pending
                          </option>
                          <option value="Cancelled" style={{ background: '#fff', color: '#0f172a' }}>
                            Cancelled
                          </option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="table-pagination-bar">
          <span className="pagination-info">
            Showing 1 to {displayedRegistrations.length} of {registrations.length} entries
          </span>
          <div className="pagination-controls">
            <button className="page-nav-btn disabled">Previous</button>
            <button className="page-num-btn active">1</button>
            <button className="page-num-btn">2</button>
            <button className="page-num-btn">3</button>
            <button className="page-nav-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
