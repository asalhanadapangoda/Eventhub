export type OrganizationCategory =
  | 'corporate'
  | 'startup'
  | 'local-partner'
  | 'international-partner'
  | 'government-partner'
  | 'university-partner';

export interface Organization {
  _id?: string;
  name: string;
  slug: string;
  category: OrganizationCategory;
  logo: string;
  shortDescription?: string;
  description?: string;
  about?: string;
  website?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  partnershipDetails?: string;
  images?: string[];
  featured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryMeta {
  id: OrganizationCategory;
  sectionId: string;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
}

export interface CategoryStats {
  categories: Record<string, number>;
  total: number;
}

