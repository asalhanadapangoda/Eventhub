import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { toast } from '../../context/ToastContext';
import { User, Mail, Phone, Building, Save, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    bio: user?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePwChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const res = await authService.updateProfile(formData);
      if (res.success) {
        toast.success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPwLoading(true);

    try {
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0B192C]">My Personal Profile</h2>
        <p className="text-xs sm:text-sm text-[#44474c] mt-1">
          Manage your contact credentials and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Information (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7 shadow-sm">
            <h3 className="text-base font-bold text-[#0B192C] mb-4">Personal Details</h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleProfileChange}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Email Address (Verified)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#e2e8f0] bg-slate-50 text-xs text-[#75777d] cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    placeholder="+94 77..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Organization / University
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleProfileChange}
                    placeholder="University of Moratuwa..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Bio / Research Background
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleProfileChange}
                  placeholder="Share a short summary of your innovation projects or focus..."
                  className="w-full p-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full h-10 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security / Password Change (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7 shadow-sm">
            <h3 className="text-base font-bold text-[#0B192C] mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#006398]" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  value={passwordData.currentPassword}
                  onChange={handlePwChange}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={passwordData.newPassword}
                  onChange={handlePwChange}
                  placeholder="Min 6 characters"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  required
                  value={passwordData.confirmNewPassword}
                  onChange={handlePwChange}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full h-10 rounded-lg bg-[#0e1c2f] hover:bg-[#1f2d42] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span>{pwLoading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

