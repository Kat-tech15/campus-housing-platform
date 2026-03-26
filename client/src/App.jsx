import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HouseDetail from './pages/HouseDetail';
import LandlordDashboard from './pages/LandlordDashboard';
import PostHouse from './pages/PostHouse';
import EditHouse from './pages/EditHouse';

function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />;
  return children;
}

function SessionExpiredHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    function handleExpired() {
      logout();
      navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
    }
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, [logout, navigate]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SessionExpiredHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/houses/:id" element={<HouseDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="landlord">
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-house"
            element={
              <ProtectedRoute requireRole="landlord">
                <PostHouse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-house/:id"
            element={
              <ProtectedRoute requireRole="landlord">
                <EditHouse />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
