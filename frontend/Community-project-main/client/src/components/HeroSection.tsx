import React from 'react';
import {
  Building2,
  Rocket,
  Users2,
  Globe2,
  Landmark,
  GraduationCap,
  ArrowDown
} from 'lucide-react';

interface HeroSectionProps {
  totalCount?: number;
  categoryCounts?: Record<string, number>;
  onNavigate?: (sectionId: string) => void;
  onExploreClick: () => void;
}

export const categoryBoxes = [
  { id: 'corporate', label: 'Corporate Partners', shortLabel: 'Corporate', countKey: 'corporate', icon: Building2 },
  { id: 'startups', label: 'Startups', shortLabel: 'Startups', countKey: 'startup', icon: Rocket },
  { id: 'local', label: 'Local Partners', shortLabel: 'Local', countKey: 'local-partner', icon: Users2 },
  { id: 'international', label: 'International Partners', shortLabel: 'International', countKey: 'international-partner', icon: Globe2 },
  { id: 'government', label: 'Government Partners', shortLabel: 'Government', countKey: 'government-partner', icon: Landmark },
  { id: 'university', label: 'University Partners', shortLabel: 'University', countKey: 'university-partner', icon: GraduationCap },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  categoryCounts = {},
  onNavigate,
  onExploreClick
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#102D48] via-[#163B5C] to-[#0B2034] text-white min-h-[calc(100vh-64px)] flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#163B5C]">
      {/* Decorative blurred background shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-blue-200 text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0070F3] animate-ping"></span>
            TRACE Sri Lanka Collaborative Ecosystem
          </div>

          {/* Main Title */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-4 text-white text-center">
            TRACE Community
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 font-normal text-center max-w-3xl mx-auto">
            TRACE empowers Sri Lanka's largest Accelerator & Incubator Network, Largest Co-Working Space Network, Largest Network of Innovation Hubs by facilitating 2500+ Expert Community, 300+ Startups, 50+ Corporates and 60+ National and International Partnerships in 15 locations across Sri Lanka
          </p>

          {/* Key Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0070F3] hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span>Explore All Organizations</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>

        {/* Category Sector Interactive Boxes ("box box wage") */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categoryBoxes.map((box) => {
              const Icon = box.icon;
              const count = categoryCounts[box.countKey] || 0;
              return (
                <button
                  key={box.id}
                  onClick={() => onNavigate && onNavigate(box.id)}
                  className="group relative flex flex-col justify-between p-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-blue-400/60 backdrop-blur-md transition-all duration-200 cursor-pointer text-left shadow-sm hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Navigate to ${box.label} (${count} organizations)`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-[#0070F3] flex items-center justify-center text-blue-300 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/15 group-hover:bg-blue-500/40 text-blue-100 border border-white/20 transition-colors">
                      {count}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-xs sm:text-sm text-white group-hover:text-blue-200 leading-snug transition-colors">
                      {box.label}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
