import React from 'react';

const CloudinaryUploader = React.lazy(() => import('../CloudinaryUploader'));

export default function AdminUserModals({
  selectedReg,
  setSelectedReg,
  getInitials,
  isChangingStatus,
  setIsChangingStatus,
  editingRegStatus,
  setEditingRegStatus,
  copyToClipboard,
  isEditingNotes,
  setIsEditingNotes,
  editingRegNotes,
  setEditingRegNotes,
  showToast,
  handleSaveRegistrationChanges,
  savingReg,
  showAddBranchAdminModal,
  setShowAddBranchAdminModal,
  handleCreateBranchAdmin,
  branchAdminForm,
  setBranchAdminForm,
  submittingBranchAdmin,
  editingAdminUser,
  setEditingAdminUser,
  handleSaveAdminEdit,
  editingAdminForm,
  setEditingAdminForm,
  savingAdminEdit,
  emailNotificationModalData,
  setEmailNotificationModalData,
}) {
  return (
    <>
      {/* REGISTRATION DETAILS SLIDE-OVER DRAWER */}
      {selectedReg && (
        <div className="drawer-backdrop" onClick={() => setSelectedReg(null)}>
          <aside className="registration-details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Registration Details</h2>
              <button className="btn-close-drawer" onClick={() => setSelectedReg(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="drawer-body-content">
              <div className="drawer-user-section">
                <div className="drawer-avatar-circle">
                  {getInitials(selectedReg.name)}
                </div>
                <div>
                  <h3 className="drawer-user-name">{selectedReg.name}</h3>
                  <p className="drawer-user-role">Senior Developer at Corp Inc.</p>
                </div>
              </div>

              <div className="drawer-status-card">
                <div className="drawer-status-header">
                  <span className="drawer-section-label">CURRENT STATUS</span>
                  <button
                    type="button"
                    className="btn-change-status-link"
                    onClick={() => setIsChangingStatus(!isChangingStatus)}
                  >
                    Change
                  </button>
                </div>

                {isChangingStatus ? (
                  <select
                    className="drawer-status-select"
                    value={editingRegStatus}
                    onChange={(e) => setEditingRegStatus(e.target.value)}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div className="current-status-value">
                    <span
                      className={`status-indicator-dot ${
                        editingRegStatus === 'Confirmed'
                          ? 'dot-confirmed'
                          : editingRegStatus === 'Pending'
                            ? 'dot-pending'
                            : 'dot-cancelled'
                      }`}
                    ></span>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{editingRegStatus}</strong>
                  </div>
                )}
              </div>

              <div className="drawer-section-group">
                <span className="drawer-section-label">EVENT INFORMATION</span>

                <div className="drawer-info-row">
                  <span className="info-key">Event Name</span>
                  <div className="info-val-strong">{selectedReg.eventTitle || 'Tech Summit 2024'}</div>
                </div>

                <div className="drawer-info-row">
                  <span className="info-key">Registration Date</span>
                  <div className="info-val-muted">
                    {selectedReg.createdAt
                      ? new Date(selectedReg.createdAt).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'October 24, 2023 at 10:45 AM'}
                  </div>
                </div>
              </div>

              <div className="drawer-section-group">
                <span className="drawer-section-label">CONTACT DETAILS</span>

                <div className="drawer-info-row">
                  <span className="info-key">Email Address</span>
                  <div className="info-val-copy">
                    <span>{selectedReg.email}</span>
                    <button
                      type="button"
                      className="btn-copy-icon"
                      onClick={() => copyToClipboard(selectedReg.email)}
                      title="Copy Email"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>
                  </div>
                </div>

                <div className="drawer-info-row">
                  <span className="info-key">Phone Number</span>
                  <div className="info-val-muted">{selectedReg.contactNumber || '+94 77 123 4567'}</div>
                </div>
              </div>

              <div className="drawer-section-group">
                <div className="drawer-notes-header">
                  <span className="drawer-section-label">ADMIN NOTES</span>
                  <button
                    type="button"
                    className="btn-edit-note-link"
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                  >
                    <i className="fa-regular fa-pen-to-square"></i> Edit Note
                  </button>
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows="3"
                    className="drawer-notes-textarea"
                    value={editingRegNotes}
                    onChange={(e) => setEditingRegNotes(e.target.value)}
                  ></textarea>
                ) : (
                  <div className="drawer-notes-box">
                    <p>"{editingRegNotes}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="drawer-footer-actions">
              <button
                type="button"
                className="btn-drawer-resend"
                onClick={() =>
                  showToast &&
                  showToast(`Resent ticket confirmation to ${selectedReg.email}`, 'success')
                }
              >
                Resend Ticket
              </button>

              <button
                type="button"
                className="btn-drawer-save"
                onClick={handleSaveRegistrationChanges}
                disabled={savingReg}
              >
                {savingReg ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Assign Branch Admin Modal */}
      {showAddBranchAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAddBranchAdminModal(false)}>
          <div
            className="modal-card admin-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', padding: '2rem' }}
          >
            <button className="modal-close" onClick={() => setShowAddBranchAdminModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-user-shield" style={{ color: '#5d4df6' }}></i>
                Assign Branch Admin & Grant Access
              </h2>
              <p className="modal-sub">
                Assign an admin for a specific TRACE branch. Credentials and assigned permissions will be dispatched to their email inbox automatically.
              </p>
            </div>

            <form onSubmit={handleCreateBranchAdmin}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Branch Admin Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={branchAdminForm.name}
                  onChange={(e) => setBranchAdminForm({ ...branchAdminForm, name: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kasun@trace.lk"
                    value={branchAdminForm.email}
                    onChange={(e) => setBranchAdminForm({ ...branchAdminForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Assign Temporary Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BranchAdmin@2026"
                    value={branchAdminForm.password}
                    onChange={(e) => setBranchAdminForm({ ...branchAdminForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Assigned TRACE Branch / Hub *</label>
                <select
                  value={branchAdminForm.branch}
                  onChange={(e) => setBranchAdminForm({ ...branchAdminForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600' }}
                >
                  <option value="TRACE Expert City Colombo 10">TRACE Expert City Colombo 10</option>
                  <option value="HomeTree Coworking, Colombo 04">HomeTree Coworking, Colombo 04</option>
                  <option value="TRACE Coworking Colombo 02">TRACE Coworking Colombo 02</option>
                  <option value="TRACE Coworking Jaffna City">TRACE Coworking Jaffna City</option>
                  <option value="TRACE BREAD Center, Makandura">TRACE BREAD Center, Makandura</option>
                  <option value="TRACE - JRDC Incubator, Kandy">TRACE - JRDC Incubator, Kandy</option>
                  <option value="TRACE Creators Space, Rathnapura">TRACE Creators Space, Rathnapura</option>
                  <option value="TRACE Batticaloa">TRACE Batticaloa</option>
                  <option value="Southern Innovation Hub">Southern Innovation Hub</option>
                  <option value="UOK Innovation Hub">UOK Innovation Hub</option>
                  <option value="UWU Innovation Hub">UWU Innovation Hub</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>Granted Permissions & Control Scope</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {[
                    { id: 'manage_events', label: '📅 Create & Edit Branch Events' },
                    { id: 'manage_registrations', label: '👥 Manage Participant Registrations' },
                    { id: 'manage_spaces', label: '🏢 Manage Branch Spaces & Inquiries' },
                    { id: 'view_analytics', label: '📊 View Analytics & Reports' },
                  ].map((perm) => (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={branchAdminForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setBranchAdminForm((prev) => ({
                            ...prev,
                            permissions: checked
                              ? [...prev.permissions, perm.id]
                              : prev.permissions.filter((p) => p !== perm.id),
                          }));
                        }}
                        style={{ accentColor: '#5d4df6', width: '16px', height: '16px' }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddBranchAdminModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#5d4df6', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={submittingBranchAdmin}
                >
                  {submittingBranchAdmin ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Assigning & Sending Mail...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Assign & Dispatch Credentials Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Administrator Account Details Modal (Admins Only) */}
      {editingAdminUser && (
        <div className="modal-overlay" onClick={() => setEditingAdminUser(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '620px', padding: '2rem', borderRadius: '16px' }}
          >
            <button className="modal-close" onClick={() => setEditingAdminUser(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-user-pen" style={{ color: '#5d4df6' }}></i>
                Edit Administrator Details & Avatar
              </h2>
              <p className="modal-sub">
                Update account name, assigned TRACE branch, Granted Permissions, and profile avatar photo for <strong style={{ color: '#5d4df6' }}>{editingAdminUser.email}</strong>.
              </p>
            </div>

            <form onSubmit={handleSaveAdminEdit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ marginBottom: '0.35rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>
                  Administrator Email (Account Identifier)
                </label>
                <input
                  type="email"
                  value={editingAdminUser.email}
                  disabled
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', fontWeight: '600' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ marginBottom: '0.35rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingAdminForm.name}
                  onChange={(e) => setEditingAdminForm({ ...editingAdminForm, name: e.target.value })}
                  placeholder="e.g. Kasun Kalhara"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ marginBottom: '0.35rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>
                  Assigned TRACE Branch Location
                </label>
                <select
                  value={editingAdminForm.branch}
                  onChange={(e) => setEditingAdminForm({ ...editingAdminForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  <option value="TRACE Expert City Colombo 10">TRACE Expert City Colombo 10</option>
                  <option value="HomeTree Coworking, Colombo 04">HomeTree Coworking, Colombo 04</option>
                  <option value="TRACE Coworking Colombo 02">TRACE Coworking Colombo 02</option>
                  <option value="TRACE Coworking Jaffna City">TRACE Coworking Jaffna City</option>
                  <option value="TRACE BREAD Center, Makandura">TRACE BREAD Center, Makandura</option>
                  <option value="TRACE - JRDC Incubator, Kandy">TRACE - JRDC Incubator, Kandy</option>
                  <option value="TRACE Creators Space, Rathnapura">TRACE Creators Space, Rathnapura</option>
                  <option value="TRACE Batticaloa">TRACE Batticaloa</option>
                  <option value="Southern Innovation Hub">Southern Innovation Hub</option>
                  <option value="UOK Innovation Hub">UOK Innovation Hub</option>
                  <option value="UWU Innovation Hub">UWU Innovation Hub</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                  <i className="fa-solid fa-camera" style={{ color: '#5d4df6' }}></i>
                  Admin Avatar Photo (Upload or Image URL)
                </label>

                {editingAdminForm.avatar && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <img
                      src={editingAdminForm.avatar}
                      alt="Admin Avatar Preview"
                      style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #5d4df6' }}
                      loading="lazy"
                      decoding="async"
                      width={54}
                      height={54}
                    />
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '700', display: 'block' }}>✓ Current Avatar Loaded</span>
                      <button
                        type="button"
                        onClick={() => setEditingAdminForm({ ...editingAdminForm, avatar: '' })}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                )}

                <React.Suspense fallback={<div style={{ fontSize: '0.82rem', color: '#64748b' }}>Loading uploader...</div>}>
                  <CloudinaryUploader
                    accept="image/*"
                    label="Upload New Admin Photo to Cloudinary"
                    onUploadSuccess={(url) => setEditingAdminForm({ ...editingAdminForm, avatar: url })}
                  />
                </React.Suspense>

                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>Or Paste Image URL directly:</label>
                  <input
                    type="text"
                    value={editingAdminForm.avatar}
                    onChange={(e) => setEditingAdminForm({ ...editingAdminForm, avatar: e.target.value })}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>Granted Permissions & Scope</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {[
                    { id: 'manage_events', label: '📅 Create & Edit Branch Events' },
                    { id: 'manage_registrations', label: '👥 Manage Participant Registrations' },
                    { id: 'manage_spaces', label: '🏢 Manage Branch Spaces & Inquiries' },
                    { id: 'view_analytics', label: '📊 View Analytics & Reports' },
                  ].map((perm) => (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingAdminForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingAdminForm((prev) => ({
                            ...prev,
                            permissions: checked
                              ? [...prev.permissions, perm.id]
                              : prev.permissions.filter((p) => p !== perm.id),
                          }));
                        }}
                        style={{ accentColor: '#5d4df6', width: '16px', height: '16px' }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingAdminUser(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#5d4df6', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={savingAdminEdit}
                >
                  {savingAdminEdit ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> Save Admin Details & Photo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Credentials Dispatch Notification Preview Modal */}
      {emailNotificationModalData && (
        <div className="modal-overlay" onClick={() => setEmailNotificationModalData(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', padding: '2rem', borderRadius: '16px' }}
          >
            <button className="modal-close" onClick={() => setEmailNotificationModalData(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Email Notification Dispatched Successfully!
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.25rem' }}>
                A confirmation email with login credentials and permissions has been sent to the branch admin's inbox.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <div style={{ background: '#0f172a', color: '#ffffff', padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fa-solid fa-envelope" style={{ marginRight: '6px', color: '#38bdf8' }}></i> {emailNotificationModalData.subject}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sent Just Now</span>
              </div>

              <div style={{ padding: '1.25rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  Hello <strong>{emailNotificationModalData.adminName}</strong>,
                </div>
                <p style={{ margin: '0 0 1rem 0' }}>
                  You have been granted <strong>Branch Admin Access</strong> for <strong>{emailNotificationModalData.branchName}</strong> on the TRACE Event Hub platform.
                </p>

                <div style={{ background: '#f8fafc', border: '1px border-dashed #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.35rem' }}>📧 <strong>Login Email:</strong> <span style={{ color: '#5d4df6', fontWeight: '600' }}>{emailNotificationModalData.email}</span></div>
                  <div style={{ marginBottom: '0.35rem' }}>🔑 <strong>Temporary Password:</strong> <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{emailNotificationModalData.temporaryPassword}</code></div>
                  <div>🏢 <strong>Assigned Branch:</strong> {emailNotificationModalData.branchName}</div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Granted Permissions:</strong>
                  <ul style={{ margin: '0.35rem 0 0 1.2rem', padding: 0, fontSize: '0.84rem' }}>
                    {emailNotificationModalData.grantedPermissions.map((p, idx) => (
                      <li key={idx} style={{ color: '#059669', fontWeight: '600' }}>✓ {p.replace('_', ' ').toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', backgroundColor: '#5d4df6', fontWeight: '700' }}
              onClick={() => setEmailNotificationModalData(null)}
            >
              Done & Close Preview
            </button>
          </div>
        </div>
      )}
    </>
  );
}
