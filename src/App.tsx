import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppConfigProvider } from './context/AppConfigContext';
import Home from './pages/Home';
import Configurator from './pages/Configurator';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <AppConfigProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppConfigProvider>
  );
}
