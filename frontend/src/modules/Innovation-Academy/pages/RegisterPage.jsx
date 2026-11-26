import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { Lock, Mail, User, Building, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        organization: formData.organization,
      });

      if (res.success) {
        toast.success('Account created successfully! Welcome to TRACE.');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register account';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-8 shadow-xl">
            <div className="text-center mb-8">
              <img
                src="/innovation-academy/trace-logo.png"
                alt="TRACE Innovation Academy"
                className="h-11 w-auto object-contain mx-auto mb-3"
              />
              <h1 className="text-2xl font-extrabold text-[#0B192C]">Create TRACE Account</h1>
              <p className="text-xs text-[#44474c] mt-1">
                Join Sri Lanka’s flagship deep-tech innovation and incubation network
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Nimna Jayawardena"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nimna@heliostech.lk"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+94 71..."
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-11 pl-9 pr-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    Organization
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="organization"
                      placeholder="University / Co"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full h-11 pl-9 pr-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full h-11 pl-9 pr-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full h-11 pl-9 pr-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <span>Creating Account...</span> : <span>Register Account</span>}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#44474c]">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#006398] hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

