import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#102D48] text-white shadow-md border-b border-[#163B5C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left Side: Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <a
              href="/community"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.hash) {
                  window.history.replaceState(null, '', '/community');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 group no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1"
            >
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-white/20 group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/community/trace-logo.png"
                  alt="TRACE Logo"
                  className="w-full h-full object-contain"
                  loading="eager" decoding="async"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none">
                    TRACE <span className="text-[#0070F3] font-bold">COMMUNITY</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                    DIRECTORY
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
