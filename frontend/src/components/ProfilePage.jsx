import React, { useState, useEffect } from 'react';

export default function ProfilePage({
  token,
  currentUser,
  setCurrentUser,
  logout,
  showToast,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const getInitialsAvatar = (cleanName) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName || 'User')}&background=5d4df6&color=fff&size=200`;
  };

  const getAvatarUrl = (userObj, currentName) => {
    if (userObj?.avatar && userObj.avatar.trim() !== '') {
      return userObj.avatar;
    }
    return getInitialsAvatar(currentName || userObj?.name);
  };

  useEffect(() => {
    const initialName = currentUser?.name || '';
    const initialEmail = currentUser?.email || '';
    setName(initialName);
    setEmail(initialEmail);
    setPhone(currentUser?.contactNumber || '');
    setAvatar(currentUser?.avatar ? currentUser.avatar : (initialName ? getInitialsAvatar(initialName) : ''));
  }, [currentUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      if (showToast) showToast('Please select an image smaller than 3MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatar(base64String);
      if (setCurrentUser) {
        setCurrentUser((prev) =>
          prev
            ? { ...prev, avatar: base64String }
            : { name, email, contactNumber: phone, avatar: base64String }
        );
      }
      saveAvatarToBackend(base64String);
    };
    reader.readAsDataURL(file);
  };

  const saveAvatarToBackend = async (newAvatar) => {
    const authToken = token || localStorage.getItem('eventhub_token');
    if (!authToken) {
      if (setCurrentUser) {
        setCurrentUser((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
      }
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ avatar: newAvatar }),
      });

      const result = await response.json();
      if (result.success) {
        if (setCurrentUser) {
          setCurrentUser(result.data);
        }
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const authToken = token || localStorage.getItem('eventhub_token');

    if (authToken) {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name,
            email,
            contactNumber: phone,
            avatar,
          }),
        });

        const result = await response.json();

        if (result.success) {
          if (setCurrentUser) {
            setCurrentUser(result.data);
          }
          if (showToast) {
            showToast('Profile updated successfully!', 'success');
          }
        } else {
          if (showToast) {
            showToast(result.message || 'Failed to update profile', 'error');
          }
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        if (showToast) {
          showToast('Network error updating profile', 'error');
        }
      } finally {
        setSaving(false);
      }
    } else {
      setTimeout(() => {
        setSaving(false);
        if (showToast) {
          showToast('Profile updated successfully!', 'success');
        }
      }, 300);
    }
  };

  const handleRemovePhoto = (e) => {
    if (e) e.preventDefault();
    const initialsAvatar = getInitialsAvatar(name);
    setAvatar(initialsAvatar);

    if (setCurrentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, avatar: '' } : null));
    }

    saveAvatarToBackend('');
    if (showToast) {
      showToast('Profile photo removed successfully!', 'info');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      if (showToast) showToast('Please enter your current password.', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      if (showToast) showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      if (showToast) showToast('New passwords do not match. Please verify.', 'error');
      return;
    }

    setChangingPassword(true);
    const authToken = token || localStorage.getItem('eventhub_token');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (showToast) showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        if (showToast) showToast(data.message || 'Failed to change password', 'error');
      }
    } catch (err) {
      console.error('Password change error:', err);
      if (showToast) showToast('Network error while changing password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="section-container">
        <div className="profile-grid-layout">
          {/* Left Column: Avatar & Quick Action Card */}
          <div className="profile-left-column">
            <div className="avatar-card-box">
              <div className="avatar-wrapper">
                <img src={avatar || getAvatarUrl(currentUser, name)} alt={name} />
                <label
                  htmlFor="avatar-file-input"
                  className="avatar-camera-btn"
                  title="Upload / Change Photo"
                >
                  <i className="fa-solid fa-camera"></i>
                </label>
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>

              <button
                type="button"
                className="btn-remove-photo-text"
                onClick={handleRemovePhoto}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                <i className="fa-regular fa-trash-can"></i> Remove Photo
              </button>

              <h2 className="avatar-user-name">{name}</h2>
              <p className="avatar-user-email">{email}</p>

              <div className="avatar-actions-group">
                <button
                  type="button"
                  className="btn-edit-profile-blue"
                  onClick={handleSaveChanges}
                >
                  <i className="fa-solid fa-floppy-disk"></i> Save Profile
                </button>
                <button type="button" className="btn-logout-outline" onClick={logout}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Details Cards */}
          <div className="profile-right-column">
            <form onSubmit={handleSaveChanges}>
              {/* Card 1: Account Information */}
              <div className="profile-card-box">
                <div className="profile-card-header">
                  <i className="fa-regular fa-user header-icon"></i>
                  <h3>Account Information</h3>
                </div>

                <div className="account-info-grid">
                  <div className="profile-form-group">
                    <label htmlFor="prof-name">Full Name</label>
                    <input
                      type="text"
                      id="prof-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="prof-email">Email Address</label>
                    <input
                      type="email"
                      id="prof-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="profile-form-group full-width">
                    <label htmlFor="prof-phone">Contact Number</label>
                    <input
                      type="tel"
                      id="prof-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Save Changes Button Row */}
              <div className="profile-save-row">
                <button
                  type="submit"
                  className="btn-save-changes-blue"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>

            {/* Card 2: Change Password Section */}
            <div className="profile-card-box" style={{ marginTop: '1.75rem' }}>
              <div className="profile-card-header">
                <i className="fa-solid fa-shield-halved header-icon"></i>
                <h3>Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className="account-info-grid">
                  {/* Current Password */}
                  <div className="profile-form-group full-width">
                    <label htmlFor="prof-current-pass">Current Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="prof-current-pass"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: 0,
                        }}
                        title={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fa-regular ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="profile-form-group">
                    <label htmlFor="prof-new-pass">
                      New Password * <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748b' }}>(min. 6 characters)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="prof-new-pass"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new strong password"
                        required
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: 0,
                        }}
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fa-regular ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="profile-form-group">
                    <label htmlFor="prof-confirm-pass">Confirm New Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="prof-confirm-pass"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        style={{
                          paddingRight: '2.5rem',
                          borderColor: confirmPassword && confirmPassword !== newPassword ? '#f43f5e' : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: 0,
                        }}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <span style={{ color: '#e11d48', fontSize: '0.75rem', fontWeight: '600', marginTop: '0.2rem' }}>
                        Passwords do not match
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Change Password Button */}
                <div className="profile-save-row" style={{ marginTop: '1.25rem' }}>
                  <button
                    type="submit"
                    className="btn-save-changes-blue"
                    disabled={changingPassword || (confirmPassword && confirmPassword !== newPassword)}
                    style={{
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {changingPassword ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Updating Password...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-key"></i> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
