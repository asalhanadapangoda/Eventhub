import React, { Component, lazy, Suspense } from 'react';
import '../../common/tailwind-modules.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthModal from './components/auth/AuthModal';

// Direct import for instant initial landing render
import HomePage from './pages/HomePage';

// Code-split other public pages
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const ProgramDetailPage = lazy(() => import('./pages/ProgramDetailPage'));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage'));
const WorkshopDetailPage = lazy(() => import('./pages/WorkshopDetailPage'));
const IndustryVisitsPage = lazy(() => import('./pages/IndustryVisitsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Code-split participant portal
const ParticipantLayout = lazy(() => import('./components/participant/ParticipantLayout'));
const MyPrograms = lazy(() => import('./pages/participant/MyPrograms'));
const MyWorkshops = lazy(() => import('./pages/participant/MyWorkshops'));
const NotificationsPage = lazy(() => import('./pages/participant/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/participant/ProfilePage'));

// Code-split admin intelligence portal
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPrograms = lazy(() => import('./pages/admin/AdminPrograms'));
const AdminWorkshops = lazy(() => import('./pages/admin/AdminWorkshops'));
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'));
const AdminParticipants = lazy(() => import('./pages/admin/AdminParticipants'));
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

class AcademyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Innovation Academy render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8ff] p-6 text-center">
          <h2 className="text-xl font-bold text-[#0B192C] mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 mb-4">Please reload the page to continue.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-[#006398] text-white text-xs font-bold uppercase tracking-wider"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router basename="/innovation-academy">
          <AuthModal />
          <AcademyErrorBoundary>
            <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/programs/:slug" element={<ProgramDetailPage />} />
              <Route path="/workshops" element={<WorkshopsPage />} />
              <Route
                path="/programs/:programSlug/workshops/:workshopSlug"
                element={<WorkshopDetailPage />}
              />
              <Route path="/industry-visits" element={<IndustryVisitsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Participant Portal (Protected) */}
              <Route
                path="/participant"
                element={
                  <ProtectedRoute>
                    <ParticipantLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="programs" element={<MyPrograms />} />
                <Route path="workshops" element={<MyWorkshops />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="*" element={<Navigate to="profile" replace />} />
              </Route>

              {/* Admin Operations Intelligence Portal (Protected, Admin Only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="programs" element={<AdminPrograms />} />
                <Route path="workshops" element={<AdminWorkshops />} />
                <Route path="registrations" element={<AdminRegistrations />} />
                <Route path="participants" element={<AdminParticipants />} />
                <Route path="visits" element={<Navigate to="/admin" replace />} />
                <Route path="contact-messages" element={<AdminContactMessages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </AcademyErrorBoundary>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

