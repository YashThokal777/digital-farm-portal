import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation3D from './components/Navigation3D';
import PageWrapper from './components/PageWrapper';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Animals from './pages/Animals';
import Health from './pages/Health';
import Inventory from './pages/Inventory';
import Biosecurity from './pages/Biosecurity';
import Profile from './pages/Profile';
import QuickEntry from './pages/QuickEntry';
import MyTasks from './pages/MyTasks';
import Compliance from './pages/Compliance';
import Reports from './pages/Reports';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Dashboard />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/farms" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Farms />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/animals" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner', 'farm_manager', 'farm_worker']}>
                <PageWrapper>
                  <Navigation3D />
                  <Animals />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/health" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner', 'farm_manager']}>
                <PageWrapper>
                  <Navigation3D />
                  <Health />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/inventory" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner', 'farm_manager']}>
                <PageWrapper>
                  <Navigation3D />
                  <Inventory />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/biosecurity" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Biosecurity />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/biosecurity/visitors" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Biosecurity />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/biosecurity/environmental" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Biosecurity />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/biosecurity/cleaning" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Biosecurity />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <Profile />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/quick-entry" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner', 'farm_manager', 'farm_worker']}>
                <PageWrapper>
                  <Navigation3D />
                  <QuickEntry />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/my-tasks" element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navigation3D />
                  <MyTasks />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/compliance" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner', 'farm_manager']}>
                <PageWrapper>
                  <Navigation3D />
                  <Compliance />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner', 'farm_manager']}>
                <PageWrapper>
                  <Navigation3D />
                  <Reports />
                </PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/portfolio" element={
              <ProtectedRoute requiredRoles={['system_admin', 'farm_owner']}>
                <PageWrapper>
                  <Navigation3D />
                  <Portfolio />
                </PageWrapper>
              </ProtectedRoute>
            } />

            {/* Redirect unknown routes to dashboard if authenticated, otherwise to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
