import React from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CorporatePartners } from './sections/CorporatePartners';
import { Startups } from './sections/Startups';
import { LocalPartners } from './sections/LocalPartners';
import { InternationalPartners } from './sections/InternationalPartners';
import { GovernmentPartners } from './sections/GovernmentPartners';
import { UniversityPartners } from './sections/UniversityPartners';
import { Footer } from './components/Footer';
import { useActiveSection } from './hooks/useActiveSection';
import { Organization } from './types/organization';
import { fallbackOrganizations } from './data/fallbackData';

export const App: React.FC = () => {
  const organizations = fallbackOrganizations;
  const { scrollToSection } = useActiveSection();

  // Dynamic reactive category counts calculated directly from organizations
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      corporate: 0,
      startup: 0,
      'local-partner': 0,
      'international-partner': 0,
      'government-partner': 0,
      'university-partner': 0,
    };
    organizations.forEach((org) => {
      counts[org.category] = (counts[org.category] || 0) + 1;
    });
    return counts;
  }, [organizations]);

  // Filter organizations by category
  const corporate = organizations.filter((o) => o.category === 'corporate');
  const startups = organizations.filter((o) => o.category === 'startup');
  const local = organizations.filter((o) => o.category === 'local-partner');
  const international = organizations.filter((o) => o.category === 'international-partner');
  const government = organizations.filter((o) => o.category === 'government-partner');
  const university = organizations.filter((o) => o.category === 'university-partner');

  // Direct navigation to official website when card is clicked
  const handleCardClick = (org: Organization) => {
    if (org.website && org.website.trim() !== '') {
      const url = org.website.startsWith('http://') || org.website.startsWith('https://')
        ? org.website
        : `https://${org.website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#102D48]">
      {/* 1. Header */}
      <Header />

      {/* Hero Overview & Interactive Category Boxes */}
      <HeroSection
        totalCount={organizations.length}
        categoryCounts={categoryCounts}
        onNavigate={scrollToSection}
        onExploreClick={() => scrollToSection('corporate')}
      />

      {/* Main Directory Content */}
      <main className="flex-1">
        {/* Section 1: Corporate Partners */}
        <CorporatePartners
          organizations={corporate}
          onCardClick={handleCardClick}
        />

        {/* Section 2: Startups */}
        <Startups
          organizations={startups}
          onCardClick={handleCardClick}
        />

        {/* Section 3: Local Partners */}
        <LocalPartners
          organizations={local}
          onCardClick={handleCardClick}
        />

        {/* Section 4: International Partners */}
        <InternationalPartners
          organizations={international}
          onCardClick={handleCardClick}
        />

        {/* Section 5: Government Partners */}
        <GovernmentPartners
          organizations={government}
          onCardClick={handleCardClick}
        />

        {/* Section 6: University Partners */}
        <UniversityPartners
          organizations={university}
          onCardClick={handleCardClick}
        />
      </main>

      {/* Footer */}
      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default App;
