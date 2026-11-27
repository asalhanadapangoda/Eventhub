import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden border-b border-[#e2e8f0]">
      {/* ========================================================
          MOBILE HERO VIEW (< lg)
          Text Directly Over High-Res Photo with Cinematic Contrast Scrim
          ======================================================== */}
      <section className="relative block lg:hidden min-h-[620px] sm:min-h-[660px] flex items-center justify-center bg-[#071322] overflow-hidden">
        {/* Full Background Photo (Brighter and More Visible) */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <img
            src="/innovation-academy/hero-innovation.jpg"
            alt="TRACE Sri Lanka Innovation Academy"
            className="w-full h-full object-cover object-center select-none brightness-105 contrast-[1.02]"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Balanced Translucent Scrim (Shows Photo Vibrantly while Keeping Text Sharp) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/65 via-[#0B192C]/38 to-[#071322]/78 z-10 pointer-events-none"></div>

        {/* Foreground Content on Mobile */}
        <div className="relative z-20 w-full max-w-xl mx-auto px-5 py-12 sm:py-16 flex flex-col items-start gap-5">
          {/* Tag Pill */}
          <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/75 border border-white/20 text-sky-200 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span className="truncate">TRACE INNOVATION ACADEMY • POWERED BY T2T</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              Inspiring Innovation <br />
              <span className="text-[#38bdf8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">Across Sri Lanka</span>
            </h1>

          </div>

          {/* Paragraph Description */}
          <p className="text-xs sm:text-sm text-white font-medium leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)]">
            Empowering Creative Minds to Transform Innovative Ideas into Sustainable Business Models
            through hands-on prototyping, human-centered design, and high-growth incubation.
          </p>

          {/* CTA Button */}
          <div className="pt-2 w-full">
            <a
              href="#programs"
              className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#006398] hover:bg-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-black/50 border border-sky-400/30 transition-all text-center"
            >
              <span>EXPLORE INNOVATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Bottom Atmosphere Pill */}
          <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>National Deep-Tech &amp; Startup Ecosystem Hub</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          DESKTOP HERO VIEW (>= lg)
          Split Screen with S-Curve Wave Mask
          ======================================================== */}
      <section className="hidden lg:flex relative min-h-[660px] xl:min-h-[720px] items-center bg-white">
        {/* Right Side: Clean High-Tech Lab Photo */}
        <div className="absolute top-0 right-0 w-[68%] h-full overflow-hidden z-0">
          <img
            src="/innovation-academy/hero-innovation.jpg"
            alt="TRACE Sri Lanka Innovation Academy"
            className="w-full h-full object-cover object-right select-none"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Organic S-Curve Wave SVG Mask */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 0 L 425 0 C 410 130 445 240 480 330 C 515 420 550 510 585 600 L 0 600 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Left Side Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-20 py-24">
          <div className="max-w-[460px] xl:max-w-[500px] flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f1fd] border border-[#d0e2fc] text-[11px] font-extrabold uppercase tracking-wider text-[#006398] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#006398]" />
              <span>TRACE INNOVATION ACADEMY • POWERED BY T2T</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-4xl lg:text-[48px] font-extrabold text-[#0B192C] leading-[1.12] tracking-tight">
                Inspiring Innovation <br />
                <span className="text-[#006398]">Across Sri Lanka</span>
              </h1>

            </div>

            <p className="text-base text-slate-600 leading-relaxed">
              Empowering Creative Minds to Transform Innovative Ideas into Sustainable Business Models
              through hands-on prototyping, human-centered design, and high-growth incubation.
            </p>

            <div className="pt-3">
              <a
                href="#programs"
                className="inline-block px-7 py-3 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                EXPLORE INNOVATION
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
