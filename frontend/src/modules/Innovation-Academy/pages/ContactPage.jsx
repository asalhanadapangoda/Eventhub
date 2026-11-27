import React, { useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ContactSection from '../components/home/ContactSection';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8fc]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

