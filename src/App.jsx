import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
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
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
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
          <Route path="/roadmap" element={<Layout><RoadmapPage /></Layout>} />
          <Route path="/facility/:id" element={<Layout><FacilityDetailView /></Layout>} />
          
          {/* Catch-all redirect to public landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
