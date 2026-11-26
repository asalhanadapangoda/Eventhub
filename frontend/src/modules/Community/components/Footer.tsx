import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0B192C] text-slate-300 pt-16 pb-10 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#1E293B]">
          {/* Column 1: TRACE Sri Lanka logo, description & circular social icons */}
          <div className="md:col-span-5 lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-white/20">
                <img
                  src="/community/trace-logo.png"
                  alt="TRACE Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg text-white tracking-wide">
                  TRACE <span className="text-[#51B4FE]">COMMUNITY</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Sri Lanka Collaborative Ecosystem
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Inspiring innovation across Sri Lanka. Empowering corporate technology powerhouses, frontier venture startups, national industry apex chambers, and academic engineering hubs across Technopark Mulgampola and the Sri Lankan digital network.
            </p>

            {/* Circular Social Buttons matching the screenshot design */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://web.facebook.com/TRACE.SL.info"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="w-9 h-9 rounded-full bg-[#1E293B] hover:bg-[#51B4FE] text-slate-300 hover:text-[#0B192C] flex items-center justify-center transition-all duration-200 border border-white/5 shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/trace_srilanka/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-9 h-9 rounded-full bg-[#1E293B] hover:bg-[#51B4FE] text-slate-300 hover:text-[#0B192C] flex items-center justify-center transition-all duration-200 border border-white/5 shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/trace-sri-lanka/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="w-9 h-9 rounded-full bg-[#1E293B] hover:bg-[#51B4FE] text-slate-300 hover:text-[#0B192C] flex items-center justify-center transition-all duration-200 border border-white/5 shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://trace.lk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official Website"
                title="Official TRACE Website"
                className="w-9 h-9 rounded-full bg-[#1E293B] hover:bg-[#51B4FE] text-slate-300 hover:text-[#0B192C] flex items-center justify-center transition-all duration-200 border border-white/5 shadow-sm"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="TRACE on YouTube"
                className="w-9 h-9 rounded-full bg-[#1E293B] hover:bg-[#51B4FE] text-slate-300 hover:text-[#0B192C] flex items-center justify-center transition-all duration-200 border border-white/5 shadow-sm"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Directory Sectors / Quick Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#51B4FE] mb-5">
              COMMUNITY DIRECTORY
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('corporate')}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  Corporate Partners
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('startups')}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  Startups
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('local')}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  Local Partners
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('international')}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  International Partners
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('government')}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  Government Partners
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('university')}
                  className="hover:text-white transition-colors text-left focus:outline-none"
                >
                  University Partners
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact information matching the screenshot design */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#51B4FE] mb-5">
              CONTACT
            </h4>
            <div className="space-y-4 text-xs">
              {/* MapPin / Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#51B4FE] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">TRACE Expert City</span>
                  <span className="text-slate-400">Maradana,</span>
                  <span className="text-slate-400">Colombo 10.</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#51B4FE] flex-shrink-0" />
                <a
                  href="tel:+94706706791"
                  className="text-white hover:text-[#51B4FE] transition-colors font-medium"
                >
                  +94 70 670 6791
                </a>
              </div>

              {/* Mail */}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#51B4FE] flex-shrink-0" />
                <a
                  href="mailto:connect@trace.lk"
                  className="text-white hover:text-[#51B4FE] transition-colors"
                >
                  connect@trace.lk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TRACE Sri Lanka. All Rights Reserved.</p>
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
