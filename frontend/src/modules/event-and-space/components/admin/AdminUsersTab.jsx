import React from 'react';

export default function AdminUsersTab({
  registeredUsers,
  setRegisteredUsers,
  userRoleFilter,
  setUserRoleFilter,
  searchQuery,
  setShowAddBranchAdminModal,
  setEditingAdminUser,
  setEditingAdminForm,
  handleSendEmailCredentials,
  token,
  showToast,
}) {
  return (
    <div className="manage-registrations-container">
      <div className="admin-dashboard-title-row">
        <div>
          <h1 className="admin-page-title">Registered Members & Branch Access Control</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
            View registered platform users, assign branch admins for individual hubs, set permissions, and send credential emails.
          </p>
        </div>
        <button
          className="btn-create-event-blue"
          onClick={() => setShowAddBranchAdminModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fa-solid fa-user-shield"></i> Assign New Branch Admin
        </button>
      </div>

      {/* Stats Row */}
      <div className="reg-stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">TOTAL REGISTERED MEMBERS</span>
            <div className="stat-value">{registeredUsers.length}</div>
            <div className="stat-trend positive">
              <i className="fa-solid fa-users"></i> Platform Accounts
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <i className="fa-solid fa-user-check"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">BRANCH ADMINS</span>
            <div className="stat-value" style={{ color: '#5d4df6' }}>
              {registeredUsers.filter((u) => u.role === 'branch_admin' || u.role === 'admin').length}
            </div>
            <div className="stat-trend positive-pill">Hub Administrators</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#5d4df6' }}>
            <i className="fa-solid fa-user-shield"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">ACTIVE TRACE BRANCHES</span>
            <div className="stat-value" style={{ color: '#059669' }}>6</div>
            <div className="stat-trend positive">Colombo, Kandy, Galle, Jaffna</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#059669' }}>
            <i className="fa-solid fa-building"></i>
          </div>
        </div>
      </div>

      {/* Users & Branch Admins Data Table */}
      <div className="admin-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Role Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: '1px solid #eaecf0', background: '#f8fafc', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setUserRoleFilter('all')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: userRoleFilter === 'all' ? '#ffffff' : 'transparent',
                color: userRoleFilter === 'all' ? '#5d4df6' : '#64748b',
                boxShadow: userRoleFilter === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-users"></i> All Members
              <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '12px', background: userRoleFilter === 'all' ? '#eef2ff' : '#cbd5e1', color: userRoleFilter === 'all' ? '#5d4df6' : '#475569' }}>
                {registeredUsers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setUserRoleFilter('admins')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: userRoleFilter === 'admins' ? '#ffffff' : 'transparent',
                color: userRoleFilter === 'admins' ? '#5d4df6' : '#64748b',
                boxShadow: userRoleFilter === 'admins' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-user-shield"></i> Admins Only
              <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '12px', background: userRoleFilter === 'admins' ? '#eef2ff' : '#cbd5e1', color: userRoleFilter === 'admins' ? '#5d4df6' : '#475569' }}>
                {registeredUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin' || u.role === 'branch_admin').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setUserRoleFilter('users')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: userRoleFilter === 'users' ? '#ffffff' : 'transparent',
                color: userRoleFilter === 'users' ? '#5d4df6' : '#64748b',
                boxShadow: userRoleFilter === 'users' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-user"></i> Regular Users
              <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '12px', background: userRoleFilter === 'users' ? '#eef2ff' : '#cbd5e1', color: userRoleFilter === 'users' ? '#5d4df6' : '#475569' }}>
                {registeredUsers.filter((u) => u.role !== 'admin' && u.role !== 'super_admin' && u.role !== 'branch_admin').length}
              </span>
            </button>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table members-data-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>USER / ADMIN</th>
                <th style={{ width: '22%' }}>EMAIL ADDRESS</th>
                <th style={{ width: '20%' }}>ASSIGNED BRANCH</th>
                <th style={{ width: '16%' }}>ROLE & PERMISSIONS</th>
                <th style={{ width: '12%' }}>REGISTERED DATE</th>
                <th style={{ width: '8%', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                    No registered user accounts found.
                  </td>
                </tr>
              ) : (
                registeredUsers
                  .filter((u) => {
                    const isAdmin = u.role === 'admin' || u.role === 'super_admin' || u.role === 'branch_admin';
                    if (userRoleFilter === 'admins' && !isAdmin) return false;
                    if (userRoleFilter === 'users' && isAdmin) return false;

                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q) ||
                      (u.branch && u.branch.toLowerCase().includes(q)) ||
                      (u.contactNumber && u.contactNumber.includes(q))
                    );
                  })
                  .map((u) => (
                    <tr key={u._id || u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={
                              u.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=5d4df6&color=fff&size=80`
                            }
                            alt={u.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #eef2ff',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                            }}
                            loading="lazy"
                            decoding="async"
                            width={40}
                            height={40}
                          />
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.94rem' }}>{u.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#4f46e5', fontWeight: '500', fontSize: '0.88rem' }}>{u.email}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.86rem', fontWeight: '600', color: '#1e293b' }}>
                          {u.branch || 'TRACE Main (Colombo)'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              display: 'inline-block',
                              width: 'fit-content',
                              backgroundColor:
                                u.role === 'admin' || u.role === 'super_admin'
                                  ? '#eff6ff'
                                  : u.role === 'branch_admin'
                                    ? '#f0fdf4'
                                    : '#f1f5f9',
                              color:
                                u.role === 'admin' || u.role === 'super_admin'
                                  ? '#5d4df6'
                                  : u.role === 'branch_admin'
                                    ? '#16a34a'
                                    : '#475569',
                              border:
                                u.role === 'admin' || u.role === 'super_admin'
                                  ? '1px solid #bfdbfe'
                                  : u.role === 'branch_admin'
                                    ? '1px solid #bbf7d0'
                                    : '1px solid #cbd5e1',
                            }}
                          >
                            {u.role === 'admin'
                              ? '● Super Admin'
                              : u.role === 'branch_admin'
                                ? '● Branch Admin'
                                : 'User Member'}
                          </span>
                          {u.permissions && u.permissions.length > 0 && (
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {u.permissions.map((p) => p.replace('manage_', '')).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#475569', fontSize: '0.86rem', fontWeight: '500' }}>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.5rem',
                            width: '112px',
                          }}
                        >
                          {(u.role === 'branch_admin' || u.role === 'admin' || u.role === 'super_admin') && (
                            <>
                              <button
                                className="icon-btn-action"
                                title="Edit Admin Details & Avatar Upload"
                                onClick={() => {
                                  setEditingAdminUser(u);
                                  setEditingAdminForm({
                                    name: u.name || '',
                                    branch: u.branch || 'TRACE Expert City (Colombo)',
                                    permissions: u.permissions || ['manage_events', 'manage_registrations'],
                                    avatar: u.avatar || '',
                                  });
                                }}
                                style={{ color: '#5d4df6', background: '#eef2ff', border: '1px solid #bfdbfe' }}
                              >
                                <i className="fa-solid fa-user-pen"></i>
                              </button>

                              <button
                                className="icon-btn-action"
                                title="Resend Credentials Email to Branch Admin"
                                onClick={() => handleSendEmailCredentials(u)}
                                style={{ color: '#5d4df6', background: '#eff6ff', border: '1px solid #bfdbfe' }}
                              >
                                <i className="fa-solid fa-paper-plane"></i>
                              </button>
                            </>
                          )}
                          <button
                            className="icon-btn-action danger"
                            title="Delete User"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete user account "${u.name}" (${u.email})?`
                                )
                              ) {
                                try {
                                  const authToken = localStorage.getItem('eventhub_token') || token;
                                  const res = await fetch(`/api/auth/users/${u._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                                    },
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    setRegisteredUsers((prev) => prev.filter((item) => item._id !== u._id));
                                    if (showToast) showToast(`Deleted user account ${u.email}`, 'success');
                                  } else {
                                    if (showToast) showToast(data.message || 'Failed to delete user', 'error');
                                  }
                                } catch (err) {
                                  console.error('Error deleting user:', err);
                                  if (showToast) showToast('Network error deleting user', 'error');
                                }
                              }
                            }}
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
