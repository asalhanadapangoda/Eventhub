import { useState, useEffect } from 'react';

export const SECTION_IDS = [
  'corporate',
  'startups',
  'local',
  'international',
  'government',
  'university',
];

export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState<string>('corporate');

  useEffect(() => {
    const handleScroll = () => {
      // Find the current section by measuring offset from top
      const scrollPosition = window.scrollY + 100; // Account for header height
      
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    // Use IntersectionObserver as primary with scroll event fallback
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate top position accounting for sticky header
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSection(id);
    }
  };

  return { activeSection, scrollToSection };
};

