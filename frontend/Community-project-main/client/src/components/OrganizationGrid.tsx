import React from 'react';
import { Building2 } from 'lucide-react';
import { Organization } from '../types/organization';
import { OrganizationCard } from './OrganizationCard';

interface OrganizationGridProps {
  organizations: Organization[];
  onCardClick: (org: Organization) => void;
  highlightedSlug?: string | null;
}

export const OrganizationGrid: React.FC<OrganizationGridProps> = ({
  organizations,
  onCardClick,
  highlightedSlug,
}) => {
  if (!organizations || organizations.length === 0) {
    return (
      <div className="py-10 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500">No organizations added to this sector yet.</p>
        <p className="text-xs text-slate-400 mt-1">Use the Admin Portal to add community partners.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {organizations.map((org) => (
        <OrganizationCard
          key={org.slug}
          organization={org}
          onClick={onCardClick}
          isHighlighted={highlightedSlug === org.slug}
        />
      ))}
    </div>
  );
};

