import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
