import React from 'react';
import { Rocket } from 'lucide-react';
import { Organization } from '../types/organization';
import { OrganizationGrid } from '../components/OrganizationGrid';

interface StartupsProps {
  organizations: Organization[];
  onCardClick: (org: Organization) => void;
  highlightedSlug?: string | null;
}

export const Startups: React.FC<StartupsProps> = ({
  organizations,
  onCardClick,
  highlightedSlug,
}) => {
  return (
    <section id="startups" className="scroll-mt-32 py-12 sm:py-16 bg-[#F8FAFC] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                Sector 02
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                High-Growth Venture Engines
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102D48]">
              Startups
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Discover innovative startups building new solutions and creating opportunities.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <Rocket className="w-3.5 h-3.5" />
              <span>{organizations.length} Organizations</span>
            </span>
          </div>
        </div>

        {/* Organization Logo Grid */}
        <OrganizationGrid
          organizations={organizations}
          onCardClick={onCardClick}
          highlightedSlug={highlightedSlug}
        />
      </div>
    </section>
  );
};

