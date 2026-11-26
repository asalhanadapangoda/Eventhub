import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B192C] text-white pt-16 pb-8 border-t border-[#1f2d42]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link to="/" className="inline-block py-1 group">
              <img
                src="/trace-logo-white.png"
                alt="TRACE Innovation Academy - Powered by T2T"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            <p className="text-xs sm:text-sm text-[#bac7e1] leading-relaxed max-w-md mt-1">
              Inspiring innovation across Sri Lanka. Empowering next-generation innovators to build
              sustainable ventures through deep-tech, venture kitchens, and hands-on industrial entrepreneurship.
            </p>

            {/* Social Icons linked to official channels */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://web.facebook.com/TRACE.SL.info"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="Facebook"
                title="TRACE Sri Lanka on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://web.facebook.com/TRACE.SL.info"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="Instagram"
                title="TRACE Sri Lanka on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/trace_srilanka/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#0A66C2] flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="LinkedIn"
                title="TRACE Sri Lanka on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href="https://tracesrilanka.lk/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#006398] flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="Official Website"
                title="TRACE Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links & Programs (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#5bb8fe]">
              ACADEMY PROGRAMS
            </h4>
            <ul className="space-y-2 text-xs text-[#bac7e1] mt-1">
              <li>
                <Link to="/programs/program-01" className="hover:text-white transition-colors">
                  Innovation &amp; Design Thinking Masterclass
                </Link>
              </li>
              <li>
                <Link to="/programs/program-02" className="hover:text-white transition-colors">
                  Pre-Incubation Program on Startup Innovation
                </Link>
              </li>

              <li>
                <Link to="/workshops" className="hover:text-white transition-colors">
                  Workshops &amp; Masterclasses
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Details (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#5bb8fe]">
              CONTACT
            </h4>
            <div className="space-y-3 text-xs text-[#bac7e1] mt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#5bb8fe] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-white block font-bold text-sm mb-0.5">
                    TRACE Expert City
                  </strong>
                  Maradana,
                  <br />
                  Colombo 10.
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-[#5bb8fe] shrink-0" />
                <a
                  href="tel:+94701800786"
                  className="hover:text-white transition-colors font-medium text-sm text-[#e2e8f0]"
                >
                  +94 70 670 6791
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#5bb8fe] shrink-0" />
                <a
                  href="mailto:connect@trace.lk"
                  className="hover:text-white transition-colors font-medium text-[#e2e8f0]"
                >
                  connect@trace.lk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TRACE Sri Lanka (TRACE Innovation Academy). Powered by T2T. All Rights Reserved.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
