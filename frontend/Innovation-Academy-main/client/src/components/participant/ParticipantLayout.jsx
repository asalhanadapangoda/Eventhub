import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

export default function ParticipantLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      {/* 1. Standard Top Navigation Header matching Home Page */}
      <Navbar />

      {/* 2. Main Participant Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* 3. Standard Footer matching Home Page */}
      <Footer />
    </div>
  );
}
