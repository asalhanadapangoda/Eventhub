import React from 'react';
import { Users2 } from 'lucide-react';
import { Organization } from '../types/organization';
import { OrganizationGrid } from '../components/OrganizationGrid';

interface LocalPartnersProps {
  organizations: Organization[];
  onCardClick: (org: Organization) => void;
  highlightedSlug?: string | null;
}

export const LocalPartners: React.FC<LocalPartnersProps> = ({
  organizations,
  onCardClick,
  highlightedSlug,
}) => {
  return (
    <section id="local" className="scroll-mt-32 py-12 sm:py-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                Sector 03
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ecosystem Guilds &amp; Chambers
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102D48]">
              Local Partners
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Explore local organizations and businesses supporting the TRACE community.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Users2 className="w-3.5 h-3.5" />
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

