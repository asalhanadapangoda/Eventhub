import React, { Suspense, lazy, useEffect, useState } from 'react';

const EventsSpacesApp = lazy(() => import('./modules/event-and-space/EventsSpacesApp'));
const CommunityApp = lazy(() => import('./modules/Community/App.tsx'));
const AcademyApp = lazy(() => import('./modules/Innovation-Academy/App.jsx'));
const ProjectsApp = lazy(() => import('./modules/Projects/App.jsx'));

const getActiveModule = (pathname) => {
  const clean = (pathname || '/').toLowerCase();
  if (clean === '/community' || clean.startsWith('/community/')) {
    return 'community';
  }
  if (clean === '/innovation-academy' || clean.startsWith('/innovation-academy/')) {
    return 'academy';
  }
  if (clean === '/projects' || clean.startsWith('/projects/')) {
    return 'projects';
  }
  return 'events-spaces';
};

const ModuleLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006398', fontWeight: 600 }}>
    Loading TRACE platform...
  </div>
);

export default function App() {
  const [activeModule, setActiveModule] = useState(() => getActiveModule(window.location.pathname));

  useEffect(() => {
    const syncModule = () => setActiveModule(getActiveModule(window.location.pathname));
    window.addEventListener('popstate', syncModule);
    return () => window.removeEventListener('popstate', syncModule);
  }, []);

  // Keep page title accurate per module and remove any stray '#' on /community
  useEffect(() => {
    if (activeModule === 'community') {
      document.title = 'TRACE Community – Ecosystem Directory Platform';
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } else if (activeModule === 'academy') {
      document.title = 'TRACE Sri Lanka | Innovation Academy';
    } else if (activeModule === 'projects') {
      document.title = 'Our Projects | TRACE Sri Lanka';
    } else {
      document.title = 'TRACE EventHub & Spaces Tracker - Discover Tech Events & Book Hub Facilities in Sri Lanka';
    }
  }, [activeModule]);

  if (activeModule === 'community') {
    return (
      <div className="tw-module community-app">
        <Suspense fallback={<ModuleLoader />}>
          <CommunityApp />
        </Suspense>
      </div>
    );
  }

  if (activeModule === 'academy') {
    return (
      <div className="tw-module academy-app">
        <Suspense fallback={<ModuleLoader />}>
          <AcademyApp />
        </Suspense>
      </div>
    );
  }

  if (activeModule === 'projects') {
    return (
      <Suspense fallback={<ModuleLoader />}>
        <ProjectsApp />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<ModuleLoader />}>
      <EventsSpacesApp />
    </Suspense>
  );
}
