import React, { useState, useEffect } from 'react';
import { Mail, Globe, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactService } from '../../services/api';
import { toast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ContactSection() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    programTrack: 'Innovation & Design Thinking Masterclass (1 Month)',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await contactService.submitContact({
        userId: user?._id || user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.programTrack,
        programOfInterest: formData.programTrack,
        message: formData.message || `Inquiry regarding ${formData.programTrack}`,
      });

      if (res.success) {
        toast.success(
          'Thank you for reaching out! Your inquiry has been sent to TRACE innovation secretariat. We will get in touch with you shortly.'
        );
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          programTrack: 'Innovation & Design Thinking Masterclass (1 Month)',
          message: '',
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to send message. Please try again or email us directly at projects@trace.lk'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-[#f4f8fc] relative overflow-hidden">
      {/* Subtle Dot Grid Background Patterns */}
      <div
        className="absolute top-0 left-0 w-64 h-64 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#006398 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-72 h-72 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#006398 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Let's Connect & 4 Info Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Pill Badge */}
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#e0f2fe] text-[#006398] text-[11px] font-extrabold uppercase tracking-wider mb-3.5">
                GET IN TOUCH
              </span>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight mb-3.5">
                Let's Connect
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8 max-w-md">
                Have inquiries about admissions, curriculum tracks, or corporate sponsorship? Our
                innovation secretariat is here to help.
              </p>

              {/* 4 Contact Cards Stack */}
              <div className="space-y-3.5">
                {/* 1. Email */}
                <a
                  href="mailto:projects@trace.lk"
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-300 p-4 flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#004e85] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5 text-[#8ed0ff]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      EMAIL
                    </span>
                    <span className="text-sm font-bold text-[#0B192C] truncate mt-0.5 group-hover:text-[#006398] transition-colors">
                      connect@trace.lk
                    </span>
                  </div>
                </a>

                {/* 2. Website */}
                <a
                  href="https://tracesrilanka.lk"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-300 p-4 flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#004e85] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5 text-[#8ed0ff]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      WEBSITE
                    </span>
                    <span className="text-sm font-bold text-[#0B192C] truncate mt-0.5 group-hover:text-[#006398] transition-colors">
                      www.tracesrilanka.lk
                    </span>
                  </div>
                </a>

                {/* 3. Contact Number */}
                <a
                  href="tel:+94701510444"
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-300 p-4 flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#004e85] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5 text-[#8ed0ff]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      CONTACT NUMBER
                    </span>
                    <span className="text-sm font-bold text-[#0B192C] truncate mt-0.5 group-hover:text-[#006398] transition-colors">
                      070 670 6791
                    </span>
                  </div>
                </a>

                {/* 4. Location */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#004e85] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-[#8ed0ff]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      LOCATION
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#0B192C] truncate mt-0.5">
                      TRACE Expert City, Maradana, Colombo 00100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow TRACE Ecosystem */}
            <div className="pt-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
                FOLLOW TRACE ECOSYSTEM
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-xs font-bold text-slate-700 hover:text-[#006398] hover:border-[#006398] transition-all"
                  aria-label="LinkedIn"
                >
                  in
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-xs font-bold text-slate-700 hover:text-[#006398] hover:border-[#006398] transition-all"
                  aria-label="Facebook"
                >
                  fb
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-xs font-bold text-slate-700 hover:text-[#006398] hover:border-[#006398] transition-all"
                  aria-label="YouTube"
                >
                  yt
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Form Card (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Full Name & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Kasun Fernando"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8fafc]/50 text-sm text-[#0B192C] placeholder:text-slate-400 focus:bg-white focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@domain.lk"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8fafc]/50 text-sm text-[#0B192C] placeholder:text-slate-400 focus:bg-white focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Program Track / Engagement */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    PROGRAM TRACK / ENGAGEMENT
                  </label>
                  <select
                    name="programTrack"
                    value={formData.programTrack}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8fafc]/50 text-sm text-[#0B192C] focus:bg-white focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="Innovation & Design Thinking Masterclass (1 Month)">
                      Innovation &amp; Design Thinking Masterclass (1 Month)
                    </option>
                    <option value="Pre-Incubation Program on Startup Innovation (3 Months)">
                      Pre-Incubation Program on Startup Innovation (3 Months)
                    </option>
                    <option value="Corporate R&D Sponsorship & Industry Visit">
                      Corporate R&amp;D Sponsorship &amp; Industry Visit
                    </option>
                    <option value="General Inquiry & Admissions Secretariat">
                      General Inquiry &amp; Admissions Secretariat
                    </option>
                  </select>
                </div>

                {/* Row 3: Message */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    placeholder="Provide details regarding your background and program goals..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8fafc]/50 text-sm text-[#0B192C] placeholder:text-slate-400 focus:bg-white focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {/* Row 4: Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#005fa3] hover:bg-[#004e85] text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                >
                  <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                  <Send className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
