import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import ProgramsSection from '../components/home/ProgramsSection';
import WorkshopsSection from '../components/home/WorkshopsSection';
import ContactSection from '../components/home/ContactSection';
import { programService, workshopService } from '../services/api';

export default function HomePage() {
  const [programs, setPrograms] = useState(() => {
    try {
      const cached = localStorage.getItem('trace_cached_programs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [workshops, setWorkshops] = useState(() => {
    try {
      const cached = localStorage.getItem('trace_cached_workshops');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const hasPrograms = Boolean(localStorage.getItem('trace_cached_programs'));
      const hasWorkshops = Boolean(localStorage.getItem('trace_cached_workshops'));
      return !(hasPrograms && hasWorkshops);
    } catch {
      return true;
    }
  });

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, workRes] = await Promise.all([
          programService.getPrograms().catch(() => ({ data: [] })),
          workshopService.getWorkshops().catch(() => ({ data: [] })),
        ]);
        if (progRes.data) {
          const pList = Array.isArray(progRes.data) ? progRes.data : progRes.data.data || [];
          setPrograms(pList);
          try {
            localStorage.setItem('trace_cached_programs', JSON.stringify(pList));
          } catch {}
        }
        if (workRes.data) {
          const wList = Array.isArray(workRes.data) ? workRes.data : workRes.data.data || [];
          setWorkshops(wList);
          try {
            localStorage.setItem('trace_cached_workshops', JSON.stringify(wList));
          } catch {}
        }
      } catch (err) {
        console.warn('Could not fetch homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle smooth scroll when navigating to an anchor hash (e.g. #workshops, #about, #programs, #contact)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      let attempts = 0;
      const scrollInterval = setInterval(() => {
        attempts++;
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          clearInterval(scrollInterval);
        } else if (attempts >= 25) {
          clearInterval(scrollInterval);
        }
      }, 80);

      return () => clearInterval(scrollInterval);
    }
  }, [location.hash, loading]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      {/* 1. Header / Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. About Us */}
        <AboutSection />

        {/* 4. Our Programs (Exactly TWO program cards) */}
        <ProgramsSection programs={programs} />

        {/* 5. Workshops & Activities (Selected upcoming workshops from both programs) */}
        <WorkshopsSection workshops={workshops} />

        {/* 6. Contact Us (Contact form saved to database) */}
        <ContactSection />
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}

