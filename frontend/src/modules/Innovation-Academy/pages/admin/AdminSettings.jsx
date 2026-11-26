import React, { useState } from 'react';
import { Database, ShieldCheck, Building, Key, Server, CheckCircle2, Save } from 'lucide-react';
import { toast } from '../../context/ToastContext';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    organization: 'Innovation',
    project: 'InnovationA',
    campus: 'TRACE Expert City, Bay 05, Maradana, Colombo 10',
    contactEmail: 'projects@trace.lk',
    contactPhone: '+94 70 151 0444',
    website: 'https://tracesrilanka.org',
    jwtExpiry: '30 Days',
    smtpStatus: 'Mock / Console Mode (Configurable via server/.env)',
    databaseEngine: 'MongoDB with Mongoose ODM',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0B192C]">System Settings &amp; Architecture</h2>
        <p className="text-xs sm:text-sm text-[#44474c] mt-1">
          Cluster configuration, organization metadata, and MongoDB integration status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Project & Organization Plaque */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3">
            <Server className="w-5 h-5 text-[#006398]" />
            <h3 className="text-base font-bold text-[#0B192C]">Organization &amp; Project Info</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0]">
              <span className="text-[11px] text-[#75777d] uppercase font-bold tracking-wider block">
                Organization Name
              </span>
              <span className="text-lg font-extrabold text-[#0B192C] mt-1 block">
                {settings.organization}
              </span>
              <span className="text-xs text-[#006398] font-medium">Active Deployment</span>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0]">
              <span className="text-[11px] text-[#75777d] uppercase font-bold tracking-wider block">
                Project Name
              </span>
              <span className="text-lg font-extrabold text-[#0B192C] mt-1 block">
                {settings.project}
              </span>
              <span className="text-xs text-[#006398] font-medium">MongoDB Atlas Cluster</span>
            </div>
          </div>
        </div>

        {/* Database & Security Architecture */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3">
            <Database className="w-5 h-5 text-[#006398]" />
            <h3 className="text-base font-bold text-[#0B192C]">Database &amp; Engine Stack</h3>
          </div>

          <div className="space-y-3 text-xs text-[#131b2e]">
            <div className="flex justify-between py-2 border-b border-[#f2f3ff]">
              <span className="text-[#75777d]">Database Architecture:</span>
              <span className="font-bold">MongoDB Atlas / Mongoose ODM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f2f3ff]">
              <span className="text-[#75777d]">Connected Collections:</span>
              <span className="font-bold">
                Users, Programs, Workshops, ProgramRegistrations, VisitRequests, ContactMessages, Notifications
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f2f3ff]">
              <span className="text-[#75777d]">Workshop Access Rule:</span>
              <span className="font-bold text-emerald-700">
                Automatic access determined by active Program Registration (No separate tickets)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f2f3ff]">
              <span className="text-[#75777d]">Authentication:</span>
              <span className="font-bold">JWT (JSON Web Tokens) with bcrypt password hashing</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#75777d]">Email Notification Service:</span>
              <span className="font-bold text-[#006398]">{settings.smtpStatus}</span>
            </div>
          </div>
        </div>

        {/* Campus & Headquarters Info */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3">
            <Building className="w-5 h-5 text-[#006398]" />
            <h3 className="text-base font-bold text-[#0B192C]">TRACE Secretariat &amp; Campus</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">
                Campus Physical Address
              </label>
              <input
                type="text"
                value={settings.campus}
                onChange={(e) => setSettings({ ...settings, campus: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Secretariat Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Contact Telephone
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#006398] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

