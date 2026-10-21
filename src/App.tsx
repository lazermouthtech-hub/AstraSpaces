import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppConfigProvider } from './context/AppConfigContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Configurator from './pages/Configurator';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <AppConfigProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user" element={<Navigate to="/user-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </AppConfigProvider>
  );
}
