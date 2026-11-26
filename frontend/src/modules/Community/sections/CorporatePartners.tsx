import React from 'react';
import { Building2 } from 'lucide-react';
import { Organization } from '../types/organization';
import { OrganizationGrid } from '../components/OrganizationGrid';

interface CorporatePartnersProps {
  organizations: Organization[];
  onCardClick: (org: Organization) => void;
  highlightedSlug?: string | null;
}

export const CorporatePartners: React.FC<CorporatePartnersProps> = ({
  organizations,
  onCardClick,
  highlightedSlug,
}) => {
  return (
    <section id="corporate" className="scroll-mt-32 py-12 sm:py-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                Sector 01
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Enterprise &amp; Multinational Scale
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102D48]">
              Corporate Partners
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Explore the corporate organizations connected with the TRACE innovation ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
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

