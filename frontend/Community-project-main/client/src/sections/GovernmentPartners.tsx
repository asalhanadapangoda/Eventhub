import React from 'react';
import { Landmark } from 'lucide-react';
import { Organization } from '../types/organization';
import { OrganizationGrid } from '../components/OrganizationGrid';

interface GovernmentPartnersProps {
  organizations: Organization[];
  onCardClick: (org: Organization) => void;
  highlightedSlug?: string | null;
}

export const GovernmentPartners: React.FC<GovernmentPartnersProps> = ({
  organizations,
  onCardClick,
  highlightedSlug,
}) => {
  return (
    <section id="government" className="scroll-mt-32 py-12 sm:py-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                Sector 05
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Policy, Trade &amp; National Infrastructure
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102D48]">
              Government Partners
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Explore government institutions and public sector organizations connected with TRACE.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Landmark className="w-3.5 h-3.5" />
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

