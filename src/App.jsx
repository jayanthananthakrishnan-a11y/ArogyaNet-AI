import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { CitizenAuthProvider } from './CitizenAuthContext';
import { LanguageProvider } from './LanguageContext';
import LoginPage from './components/LoginPage';
import CitizenSignup from './components/CitizenSignup';
import CitizenLogin from './components/CitizenLogin';
import ContactPage from './components/ContactPage';
import LandingPage from './components/LandingPage';
import HeroHomepage from './components/HeroHomepage';
import PublicLayout from './components/PublicLayout';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/InventoryPage';
import SurveillancePage from './components/SurveillancePage';
import AttendancePage from './components/AttendancePage';
import PatientLoggingPage from './components/PatientLoggingPage';
import FacilityDetailView from './components/FacilityDetailView';
import AdminRegistryPage from './components/AdminRegistryPage';
import CommandCenterPage from './components/CommandCenterPage';
import MLADashboard from './components/MLADashboard';
import ReferralPage from './components/ReferralPage';
import DirectMessagingPage from './components/DirectMessagingPage';
import AmbulancePage from './components/AmbulancePage';
import RoadmapPage from './components/RoadmapPage';
import UserProfile from './components/UserProfile';
import Layout from './components/Layout';

const ProtectedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'mla') return <MLADashboard />;
  return <Dashboard />;
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <CitizenAuthProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HeroHomepage /></PublicLayout>} />
            <Route path="/analytics" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/profile" element={<PublicLayout><UserProfile /></PublicLayout>} />
            <Route path="/signup" element={<CitizenSignup />} />
            <Route path="/signin" element={<CitizenLogin />} />
            <Route path="/login" element={<LoginPage />} />
          {/* Protected Routes (Wrapped in Layout) */}
          <Route path="/dashboard" element={<Layout><ProtectedDashboard /></Layout>} />
          <Route path="/inventory" element={<Layout><InventoryPage /></Layout>} />
          <Route path="/surveillance" element={<Layout><SurveillancePage /></Layout>} />
          <Route path="/attendance" element={<Layout><AttendancePage /></Layout>} />
          <Route path="/patient-logging" element={<Layout><PatientLoggingPage /></Layout>} />
          <Route path="/registry" element={<Layout><AdminRegistryPage /></Layout>} />
          <Route path="/command-center" element={<Layout><CommandCenterPage /></Layout>} />
          <Route path="/referrals" element={<Layout><ReferralPage /></Layout>} />
          <Route path="/messages" element={<Layout><DirectMessagingPage /></Layout>} />
          <Route path="/ambulance" element={<Layout><AmbulancePage /></Layout>} />
          <Route path="/roadmap" element={<PublicLayout><RoadmapPage /></PublicLayout>} />
          <Route path="/facility/:id" element={<Layout><FacilityDetailView /></Layout>} />
          
            {/* Catch-all redirect to public landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </CitizenAuthProvider>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
