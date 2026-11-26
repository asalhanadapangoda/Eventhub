import React from 'react';
import { Eye, Flag, MapPin, ArrowRight } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-14 sm:py-20 lg:py-28 bg-white border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column: Enlarged Visual Campus Photo (6 cols) */}
          <div className="lg:col-span-6 relative">
            {/* Main Rounded Image Container (Enlarged) */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group bg-slate-900">
              <img
                src="/trace-expert-city.webp"
                alt="TRACE Expert City Maradana Innovation Precinct"
                loading="lazy"
                decoding="async"
                className="w-full h-[280px] sm:h-[440px] lg:h-[530px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Subtle Bottom Gradient for High Clarity & Sharpness */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none"></div>

              {/* Bottom-Left Overlay Text */}
              <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-sky-300 mb-2 shadow-sm">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>TRACE Expert City, Maradana</span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-white leading-snug drop-shadow-md">
                  Sri Lanka's Technology Precinct
                </h4>
              </div>
            </div>
          </div>

          {/* Right Column: About Details, Vision & Mission (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6 lg:pl-2">
            {/* Pill Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f1fd] text-xs font-extrabold uppercase tracking-wider text-[#006398] w-fit shadow-2xs">
              ABOUT TRACE SRI LANKA
            </div>

            {/* Main Section Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0B192C] tracking-tight leading-[1.15]">
              Building Connections. <br />
              <span className="text-[#006398]">Empowering Innovation.</span>
            </h2>

            {/* Description Paragraph */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              TRACE (Technologically Re-Awakening Culture of Excellence) serves as Sri Lanka's
              foremost national innovation catalyst. By bridging higher education, multinational
              technology enterprises, venture capital institutions, and high-impact startups, we
              orchestrate the intellectual and infrastructural conditions essential for sovereign
              digital competitiveness.
            </p>

            {/* Vision and Mission Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Vision Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#faf8ff] border border-slate-200/80 shadow-2xs flex flex-col gap-2.5 hover:border-[#006398]/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#e8f1fd] text-[#006398] flex items-center justify-center shadow-2xs">
                  <Eye className="w-5 h-5 text-[#006398]" />
                </div>
                <h3 className="font-extrabold text-base text-[#0B192C]">Our Vision</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To transform Sri Lanka into a globally distinguished technological innovation powerhouse through sustainable knowledge economies.
                </p>
              </div>

              {/* Mission Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#faf8ff] border border-slate-200/80 shadow-2xs flex flex-col gap-2.5 hover:border-[#006398]/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#e8f1fd] text-[#006398] flex items-center justify-center shadow-2xs">
                  <Flag className="w-5 h-5 text-[#006398]" />
                </div>
                <h3 className="font-extrabold text-base text-[#0B192C]">Our Mission</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Empower Sri Lankan human capital, stimulate deep-tech entrepreneurship, and provide frictionless pathways from idea formulation to global markets.
                </p>
              </div>
            </div>

            {/* Bottom Link with Arrow */}
            <div className="pt-2">
              <a
                href="#programs"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#006398] hover:text-[#0284c7] transition-colors group"
              >
                <span>Explore Academic &amp; Industry Tracks</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
